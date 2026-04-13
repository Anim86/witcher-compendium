# Script per l'installazione di Foundry VTT come Servizio Windows (Metodo WinSW)
# ESEGUIRE COME AMMINISTRATORE

$serviceName = "FoundryVTT"
$nodePath = "C:\Program Files\nodejs\node.exe"
$foundryMain = "E:\Foundry Virtual Tabletop\resources\app\main.js"
$dataPath = "E:\FoundryVTT_Data"
$installDir = "E:\FoundryVTT_Service"

# 1. Creazione directory di installazione
if (!(Test-Path $installDir)) {
    New-Item -ItemType Directory -Path $installDir | Out-Null
}

# 2. Download WinSW
$winswExe = "$installDir\$serviceName.exe"
$winswXml = "$installDir\$serviceName.xml"

Write-Host "Scaricamento di WinSW da GitHub..." -ForegroundColor Yellow
Invoke-WebRequest -Uri "https://github.com/winsw/winsw/releases/latest/download/WinSW-x64.exe" -OutFile $winswExe

# 3. Creazione file di configurazione XML
$xmlContent = @"
<service>
  <id>$serviceName</id>
  <name>Foundry VTT Service</name>
  <description>Servizio per il server di Foundry Virtual Tabletop</description>
  <executable>$nodePath</executable>
  <arguments>"$foundryMain" --dataPath="$dataPath"</arguments>
  <log mode="roll"></log>
  <startmode>Manual</startmode>
</service>
"@

$xmlContent | Out-File -FilePath $winswXml -Encoding utf8

# 4. Installazione del servizio
Write-Host "Installazione del servizio $serviceName..." -ForegroundColor Green

# Verifica se esiste già
$existingService = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
if ($existingService) {
    Write-Host "Rimuovo versione precedente..." -ForegroundColor Yellow
    Start-Process -FilePath $winswExe -ArgumentList "stop" -Wait -NoNewWindow
    Start-Process -FilePath $winswExe -ArgumentList "uninstall" -Wait -NoNewWindow
}

# Installazione
Start-Process -FilePath $winswExe -ArgumentList "install" -Wait -NoNewWindow

Write-Host "`nInstallazione completata!" -ForegroundColor White -BackgroundColor Green
Write-Host "Foundry VTT è stato installato come servizio con AVVIO MANUALE."
Write-Host "Puoi gestirlo con i comandi:"
Write-Host "  Start-Service $serviceName" -ForegroundColor Cyan
Write-Host "  Stop-Service $serviceName" -ForegroundColor Cyan
Write-Host "`nI log sono disponibili in: $installDir"
