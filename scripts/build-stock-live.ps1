# Naver + Yahoo live quotes -> public/data/stock-live-*.json
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$OutDir = Join-Path $Root "public\data"
$UniFile = Join-Path $Root "scripts\stock-universe.json"
$utf8 = New-Object System.Text.UTF8Encoding $false
$headers = @{ "User-Agent" = "Mozilla/5.0 FinTrack2030/1.0" }

$uni = Get-Content $UniFile -Raw -Encoding UTF8 | ConvertFrom-Json
$KrStocks = $uni.kr
$UsStocks = $uni.us

function Save-Json($path, $obj) {
  $json = $obj | ConvertTo-Json -Depth 8 -Compress
  [System.IO.File]::WriteAllText($path, $json, $utf8)
}

function Get-YahooQuotes($symbols) {
  $map = @{}
  $batchSize = 15
  for ($i = 0; $i -lt $symbols.Count; $i += $batchSize) {
    $end = [math]::Min($i + $batchSize - 1, $symbols.Count - 1)
    $batch = $symbols[$i..$end]
    $url = "https://query1.finance.yahoo.com/v7/finance/spark?symbols=$($batch -join ',')&range=1d&interval=1d"
    try {
      $r = Invoke-WebRequest -Uri $url -Headers $headers -UseBasicParsing -TimeoutSec 60
      $results = ($r.Content | ConvertFrom-Json).spark.result
      if (-not $results) { continue }
      foreach ($item in $results) {
        $meta = $item.response[0].meta
        if (-not $meta) { continue }
        $cur = [double]$meta.regularMarketPrice
        $prev = [double]$meta.chartPreviousClose
        if ($prev -eq 0) { $prev = $cur }
        $pct = if ($prev -ne 0) { [math]::Round((($cur - $prev) / $prev) * 100, 2) } else { 0 }
        $vol = 0
        if ($meta.regularMarketVolume) { $vol = [long]$meta.regularMarketVolume }
        $map[$item.symbol] = @{ price = $cur; change = $pct; volume = $vol }
      }
    } catch { Write-Warning $_.Exception.Message }
  }
  return $map
}

Write-Host "Fetching Naver indices..."
$idxUrl = "https://polling.finance.naver.com/api/realtime/domestic/index/KOSPI,KOSDAQ"
$indices = @{}
try {
  $idxRes = Invoke-WebRequest -Uri $idxUrl -Headers $headers -UseBasicParsing -TimeoutSec 30
  foreach ($d in ($idxRes.Content | ConvertFrom-Json).datas) {
    $price = [double]($d.closePrice -replace ',', '')
    $chg = [double]$d.fluctuationsRatio
    if ($d.compareToPreviousPrice.code -eq "5") { $chg = -$chg }
    $indices[$d.itemCode] = @{ price = $price; change = $chg }
  }
} catch { Write-Warning "Naver index: $($_.Exception.Message)" }

Write-Host "Fetching Yahoo indices..."
$yahooIdxMap = Get-YahooQuotes @("^GSPC", "^IXIC")
if ($yahooIdxMap["^GSPC"]) { $indices["SP500"] = $yahooIdxMap["^GSPC"] }
if ($yahooIdxMap["^IXIC"]) { $indices["NASDAQ"] = $yahooIdxMap["^IXIC"] }

Write-Host "Fetching Naver domestic..."
$codes = ($KrStocks | ForEach-Object { $_.code }) -join ","
$naverUrl = "https://polling.finance.naver.com/api/realtime/domestic/stock/$codes"
$naverRes = Invoke-WebRequest -Uri $naverUrl -Headers $headers -UseBasicParsing -TimeoutSec 60
$naverJson = $naverRes.Content | ConvertFrom-Json
$naverMap = @{}
foreach ($d in $naverJson.datas) {
  $price = [double]($d.closePrice -replace ',', '')
  $chg = [double]$d.fluctuationsRatio
  if ($d.compareToPreviousPrice.code -eq "5") { $chg = -$chg }
    $vol = 0
    if ($d.accumulatedTradingVolume) {
      $volRaw = ($d.accumulatedTradingVolume -replace ',', '')
      if ($volRaw -match '^\d+$') { $vol = [long]$volRaw }
    }
  $naverMap[$d.itemCode] = @{ price = $price; change = $chg; volume = $vol; name = $d.stockName }
}

$krNaver = @($KrStocks | ForEach-Object {
  $q = $naverMap[$_.code]
  @{
    name = if ($q.name) { $q.name } else { $_.name }
    code = $_.code; market = $_.market
    price = if ($q) { $q.price } else { 0 }
    change = if ($q) { $q.change } else { 0 }
    volume = if ($q) { $q.volume } else { 0 }
  }
})

Write-Host "Fetching Yahoo US..."
$usSyms = $UsStocks | ForEach-Object { $_.code }
$yahooUsMap = Get-YahooQuotes $usSyms
$usYahoo = @($UsStocks | ForEach-Object {
  $q = $yahooUsMap[$_.code]
  @{ name = $_.name; code = $_.code; market = $_.market; price = $(if ($q) { $q.price } else { 0 }); change = $(if ($q) { $q.change } else { 0 }); volume = $(if ($q) { $q.volume } else { 0 }) }
})

Write-Host "Fetching Yahoo KR..."
$krSyms = $KrStocks | ForEach-Object { "$($_.code).$($_.suffix)" }
$yahooKrMap = Get-YahooQuotes $krSyms
$krYahoo = @($KrStocks | ForEach-Object {
  $sym = "$($_.code).$($_.suffix)"
  $q = $yahooKrMap[$sym]
  @{ name = $_.name; code = $_.code; market = $_.market; price = $(if ($q) { $q.price } else { 0 }); change = $(if ($q) { $q.change } else { 0 }); volume = $(if ($q) { $q.volume } else { 0 }) }
})

$now = (Get-Date).ToUniversalTime().ToString("o")
Save-Json (Join-Path $OutDir "stock-live-naver.json") @{ updated = $now; indices = $indices; kr = $krNaver; us = $usYahoo; source = "naver+yahoo" }
Save-Json (Join-Path $OutDir "stock-live-yahoo.json") @{ updated = $now; indices = $indices; kr = $krYahoo; us = $usYahoo; source = "yahoo" }
Write-Host "Saved stock-live JSON files"
