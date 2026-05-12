# Remove quantity suffixes from both disk files and JSON references
# Disk: _a3, _a10 -> removed
# JSON img: _x3, _x10 -> removed  
# JSON filenames: _x3, _x10 -> removed

$srcPacks = 'c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\src-packs'
$schematicsDir = 'c:\Users\apaci\Desktop\Script\witcher-compendium-main\witcher-compendium\assets\ALCHIMIA_E_ARTIGIANATO\witcher-schematics'

# 1. Rename files on disk: remove _a3, _a10
Write-Host '=== STEP 1: Rename .webp files on disk ==='
$diskFiles = Get-ChildItem $schematicsDir -Filter '*.webp' | Where-Object {
    $_.Name -match '_a\d+\.webp$'
}

$diskCount = 0
foreach ($f in $diskFiles) {
    $newName = $f.Name -replace '_a\d+\.webp$', '.webp'
    $newPath = Join-Path $f.DirectoryName $newName
    if (-not (Test-Path $newPath)) {
        Rename-Item -Path $f.FullName -NewName $newName
        $diskCount++
        Write-Host ('  RENAMED | ' + $f.Name + ' -> ' + $newName)
    } else {
        Write-Host ('  SKIP (exists) | ' + $f.Name + ' -> ' + $newName)
    }
}
Write-Host ('  Disk files renamed: ' + $diskCount)

# 2. Fix JSON img fields: remove _x3, _x10 from img path
Write-Host ''
Write-Host '=== STEP 2: Fix JSON img fields ==='
$jsonFiles = Get-ChildItem -Path $srcPacks -Recurse -Filter '*.json'

$jsonCount = 0
foreach ($f in $jsonFiles) {
    $raw = Get-Content $f.FullName -Raw -Encoding UTF8
    $content = $raw | ConvertFrom-Json
    if (-not $content.img) { continue }
    if ($content.img -notmatch '_x\d+\.webp$') { continue }
    
    $newImg = $content.img -replace '_x\d+\.webp$', '.webp'
    $newRaw = $raw -replace [regex]::Escape($content.img), $newImg
    Set-Content -Path $f.FullName -Value $newRaw -Encoding UTF8 -NoNewline
    $jsonCount++
    Write-Host ('  FIXED | ' + $f.Name)
    Write-Host ('    OLD: ' + $content.img)
    Write-Host ('    NEW: ' + $newImg)
}
Write-Host ('  JSON img fields fixed: ' + $jsonCount)

# 3. Rename JSON files: remove _x3, _x10 from filename
Write-Host ''
Write-Host '=== STEP 3: Rename JSON files ==='
$jsonFiles2 = Get-ChildItem -Path $srcPacks -Recurse -Filter '*_x[0-9]*.json'

$renameCount = 0
foreach ($f in $jsonFiles2) {
    # Only target the quantity suffix, preserve the hash suffix
    # Pattern: schema_orione_x3_0c8eaef83981bedf.json -> schema_orione_0c8eaef83981bedf.json
    $newName = $f.Name -replace '_x\d+_', '_'
    if ($newName -ne $f.Name) {
        $newPath = Join-Path $f.DirectoryName $newName
        if (-not (Test-Path $newPath)) {
            Rename-Item -Path $f.FullName -NewName $newName
            $renameCount++
            Write-Host ('  RENAMED | ' + $f.Name + ' -> ' + $newName)
        } else {
            Write-Host ('  SKIP (exists) | ' + $f.Name + ' -> ' + $newName)
        }
    }
}
Write-Host ('  JSON files renamed: ' + $renameCount)
