# ============================================================
#  MASTER FIX SCRIPT - Witcher Weapons Audit Corrections
#  Reads armi.csv and patches all JSON weapon files
# ============================================================

$csvPath = 'c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\raw-data\armi.csv'
$jsonDir = 'c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\src-packs\EQUIPAGGIAMENTO\witcher-weapons'

# ---- STEP 0: Parse CSV ----
$csv = Import-Csv -Path $csvPath -Encoding UTF8
Write-Host "CSV loaded: $($csv.Count) weapons"

# Build CSV lookup by name (lowercase trimmed)
$csvLookup = @{}
foreach ($row in $csv) {
    $csvLookup[$row.Nome.Trim().ToLower()] = $row
}

# ---- Name mapping: CSV name -> JSON name(s) ----
$nameMap = @{
    'gatto (acciaio)'     = "spada d'acciaio del gatto"
    'gatto (argento)'     = "spada d'argento del gatto"
    'gatto (balestra)'    = 'balestra del gatto'
    'grifone (acciaio)'   = "spada d'acciaio del grifone"
    'grifone (argento)'   = "spada d'argento del grifone"
    'grifone (balestra)'  = 'balestra del grifone'
    'lupo (acciaio)'      = "spada d'acciaio del lupo"
    'lupo (argento)'      = "spada d'argento del lupo"
    'manticora (acciaio)' = "spada d'acciaio della manticora"
    'manticora (argento)' = "spada d'argento della manticora"
    'orso (acciaio)'      = "spada d'acciaio dell'orso"
    'orso (argento)'      = "spada d'argento dell'orso"
    'orso (balestra)'     = "balestra dell'orso"
    'vipera (acciaio)'    = "spada d'acciaio della vipera"
    'vipera (argento)'    = "spada d'argento della vipera"
    'vipera (zanna)'      = 'zanna della vipera'
    'lumaca (acciaio)'    = 'scuola della lumaca (acciaio)'
    'lumaca (argento)'    = 'scuola della lumaca (argento)'
}

# Build reverse map: JSON name (lower) -> CSV row
$jsonToCsv = @{}
foreach ($row in $csv) {
    $csvName = $row.Nome.Trim().ToLower()
    # Direct name
    $jsonToCsv[$csvName] = $row
    # Mapped name
    if ($nameMap.ContainsKey($csvName)) {
        $jsonToCsv[$nameMap[$csvName].ToLower()] = $row
    }
}

# Also handle Scorpione (Balista) -> Scorpione
$jsonToCsv['scorpione'] = $csvLookup['scorpione (balista)']

# ---- STEP 1: Delete obsolete duplicate stubs ----
Write-Host ""
Write-Host "========================================="
Write-Host "  STEP 1: Deleting obsolete stub duplicates"
Write-Host "========================================="

$toDelete = @(
    'spada_d_acciaio_del_manticora_dff7bafa4619032a.json',
    'spada_d_argento_del_manticora_4789a37890f364ff.json',
    'spada_d_acciaio_del_orso_c76043256396f90e.json',
    'spada_d_argento_del_orso_1468fd49a992bbdd.json',
    'balestra_del_orso_e2c45d03f675ac5c.json',
    'spada_d_acciaio_del_vipera_f8ce387de862d64f.json',
    'spada_d_argento_del_vipera_db2efd30f049d15d.json',
    'zanna_del_vipera_e8d1f81b32f1adeb.json',
    'spada_d_acciaio_della_lumaca_2c4e9b97934fac2d.json',
    'spada_d_argento_della_lumaca_7c44ab7e72a15d6b.json'
)

foreach ($f in $toDelete) {
    $path = Join-Path $jsonDir $f
    if (Test-Path $path) {
        Remove-Item $path -Force
        Write-Host "  DELETED: $f"
    } else {
        Write-Host "  SKIP (not found): $f"
    }
}

# ---- Helper: Parse damage type from CSV ----
function Get-DamageType($csvType) {
    $slashing = $false; $piercing = $false; $bludgeoning = $false; $elemental = $false
    if ($csvType -match 'T') { $slashing = $true }
    if ($csvType -match 'P') { $piercing = $true }
    if ($csvType -match 'C') { $bludgeoning = $true }
    if ($csvType -match 'S') { $slashing = $true }  # S = silver slashing
    return @{ slashing = $slashing; piercing = $piercing; bludgeoning = $bludgeoning; elemental = $elemental }
}

