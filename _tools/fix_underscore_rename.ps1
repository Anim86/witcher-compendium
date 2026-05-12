# Rename webp files on disk: dacciaio -> d_acciaio, dargento -> d_argento
$schematicsDir = 'c:\Users\apaci\Desktop\Script\witcher-compendium-main\witcher-compendium\assets\ALCHIMIA_E_ARTIGIANATO\witcher-schematics'

$files = Get-ChildItem $schematicsDir -Filter '*.webp' | Where-Object {
    $_.Name -match '(dacciaio|dargento)'
}

$count = 0
foreach ($f in $files) {
    $newName = $f.Name -replace 'dacciaio', 'd_acciaio' -replace 'dargento', 'd_argento'
    
    if ($newName -ne $f.Name) {
        $newPath = Join-Path $f.DirectoryName $newName
        if (-not (Test-Path $newPath)) {
            Rename-Item -Path $f.FullName -NewName $newName
            $count++
            Write-Host ('RENAMED | ' + $f.Name + ' -> ' + $newName)
        } else {
            Write-Host ('SKIP (target exists) | ' + $f.Name + ' -> ' + $newName)
        }
    }
}

Write-Host ''
Write-Host ('Total files renamed: ' + $count)
