# Detail remaining 8 NO MATCH schematics
$srcPacks = 'c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\src-packs'
$schematicsDir = 'c:\Users\apaci\Desktop\Script\witcher-compendium-main\witcher-compendium\assets\ALCHIMIA_E_ARTIGIANATO\witcher-schematics'

$diskFiles = Get-ChildItem $schematicsDir -Filter '*.webp' | ForEach-Object { $_.Name }

$targets = @(
    'schema_asce_da_lancio_x3.webp',
    'schema_coltelli_da_lancio_x3.webp',
    'schema_munizioni_a_punta_larga_x10.webp',
    'schema_munizioni_bodkin_x10.webp',
    'schema_orione_x3.webp',
    'schema_rinforzo_elfico.webp',
    'schema_rinforzo_in_fibra.webp',
    'schema_rinforzo_nano.webp'
)

$jsonFiles = Get-ChildItem -Path $srcPacks -Recurse -Filter '*.json'

$count = 0
foreach ($f in $jsonFiles) {
    $content = Get-Content $f.FullName -Raw -Encoding UTF8 | ConvertFrom-Json
    if (-not $content.img) { continue }
    
    $imgFile = Split-Path $content.img -Leaf
    if ($targets -notcontains $imgFile) { continue }
    
    $count++
    Write-Host ('--- [' + $count + '] ' + $content.name + ' ---')
    Write-Host ('  JSON file:     ' + $f.Name)
    Write-Host ('  Item name:     ' + $content.name)
    Write-Host ('  Item type:     ' + $content.type)
    Write-Host ('  img attuale:   ' + $content.img)
    Write-Host ('  Cerca file:    ' + $imgFile)
    
    # Try x->a variant
    $variantA = $imgFile -replace '_x(\d+)\.webp', '_a$1.webp'
    if ($variantA -ne $imgFile -and ($diskFiles -contains $variantA)) {
        Write-Host ('  FILE SU DISCO: ' + $variantA + ' [TROVATO - mismatch x/a]')
    } elseif ($diskFiles -contains $imgFile) {
        Write-Host ('  FILE SU DISCO: ' + $imgFile + ' [TROVATO - match esatto]')
    } else {
        # Search for anything similar
        $base = $imgFile -replace '\.webp$', '' -replace '_x\d+$', '' -replace '_a\d+$', ''
        $similar = $diskFiles | Where-Object { $_ -like ($base + '*') }
        if ($similar) {
            Write-Host ('  FILE SU DISCO: NESSUN MATCH ESATTO')
            Write-Host ('  Simili trovati:')
            foreach ($s in $similar) {
                Write-Host ('    -> ' + $s)
            }
        } else {
            Write-Host ('  FILE SU DISCO: NESSUNO - DAVVERO MANCANTE')
        }
    }
    Write-Host ''
}
