<#
.SYNOPSIS
  Deploys a fresh demo treasury on Stellar testnet and loads it with the demo data.

.DESCRIPTION
  Creates nothing it cannot recreate: it reuses the Stellar CLI identities qt-assembly, qt-admin,
  qt-council1..3 and qt-vendor (see docs/06-getting-started.md), deploys a new contract with a 2-of-3
  council, opens three budget lines, approves one vendor, funds the treasury and runs one complete
  expense (proposed, signed twice, paid) with the invoice in scripts/demo/factura-ascensor.pdf.

  Run it again before each recording to start from the same state. Testnet only.

.PARAMETER Alias
  Name the new contract gets in the CLI. An existing alias with this name is replaced.

.EXAMPLE
  ./scripts/seed-demo.ps1
#>
param([string]$Alias = "quintti-demo")

$ErrorActionPreference = "Continue"
$root = Split-Path -Parent $PSScriptRoot
$wasm = Join-Path $root "target/wasm32v1-none/release/quintti_treasury.wasm"
$invoice = Join-Path $PSScriptRoot "demo/factura-ascensor.pdf"
$network = "testnet"
$stroops = 10000000

# The amounts of the demo, in XLM.
$budgets = @(
  @{ Category = "mantenimiento"; Limit = 1000 },
  @{ Category = "vigilancia"; Limit = 600 },
  @{ Category = "aseo"; Limit = 300 }
)
$deposit = 500
$firstExpense = @{ Category = "mantenimiento"; Amount = 80 }

$evidence = New-Object System.Collections.Generic.List[object]

function Invoke-Stellar {
  param([string]$Step, [string[]]$Arguments)
  $output = (& stellar @Arguments 2>&1 | Out-String)
  if ($LASTEXITCODE -ne 0) { throw "Step '$Step' failed:`n$output" }
  $hash = [regex]::Match($output, "(?i)transaction[^0-9a-f]*([0-9a-f]{64})").Groups[1].Value
  if ($hash) { $evidence.Add([pscustomobject]@{ Step = $Step; Hash = $hash }) }
  return $output.Trim()
}

function Call-Contract {
  param([string]$Step, [string]$Source, [string[]]$Arguments)
  Write-Host "  $Step"
  Invoke-Stellar $Step (@("contract", "invoke", "--id", $Alias, "--source", $Source, "--network", $network, "--") + $Arguments) | Out-Null
}

function Address([string]$Identity) { (& stellar keys address $Identity).Trim() }

function Sha256Hex([string]$Path) {
  $sha = [Security.Cryptography.SHA256]::Create()
  ([BitConverter]::ToString($sha.ComputeHash([IO.File]::ReadAllBytes($Path))) -replace "-", "").ToLower()
}

if (-not (Test-Path $wasm)) { throw "Build the contract first: stellar contract build (expected $wasm)" }
if (-not (Test-Path $invoice)) { throw "Missing $invoice" }

Write-Host "Deploying the demo treasury on $network"
$council = @((Address "qt-council1"), (Address "qt-council2"), (Address "qt-council3"))
$councilFile = Join-Path ([IO.Path]::GetTempPath()) "quintti-council.json"
[IO.File]::WriteAllText($councilFile, ($council | ConvertTo-Json -Compress))
& stellar contract alias remove $Alias 2>&1 | Out-Null
$token = (& stellar contract id asset --asset native --network $network).Trim()

$deployOutput = Invoke-Stellar "deploy" @(
  "contract", "deploy", "--wasm", $wasm, "--source", "qt-admin", "--network", $network, "--alias", $Alias,
  "--", "--token", $token, "--assembly", (Address "qt-assembly"), "--administrator", (Address "qt-admin"),
  "--council-file-path", $councilFile, "--threshold", "2"
)
$contractId = [regex]::Match($deployOutput, "C[A-Z2-7]{55}").Value
if (-not $contractId) { throw "Could not read the contract id from:`n$deployOutput" }
Remove-Item $councilFile -ErrorAction SilentlyContinue

Write-Host "Loading the demo data into $contractId"
foreach ($line in $budgets) {
  Call-Contract "budget $($line.Category) $($line.Limit) XLM" "qt-assembly" @("set_budget", "--category", $line.Category, "--limit", ([string]($line.Limit * $stroops)))
}
Call-Contract "approve the vendor" "qt-assembly" @("set_vendor", "--vendor", (Address "qt-vendor"), "--allowed", "true")
Call-Contract "deposit $deposit XLM" "qt-assembly" @("deposit", "--from", (Address "qt-assembly"), "--amount", ([string]($deposit * $stroops)))
Call-Contract "propose $($firstExpense.Amount) XLM" "qt-admin" @(
  "propose_expense", "--category", $firstExpense.Category, "--vendor", (Address "qt-vendor"),
  "--amount", ([string]($firstExpense.Amount * $stroops)), "--invoice_hash", (Sha256Hex $invoice)
)
Call-Contract "first approval (stays pending)" "qt-council1" @("approve_expense", "--approver", (Address "qt-council1"), "--id", "0")
Call-Contract "second approval (pays the vendor)" "qt-council2" @("approve_expense", "--approver", (Address "qt-council2"), "--id", "0")

Write-Host ""
Write-Host "Demo treasury ready"
Write-Host "  Contract: $contractId"
Write-Host "  Explorer: https://stellar.expert/explorer/testnet/contract/$contractId"
Write-Host "  Put it in frontend/.env.local as NEXT_PUBLIC_TREASURY_CONTRACT_ID=$contractId"
Write-Host ""
foreach ($item in $evidence) {
  Write-Host ("  {0,-38} https://stellar.expert/explorer/testnet/tx/{1}" -f $item.Step, $item.Hash)
}
