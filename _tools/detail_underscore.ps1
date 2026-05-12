# Show remaining mismatches: d_acciaio vs dacciaio, d_argento vs dargento
$srcPacks = 'c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\src-packs'
$schematicsDir = 'c:\Users\apaci\Desktop\Script\witcher-compendium-main\witcher-compendium\assets\ALCHIMIA_E_ARTIGIANATO\witcher-schematics'

$diskFiles = Get-ChildItem $schematicsDir -Filter '*.webp' | ForEach-Object { $_.Name }
$jsonFiles = Get-ChildItem -Path $srcPacks -Recurse -Filter '*.json'

$count = 0
foreach ($f in $jsonFiles) {
    $content = Get-Content $f.FullName -Raw -Encoding UTF8 | ConvertFrom-Json
    if (-not $content.img) { continue }
    
    $imgFile = Split-Path $content.img -Leaf
    $imgDir = Split-Path $content.img -Parent
    
    # Only check schematics
    if ($imgDir -notlike '*witcher-schematics*') { continue }
    
    # Check if file exists on disk
    if ($diskFiles -contains $imgFile) { continue }
    
    # Try variant without underscore after d (d_acciaio -> dacciaio)
    $variant = $imgFile -replace '_d_acciaio_', '_dacciaio_' -replace '_d_argento_', '_dargento_'
    
    if ($variant -ne $imgFile -and ($diskFiles -contains $variant)) {
        $count++
        Write-Host ('--- [' + $count + '] ' + $content.name + ' ---')
        Write-Host ('  JSON file:     ' + $f.Name)
        Write-Host ('  img attuale:   ' + $content.img)
        Write-Host ('  JSON cerca:    ' + $imgFile)
        Write-Host ('  Esiste come:   ' + $variant)
        Write-Host ''
    } elseif (-not ($diskFiles -contains $imgFile)) {
        # Truly missing, just log it
        Write-Host ('  [NO MATCH] ' + $content.name + ' | ' + $imgFile)
    }
}

Write-Host ''
Write-Host ('Totale mismatch d_acciaio/d_argento: ' + $count)
