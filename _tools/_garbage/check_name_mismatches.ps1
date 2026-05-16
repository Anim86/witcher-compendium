# Analyze naming mismatches between JSON img paths and actual files on disk
$schematicsDir = "c:\Users\apaci\Desktop\Script\witcher-compendium-main\witcher-compendium\assets\ALCHIMIA_E_ARTIGIANATO\witcher-schematics"
$weaponsDir = "c:\Users\apaci\Desktop\Script\witcher-compendium-main\witcher-compendium\assets\EQUIPAGGIAMENTO\witcher-weapons"

$schematicFiles = Get-ChildItem $schematicsDir -Filter "*.webp" | ForEach-Object { $_.Name }
$weaponFiles = Get-ChildItem $weaponsDir -Filter "*.webp" | ForEach-Object { $_.Name }

Write-Host "=== SCHEMATIC FILES: Wanted by JSON vs Existing ==="
Write-Host ""

# What JSON wants (from missing list)
$wantedSchematics = @(
    "schema_schema_spada_d_acciaio_del_manticora.webp",
    "schema_schema_spada_d_acciaio_del_orso.webp",
    "schema_schema_spada_d_acciaio_del_vipera.webp",
    "schema_schema_spada_d_argento_del_gatto.webp",
    "schema_schema_spada_d_argento_del_grifone.webp",
    "schema_schema_spada_d_argento_del_lupo.webp",
    "schema_schema_spada_d_argento_del_manticora.webp",
    "schema_schema_spada_d_argento_del_orso.webp",
    "schema_schema_spada_d_argento_del_vipera.webp",
    "schema_schema_zanna_del_vipera.webp",
    "schema_schema_armi_di_toussaint.webp",
    "schema_asce_da_lancio_x3.webp",
    "schema_coltelli_da_lancio_x3.webp",
    "schema_munizioni_a_punta_larga_x10.webp",
    "schema_munizioni_bodkin_x10.webp",
    "schema_orione_x3.webp",
    "schema_rinforzo_elfico.webp",
    "schema_rinforzo_in_fibra.webp",
    "schema_rinforzo_nano.webp"
)

foreach ($w in $wantedSchematics) {
    if ($schematicFiles -contains $w) {
        Write-Host "  OK         | $w"
    } else {
        # Try to find a close match by stripping schema_schema -> schema and x3->a3
        $variant1 = $w -replace "^schema_schema_", "schema_"
        $variant2 = $w -replace "_x(\d+)\.webp", '_a$1.webp'
        $variant3 = $variant1 -replace "_x(\d+)\.webp", '_a$1.webp'
        # Also try d_acciaio -> dacciaio
        $variant4 = $variant1 -replace "_d_acciaio_", "_dacciaio_" -replace "_d_argento_", "_dargento_"
        $variant5 = $variant3 -replace "_d_acciaio_", "_dacciaio_" -replace "_d_argento_", "_dargento_"
        
        $found = $false
        foreach ($v in @($variant1, $variant2, $variant3, $variant4, $variant5)) {
            if ($schematicFiles -contains $v) {
                Write-Host "  MISMATCH   | JSON wants: $w"
                Write-Host "             | Exists as:  $v"
                $found = $true
                break
            }
        }
        if (-not $found) {
            Write-Host "  NOT FOUND  | $w (no close match)"
        }
    }
}

Write-Host ""
Write-Host "=== WEAPON FILES: Wanted by JSON vs Existing ==="
Write-Host ""

# Weapons that JSON is missing (from missing list with legacy paths)
$wantedWeapons = @(
    "balestra_dell_orso.webp",
    "spada_d_acciaio_della_manticora.webp",
    "spada_d_acciaio_della_vipera.webp",
    "spada_d_acciaio_dell_orso.webp",
    "spada_d_argento_della_manticora.webp",
    "spada_d_argento_della_vipera.webp",  
    "spada_d_argento_dell_orso.webp",
    "zanna_della_vipera.webp",
    "sentinella_dell_abisso.webp"
)

foreach ($w in $wantedWeapons) {
    if ($weaponFiles -contains $w) {
        Write-Host "  EXISTS IN EQUIPAGGIAMENTO | $w"
    } else {
        Write-Host "  NOT FOUND                | $w"
    }
}

# Also check DLC spade
Write-Host ""
Write-Host "=== DLC SPADE: Checking if these exist somewhere ==="
$dlcSpade = @(
    "spada_d_acciaio_del_gatto.webp",
    "spada_d_acciaio_del_grifone.webp",
    "spada_d_acciaio_del_lupo.webp",
    "spada_d_argento_del_gatto.webp",
    "spada_d_argento_del_grifone.webp",
    "spada_d_argento_del_lupo.webp"
)

foreach ($w in $dlcSpade) {
    if ($weaponFiles -contains $w) {
        Write-Host "  EXISTS IN weapons         | $w"
    } else {
        # Check if scuola variant exists
        $scuolaName = $w -replace "spada_d_acciaio_del_", "scuola_del_" -replace "spada_d_acciaio_della_", "scuola_della_" -replace "spada_d_argento_del_", "scuola_del_" -replace "spada_d_argento_della_", "scuola_della_"
        $scuolaAcciaio = $w -replace "spada_d_(acciaio|argento)_del_(.+)\.webp", 'scuola_del_$2_$1.webp'
        if ($weaponFiles -contains $scuolaAcciaio) {
            Write-Host "  POSSIBLE MATCH            | $w -> $scuolaAcciaio"
        } else {
            Write-Host "  NOT FOUND                 | $w"
        }
    }
}
