# Fix Category B: 8 legacy path items
# 1. Move 3 Rinforzo .webp from Schemi_di_Fabbricazione/witcher-schematics/ to witcher-schematics/
# 2. Update 5 weapon JSONs from Armi_e_Armature/ to EQUIPAGGIAMENTO/

$assetsRoot = 'c:\Users\apaci\Desktop\Script\witcher-compendium-main\witcher-compendium\assets'
$srcPacks = 'c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\src-packs'

# --- STEP 1: Move Rinforzo files ---
Write-Host '=== STEP 1: Move Rinforzo .webp files ==='
$oldDir = Join-Path $assetsRoot 'ALCHIMIA_E_ARTIGIANATO\Schemi_di_Fabbricazione\witcher-schematics'
$newDir = Join-Path $assetsRoot 'ALCHIMIA_E_ARTIGIANATO\witcher-schematics'

$rinforzoFiles = @(
    'schema_rinforzo_elfico.webp',
    'schema_rinforzo_in_fibra.webp',
    'schema_rinforzo_nano.webp'
)

$movedCount = 0
foreach ($fname in $rinforzoFiles) {
    $src = Join-Path $oldDir $fname
    $dst = Join-Path $newDir $fname
    if (Test-Path $src) {
        if (-not (Test-Path $dst)) {
            Move-Item -Path $src -Destination $dst
            $movedCount++
            Write-Host ('  MOVED | ' + $fname)
            Write-Host ('    FROM: ' + $oldDir)
            Write-Host ('    TO:   ' + $newDir)
        } else {
            Write-Host ('  SKIP (exists) | ' + $fname)
        }
    } else {
        Write-Host ('  NOT FOUND | ' + $src)
    }
}
Write-Host ('  Files moved: ' + $movedCount)

# --- STEP 2: Fix weapon JSON paths ---
Write-Host ''
Write-Host '=== STEP 2: Fix weapon JSON img paths ==='
$jsonFiles = Get-ChildItem -Path $srcPacks -Recurse -Filter '*.json'

$fixCount = 0
foreach ($f in $jsonFiles) {
    $raw = Get-Content $f.FullName -Raw -Encoding UTF8
    $content = $raw | ConvertFrom-Json
    if (-not $content.img) { continue }
    
    # Fix Armi_e_Armature/ -> EQUIPAGGIAMENTO/
    if ($content.img -match 'Armi_e_Armature/witcher-weapons/') {
        $newImg = $content.img -replace 'Armi_e_Armature/witcher-weapons/', 'EQUIPAGGIAMENTO/witcher-weapons/'
        $newRaw = $raw.Replace($content.img, $newImg)
        Set-Content -Path $f.FullName -Value $newRaw -Encoding UTF8 -NoNewline
        $fixCount++
        Write-Host ('  FIXED | ' + $content.name)
        Write-Host ('    OLD: ' + $content.img)
        Write-Host ('    NEW: ' + $newImg)
    }
}
Write-Host ('  JSON paths fixed: ' + $fixCount)
