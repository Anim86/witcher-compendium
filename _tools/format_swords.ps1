# Reformat the 6 sword JSONs to match project standard key order
$srcPacks = 'c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\src-packs\EQUIPAGGIAMENTO\witcher-weapons'
$files = @(
    'spada_d_acciaio_del_gatto_4224936e2338517b.json',
    'spada_d_acciaio_del_grifone_3fd3cc4a053ee4e3.json',
    'spada_d_acciaio_del_lupo_b02556df7587bae1.json',
    'spada_d_argento_del_gatto_ba58a4bbe6f32d69.json',
    'spada_d_argento_del_grifone_a76cd51e95ac556f.json',
    'spada_d_argento_del_lupo_19d88746db960774.json'
)

foreach ($fname in $files) {
    $path = Join-Path $srcPacks $fname
    $j = Get-Content $path -Raw -Encoding UTF8 | ConvertFrom-Json
    
    # Decode unicode escapes in description
    $desc = $j.system.description
    $name = $j.name
    
    # Build effects array
    $effectsJson = ''
    if ($j.system.damageProperties.effects -and $j.system.damageProperties.effects.Count -gt 0) {
        $e = $j.system.damageProperties.effects[0]
        $statusStr = if ($e.statusEffect) { '"' + $e.statusEffect + '"' } else { 'null' }
        $effectsJson = @"
                {
                    "id": "$($e.id)",
                    "name": "$($e.name)",
                    "statusEffect": $statusStr,
                    "percentage": $($e.percentage),
                    "varEffect": false
                }
"@
    }

    $apStr = if ($j.system.damageProperties.armorPiercing) { 'true' } else { 'false' }
    $iapStr = if ($j.system.damageProperties.improvedArmorPiercing) { 'true' } else { 'false' }
    $metStr = if ($j.system.damageProperties.isMeteorite) { 'true' } else { 'false' }

    $output = @"
{
    "_id": "$($j._id)",
    "name": "$name",
    "type": "weapon",
    "img": "$($j.img)",
    "system": {
        "description": "$desc",
        "weight": 1,
        "cost": 100,
        "sourcebook": "SW",
        "damage": "$($j.system.damage)",
        "accuracy": $($j.system.accuracy),
        "reliability": {
            "value": $($j.system.reliability.value),
            "max": $($j.system.reliability.max)
        },
        "hands": "$($j.system.hands)",
        "type": {
            "text": "",
            "slashing": true,
            "piercing": true,
            "bludgeoning": false,
            "elemental": false
        },
        "damageProperties": {
            "armorPiercing": $apStr,
            "improvedArmorPiercing": $iapStr,
            "ablating": false,
            "crushingForce": false,
            "isMeteorite": $metStr,
            "isNonLethal": false,
            "effects": [
$effectsJson
            ]
        }
    },
    "effects": [],
    "flags": {},
    "_stats": {
        "systemId": "TheWitcherItaNewSystem",
        "coreVersion": 14
    }
}
"@

    Set-Content -Path $path -Value $output -Encoding UTF8 -NoNewline
    Write-Host ('FORMATTED | ' + $fname)
}
