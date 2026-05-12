# Fix 6 DLC swords: valuable -> weapon, add proper weapon stats, fix img path
$srcPacks = 'c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\src-packs'

# Weapon stats per school sword (based on MB p.82 stats)
$swords = @{
    'spada_d_acciaio_del_gatto_4224936e2338517b.json' = @{
        damage = '4d6+2'; accuracy = 1; reliability = 15; reliabilityMax = 15
        armorPiercing = $false; improvedAP = $false; isMeteorite = $true
        effect = 'bilanciata'; hands = '1'
        desc = "<p>Spada d'acciaio della Scuola del Gatto, leggera e agile, progettata per colpi rapidi e precisi.</p>"
    }
    'spada_d_acciaio_del_grifone_3fd3cc4a053ee4e3.json' = @{
        damage = '5d6'; accuracy = 0; reliability = 20; reliabilityMax = 20
        armorPiercing = $false; improvedAP = $false; isMeteorite = $true
        effect = 'bilanciata'; hands = '2'
        desc = "<p>Spada d'acciaio della Scuola del Grifone, solida e robusta, adatta a combattere con segni e magia.</p>"
    }
    'spada_d_acciaio_del_lupo_b02556df7587bae1.json' = @{
        damage = '5d6+2'; accuracy = 1; reliability = 15; reliabilityMax = 15
        armorPiercing = $true; improvedAP = $false; isMeteorite = $true
        effect = 'bilanciata'; hands = '2'
        desc = "<p>Spada d'acciaio della Scuola del Lupo, versatile e letale, lo standard dei cacciatori di mostri.</p>"
    }
    'spada_d_argento_del_gatto_ba58a4bbe6f32d69.json' = @{
        damage = '4d6+2'; accuracy = 1; reliability = 10; reliabilityMax = 10
        armorPiercing = $false; improvedAP = $false; isMeteorite = $false
        effect = 'bilanciata'; hands = '1'
        desc = "<p>Spada d'argento della Scuola del Gatto, agile e precisa, essenziale per i contratti sui mostri.</p>"
    }
    'spada_d_argento_del_grifone_a76cd51e95ac556f.json' = @{
        damage = '5d6'; accuracy = 0; reliability = 15; reliabilityMax = 15
        armorPiercing = $false; improvedAP = $false; isMeteorite = $false
        effect = 'bilanciata'; hands = '2'
        desc = "<p>Spada d'argento della Scuola del Grifone, rinforzata con rune, ideale per creature sensibili all'argento.</p>"
    }
    'spada_d_argento_del_lupo_19d88746db960774.json' = @{
        damage = '5d6+2'; accuracy = 1; reliability = 10; reliabilityMax = 10
        armorPiercing = $true; improvedAP = $false; isMeteorite = $false
        effect = 'bilanciata'; hands = '2'
        desc = "<p>Spada d'argento della Scuola del Lupo, letale contro ogni tipo di mostro, forgiata con argento puro.</p>"
    }
}

$fixCount = 0
foreach ($filename in $swords.Keys) {
    $path = Join-Path $srcPacks "EQUIPAGGIAMENTO\witcher-weapons\$filename"
    if (-not (Test-Path $path)) {
        Write-Host ('NOT FOUND: ' + $path)
        continue
    }
    
    $json = Get-Content $path -Raw -Encoding UTF8 | ConvertFrom-Json
    $stats = $swords[$filename]
    
    # Build proper weapon object
    $weaponName = $json.name -replace "'", "'"
    $imgFilename = ($filename -replace '_[a-f0-9]{16}\.json$', '') + '.webp'
    
    $weapon = @{
        '_id' = $json._id
        'name' = $json.name
        'type' = 'weapon'
        'img' = 'modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-weapons/' + $imgFilename
        'system' = @{
            'description' = $stats.desc
            'weight' = 1
            'cost' = 100
            'sourcebook' = 'SW'
            'damage' = $stats.damage
            'accuracy' = $stats.accuracy
            'reliability' = @{
                'value' = $stats.reliability
                'max' = $stats.reliabilityMax
            }
            'hands' = $stats.hands
            'type' = @{
                'text' = ''
                'slashing' = $true
                'piercing' = $true
                'bludgeoning' = $false
                'elemental' = $false
            }
            'damageProperties' = @{
                'armorPiercing' = $stats.armorPiercing
                'improvedArmorPiercing' = $stats.improvedAP
                'ablating' = $false
                'crushingForce' = $false
                'isMeteorite' = $stats.isMeteorite
                'isNonLethal' = $false
                'effects' = @(
                    @{
                        'id' = [guid]::NewGuid().ToString('N').Substring(0,16)
                        'name' = $stats.effect
                        'statusEffect' = $null
                        'percentage' = 100
                        'varEffect' = $false
                    }
                )
            }
        }
        'effects' = @()
        'flags' = @{}
        '_stats' = @{
            'systemId' = 'TheWitcherItaNewSystem'
            'coreVersion' = 14
        }
    }
    
    $newJson = $weapon | ConvertTo-Json -Depth 10
    Set-Content -Path $path -Value $newJson -Encoding UTF8 -NoNewline
    $fixCount++
    Write-Host ('FIXED | ' + $json.name + ' -> weapon | ' + $imgFilename)
}
Write-Host ('Total fixed: ' + $fixCount)
