<#
.SYNOPSIS
  Shows on Stellar testnet that a native multi-signature account can be the treasury's assembly.

.DESCRIPTION
  Decision 0017 (docs/decisions/0017-a-collective-assembly.md): the assembly is an address, so it can be
  a Stellar account that needs 2 of 3 representatives to sign. This script:

    1. Creates (or reuses) three representatives and an assembly account, all throwaway testnet keys.
    2. Turns the assembly account into a 2-of-3 multi-signature account and removes its master key's weight.
    3. Deploys a treasury that uses that account as the assembly.
    4. Tries to change a budget line with ONE representative's signature (it must be rejected).
    5. Tries again with TWO signatures (it must go through) and reads the budget back.

  It needs the identities qt-admin and qt-council1..3 from docs/06-getting-started.md, and the built
  WASM (stellar contract build). Safe to rerun: the assembly account is configured only once and each run
  deploys a new treasury. Testnet only, nothing here is secret or worth anything.

.PARAMETER Alias
  Name the new contract gets in the CLI. An existing alias with this name is replaced.

.EXAMPLE
  ./scripts/demo-multisig-assembly.ps1
#>
param([string]$Alias = "quintti-multisig")

$ErrorActionPreference = "Continue"
$root = Split-Path -Parent $PSScriptRoot
$wasm = Join-Path $root "target/wasm32v1-none/release/quintti_treasury.wasm"
$network = "testnet"
$representatives = @("qt-rep1", "qt-rep2", "qt-rep3")
$assemblyIdentity = "qt-assembly-ms"
$stroops = 10000000

if (-not (Test-Path $wasm)) { throw "Build the contract first: stellar contract build (expected $wasm)" }

function Address([string]$Identity) { (& stellar keys address $Identity).Trim() }

# The CLI prints progress on stderr, so read everything and pick the XDR line (it starts with AAAA).
function Get-Xdr([string]$Text) {
  ($Text -split "`r?`n" | Where-Object { $_ -match '^AAAA' } | Select-Object -Last 1).Trim()
}

function Ensure-Identity([string]$Name) {
  if (-not ((& stellar keys ls 2>&1 | Out-String) -split "`r?`n" -contains $Name)) {
    & stellar keys generate $Name --network $network --fund 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "Could not create the identity $Name" }
    Write-Host "  created $Name"
  }
}

Write-Host "1. Identities"
foreach ($name in ($representatives + $assemblyIdentity)) { Ensure-Identity $name }
$assembly = Address $assemblyIdentity

Write-Host "2. The assembly account: 2 of 3 representatives"
$account = Invoke-RestMethod "https://horizon-$network.stellar.org/accounts/$assembly"
$configured = ($account.thresholds.med_threshold -eq 2) -and (@($account.signers | Where-Object { $_.weight -eq 1 }).Count -eq 3)
if ($configured) {
  Write-Host "  already configured"
} else {
  foreach ($rep in $representatives) {
    & stellar tx new set-options --source-account $assemblyIdentity --network $network --signer (Address $rep) --signer-weight 1 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "Could not add $rep as a signer" }
  }
  # Last, because after this the master key can no longer sign alone.
  & stellar tx new set-options --source-account $assemblyIdentity --network $network --master-weight 0 --low-threshold 2 --med-threshold 2 --high-threshold 2 2>&1 | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "Could not set the thresholds" }
  Write-Host "  configured: 3 signers of weight 1, every threshold 2, master key weight 0"
}

Write-Host "3. Deploying a treasury with that account as the assembly"
$token = (& stellar contract id asset --asset native --network $network).Trim()
$councilFile = Join-Path ([IO.Path]::GetTempPath()) "quintti-council-ms.json"
[IO.File]::WriteAllText($councilFile, (@((Address "qt-council1"), (Address "qt-council2"), (Address "qt-council3")) | ConvertTo-Json -Compress))
& stellar contract alias remove $Alias 2>&1 | Out-Null
$deploy = (& stellar contract deploy --wasm $wasm --source qt-admin --network $network --alias $Alias -- --token $token --assembly $assembly --administrator (Address "qt-admin") --council-file-path $councilFile --threshold 2 2>&1 | Out-String)
Remove-Item $councilFile -ErrorAction SilentlyContinue
$contractId = [regex]::Match($deploy, "C[A-Z2-7]{55}").Value
if (-not $contractId) { throw "Could not read the contract id from:`n$deploy" }
Write-Host "  contract $contractId"

# The assembly account is the source of the transaction, so the signatures on the envelope are its
# authorization. build-only does not simulate, so the transaction is simulated before it is signed.
Write-Host "4. A budget change signed by ONE representative"
$limit = [string](1000 * $stroops)
$built = Get-Xdr (& stellar contract invoke --id $Alias --source-account $assembly --network $network --build-only -- set_budget --category mantenimiento --limit $limit 2>&1 | Out-String)
$ready = Get-Xdr ($built | & stellar tx simulate --source-account $assembly --network $network 2>&1 | Out-String)
if (-not $ready) { throw "Could not simulate the transaction" }
$oneSignature = Get-Xdr ($ready | & stellar tx sign --sign-with-key $representatives[0] --network $network 2>&1 | Out-String)
$rejected = ($oneSignature | & stellar tx send --network $network 2>&1 | Out-String)
if ($rejected -match "TxBadAuth") {
  Write-Host "  rejected by the network: TxBadAuth (one signature of weight 1 does not reach the threshold of 2)"
} else {
  throw "Expected the network to reject a single signature, got:`n$rejected"
}

Write-Host "5. The same change signed by TWO representatives"
$twoSignatures = Get-Xdr ($oneSignature | & stellar tx sign --sign-with-key $representatives[1] --network $network 2>&1 | Out-String)
$accepted = ($twoSignatures | & stellar tx send --network $network 2>&1 | Out-String)
$hash = [regex]::Match($accepted, '"tx_hash":\s*"([0-9a-f]{64})"').Groups[1].Value
if (-not $hash) { throw "The transaction with two signatures did not go through:`n$accepted" }
$budget = (& stellar contract invoke --id $Alias --source-account qt-admin --network $network --send no -- get_budget --category mantenimiento 2>$null | Out-String).Trim()

Write-Host ""
Write-Host "Done"
Write-Host "  Assembly account: $assembly"
Write-Host "  Contract:         $contractId"
Write-Host "  Budget read back: $budget"
Write-Host "  Accepted tx:      https://stellar.expert/explorer/testnet/tx/$hash"
