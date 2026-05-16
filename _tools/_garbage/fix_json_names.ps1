# Find and rename JSON files with _x3, _x5, _x10 in the name
$srcPacks = 'c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\src-packs'
$files = Get-ChildItem -Path $srcPacks -Recurse -Filter '*.json' | Where-Object { $_.Name -match '_x\d+_' }

$count = 0
foreach ($f in $files) {
    $newName = $f.Name -replace '_x\d+_', '_'
    if ($newName -ne $f.Name) {
        $newPath = Join-Path $f.DirectoryName $newName
        if (-not (Test-Path $newPath)) {
            Rename-Item -Path $f.FullName -NewName $newName
            $count++
            Write-Host ('RENAMED | ' + $f.Name + ' -> ' + $newName)
        } else {
            Write-Host ('SKIP | ' + $f.Name + ' -> ' + $newName + ' (exists)')
        }
    }
}
Write-Host ('Total renamed: ' + $count)