# ---- Helper: Parse effects from CSV into damageProperties fields ----
function Get-DamageProperties($csvEffects) {
    $armorPiercing = $false
    $improvedArmorPiercing = $false
    $ablating = $false
    $crushingForce = $false
    $isMeteorite = $false
    $isNonLethal = $false
    $stun = $null
    $effects = @()

    if (-not $csvEffects -or $csvEffects -eq 'Nessuno' -or $csvEffects -eq 'N/A') {
        return @{
            armorPiercing = $armorPiercing
            improvedArmorPiercing = $improvedArmorPiercing
            ablating = $ablating
            crushingForce = $crushingForce
            isMeteorite = $isMeteorite
            isNonLethal = $isNonLethal
            stun = $stun
            effects = $effects
        }
    }

    $parts = $csvEffects -split ',\s*'

    foreach ($part in $parts) {
        $p = $part.Trim()
        switch -Regex ($p) {
            '^Trapassare Migliorato$' { $improvedArmorPiercing = $true }
            '^Trapassare$' { $armorPiercing = $true }
            '^Ablativa$' { $ablating = $true }
            '^Forza Schiacciante$' { $crushingForce = $true }
            '^Meteorite$' { $isMeteorite = $true }
            '^Non-Letale$' { $isNonLethal = $true }
            '^Stordimento\s*\((-?\d+)\)$' {
                $stun = [int]$Matches[1]
            }
            '^Sanguinamento\s*\((\d+)%?\)$' {
                $effects += @{
                    id = [guid]::NewGuid().ToString('N').Substring(0,16)
                    name = 'sanguinamento'
                    statusEffect = $null
                    percentage = [int]$Matches[1]
                    varEffect = $false
                }
            }
            '^Sang\s*\((\d+)%?\)$' {
                $effects += @{
                    id = [guid]::NewGuid().ToString('N').Substring(0,16)
                    name = 'sanguinamento'
                    statusEffect = $null
                    percentage = [int]$Matches[1]
                    varEffect = $false
                }
            }
            '^Avvelenato\s*\((\d+)%?\)$' {
                $effects += @{
                    id = [guid]::NewGuid().ToString('N').Substring(0,16)
                    name = 'avvelenato'
                    statusEffect = $null
                    percentage = [int]$Matches[1]
                    varEffect = $false
                }
            }
            '^Congelamento\s*\((\d+)%?\)$' {
                $effects += @{
                    id = [guid]::NewGuid().ToString('N').Substring(0,16)
                    name = 'congelamento'
                    statusEffect = $null
                    percentage = [int]$Matches[1]
                    varEffect = $false
                }
            }
            '^Fuoco\s*\((\d+)%?\)\s*.*$' {
                $effects += @{
                    id = [guid]::NewGuid().ToString('N').Substring(0,16)
                    name = 'fuoco'
                    statusEffect = $null
                    percentage = [int]$Matches[1]
                    varEffect = $false
                }
            }
            '^Vacillante\s*\((\d+)%?\)$' {
                $effects += @{
                    id = [guid]::NewGuid().ToString('N').Substring(0,16)
                    name = 'vacillante'
                    statusEffect = $null
                    percentage = [int]$Matches[1]
                    varEffect = $false
                }
            }
            '^Bilanciata?\s*(\(\+\d+\))?$' {
                $effects += @{
                    id = [guid]::NewGuid().ToString('N').Substring(0,16)
                    name = $p.ToLower()
                    statusEffect = $null
                    percentage = 100
                    varEffect = $false
                }
            }
            '^Bilanciato$' {
                $effects += @{
                    id = [guid]::NewGuid().ToString('N').Substring(0,16)
                    name = 'bilanciata'
                    statusEffect = $null
                    percentage = 100
                    varEffect = $false
                }
            }
            '^Portata$' {
                $effects += @{
                    id = [guid]::NewGuid().ToString('N').Substring(0,16)
                    name = 'portata'
                    statusEffect = $null
                    percentage = 100
                    varEffect = $false
                }
            }
            '^Presa$' {
                $effects += @{
                    id = [guid]::NewGuid().ToString('N').Substring(0,16)
                    name = 'presa'
                    statusEffect = $null
                    percentage = 100
                    varEffect = $false
                }
            }
            '^Rissa$' {
                $effects += @{
                    id = [guid]::NewGuid().ToString('N').Substring(0,16)
                    name = 'rissa'
                    statusEffect = $null
                    percentage = 100
                    varEffect = $false
                }
            }
            '^Occultabile$' {
                $effects += @{
                    id = [guid]::NewGuid().ToString('N').Substring(0,16)
                    name = 'occultabile'
                    statusEffect = $null
                    percentage = 100
                    varEffect = $false
                }
            }
            '^Ricarica Lenta$' {
                $effects += @{
                    id = [guid]::NewGuid().ToString('N').Substring(0,16)
                    name = 'Ricarica Lenta'
                    statusEffect = $null
                    percentage = 100
                    varEffect = $false
                }
            }
            '^Focus\s*\((\d+)\)$' {
                $effects += @{
                    id = [guid]::NewGuid().ToString('N').Substring(0,16)
                    name = "Focus ($($Matches[1]))"
                    statusEffect = $null
                    percentage = 100
                    varEffect = $false
                }
            }
            '^Focus Sup' {
                $effects += @{
                    id = [guid]::NewGuid().ToString('N').Substring(0,16)
                    name = $p
                    statusEffect = $null
                    percentage = 100
                    varEffect = $false
                }
            }
            '^Argento\s*\((.+)\)$' {
                $effects += @{
                    id = [guid]::NewGuid().ToString('N').Substring(0,16)
                    name = "Argento ($($Matches[1]))"
                    statusEffect = $null
                    percentage = 100
                    varEffect = $false
                }
            }
            '^Parata$' {
                $effects += @{
                    id = [guid]::NewGuid().ToString('N').Substring(0,16)
                    name = 'parata'
                    statusEffect = $null
                    percentage = 100
                    varEffect = $false
                }
            }
            '^Intrappolante$' {
                $effects += @{
                    id = [guid]::NewGuid().ToString('N').Substring(0,16)
                    name = 'intrappolante'
                    statusEffect = $null
                    percentage = 100
                    varEffect = $false
                }
            }
            '^Ancora Magica$' {
                $effects += @{
                    id = [guid]::NewGuid().ToString('N').Substring(0,16)
                    name = 'Ancora Magica'
                    statusEffect = $null
                    percentage = 100
                    varEffect = $false
                }
            }
            '^Serventi$' {
                $effects += @{
                    id = [guid]::NewGuid().ToString('N').Substring(0,16)
                    name = 'Serventi'
                    statusEffect = $null
                    percentage = 100
                    varEffect = $false
                }
            }
            '^Postazione$' {
                $effects += @{
                    id = [guid]::NewGuid().ToString('N').Substring(0,16)
                    name = 'Postazione'
                    statusEffect = $null
                    percentage = 100
                    varEffect = $false
                }
            }
            '^Iniezione$' {
                $effects += @{
                    id = [guid]::NewGuid().ToString('N').Substring(0,16)
                    name = 'Iniezione'
                    statusEffect = $null
                    percentage = 100
                    varEffect = $false
                }
            }
            '^Intrappola-Lama$' {
                $effects += @{
                    id = [guid]::NewGuid().ToString('N').Substring(0,16)
                    name = 'Intrappola-Lama'
                    statusEffect = $null
                    percentage = 100
                    varEffect = $false
                }
            }
            '^Arma Improvvisata$' {
                $effects += @{
                    id = [guid]::NewGuid().ToString('N').Substring(0,16)
                    name = 'Arma Improvvisata'
                    statusEffect = $null
                    percentage = 100
                    varEffect = $false
                }
            }
            '^\+\d+' {
                # Generic effect like "+3 vs Spettri", "+25 PS", etc.
                $effects += @{
                    id = [guid]::NewGuid().ToString('N').Substring(0,16)
                    name = $p
                    statusEffect = $null
                    percentage = 100
                    varEffect = $false
                }
            }
            '^Stordimento\s*\(\d+\)' {
                # Already handled stun above
            }
            default {
                # Catch-all for unrecognized effects
                if ($p -ne 'Nessuno' -and $p -ne 'N/A' -and $p -ne '') {
                    # Check if it wasn't already handled
                    $handled = $false
                    if ($p -match 'Trapassare|Ablativa|Forza|Meteorite|Non-Letale') { $handled = $true }
                    if (-not $handled) {
                        $effects += @{
                            id = [guid]::NewGuid().ToString('N').Substring(0,16)
                            name = $p
                            statusEffect = $null
                            percentage = 100
                            varEffect = $false
                        }
                    }
                }
            }
        }
    }

    return @{
        armorPiercing = $armorPiercing
        improvedArmorPiercing = $improvedArmorPiercing
        ablating = $ablating
        crushingForce = $crushingForce
        isMeteorite = $isMeteorite
        isNonLethal = $isNonLethal
        stun = $stun
        effects = $effects
    }
}

