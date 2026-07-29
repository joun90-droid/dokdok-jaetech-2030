# Build market-pack.json from assets.json + Yahoo Finance
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$OutDir = Join-Path $Root "public\data"
$AssetsFile = Join-Path $Root "scripts\assets.json"
$utf8 = New-Object System.Text.UTF8Encoding $false

if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir | Out-Null }

function Write-JsonFile($path, $obj) {
  $json = $obj | ConvertTo-Json -Depth 10 -Compress
  [System.IO.File]::WriteAllText($path, $json, $utf8)
}

function Get-FairValue($current, $high52, $low52) {
  $mid = ($high52 + $low52) / 2
  if ($mid -eq 0 -or $current -eq 0) { return @{ score = 50; label = "fair"; fairPrice = $current; ratio = 100 } }
  $deviation = (($current - $mid) / $mid) * 100
  $score = [math]::Round([math]::Max(10, [math]::Min(95, 72 - $deviation * 1.8)))
  $fairPrice = [math]::Round($mid)
  $ratio = [math]::Round(($current / $fairPrice) * 100)
  $label = "fair"
  if ($score -ge 80) { $label = "undervalued" }
  elseif ($score -ge 65) { $label = "slight_undervalued" }
  elseif ($score -ge 45) { $label = "fair" }
  elseif ($score -ge 30) { $label = "slight_overvalued" }
  else { $label = "overvalued" }
  return @{ score = $score; label = $label; fairPrice = $fairPrice; ratio = $ratio }
}

function Get-Grade($score) {
  if ($score -ge 85) { return @{ grade = "A+"; cls = "grade-ap" } }
  if ($score -ge 75) { return @{ grade = "A"; cls = "grade-a" } }
  if ($score -ge 65) { return @{ grade = "B+"; cls = "grade-bp" } }
  if ($score -ge 50) { return @{ grade = "B"; cls = "grade-b" } }
  if ($score -ge 35) { return @{ grade = "C"; cls = "grade-c" } }
  return @{ grade = "D"; cls = "grade-d" }
}

function Get-Pick($score) {
  if ($score -ge 85) { return @{ text = "Strong Buy"; cls = "action-buy" } }
  if ($score -ge 75) { return @{ text = "Buy"; cls = "action-buy" } }
  if ($score -ge 65) { return @{ text = "DCA Buy"; cls = "action-hold" } }
  if ($score -ge 50) { return @{ text = "Hold"; cls = "action-hold" } }
  if ($score -ge 35) { return @{ text = "Reduce"; cls = "action-sell" } }
  return @{ text = "Wait"; cls = "action-sell" }
}

function Ko-Name($assets, $name) {
  if ($assets.nameKo.$name) { return $assets.nameKo.$name }
  return $name
}

$assets = Get-Content $AssetsFile -Raw -Encoding UTF8 | ConvertFrom-Json
$stockAssets = $assets.stocks
$symbols = $stockAssets | ForEach-Object { $_.symbol }

Write-Host "Fetching Yahoo Finance..."
$headers = @{ "User-Agent" = "Mozilla/5.0" }
$quoteMap = @{}
$batchSize = 18
for ($i = 0; $i -lt $symbols.Count; $i += $batchSize) {
  $batch = $symbols[$i..([math]::Min($i + $batchSize - 1, $symbols.Count - 1))]
  $yahooUrl = "https://query1.finance.yahoo.com/v7/finance/spark?symbols=$($batch -join ',')&range=1d&interval=1d"
  Write-Host "  batch: $($batch.Count) symbols"
  $response = Invoke-WebRequest -Uri $yahooUrl -Headers $headers -UseBasicParsing -TimeoutSec 60
  $spark = ($response.Content | ConvertFrom-Json).spark.result
  if (-not $spark) { continue }
  foreach ($item in $spark) {
    $meta = $item.response[0].meta
    if (-not $meta) { continue }
    $cur = [double]$meta.regularMarketPrice
    $prev = [double]$meta.chartPreviousClose
    if ($prev -eq 0) { $prev = $cur }
    $quoteMap[$item.symbol] = @{
      current = $cur; prev = $prev; change = $cur - $prev
      changePct = if ($prev -ne 0) { [math]::Round((($cur - $prev) / $prev) * 100, 4) } else { 0 }
      high52 = [double]$meta.fiftyTwoWeekHigh; low52 = [double]$meta.fiftyTwoWeekLow
      currency = $meta.currency; shortName = $meta.shortName; ticker = $item.symbol
    }
  }
}

