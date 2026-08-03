# public/ 저장 시 Firebase Hosting 자동 배포 (로컬 파일 감시)
# 사용: pwsh -File scripts/watch-and-deploy.ps1
# 종료: Ctrl+C

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Public = Join-Path $Root "public"
$Project = "fintrack2030-248bf"
$DebounceSec = 8

Set-Location $Root

Write-Host "Watching: $Public" -ForegroundColor Cyan
Write-Host "Project:  $Project" -ForegroundColor Cyan
Write-Host "Deploy after ${DebounceSec}s quiet. Ctrl+C to stop.`n" -ForegroundColor DarkGray

$timer = $null
$pending = $false

function Invoke-Deploy {
  Write-Host "`n[$(Get-Date -Format 'HH:mm:ss')] Deploying..." -ForegroundColor Yellow
  firebase deploy --only hosting --project $Project
  if ($LASTEXITCODE -eq 0) {
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Done → https://fintrack2030-248bf.web.app`n" -ForegroundColor Green
  } else {
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Deploy FAILED`n" -ForegroundColor Red
  }
}

$action = {
  $script:pending = $true
  if ($script:timer) { $script:timer.Dispose() }
  $script:timer = New-Object System.Timers.Timer ($DebounceSec * 1000)
  $script:timer.AutoReset = $false
  Register-ObjectEvent -InputObject $script:timer -EventName Elapsed -Action {
    if ($script:pending) {
      $script:pending = $false
      Invoke-Deploy
    }
  } | Out-Null
  $script:timer.Start()
}

$watcher = New-Object System.IO.FileSystemWatcher $Public -Property LastWrite, FileName, ChangeType
Register-ObjectEvent $watcher Changed -Action $action | Out-Null
Register-ObjectEvent $watcher Created -Action $action | Out-Null
Register-ObjectEvent $watcher Deleted -Action $action | Out-Null
Register-ObjectEvent $watcher Renamed -Action $action | Out-Null

try {
  while ($true) { Start-Sleep -Seconds 1 }
} finally {
  $watcher.Dispose()
}