# ---- Helper: Parse conceal from CSV ----
function Get-Conceal($csvConceal) {
    switch ($csvConceal) {
        'P' { return 'P' }
        'M' { return 'M' }
        'G' { return 'G' }
        'S' { return 'S' }
        'N/A' { return 'N/A' }
        default { return $csvConceal }
    }
}

# ---- STEP 2: Convert 2 stubs from valuable to weapon ----
Write-Host ""
Write-Host "========================================="
Write-Host "  STEP 2: Converting stubs to weapon"
Write-Host "========================================="

$stubFiles = @(
    @{ File = 'balestra_del_gatto_b08cca06247d1f80.json'; CsvName = 'gatto (balestra)' },
    @{ File = 'balestra_del_grifone_98858e9eccdaea1c.json'; CsvName = 'grifone (balestra)' }
)

foreach ($stub in $stubFiles) {
    $filePath = Join-Path $jsonDir $stub.File
    $csvRow = $csvLookup[$stub.CsvName]

    if (-not $csvRow) {
        Write-Host "  ERROR: CSV row not found for $($stub.CsvName)"
        continue
    }

    $raw = Get-Content $filePath -Raw -Encoding UTF8
    $obj = $raw | ConvertFrom-Json

    $csvAcc = $csvRow.'Precisione (PA)' -replace '\+', ''
    $csvRel = $csvRow.('Affidabilit' + [char]0x00E0)
    if (-not $csvRel) {
        # Try different encoding for Affidabilità
        foreach ($prop in $csvRow.PSObject.Properties) {
            if ($prop.Name -match 'Affidabilit') { $csvRel = $prop.Value; break }
        }
    }
    $csvWeight = [double]($csvRow.'Peso (kg)'.Replace(',', '.'))
    $csvCost = $csvRow.'Costo (Corone)'.Replace(',', '.')
    if ($csvCost -eq 'N/A') { $csvCost = 0 } else { $csvCost = [int]$csvCost }
    $csvSlots = [int]$csvRow.'Slot Potenziamenti'
    $csvHands = [int]$csvRow.'Mani Necessarie'
    $csvRange = $csvRow.'Gittata'
    $csvConceal = $csvRow.('Occultabilit' + [char]0x00E0)
    if (-not $csvConceal) {
        foreach ($prop in $csvRow.PSObject.Properties) {
            if ($prop.Name -match 'Occultabilit') { $csvConceal = $prop.Value; break }
        }
    }

    $dmgType = Get-DamageType $csvRow.'Tipo di Danno'
    $dmgProps = Get-DamageProperties $csvRow.'Effetti'

    # Build full weapon object
    $obj.type = 'weapon'
    $obj.system = [PSCustomObject]@{
        description = "<p>$($csvRow.Descrizione)</p>"
        weight = $csvWeight
        cost = $csvCost
        sourcebook = 'MB'
        damage = $csvRow.'Danno (DAN)'
        accuracy = [int]$csvAcc
        reliability = [PSCustomObject]@{
            value = [int]$csvRel
            max = [int]$csvRel
        }
        hands = "$csvHands"
        range = $csvRange
        enhancementSlots = $csvSlots
        conceal = (Get-Conceal $csvConceal)
        type = [PSCustomObject]@{
            text = ''
            slashing = $dmgType.slashing
            piercing = $dmgType.piercing
            bludgeoning = $dmgType.bludgeoning
            elemental = $dmgType.elemental
        }
        damageProperties = [PSCustomObject]@{
            armorPiercing = $dmgProps.armorPiercing
            improvedArmorPiercing = $dmgProps.improvedArmorPiercing
            ablating = $dmgProps.ablating
            crushingForce = $dmgProps.crushingForce
            isMeteorite = $dmgProps.isMeteorite
            isNonLethal = $dmgProps.isNonLethal
            effects = $dmgProps.effects
        }
    }

    $json = $obj | ConvertTo-Json -Depth 10
    [System.IO.File]::WriteAllText($filePath, $json, [System.Text.Encoding]::UTF8)
    Write-Host "  CONVERTED: $($stub.File) -> type=weapon with full stats"
}

