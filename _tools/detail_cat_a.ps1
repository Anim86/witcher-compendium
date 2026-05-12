$srcPacks = 'c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\src-packs'
$assetsRoot = 'c:\Users\apaci\Desktop\Script\witcher-compendium-main\witcher-compendium\assets'
$schematicsDir = Join-Path $assetsRoot 'ALCHIMIA_E_ARTIGIANATO\witcher-schematics'

$jsonFiles = Get-ChildItem -Path $srcPacks -Recurse -Filter '*.json'

$mismatches = @{
    'schema_schema_spada_d_acciaio_del_manticora.webp' = 'schema_spada_dacciaio_del_manticora.webp'
    'schema_schema_spada_d_acciaio_del_orso.webp' = 'schema_spada_dacciaio_del_orso.webp'
    'schema_schema_spada_d_acciaio_del_vipera.webp' = 'schema_spada_dacciaio_del_vipera.webp'
    'schema_schema_spada_d_argento_del_gatto.webp' = 'schema_spada_dargento_del_gatto.webp'
    'schema_schema_spada_d_argento_del_grifone.webp' = 'schema_spada_dargento_del_grifone.webp'
    'schema_schema_spada_d_argento_del_lupo.webp' = 'schema_spada_dargento_del_lupo.webp'
    'schema_schema_spada_d_argento_del_manticora.webp' = 'schema_spada_dargento_del_manticora.webp'
    'schema_schema_spada_d_argento_del_orso.webp' = 'schema_spada_dargento_del_orso.webp'
    'schema_schema_spada_d_argento_del_vipera.webp' = 'schema_spada_dargento_del_vipera.webp'
    'schema_schema_zanna_del_vipera.webp' = 'schema_zanna_del_vipera.webp'
    'schema_schema_armi_di_toussaint.webp' = 'schema_armi_di_toussaint.webp'
    'schema_asce_da_lancio_x3.webp' = 'schema_asce_da_lancio_a3.webp'
    'schema_coltelli_da_lancio_x3.webp' = 'schema_coltelli_da_lancio_a3.webp'
    'schema_munizioni_a_punta_larga_x10.webp' = 'schema_munizioni_a_punta_larga_a10.webp'
    'schema_munizioni_bodkin_x10.webp' = 'schema_munizioni_bodkin_a10.webp'
    'schema_orione_x3.webp' = 'schema_orione_a3.webp'
}

$mismatchKeys = $mismatches.Keys

$count = 0
foreach ($f in $jsonFiles) {
    $raw = Get-Content $f.FullName -Raw
    $content = $raw | ConvertFrom-Json
    if ($content.img) {
        $imgFilename = Split-Path $content.img -Leaf
        if ($mismatchKeys -contains $imgFilename) {
            $count++
            $correctFile = $mismatches[$imgFilename]
            $existsOnDisk = Test-Path (Join-Path $schematicsDir $correctFile)
            $status = if ($existsOnDisk) { 'VERIFICATO' } else { 'NON TROVATO' }
            
            Write-Host ('--- [' + $count + '] ' + $content.name + ' ---')
            Write-Host ('  JSON file:     ' + $f.Name)
            Write-Host ('  Cartella:      ' + $f.Directory.Name)
            Write-Host ('  Item type:     ' + $content.type)
            Write-Host ('  img attuale:   ' + $content.img)
            Write-Host ('  Cerca file:    ' + $imgFilename)
            Write-Host ('  File su disco: ' + $correctFile + ' [' + $status + ']')
            Write-Host ''
        }
    }
}

Write-Host ('Totale mismatch trovati: ' + $count)
