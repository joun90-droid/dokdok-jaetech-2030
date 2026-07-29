# Yahoo Finance Spark API → public/data/quotes.json
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$OutDir = Join-Path $Root "public\data"
$OutFile = Join-Path $OutDir "quotes.json"

$Symbols = @(
  "^GSPC", "^IXIC", "^KS11", "^KQ11",
  "069500.KS", "360750.KS",
  "AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "TSLA",
  "005930.KS", "000660.KS", "035420.KS", "005380.KS", "035720.KS"
)

if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir | Out-Null }

$yahooUrl = "https://query1.finance.yahoo.com/v7/finance/spark?symbols=$($Symbols -join ',')&range=1d&interval=1d"
Write-Host "Fetching: $yahooUrl"

$headers = @{ "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
$response = Invoke-WebRequest -Uri $yahooUrl -Headers $headers -UseBasicParsing -TimeoutSec 30
$json = $response.Content | ConvertFrom-Json

$quotes = @{}
foreach ($item in $json.spark.result) {
  $meta = $item.response[0].meta
  if (-not $meta) { continue }
  $current = [double]$meta.regularMarketPrice
  $prev = [double]($meta.chartPreviousClose)
  if ($prev -eq 0) { $prev = $current }
  $change = $current - $prev
  $changePct = if ($prev -ne 0) { ($change / $prev) * 100 } else { 0 }

  $quotes[$item.symbol] = @{
    current     = $current
    prev        = $prev
    change      = $change
    changePct   = [math]::Round($changePct, 4)
    high52      = [double]$meta.fiftyTwoWeekHigh
    low52       = [double]$meta.fiftyTwoWeekLow
    currency    = $meta.currency
    shortName   = if ($meta.shortName) { $meta.shortName } else { $meta.longName }
    ticker      = $item.symbol
  }
}

$output = @{
  updated = (Get-Date).ToUniversalTime().ToString("o")
  quotes  = $quotes
} | ConvertTo-Json -Depth 5

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($OutFile, $output, $utf8NoBom)
Write-Host "Saved $($quotes.Count) quotes → $OutFile"