# ---- STEP 3: Patch all existing weapons ----
Write-Host ""
Write-Host "========================================="
Write-Host "  STEP 3: Patching all weapon attributes"
Write-Host "========================================="

$jsonFiles = Get-ChildItem -Path $jsonDir -Filter '*.json'
$patchCount = 0
$skipCount = 0

foreach ($f in $jsonFiles) {
    $raw = Get-Content $f.FullName -Raw -Encoding UTF8
    $obj = $raw | ConvertFrom-Json

    # Skip non-weapons
    if ($obj.type -ne 'weapon') {
        $skipCount++
        continue
    }

    # Find matching CSV row
    $jsonName = $obj.name.Trim().ToLower()
    $csvRow = $jsonToCsv[$jsonName]

    if (-not $csvRow) {
        # Try partial match
        foreach ($key in $jsonToCsv.Keys) {
            if ($jsonName -like "*$key*" -or $key -like "*$jsonName*") {
                $csvRow = $jsonToCsv[$key]
                break
            }
        }
    }

    if (-not $csvRow) {
        # This is a DLC/ammo/extra item not in CSV - skip
        $skipCount++
        continue
    }

    $changed = $false

    # --- Parse CSV values ---
    $csvAcc = $csvRow.'Precisione (PA)' -replace '\+', ''
    $csvRel = $null
    foreach ($prop in $csvRow.PSObject.Properties) {
        if ($prop.Name -match 'Affidabilit') { $csvRel = $prop.Value; break }
    }
    $csvWeight = [double]($csvRow.'Peso (kg)'.Replace(',', '.'))
    $csvCost = $csvRow.'Costo (Corone)'.Replace(',', '.')
    if ($csvCost -eq 'N/A') { $csvCost = 0 } else { $csvCost = [int]$csvCost }
    $csvSlots = [int]$csvRow.'Slot Potenziamenti'
    $csvHands = [int]$csvRow.'Mani Necessarie'
    $csvRange = $csvRow.'Gittata'
    $csvDamage = $csvRow.'Danno (DAN)'
    $csvConceal = $null
    foreach ($prop in $csvRow.PSObject.Properties) {
        if ($prop.Name -match 'Occultabilit') { $csvConceal = $prop.Value; break }
    }

    # --- Fix damage ---
    if ($csvDamage -and $csvDamage -ne 'N/A' -and $obj.system.damage -ne $csvDamage) {
        $obj.system.damage = $csvDamage
        $changed = $true
    }

    # --- Fix accuracy ---
    $jsonAcc = [string]$obj.system.accuracy
    if ($csvAcc -ne $jsonAcc) {
        $obj.system.accuracy = [int]$csvAcc
        $changed = $true
    }

    # --- Fix reliability ---
    if ($csvRel) {
        $csvRelInt = [int]$csvRel
        if ($obj.system.reliability -is [PSCustomObject]) {
            if ($obj.system.reliability.max -ne $csvRelInt) {
                $obj.system.reliability.max = $csvRelInt
                $obj.system.reliability.value = $csvRelInt
                $changed = $true
            }
        } elseif ($obj.system.reliability -ne $csvRelInt) {
            $obj.system | Add-Member -NotePropertyName 'reliability' -NotePropertyValue ([PSCustomObject]@{ value = $csvRelInt; max = $csvRelInt }) -Force
            $changed = $true
        }
    }

    # --- Fix hands ---
    $jsonHands = [string]$obj.system.hands
    if ($jsonHands -ne "$csvHands") {
        $obj.system.hands = "$csvHands"
        $changed = $true
    }

    # --- Fix weight ---
    if ([double]$obj.system.weight -ne $csvWeight) {
        $obj.system.weight = $csvWeight
        $changed = $true
    }

    # --- Fix cost ---
    if ([int]$obj.system.cost -ne $csvCost) {
        $obj.system.cost = $csvCost
        $changed = $true
    }

    # --- Add enhancementSlots ---
    if ($csvSlots -gt 0) {
        $currentSlots = $obj.system.enhancementSlots
        if ($null -eq $currentSlots -or $currentSlots -ne $csvSlots) {
            $obj.system | Add-Member -NotePropertyName 'enhancementSlots' -NotePropertyValue $csvSlots -Force
            $changed = $true
        }
    }

    # --- Fix range/reach ---
    if ($csvRange -and $csvRange -ne 'N/A') {
        if (-not $obj.system.reach -and -not $obj.system.range) {
            $obj.system | Add-Member -NotePropertyName 'range' -NotePropertyValue $csvRange -Force
            $changed = $true
        }
    }

    # --- Add conceal ---
    if ($csvConceal -and $csvConceal -ne 'N/A') {
        $currentConceal = $obj.system.conceal
        if (-not $currentConceal) {
            $obj.system | Add-Member -NotePropertyName 'conceal' -NotePropertyValue (Get-Conceal $csvConceal) -Force
            $changed = $true
        }
    }

    # --- Fix description ---
    $currentDesc = $obj.system.description
    if (-not $currentDesc -or $currentDesc -eq '' -or $currentDesc -eq '<p></p>') {
        $csvDesc = $csvRow.'Descrizione'
        if ($csvDesc) {
            $obj.system.description = "<p>$csvDesc</p>"
            $changed = $true
        }
    }

    # --- Fix type (damage type) ---
    if (-not $obj.system.type) {
        $dmgType = Get-DamageType $csvRow.'Tipo di Danno'
        $obj.system | Add-Member -NotePropertyName 'type' -NotePropertyValue ([PSCustomObject]@{
            text = ''
            slashing = $dmgType.slashing
            piercing = $dmgType.piercing
            bludgeoning = $dmgType.bludgeoning
            elemental = $dmgType.elemental
        }) -Force
        $changed = $true
    }

    # --- Fix damageProperties ---
    if (-not $obj.system.damageProperties) {
        $dmgProps = Get-DamageProperties $csvRow.'Effetti'
        $dpObj = [PSCustomObject]@{
            armorPiercing = $dmgProps.armorPiercing
            improvedArmorPiercing = $dmgProps.improvedArmorPiercing
            ablating = $dmgProps.ablating
            crushingForce = $dmgProps.crushingForce
            isMeteorite = $dmgProps.isMeteorite
            isNonLethal = $dmgProps.isNonLethal
            effects = $dmgProps.effects
        }
        if ($dmgProps.stun) {
            $dpObj | Add-Member -NotePropertyName 'stun' -NotePropertyValue $dmgProps.stun
        }
        $obj.system | Add-Member -NotePropertyName 'damageProperties' -NotePropertyValue $dpObj -Force
        $changed = $true
    }

    # --- Save if changed ---
    if ($changed) {
        $json = $obj | ConvertTo-Json -Depth 10
        [System.IO.File]::WriteAllText($f.FullName, $json, [System.Text.Encoding]::UTF8)
        $patchCount++
        Write-Host "  PATCHED: $($obj.name)"
    }
}

Write-Host ""
Write-Host "========================================="
Write-Host "  SUMMARY"
Write-Host "========================================="
Write-Host "  Files deleted (obsolete stubs): $($toDelete.Count)"
Write-Host "  Stubs converted to weapon:      $($stubFiles.Count)"
Write-Host "  Weapons patched:                $patchCount"
Write-Host "  Files skipped (DLC/ammo/extra): $skipCount"
Write-Host "  DONE!"
