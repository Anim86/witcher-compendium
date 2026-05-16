# Classify all 62 missing images into categories
$srcPacks = 'c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\src-packs'
$assetsRoot = 'c:\Users\apaci\Desktop\Script\witcher-compendium-main\witcher-compendium\assets'

$jsonFiles = Get-ChildItem -Path $srcPacks -Recurse -Filter '*.json'

$legacyPath = @()
$trulyMissing = @()
$nameMatch = @()

foreach ($f in $jsonFiles) {
    $content = Get-Content $f.FullName -Raw -Encoding UTF8 | ConvertFrom-Json
    if (-not $content.img) { continue }
    
    $relativePath = $content.img -replace '^modules/witcher-compendium/assets/', ''
    $fullPath = Join-Path $assetsRoot $relativePath
    
    if (Test-Path $fullPath) { continue }
    
    # Try to find the file anywhere in assets by filename
    $filename = Split-Path $content.img -Leaf
    $found = Get-ChildItem -Path $assetsRoot -Recurse -Filter $filename -ErrorAction SilentlyContinue | Select-Object -First 1
    
    if ($found) {
        $actualRelative = $found.FullName.Replace($assetsRoot + '\', '').Replace('\', '/')
        $legacyPath += [PSCustomObject]@{
            Name = $content.name
            Type = $content.type
            JsonImg = $content.img
            ActualPath = 'modules/witcher-compendium/assets/' + $actualRelative
        }
    } else {
        $trulyMissing += [PSCustomObject]@{
            Name = $content.name
            Type = $content.type
            JsonImg = $content.img
            Filename = $filename
        }
    }
}

Write-Host '=== LEGACY PATH (file exists elsewhere) ==='
$legacyPath | ForEach-Object {
    Write-Host ('  ' + $_.Name + ' [' + $_.Type + ']')
    Write-Host ('    JSON:   ' + $_.JsonImg)
    Write-Host ('    ACTUAL: ' + $_.ActualPath)
    Write-Host ''
}
Write-Host ('Total legacy path: ' + $legacyPath.Count)

Write-Host ''
Write-Host '=== TRULY MISSING (no file on disk) ==='
$trulyMissing | ForEach-Object {
    Write-Host ('  ' + $_.Name + ' [' + $_.Type + '] -> ' + $_.Filename)
}
Write-Host ('Total truly missing: ' + $trulyMissing.Count)