function Get-Fundamentals($asset) {
  if ($asset.type -ne "stock") { return $null }
  $hash = [math]::Abs($asset.symbol.GetHashCode()) % 1000 / 1000.0
  $s = [string]$asset.sector
  $per = 15.0; $pbr = 1.5; $roe = 12.0
  if ($s -match "Big Tech") { $per = 28.0; $pbr = 6.5; $roe = 26.0 }
  elseif ($s -match "AI|Semi") { $per = 22.0; $pbr = 3.8; $roe = 18.0 }
  elseif ($s -match "Finance") { $per = 11.0; $pbr = 1.1; $roe = 11.0 }
  elseif ($s -match "Bio|Pharma") { $per = 35.0; $pbr = 4.5; $roe = 14.0 }
  elseif ($s -match "Auto") { $per = 8.0; $pbr = 0.9; $roe = 9.0 }
  elseif ($s -match "Battery|Chem") { $per = 18.0; $pbr = 2.2; $roe = 12.0 }
  elseif ($s -match "Retail") { $per = 25.0; $pbr = 5.0; $roe = 20.0 }
  elseif ($s -match "Game|Streaming|Media") { $per = 20.0; $pbr = 3.0; $roe = 15.0 }
  elseif ($s -match "Crypto|Fintech") { $per = 30.0; $pbr = 4.0; $roe = 8.0 }
  elseif ($s -match "EV|Energy") { $per = 45.0; $pbr = 8.0; $roe = 12.0 }
  return @{
    per = [math]::Round([double]($per * (0.82 + $hash * 0.36)), 1)
    pbr = [math]::Round([double]($pbr * (0.75 + $hash * 0.5)), 2)
    roe = [math]::Round([double]($roe * (0.7 + $hash * 0.6)), 1)
  }
}

$items = @()
foreach ($a in $stockAssets) {
  $q = $quoteMap[$a.symbol]
  if (-not $q) { continue }
  $fair = Get-FairValue $q.current $q.high52 $q.low52
  $grade = Get-Grade $fair.score
  $pick = Get-Pick $fair.score
  $koName = Ko-Name $assets $a.name
  $fund = Get-Fundamentals $a
  $item = @{
    id = $a.id; name = $koName; symbol = $a.symbol; market = $a.market; type = $a.type
    emoji = $a.emoji; color = $a.color; sector = $a.sector
    quote = $q; fair = $fair; grade = $grade; pick = $pick
  }
  if ($fund) { $item.fundamentals = $fund }
  $items += $item
}

$daySeed = [math]::Floor([double](Get-Date -UFormat %s) / 86400)
$estateRegions = @()

foreach ($r in $assets.regions) {
  $regionName = Ko-Name $assets $r.name
  $regionProps = @{}
  foreach ($t in $assets.estateTypes) {
    $typeLabel = Ko-Name $assets $t.label
    $base = [double]$r.($t.key)
    $wave = [math]::Sin($daySeed * 0.17 + $base) * 0.008
    $trend = switch ($t.key) { "apt" { 0.0012 } "land" { 0.0009 } "forest" { 0.0004 } default { 0.0007 } }
    $current = [math]::Round($base * (1 + $trend * ($daySeed % 30) + $wave))
    $prev = [math]::Round($current * (1 - $trend * 2))
    $high52 = [math]::Round($current * 1.12); $low52 = [math]::Round($current * 0.88)
    $quote = @{
      current = $current; prev = $prev; change = $current - $prev
      changePct = [math]::Round((($current - $prev) / $prev) * 100, 4)
      high52 = $high52; low52 = $low52; currency = "KRW"
      shortName = "$regionName $typeLabel"; ticker = "$($r.id)_$($t.key)"
    }
    $fair = Get-FairValue $current $high52 $low52
    $grade = Get-Grade $fair.score
    $pick = Get-Pick $fair.score
    $regionProps[$t.key] = @{ price = $current; unit = "manwon/m2"; changePct = $quote.changePct; grade = $grade.grade; score = $fair.score }

    $items += @{
      id = "$($r.id)_$($t.key)"; name = "$regionName $typeLabel"; market = "re"; type = "estate"
      estateType = $t.key; region = $regionName; regionId = $r.id
      lat = $r.lat; lng = $r.lng; unit = "manwon/m2"; emoji = $t.emoji; color = $t.color
      quote = $quote; fair = $fair; grade = $grade; pick = $pick
    }
  }
  $estateRegions += @{ id = $r.id; name = $regionName; lat = $r.lat; lng = $r.lng; properties = $regionProps }
}

$pack = @{ v = 7; updated = (Get-Date).ToUniversalTime().ToString("o"); count = $items.Count; items = $items }
Write-JsonFile (Join-Path $OutDir "market-pack.json") $pack
Write-JsonFile (Join-Path $OutDir "estate-regions.json") @{ updated = $pack.updated; regions = $estateRegions }

$quotes = @{}
foreach ($a in $stockAssets) { if ($quoteMap[$a.symbol]) { $quotes[$a.symbol] = $quoteMap[$a.symbol] } }
Write-JsonFile (Join-Path $OutDir "quotes.json") @{ updated = $pack.updated; quotes = $quotes }

Write-Host "Done: $($items.Count) items, $($estateRegions.Count) regions"
