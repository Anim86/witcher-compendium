@echo off
echo Avvio del servizio Foundry VTT...
net start FoundryVTT
if %errorlevel% neq 0 (
    echo.
    echo ERRORE: Assicurati di eseguire questo file come AMMINISTRATORE.
)
pause
