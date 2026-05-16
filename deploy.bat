@echo off
@echo off
:: Controlla se lo script e' in esecuzione con privilegi di amministratore
net session >nul 2>&1
if %errorLevel% == 0 (
    goto :Admin
) else (
    echo Richiesta privilegi di amministratore in corso...
    powershell -Command "Start-Process '%~dpnx0' -Verb RunAs"
    exit /b
)

:Admin
powershell.exe -ExecutionPolicy Bypass -File "%~dp0deploy.ps1"
pause
