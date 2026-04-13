# Deploy Script for Witcher TRPG Project

# Destination paths
$moduleDest = "E:\FoundryVTT_Data\Data\modules\witcher-compendium"
$systemDest = "E:\FoundryVTT_Data\Data\systems\TheWitcherItaNewSystem"

# Source paths (relative to script location)
$moduleSrc = ".\witcher-compendium"
$systemSrc = ".\TheWitcherItaNewSystem"

Write-Host "Starting deployment to Foundry VTT..." -ForegroundColor Cyan

# Stop FoundryVTT service (if running)
Write-Host "Stopping FoundryVTT service..." -ForegroundColor Yellow
Stop-Service -Name "FoundryVTT" -ErrorAction SilentlyContinue

# Deploy Module
if (Test-Path $moduleSrc) {
    Write-Host "Deploying module: witcher-compendium..." -ForegroundColor Yellow
    if (!(Test-Path $moduleDest)) { New-Item -ItemType Directory -Path $moduleDest -Force | Out-Null }
    Copy-Item -Path "$moduleSrc\*" -Destination $moduleDest -Recurse -Force
    Write-Host "Module deployed successfully." -ForegroundColor Green
} else {
    Write-Warning "Source module directory not found: $moduleSrc"
}

# Deploy System
if (Test-Path $systemSrc) {
    Write-Host "Deploying system: TheWitcherItaNewSystem..." -ForegroundColor Yellow
    if (!(Test-Path $systemDest)) { New-Item -ItemType Directory -Path $systemDest -Force | Out-Null }
    Copy-Item -Path "$systemSrc\*" -Destination $systemDest -Recurse -Force
    Write-Host "System deployed successfully." -ForegroundColor Green
} else {
    Write-Warning "Source system directory not found: $systemSrc"
}

Write-Host "Deployment complete!" -ForegroundColor Cyan

# Restart service (if it was intended to be on)
Write-Host "Restarting FoundryVTT service..." -ForegroundColor Yellow
Start-Service -Name "FoundryVTT" -ErrorAction SilentlyContinue
