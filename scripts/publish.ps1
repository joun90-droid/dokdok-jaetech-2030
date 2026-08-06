# GitHub push + Firebase Hosting 배포 (FinTrack 2030)
# 사용: .\scripts\publish.ps1 [-Message "커밋 메시지"] [-DeployOnly]
param(
  [string]$Message = "Update site.",
  [switch]$DeployOnly
)

$ErrorActionPreference = "Stop"
Set-Location "D:\Sites\live\재테크 투자정보"

if (-not $DeployOnly) {
  git add -A
  $status = git status --porcelain
  if ($status) {
    git commit -m $Message
    git push origin main
    Write-Host "GitHub push 완료" -ForegroundColor Green
  } else {
    Write-Host "커밋할 변경 없음 — deploy만 진행" -ForegroundColor Yellow
  }
}

firebase deploy --only hosting --project fintrack2030-248bf
Write-Host "Firebase deploy 완료: https://fintrack2030-248bf.web.app/" -ForegroundColor Green
