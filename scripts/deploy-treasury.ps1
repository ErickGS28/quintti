<#
.SYNOPSIS
  Deploys a Quintti treasury with the roles you give it. It only shows the plan unless you pass -Execute.

.DESCRIPTION
  For a real deployment (decision 0018, docs/10-mainnet-launch.md). Unlike seed-demo.ps1 it loads no demo data
  and takes addresses, not identities, for every role. Only -Source needs a key: the account that pays for
  and signs the deployment.

  Without -Execute nothing is sent. The script checks the arguments, prints what it would deploy and, when
  the source account exists on the network, simulates the upload to estimate the cost.

  With -Execute on mainnet it also asks you to type MAINNET, because a deployment cannot be undone and the
  contract cannot be upgraded.

  Rehearse it on testnet first: -Network testnet uses the SDF's public testnet RPC and costs nothing.

.PARAMETER Network
  mainnet (default) or testnet.

.PARAMETER RpcUrl
  Soroban RPC URL. Required on mainnet: the SDF runs no public one. Defaults to the SDF RPC on testnet.

.PARAMETER Source
  Stellar CLI identity that pays for and signs the deployment (stellar keys generate <name>).

.PARAMETER Name
  The building's name, shown to every resident (up to 80 bytes; an accented letter takes two).

.PARAMETER Assembly
  Address that sets the rules: budget, vendors, council. A G account, which can be a multi-signature account.

.PARAMETER Administrator
  Address that proposes expenses.

.PARAMETER Council
  Addresses that approve expenses.

.PARAMETER Threshold
  How many council approvals pay an expense.

.PARAMETER RotationDelay
  Seconds a council rotation must wait. Default 172800 (two days). Zero makes rotations immediate.

.PARAMETER Execute
  Actually deploy.

.EXAMPLE
  ./scripts/deploy-treasury.ps1 -Network testnet -Source qt-admin -Name "Torres del Parque" -Assembly G... -Administrator G... -Council G...,G...,G... -Threshold 2

.EXAMPLE
  ./scripts/deploy-treasury.ps1 -RpcUrl https://soroban-rpc.mainnet.stellar.gateway.fm -Source qm-deployer -Name "Torres del Parque" -Assembly G... -Administrator G... -Council G...,G...,G... -Threshold 2 -Execute
#>
param(
  [ValidateSet("mainnet", "testnet")][string]$Network = "mainnet",
  [string]$RpcUrl = "",
  [Parameter(Mandatory = $true)][string]$Source,
  [Parameter(Mandatory = $true)][string]$Name,
  [Parameter(Mandatory = $true)][string]$Assembly,
  [Parameter(Mandatory = $true)][string]$Administrator,
  [Parameter(Mandatory = $true)][string[]]$Council,
  [Parameter(Mandatory = $true)][int]$Threshold,
  [uint32]$RotationDelay = 172800,
  [switch]$Execute
)

$ErrorActionPreference = "Continue"
$root = Split-Path -Parent $PSScriptRoot
$wasm = Join-Path $root "target/wasm32v1-none/release/quintti_treasury.wasm"

$networks = @{
  mainnet = @{ Passphrase = "Public Global Stellar Network ; September 2015"; Explorer = "https://stellar.expert/explorer/public"; DefaultRpc = "" }
  testnet = @{ Passphrase = "Test SDF Network ; September 2015"; Explorer = "https://stellar.expert/explorer/testnet"; DefaultRpc = "https://soroban-testnet.stellar.org" }
}
$passphrase = $networks[$Network].Passphrase
$explorer = $networks[$Network].Explorer
if (-not $RpcUrl) { $RpcUrl = $networks[$Network].DefaultRpc }

function Fail([string]$Message) { Write-Host "ERROR: $Message" -ForegroundColor Red; exit 1 }

# ---- Checks that need no network -------------------------------------------------------------
if (-not $RpcUrl) { Fail "-RpcUrl is required on mainnet: the SDF runs no public Soroban RPC. Pick a provider (see docs/10-mainnet-launch.md)." }
if ($Network -eq "mainnet" -and -not $RpcUrl.StartsWith("https://")) { Fail "-RpcUrl must use https on mainnet." }
$account = "^G[A-Z2-7]{55}$"
foreach ($pair in @(@("Assembly", $Assembly), @("Administrator", $Administrator))) {
  if ($pair[1] -notmatch $account) { Fail "-$($pair[0]) is not a Stellar account address (it must start with G and have 56 characters)." }
}
foreach ($member in $Council) { if ($member -notmatch $account) { Fail "A council address is not a Stellar account address: $member" } }
if (-not $Name.Trim()) { Fail "-Name is empty." }
if ([Text.Encoding]::UTF8.GetByteCount($Name) -gt 80) { Fail "-Name is longer than 80 bytes." }
if ($Council.Count -lt 1 -or $Council.Count -gt 7) { Fail "The council needs between 1 and 7 members (the contract's MAX_COUNCIL)." }
if (@($Council | Select-Object -Unique).Count -ne $Council.Count) { Fail "The council has a repeated address." }
if ($Threshold -lt 1 -or $Threshold -gt $Council.Count) { Fail "-Threshold must be between 1 and the council size ($($Council.Count))." }
if ($Council -contains $Administrator) { Fail "The administrator cannot also be on the council (nobody approves their own proposals)." }
if (-not (Test-Path $wasm)) { Fail "Build the contract first: stellar contract build (expected $wasm)" }

