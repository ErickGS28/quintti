<#
.SYNOPSIS
  Shows on Stellar testnet that the assembly can be a 2-of-3 multi-signature account, and that council
  rotations wait for a delay.

.DESCRIPTION
  Decision 0017 (docs/decisions/0017-a-collective-assembly.md): the assembly is an address, so it can be
  a Stellar account that needs 2 of 3 representatives to sign, and the treasury can make council
  rotations wait. This script:

    1. Creates (or reuses) three representatives and an assembly account, all throwaway testnet keys.
    2. Turns the assembly account into a 2-of-3 multi-signature account and removes its master key's weight.
    3. Deploys a treasury that uses that account as the assembly, with a rotation delay.
    4. Changes a budget line with ONE representative's signature (the network rejects it) and with TWO
       (it goes through).
    5. Tries to rotate the council at once (the contract refuses: a delay applies).
    6. Announces a rotation, tries to execute it before the delay (refused), waits, executes it, and
       reads the new council back.
    7. Announces another rotation and cancels it.

  It needs the identities qt-admin and qt-council1..3 from docs/06-getting-started.md, and the built
  WASM (stellar contract build). Safe to rerun: the assembly account is configured only once and each run
  deploys a new treasury. Testnet only, nothing here is secret or worth anything.

.PARAMETER Alias
  Name the new contract gets in the CLI. An existing alias with this name is replaced.

.PARAMETER RotationDelay
  Seconds a council rotation must wait. A real building would use days; the demo waits this long.

.EXAMPLE
  ./scripts/demo-multisig-assembly.ps1
#>
param(
  [string]$Alias = "quintti-multisig",
  [int]$RotationDelay = 45
)

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
  $line = $Text -split "`r?`n" | Where-Object { $_ -match '^AAAA' } | Select-Object -Last 1
  if ($line) { $line.Trim() } else { "" }
}

function Ensure-Identity([string]$Name) {
  if (-not ((& stellar keys ls 2>&1 | Out-String) -split "`r?`n" -contains $Name)) {
    & stellar keys generate $Name --network $network --fund 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "Could not create the identity $Name" }
    Write-Host "  created $Name"
  }
}

function Write-Json([object]$Value) {
  $file = Join-Path ([IO.Path]::GetTempPath()) ("quintti-" + [guid]::NewGuid().ToString("N") + ".json")
  [IO.File]::WriteAllText($file, (ConvertTo-Json -InputObject @($Value) -Compress))
  return $file
}

# Calls the treasury as the assembly. The assembly account is the source of the transaction, so the
# signatures on the envelope are its authorization. build-only does not simulate, so the transaction is
# simulated before it is signed. A contract error shows up at the simulation; a missing signature is
# refused by the network when the transaction is sent.
function Invoke-AsAssembly([string]$Function, [string[]]$Arguments, [string[]]$Signers) {
  $built = Get-Xdr (& stellar contract invoke --id $Alias --source-account $script:assembly --network $network --build-only -- $Function @Arguments 2>&1 | Out-String)
  $simulation = (& stellar tx simulate --source-account $script:assembly --network $network $built 2>&1 | Out-String)
  $ready = Get-Xdr $simulation
  if (-not $ready) { return [pscustomobject]@{ Accepted = $false; Output = $simulation; Hash = "" } }
  $signed = $ready
  foreach ($signer in $Signers) { $signed = Get-Xdr ($signed | & stellar tx sign --sign-with-key $signer --network $network 2>&1 | Out-String) }
  $sent = ($signed | & stellar tx send --network $network 2>&1 | Out-String)
  $hash = [regex]::Match($sent, '"tx_hash":\s*"([0-9a-f]{64})"').Groups[1].Value
  return [pscustomobject]@{ Accepted = [bool]$hash; Output = $sent; Hash = $hash }
}

function Read-Contract([string]$Function, [string[]]$Arguments = @()) {
  (& stellar contract invoke --id $Alias --source-account qt-admin --network $network --send no -- $Function @Arguments 2>$null | Out-String).Trim()
}

function Expect([bool]$Condition, [string]$Message) { if (-not $Condition) { throw $Message } }

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
  # Last, because after this the master key can no longer sign alone. Every threshold is 2, so the
  # calls below do not depend on which one the network applies to them.
  & stellar tx new set-options --source-account $assemblyIdentity --network $network --master-weight 0 --low-threshold 2 --med-threshold 2 --high-threshold 2 2>&1 | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "Could not set the thresholds" }
  Write-Host "  configured: 3 signers of weight 1, every threshold 2, master key weight 0"
}

