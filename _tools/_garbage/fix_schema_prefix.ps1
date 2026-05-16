# Fix schema_schema_ -> schema_ in all JSON img fields
# Also renames the JSON files themselves if they contain schema_schema_

$srcPacks = 'c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\src-packs'
$count = 0
$renamed = 0

$jsonFiles = Get-ChildItem -Path $srcPacks -Recurse -Filter '*.json'

foreach ($f in $jsonFiles) {
    $content = Get-Content $f.FullName -Raw -Encoding UTF8
    
    if ($content -match 'schema_schema_') {
        # Fix the img field: schema_schema_ -> schema_
        $newContent = $content -replace 'schema_schema_', 'schema_'
        Set-Content -Path $f.FullName -Value $newContent -Encoding UTF8 -NoNewline
        $count++
        
        $parsed = $newContent | ConvertFrom-Json
        Write-Host ('FIXED img | ' + $f.Name + ' -> ' + $parsed.img)
    }
}

Write-Host ''
Write-Host ('JSON img fields fixed: ' + $count)

# Now rename the JSON files themselves
Write-Host ''
Write-Host '--- Renaming JSON files with schema_schema_ prefix ---'

$jsonFiles2 = Get-ChildItem -Path $srcPacks -Recurse -Filter 'schema_schema_*.json'
foreach ($f in $jsonFiles2) {
    $newName = $f.Name -replace '^schema_schema_', 'schema_'
    $newPath = Join-Path $f.DirectoryName $newName
    
    if (-not (Test-Path $newPath)) {
        Rename-Item -Path $f.FullName -NewName $newName
        $renamed++
        Write-Host ('RENAMED | ' + $f.Name + ' -> ' + $newName)
    } else {
        Write-Host ('SKIP (exists) | ' + $f.Name + ' -> ' + $newName)
    }
}

Write-Host ''
Write-Host ('JSON files renamed: ' + $renamed)
