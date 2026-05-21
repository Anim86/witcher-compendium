# Deploy Script for Witcher TRPG Project (Generalized Version)

# --- CONFIGURAZIONE PERCORSI ---

# Sorgenti: puntano automaticamente alla cartella dove si trova questo script
$moduleSrc = Join-Path $PSScriptRoot "witcher-compendium"
$systemSrc = Join-Path $PSScriptRoot "TheWitcherItaNewSystem"

# Destinazione: prova il vecchio percorso su E:, altrimenti usa il percorso standard su C:
$foundryBase = "E:\FoundryVTT_Data"
if (-not (Test-Path $foundryBase)) {
    # Percorso standard basato sull'utente corrente
    $foundryBase = "$env:LOCALAPPDATA\FoundryVTT"
}

$moduleDest = Join-Path $foundryBase "Data\modules\witcher-compendium"
$systemDest = Join-Path $foundryBase "Data\systems\TheWitcherItaNewSystem"

# --- LOGICA DI DEPLOY ---

Write-Host "Starting deployment to: $foundryBase" -ForegroundColor Cyan
Write-Host "Source path: $PSScriptRoot" -ForegroundColor Gray

# Stop FoundryVTT service (se installato come servizio) o processo desktop
Write-Host "Stopping FoundryVTT (if running)..." -ForegroundColor Yellow
Stop-Service -Name "FoundryVTT" -ErrorAction SilentlyContinue
$foundryProcess = Get-Process -Name "FoundryVTT" -ErrorAction SilentlyContinue
if ($foundryProcess) {
    Write-Host "Rilevato processo FoundryVTT attivo. Chiusura in corso per sbloccare i file del database..." -ForegroundColor Yellow
    Stop-Process -Name "FoundryVTT" -Force
    Start-Sleep -Seconds 2
}


# Deploy Module
if (Test-Path $moduleSrc) {
    Write-Host "Deploying module: witcher-compendium..." -ForegroundColor Yellow
    if (Test-Path $moduleDest) { Remove-Item -Path $moduleDest -Recurse -Force }
    New-Item -ItemType Directory -Path $moduleDest -Force | Out-Null
    Copy-Item -Path "$moduleSrc\*" -Destination $moduleDest -Recurse -Force
    Write-Host "Module deployed successfully." -ForegroundColor Green
} else {
    Write-Error "Source module directory not found: $moduleSrc"
}

# Deploy System
if (Test-Path $systemSrc) {
    Write-Host "Deploying system: TheWitcherItaNewSystem..." -ForegroundColor Yellow
    if (Test-Path $systemDest) { Remove-Item -Path $systemDest -Recurse -Force }
    New-Item -ItemType Directory -Path $systemDest -Force | Out-Null
    Copy-Item -Path "$systemSrc\*" -Destination $systemDest -Recurse -Force
    Write-Host "System deployed successfully." -ForegroundColor Green
} else {
    Write-Error "Source system directory not found: $systemSrc"
}

Write-Host "Deployment complete!" -ForegroundColor Cyan

# Restart service
Write-Host "Restarting FoundryVTT service..." -ForegroundColor Yellow
Start-Service -Name "FoundryVTT" -ErrorAction SilentlyContinue

