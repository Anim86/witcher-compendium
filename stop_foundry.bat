@echo off
echo Arresto del servizio Foundry VTT...
net stop FoundryVTT
if %errorlevel% neq 0 (
    echo.
    echo ERRORE: Assicurati di eseguire questo file come AMMINISTRATORE.
)
pause
