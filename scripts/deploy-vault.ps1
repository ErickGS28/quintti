<#
.SYNOPSIS
  Deploys the Ship It vault on testnet and locks XLM in it. It only shows the plan unless you pass -Execute.

.DESCRIPTION
  The vault (contracts/vault, decision 0021) holds XLM and pays a fixed amount, once per account, to whoever
  presents the code. It is opened with the SHA-256 of the code in lowercase, so "Ship It" and "ship it" open
  the same vault, and it has no owner: after funding, the only way out is `claim`.

  The script deploys the vault and then transfers the locked amount from -Source to the vault in a second
  transaction. Testnet only: the vault is not audited and has no way to give the money back.

  Without -Execute nothing is sent.

.PARAMETER Source
  Stellar CLI identity that pays for the deployment and provides the locked XLM (stellar keys generate <name> --fund).

.PARAMETER Code
  The code that opens the vault. Default "Ship It".

.PARAMETER Locked
  XLM to lock in the vault. Default 5555.

.PARAMETER Payout
  XLM each account receives when it claims. Default 55.55, so 5555 XLM serve 100 accounts.

.PARAMETER Execute
  Actually deploy and fund.

.EXAMPLE
  ./scripts/deploy-vault.ps1 -Source qt-admin

.EXAMPLE
  ./scripts/deploy-vault.ps1 -Source qt-admin -Execute
#>
param(
  [Parameter(Mandatory = $true)][string]$Source,
  [string]$Code = "Ship It",
  [decimal]$Locked = 5555,
  [decimal]$Payout = 55.55,
  [switch]$Execute
)

$ErrorActionPreference = "Continue"
$root = Split-Path -Parent $PSScriptRoot
$wasm = Join-Path $root "target/wasm32v1-none/release/quintti_vault.wasm"
$network = "testnet"
$explorer = "https://stellar.expert/explorer/testnet"
$stroops = [decimal]10000000

function Fail([string]$Message) { Write-Host "ERROR: $Message" -ForegroundColor Red; exit 1 }

# ---- Checks that need no network -------------------------------------------------------------
$trimmed = $Code.Trim()
if (-not $trimmed) { Fail "-Code is empty." }
if ($trimmed -cne $Code) { Fail "-Code has spaces at its ends. The app trims what people type, so the code could never match." }
if ($Code -notmatch '^[\x20-\x7E]+$') { Fail "-Code must be plain ASCII: the contract lowercases ASCII letters only." }
if ([Text.Encoding]::UTF8.GetByteCount($Code) -gt 64) { Fail "-Code is longer than 64 bytes." }
if ($Payout -le 0) { Fail "-Payout must be above zero." }
if ($Locked -lt $Payout) { Fail "-Locked is less than one -Payout." }
if (($Locked * $stroops) % 1 -ne 0 -or ($Payout * $stroops) % 1 -ne 0) { Fail "XLM has 7 decimals at most." }
if (-not (Test-Path $wasm)) { Fail "Build the contract first: stellar contract build --package quintti-vault (expected $wasm)" }

$sourceAddress = (& stellar keys address $Source 2>$null | Out-String).Trim()
if ($sourceAddress -notmatch "^G[A-Z2-7]{55}$") { Fail "The Stellar CLI has no identity called '$Source'." }
$token = (& stellar contract id asset --asset native --network $network 2>$null | Out-String).Trim()
if ($token -notmatch "^C[A-Z2-7]{55}$") { Fail "Could not work out the native token's contract address." }

$sha = [Security.Cryptography.SHA256]::Create()
$hashBytes = $sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($Code.ToLowerInvariant()))
$codeHash = ([BitConverter]::ToString($hashBytes) -replace "-", "").ToLower()
$lockedStroops = [decimal]::Truncate($Locked * $stroops)
$payoutStroops = [decimal]::Truncate($Payout * $stroops)

$balance = $null
try {
  $account = Invoke-RestMethod "https://horizon-testnet.stellar.org/accounts/$sourceAddress"
  $balance = [decimal](($account.balances | Where-Object asset_type -eq "native").balance)
} catch { }

Write-Host ""
Write-Host "Plan: deploy the Ship It vault on TESTNET"
Write-Host "  Paid by:     $Source ($sourceAddress)"
Write-Host "  Holds:       " $(if ($null -ne $balance) { "$balance XLM" } else { "unknown (the account may not exist on testnet)" })
Write-Host "  Token:       native XLM, $token"
Write-Host "  Code:        $Code  (stored only as sha256 of the lowercase text: $codeHash)"
Write-Host "  Locks:       $Locked XLM ($lockedStroops stroops)"
Write-Host "  Per account: $Payout XLM ($payoutStroops stroops), once per account, so $([math]::Floor($Locked / $Payout)) accounts"
Write-Host "  WASM:        $wasm"
Write-Host "  There is no owner and no withdrawal: the locked XLM only leaves through claim." -ForegroundColor Yellow

if ($null -ne $balance -and $balance -lt ($Locked + 5)) { Fail "$Source holds $balance XLM and needs more than $($Locked + 5). Fund it: stellar keys fund $Source --network testnet" }

if (-not $Execute) {
  Write-Host ""
  Write-Host "Nothing was sent. Add -Execute to deploy and fund." -ForegroundColor Green
  exit 0
}

# ---- Sending -----------------------------------------------------------------------------------
Write-Host ""
Write-Host "Deploying..."
$output = (& stellar contract deploy --wasm $wasm --source $Source --network $network -- --token $token --code_hash $codeHash --payout $payoutStroops 2>&1 | Out-String)
$vaultId = [regex]::Match($output, "C[A-Z2-7]{55}").Value
if (-not $vaultId) { Fail "The deployment did not return a contract address:`n$output" }
$hashes = [regex]::Matches($output, "Signing transaction:\s*([0-9a-f]{64})")
$deployHash = if ($hashes.Count -gt 0) { $hashes[$hashes.Count - 1].Groups[1].Value } else { "" }

Write-Host "Locking $Locked XLM..."
$fund = (& stellar contract invoke --id $token --source $Source --network $network -- transfer --from $sourceAddress --to $vaultId --amount $lockedStroops 2>&1 | Out-String)
if ($LASTEXITCODE -ne 0) { Fail "The vault was deployed ($vaultId) but funding it failed:`n$fund" }
$fundHashes = [regex]::Matches($fund, "Signing transaction:\s*([0-9a-f]{64})")
$fundHash = if ($fundHashes.Count -gt 0) { $fundHashes[$fundHashes.Count - 1].Groups[1].Value } else { "" }

$held = (& stellar contract invoke --id $vaultId --source $Source --network $network -- get_balance 2>$null | Out-String).Trim().Trim('"')

Write-Host ""
Write-Host "Vault ready on testnet" -ForegroundColor Green
Write-Host "  Contract:     $vaultId"
Write-Host "  Explorer:     $explorer/contract/$vaultId"
if ($deployHash) { Write-Host "  Deploy tx:    $explorer/tx/$deployHash" }
if ($fundHash) { Write-Host "  Funding tx:   $explorer/tx/$fundHash" }
Write-Host "  Vault holds:  $held stroops"
Write-Host ""
Write-Host "Next: frontend/.env.local gets NEXT_PUBLIC_VAULT_CONTRACT_ID=$vaultId, then npm run bindings -- $vaultId testnet vault"