Write-Host "3. Deploying a treasury with that account as the assembly and a $RotationDelay s rotation delay"
$token = (& stellar contract id asset --asset native --network $network).Trim()
$councilFile = Write-Json @((Address "qt-council1"), (Address "qt-council2"), (Address "qt-council3"))
& stellar contract alias remove $Alias 2>&1 | Out-Null
$deploy = (& stellar contract deploy --wasm $wasm --source qt-admin --network $network --alias $Alias -- --token $token --assembly $assembly --administrator (Address "qt-admin") --council-file-path $councilFile --threshold 2 --rotation_delay $RotationDelay --name "Demo asamblea multifirma" 2>&1 | Out-String)
Remove-Item $councilFile -ErrorAction SilentlyContinue
$contractId = [regex]::Match($deploy, "C[A-Z2-7]{55}").Value
Expect ([bool]$contractId) "Could not read the contract id from:`n$deploy"
Write-Host "  contract $contractId"

Write-Host "4. A budget change signed by ONE representative"
$limit = [string](1000 * $stroops)
$budgetArguments = @("--category", "mantenimiento", "--limit", $limit)
$one = Invoke-AsAssembly "set_budget" $budgetArguments @($representatives[0])
Expect ((-not $one.Accepted) -and ($one.Output -match "TxBadAuth")) "Expected the network to reject a single signature, got:`n$($one.Output)"
Write-Host "  rejected by the network: TxBadAuth (one signature of weight 1 does not reach the threshold of 2)"

Write-Host "5. The same change signed by TWO representatives"
$two = Invoke-AsAssembly "set_budget" $budgetArguments @($representatives[0], $representatives[1])
Expect $two.Accepted "The transaction with two signatures did not go through:`n$($two.Output)"
Write-Host "  accepted: https://stellar.expert/explorer/testnet/tx/$($two.Hash)"
Write-Host "  budget read back: $(Read-Contract 'get_budget' @('--category', 'mantenimiento'))"

Write-Host "6. Rotating the council at once is refused"
$newCouncil = @((Address "qt-council1"), (Address "qt-council2"), (Address "qt-rep3"))
$newCouncilFile = Write-Json $newCouncil
$signers = @($representatives[0], $representatives[1])
$immediate = Invoke-AsAssembly "rotate_council" @("--council-file-path", $newCouncilFile, "--threshold", "2") $signers
Expect ((-not $immediate.Accepted) -and ($immediate.Output -match "#20")) "Expected RotationDelayRequired (#20), got:`n$($immediate.Output)"
Write-Host "  refused by the contract: RotationDelayRequired (error 20)"

Write-Host "7. Announcing the rotation, then trying to execute it too early"
$announce = Invoke-AsAssembly "announce_rotation" @("--council-file-path", $newCouncilFile, "--threshold", "2") $signers
Expect $announce.Accepted "The announcement did not go through:`n$($announce.Output)"
Write-Host "  announced: https://stellar.expert/explorer/testnet/tx/$($announce.Hash)"
Write-Host "  pending rotation: $(Read-Contract 'get_pending_rotation')"
$early = Invoke-AsAssembly "execute_rotation" @() $signers
Expect ((-not $early.Accepted) -and ($early.Output -match "#23")) "Expected RotationNotReady (#23), got:`n$($early.Output)"
Write-Host "  refused by the contract: RotationNotReady (error 23)"

Write-Host "8. Waiting $($RotationDelay + 15) s, then executing"
Start-Sleep -Seconds ($RotationDelay + 15)
$execute = Invoke-AsAssembly "execute_rotation" @() $signers
Expect $execute.Accepted "The rotation did not run after the delay:`n$($execute.Output)"
Remove-Item $newCouncilFile -ErrorAction SilentlyContinue
Write-Host "  executed: https://stellar.expert/explorer/testnet/tx/$($execute.Hash)"

Write-Host "9. Announcing another rotation and cancelling it"
$backFile = Write-Json @((Address "qt-council1"), (Address "qt-council2"), (Address "qt-council3"))
$second = Invoke-AsAssembly "announce_rotation" @("--council-file-path", $backFile, "--threshold", "2") $signers
Remove-Item $backFile -ErrorAction SilentlyContinue
Expect $second.Accepted "The second announcement did not go through:`n$($second.Output)"
$cancel = Invoke-AsAssembly "cancel_rotation" @() $signers
Expect $cancel.Accepted "The cancellation did not go through:`n$($cancel.Output)"
Expect ((Read-Contract 'get_pending_rotation') -eq "null") "A rotation is still pending after the cancellation"
Write-Host "  announced: https://stellar.expert/explorer/testnet/tx/$($second.Hash)"
Write-Host "  cancelled: https://stellar.expert/explorer/testnet/tx/$($cancel.Hash)"

Write-Host ""
Write-Host "Done"
Write-Host "  Assembly account: $assembly"
Write-Host "  Contract:         $contractId"
Write-Host "  Council now:      $(Read-Contract 'get_council')"
Write-Host "  Pending rotation: $(Read-Contract 'get_pending_rotation')"
