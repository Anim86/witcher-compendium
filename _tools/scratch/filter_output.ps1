$lines = Get-Content 'c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\scratch\audit_output.txt' -Encoding Unicode
foreach ($line in $lines) {
    if ($line -match 'Impossibile') { continue }
    if ($line -match 'CategoryInfo') { continue }
    if ($line -match 'FullyQualifiedErrorId') { continue }
    if ($line -match 'audit_weapons') { continue }
    if ($line -match 'RuntimeException') { continue }
    if ($line -match '^\+') { continue }
    if ($line -match '^\s+~') { continue }
    if ($line.Trim() -eq '') { continue }
    Write-Host $line
}
