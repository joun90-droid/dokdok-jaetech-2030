$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

$port = 8080
$hostName = "127.0.0.1"
$publicDir = Join-Path $root "public"

$existing = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -First 1
if ($existing) {
    Write-Host "이미 로컬 서버가 포트 $port 에서 실행 중입니다."
    Write-Host "브라우저에서 http://$hostName:$port 접속하면 됩니다."
    Start-Process "http://$hostName:$port"
    return
}

Write-Host "로컬 서버 시작 중... http://$hostName:$port"
Start-Process "http://$hostName:$port"
python -m http.server $port --bind $hostName --directory $publicDir