$sha = [Security.Cryptography.SHA256]::Create()
$wasmHash = ([BitConverter]::ToString($sha.ComputeHash([IO.File]::ReadAllBytes($wasm))) -replace "-", "").ToLower()
$sourceAddress = (& stellar keys address $Source 2>$null | Out-String).Trim()
if ($sourceAddress -notmatch $account) { Fail "The Stellar CLI has no identity called '$Source'. Create it with: stellar keys generate $Source" }

$token = (& stellar contract id asset --asset native --rpc-url $RpcUrl --network-passphrase $passphrase 2>$null | Out-String).Trim()
if ($token -notmatch "^C[A-Z2-7]{55}$") { Fail "Could not work out the native token's contract address (check -RpcUrl)." }

Write-Host ""
Write-Host "Plan: deploy a Quintti treasury on $($Network.ToUpper())"
Write-Host "  RPC:            $RpcUrl"
Write-Host "  Building:       $Name"
Write-Host "  Paid by:        $Source ($sourceAddress)"
Write-Host "  Token:          native XLM, $token"
Write-Host "  Assembly:       $Assembly"
Write-Host "  Administrator:  $Administrator"
Write-Host "  Council:        $($Council.Count) members, $Threshold approvals pay an expense"
foreach ($member in $Council) { Write-Host "                  $member" }
Write-Host "  Rotation delay: $RotationDelay seconds"
Write-Host "  WASM:           $wasm"
Write-Host "  WASM sha256:    $wasmHash"
if ($Council -contains $Assembly -or $Assembly -eq $Administrator) {
  Write-Host "  NOTE: one address holds more than one role. That is fine for a demo and says nothing about collective control." -ForegroundColor Yellow
}

# ---- Cost estimate: only possible when the source account exists on the network ---------------
Write-Host ""
Write-Host "Cost estimate"
$build = (& stellar contract upload --wasm $wasm --source-account $sourceAddress --rpc-url $RpcUrl --network-passphrase $passphrase --build-only 2>&1 | Out-String)
$xdr = ($build -split "`r?`n" | Where-Object { $_ -match "^AAAA" } | Select-Object -Last 1)
if ($xdr) {
  $simulation = ($xdr.Trim() | & stellar tx simulate --source-account $sourceAddress --rpc-url $RpcUrl --network-passphrase $passphrase 2>&1 | Out-String)
  $assembled = ($simulation -split "`r?`n" | Where-Object { $_ -match "^AAAA" } | Select-Object -Last 1)
  if ($assembled) {
    $json = ($assembled.Trim() | & stellar xdr decode --type TransactionEnvelope --output json 2>$null | Out-String)
    $fee = [regex]::Match($json, '"fee":\s*(\d+)').Groups[1].Value
    if ($fee) {
      Write-Host ("  Uploading the WASM on {0}: {1} XLM in fees." -f $Network, ([decimal]$fee / 10000000))
      Write-Host "  That is only the upload. The deployment is a second transaction, and every account also needs its minimum balance."
      if ($Network -ne "mainnet") { Write-Host "  Testnet fee settings can differ from mainnet: for the real figure run this against mainnet with a funded -Source." }
    }
    else { Write-Host "  The upload simulated, but the fee could not be read." }
  } else {
    Write-Host "  Could not simulate (on mainnet the source account must exist and hold XLM): does $sourceAddress exist on $Network? ($(($simulation -split "`r?`n" | Where-Object { $_ -match 'error' } | Select-Object -First 1)))"
  }
} else {
  Write-Host "  Could not build the upload transaction."
}

if (-not $Execute) {
  Write-Host ""
  Write-Host "Nothing was sent. Add -Execute to deploy." -ForegroundColor Green
  exit 0
}

# ---- Sending -----------------------------------------------------------------------------------
if ($Network -eq "mainnet") {
  Write-Host ""
  Write-Host "This sends real transactions with real XLM. A deployed treasury cannot be upgraded or removed, and the contract is not audited." -ForegroundColor Yellow
  $answer = Read-Host "Type MAINNET to continue"
  if ($answer -cne "MAINNET") { Fail "Cancelled. Nothing was sent." }
}

$councilFile = Join-Path ([IO.Path]::GetTempPath()) ("quintti-council-" + [guid]::NewGuid().ToString("N") + ".json")
[IO.File]::WriteAllText($councilFile, (ConvertTo-Json -InputObject @($Council) -Compress))
try {
  Write-Host ""
  Write-Host "Deploying..."
  $output = (& stellar contract deploy --wasm $wasm --source-account $Source --rpc-url $RpcUrl --network-passphrase $passphrase -- --token $token --assembly $Assembly --administrator $Administrator --council-file-path $councilFile --threshold $Threshold --rotation_delay $RotationDelay --name $Name 2>&1 | Out-String)
} finally {
  Remove-Item $councilFile -ErrorAction SilentlyContinue
}
$contractId = [regex]::Match($output, "C[A-Z2-7]{55}").Value
if (-not $contractId) { Fail "The deployment did not return a contract address:`n$output" }
$hashes = [regex]::Matches($output, "Signing transaction:\s*([0-9a-f]{64})")
$deployHash = if ($hashes.Count -gt 0) { $hashes[$hashes.Count - 1].Groups[1].Value } else { "" }

Write-Host ""
Write-Host "Deployed on $Network" -ForegroundColor Green
Write-Host "  Contract:    $contractId"
Write-Host "  Explorer:    $explorer/contract/$contractId"
if ($deployHash) { Write-Host "  Transaction: $explorer/tx/$deployHash" }
Write-Host ""
Write-Host "Next: frontend/.env.local gets NEXT_PUBLIC_TREASURY_CONTRACT_ID=$contractId (and NEXT_PUBLIC_STELLAR_NETWORK=$Network, NEXT_PUBLIC_SOROBAN_RPC_URL=$RpcUrl)."
