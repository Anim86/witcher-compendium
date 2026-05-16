# Check Missing Images Script
# Scans all JSON files in src-packs for img tags and checks if the referenced files exist

$srcPacks = "c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\src-packs"
$projectRoot = "c:\Users\apaci\Desktop\Script\witcher-compendium-main"

$jsonFiles = Get-ChildItem -Path $srcPacks -Recurse -Filter "*.json"
$imgPaths = @{}

foreach ($f in $jsonFiles) {
    $content = Get-Content $f.FullName -Raw | ConvertFrom-Json
    if ($content.img) {
        $imgPaths[$content.img] = @{
            Name = $content.name
            Type = $content.type
            JsonFile = $f.Name
        }
    }
}

Write-Host "=== TOTAL JSON FILES WITH img TAG: $($imgPaths.Count)"
Write-Host ""

# Check which files actually exist
$missing = @()
$found = @()

foreach ($entry in $imgPaths.GetEnumerator()) {
    $imgPath = $entry.Key
    # img paths look like: modules/witcher-compendium/assets/...
    # Map to: witcher-compendium/assets/...
    $relativePath = $imgPath -replace "^modules/", ""
    $fullPath = Join-Path $projectRoot $relativePath

    if (Test-Path $fullPath) {
        $found += @{ Path = $imgPath; Name = $entry.Value.Name; Type = $entry.Value.Type }
    } else {
        $missing += @{ Path = $imgPath; Name = $entry.Value.Name; Type = $entry.Value.Type; JsonFile = $entry.Value.JsonFile }
    }
}

Write-Host "=== IMAGES FOUND ON DISK: $($found.Count)"
Write-Host "=== IMAGES MISSING FROM DISK: $($missing.Count)"
Write-Host ""
Write-Host "--- MISSING IMAGES LIST ---"
$missing | Sort-Object { $_.Name } | ForEach-Object {
    Write-Host ("  MISSING | $($_.Name) | $($_.Type) | $($_.Path)")
}
