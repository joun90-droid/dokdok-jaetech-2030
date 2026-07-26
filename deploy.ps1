# 영재가 추천하는 — GitHub + Firebase(Google Cloud) 배포 스크립트
# PowerShell에서 실행: .\deploy.ps1

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ProjectRoot

$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")

Write-Host "`n=== 1. GitHub 로그인 확인 ===" -ForegroundColor Cyan
gh auth status 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "브라우저에서 GitHub 로그인을 완료하세요."
    gh auth login -h github.com -p https -w
}

Write-Host "`n=== 2. Firebase(Google) 로그인 확인 ===" -ForegroundColor Cyan
firebase login:list 2>$null | Select-String "No authorized" -Quiet
if ($LASTEXITCODE -eq 0 -or (firebase login:list 2>&1 | Select-String "No authorized")) {
    Write-Host "브라우저에서 Google 계정 로그인을 완료하세요."
    firebase login
}

$ProjectId = "youngjae-invest-2026"
Write-Host "`n=== 3. Firebase 프로젝트: $ProjectId ===" -ForegroundColor Cyan
$projects = firebase projects:list 2>&1 | Out-String
if ($projects -notmatch $ProjectId) {
    firebase projects:create $ProjectId --display-name "영재가 추천하는" 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "프로젝트 ID가 이미 사용 중이면 .firebaserc 의 default 값을 변경하세요." -ForegroundColor Yellow
    }
}
firebase use $ProjectId

Write-Host "`n=== 4. GitHub 저장소 생성 및 push ===" -ForegroundColor Cyan
$RepoName = "youngjae-youth-invest"
git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) {
    gh repo create $RepoName --public --source=. --remote=origin --push
} else {
    git push -u origin main
}

Write-Host "`n=== 5. Firebase Hosting 배포 ===" -ForegroundColor Cyan
firebase deploy --only hosting --project $ProjectId

$Url = "https://$ProjectId.web.app"
Write-Host "`n========================================" -ForegroundColor Green
Write-Host " 배포 완료!" -ForegroundColor Green
Write-Host " 사이트 URL: $Url" -ForegroundColor Green
Write-Host " GitHub: https://github.com/$(gh api user -q .login)/$RepoName" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green
