$csvPath = 'c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\raw-data\armi.csv'
$jsonDir = 'c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\src-packs\EQUIPAGGIAMENTO\witcher-weapons'

# Parse CSV
$csv = Import-Csv -Path $csvPath -Encoding UTF8

# Parse all JSONs
$jsonFiles = Get-ChildItem -Path $jsonDir -Filter '*.json'
$jsonItems = @()
foreach ($f in $jsonFiles) {
    $raw = Get-Content $f.FullName -Raw -Encoding UTF8
    $obj = $raw | ConvertFrom-Json
    $sys = $obj.system

    $effStr = ''
    if ($sys.effects -is [string] -and $sys.effects -ne '' -and $sys.effects -ne 'N/A') {
        $effStr = $sys.effects
    }
    if ($sys.damageProperties -and $sys.damageProperties.effects) {
        $names = @()
        foreach ($e in $sys.damageProperties.effects) { $names += $e.name }
        if ($names.Count -gt 0) { $effStr = $names -join ', ' }
    }

    $relMax = ''
    if ($sys.reliability -is [PSCustomObject] -or $sys.reliability -is [Hashtable]) {
        $relMax = $sys.reliability.max
    } else {
        $relMax = $sys.reliability
    }

    $reach = ''
    if ($sys.reach) { $reach = $sys.reach }
    elseif ($sys.range) { $reach = $sys.range }

    $enhSlots = ''
    if ($null -ne $sys.enhancementSlots) { $enhSlots = $sys.enhancementSlots }

    $conceal = ''
    if ($sys.concealment) { $conceal = $sys.concealment }
    elseif ($sys.conceal) { $conceal = $sys.conceal }

    $jsonItems += [PSCustomObject]@{
        FileName     = $f.Name
        Name         = $obj.name
        ItemType     = $obj.type
        Damage       = $sys.damage
        Accuracy     = $sys.accuracy
        Reliability  = $relMax
        Hands        = $sys.hands
        Weight       = $sys.weight
        Cost         = $sys.cost
        Effects      = $effStr
        Reach        = $reach
        EnhSlots     = $enhSlots
        Conceal      = $conceal
        HasDmgType   = [bool]($sys.type)
        HasDmgProps  = [bool]($sys.damageProperties)
        HasDesc      = [bool]($sys.description)
    }
}

# Build JSON name lookup (lowercase)
$jsonLookup = @{}
foreach ($j in $jsonItems) {
    $key = $j.Name.Trim().ToLower()
    if (-not $jsonLookup.ContainsKey($key)) {
        $jsonLookup[$key] = @()
    }
    $jsonLookup[$key] += $j
}

# CSV-to-JSON name mapping for known differences
$nameMap = @{
    'gatto (acciaio)'    = "spada d'acciaio del gatto"
    'gatto (argento)'    = "spada d'argento del gatto"
    'gatto (balestra)'   = 'balestra del gatto'
    'grifone (acciaio)'  = "spada d'acciaio del grifone"
    'grifone (argento)'  = "spada d'argento del grifone"
    'grifone (balestra)' = 'balestra del grifone'
    'lupo (acciaio)'     = "spada d'acciaio del lupo"
    'lupo (argento)'     = "spada d'argento del lupo"
    'manticora (acciaio)' = "spada d'acciaio della manticora"
    'manticora (argento)' = "spada d'argento della manticora"
    'orso (acciaio)'     = "spada d'acciaio dell'orso"
    'orso (argento)'     = "spada d'argento dell'orso"
    'orso (balestra)'    = "balestra dell'orso"
    'vipera (acciaio)'   = "spada d'acciaio della vipera"
    'vipera (argento)'   = "spada d'argento della vipera"
    'vipera (zanna)'     = 'zanna della vipera'
    'lumaca (acciaio)'   = 'scuola della lumaca (acciaio)'
    'lumaca (argento)'   = 'scuola della lumaca (argento)'
    "ogh'r"              = "ogh'r"
}

Write-Host "========================================="
Write-Host "  WEAPON AUDIT REPORT"
Write-Host "========================================="
Write-Host ""
Write-Host "CSV weapons count: $($csv.Count)"
Write-Host "JSON files count: $($jsonFiles.Count)"
Write-Host ""

# Count by type
Write-Host "--- JSON files by item type ---"
$jsonItems | Group-Object ItemType | ForEach-Object { Write-Host "  $($_.Name): $($_.Count)" }

Write-Host ""
Write-Host "========================================="
Write-Host "  1. MISSING FROM JSON (in CSV but not in JSON)"
Write-Host "========================================="

$missing = @()
$found = @()
$stubs = @()
foreach ($row in $csv) {
    $csvName = $row.Nome.Trim().ToLower()

    # Try direct match first
    $match = $jsonLookup[$csvName]

    # Try mapped name
    if (-not $match -and $nameMap.ContainsKey($csvName)) {
        $mapped = $nameMap[$csvName].ToLower()
        $match = $jsonLookup[$mapped]
    }

    # Try partial match
    if (-not $match) {
        foreach ($key in $jsonLookup.Keys) {
            if ($key -like "*$csvName*" -or $csvName -like "*$key*") {
                $match = $jsonLookup[$key]
                break
            }
        }
    }

    if (-not $match) {
        $missing += $row.Nome
        Write-Host "  MISSING: $($row.Nome) [$($row.Categoria)]"
    } else {
        # Check if any match is a stub (type=valuable or missing critical fields)
        $bestMatch = $null
        foreach ($m in $match) {
            if ($m.ItemType -eq 'weapon') {
                $bestMatch = $m
                break
            }
        }
        if (-not $bestMatch) { $bestMatch = $match[0] }

        if ($bestMatch.ItemType -eq 'valuable') {
            $stubs += [PSCustomObject]@{ CsvName = $row.Nome; JsonName = $bestMatch.Name; FileName = $bestMatch.FileName }
        } else {
            $found += [PSCustomObject]@{
                CsvName = $row.Nome
                JsonItem = $bestMatch
                CsvRow = $row
            }
        }
    }
}

Write-Host ""
Write-Host "========================================="
Write-Host "  2. STUB ENTRIES (type=valuable, not weapon)"
Write-Host "========================================="
foreach ($s in $stubs) {
    Write-Host "  STUB: $($s.CsvName) -> $($s.JsonName) [$($s.FileName)]"
}

Write-Host ""
Write-Host "========================================="
Write-Host "  3. EXTRA JSON FILES (in JSON but not in CSV)"
Write-Host "========================================="

$csvNamesLower = @()
foreach ($row in $csv) { $csvNamesLower += $row.Nome.Trim().ToLower() }
$mappedNamesLower = @()
foreach ($v in $nameMap.Values) { $mappedNamesLower += $v.ToLower() }

foreach ($j in $jsonItems) {
    $jName = $j.Name.Trim().ToLower()
    $inCsv = $csvNamesLower -contains $jName
    $inMapped = $mappedNamesLower -contains $jName

    if (-not $inCsv -and -not $inMapped) {
        # Check if it's a duplicate of a mapped entry
        $isDup = $false
        foreach ($key in $jsonLookup.Keys) {
            if ($jsonLookup[$key].Count -gt 1) {
                foreach ($item in $jsonLookup[$key]) {
                    if ($item.FileName -eq $j.FileName) { $isDup = $true; break }
                }
            }
            if ($isDup) { break }
        }
        Write-Host "  EXTRA: $($j.Name) | type=$($j.ItemType) | $($j.FileName)"
    }
}

Write-Host ""
Write-Host "========================================="
Write-Host "  4. ATTRIBUTE COMPARISON (CSV vs JSON)"
Write-Host "========================================="

$issues = @()
foreach ($f in $found) {
    $c = $f.CsvRow
    $j = $f.JsonItem
    $problems = @()

    # Damage
    if ($c.('Danno (DAN)') -and $j.Damage) {
        $csvDmg = $c.('Danno (DAN)').Trim()
        $jsonDmg = $j.Damage.Trim()
        if ($csvDmg -ne $jsonDmg -and $csvDmg -ne 'N/A') {
            $problems += "Danno: CSV='$csvDmg' JSON='$jsonDmg'"
        }
    } elseif ($c.('Danno (DAN)') -ne 'N/A' -and -not $j.Damage) {
        $problems += "Danno: MANCANTE nel JSON (CSV='$($c.('Danno (DAN)'))')"
    }

    # Accuracy
    $csvAcc = $c.('Precisione (PA)').Trim()
    $jsonAcc = [string]$j.Accuracy
    if ($csvAcc -and $jsonAcc) {
        $csvAccNum = $csvAcc -replace '\+', ''
        $jsonAccNum = $jsonAcc -replace '\+', ''
        if ($csvAccNum -ne $jsonAccNum) {
            $problems += "Precisione: CSV='$csvAcc' JSON='$jsonAcc'"
        }
    }

    # Reliability
    $csvRel = $c.('Affidabilità').Trim()
    $jsonRel = [string]$j.Reliability
    if ($csvRel -and $jsonRel -and $csvRel -ne $jsonRel) {
        $problems += "Affidabilita: CSV='$csvRel' JSON='$jsonRel'"
    }

    # Hands
    $csvHands = $c.('Mani Necessarie').Trim()
    $jsonHands = [string]$j.Hands
    if ($csvHands -and $jsonHands -and $csvHands -ne $jsonHands) {
        $problems += "Mani: CSV='$csvHands' JSON='$jsonHands'"
    }

    # Weight
    $csvWeight = $c.('Peso (kg)').Trim().Replace(',', '.')
    $jsonWeight = [string]$j.Weight
    if ($csvWeight -and $jsonWeight) {
        if ([double]$csvWeight -ne [double]$jsonWeight) {
            $problems += "Peso: CSV='$csvWeight' JSON='$jsonWeight'"
        }
    }

    # Cost
    $csvCost = $c.('Costo (Corone)').Trim().Replace(',', '.')
    if ($csvCost -ne 'N/A' -and $j.Cost) {
        $jsonCost = [string]$j.Cost
        if ($csvCost -ne $jsonCost) {
            $problems += "Costo: CSV='$csvCost' JSON='$jsonCost'"
        }
    }

    # Enhancement slots
    $csvSlots = $c.('Slot Potenziamenti').Trim()
    if ($csvSlots -and $j.EnhSlots -ne '' -and $csvSlots -ne [string]$j.EnhSlots) {
        $problems += "Slot Pot: CSV='$csvSlots' JSON='$($j.EnhSlots)'"
    } elseif ($csvSlots -and $csvSlots -ne '0' -and $j.EnhSlots -eq '') {
        $problems += "Slot Pot: MANCANTE nel JSON (CSV='$csvSlots')"
    }

    # Missing fields check
    if (-not $j.HasDesc) { $problems += "Descrizione: MANCANTE" }
    if (-not $j.HasDmgType) { $problems += "Tipo Danno (slashing/piercing/bludg): MANCANTE" }
    if (-not $j.HasDmgProps) { $problems += "Proprietà Danno (damageProperties): MANCANTE" }
    if (-not $j.Reach -and $c.('Gittata').Trim() -ne 'N/A') { $problems += "Gittata/Reach: MANCANTE (CSV='$($c.('Gittata'))')" }

    if ($problems.Count -gt 0) {
        $issues += [PSCustomObject]@{ Name = $f.CsvName; Problems = $problems }
        Write-Host ""
        Write-Host "  [$($f.CsvName)]"
        foreach ($p in $problems) { Write-Host "    - $p" }
    }
}

Write-Host ""
Write-Host "========================================="
Write-Host "  5. DUPLICATE JSON ENTRIES"
Write-Host "========================================="
foreach ($key in $jsonLookup.Keys) {
    $entries = $jsonLookup[$key]
    if ($entries.Count -gt 1) {
        Write-Host "  DUPLICATO: '$key'"
        foreach ($e in $entries) {
            Write-Host "    -> $($e.FileName) [type=$($e.ItemType)]"
        }
    }
}

Write-Host ""
Write-Host "========================================="
Write-Host "  SUMMARY"
Write-Host "========================================="
Write-Host "  Armi nel CSV:            $($csv.Count)"
Write-Host "  File JSON totali:        $($jsonFiles.Count)"
Write-Host "  Armi TROVATE e VALIDE:   $($found.Count)"
Write-Host "  Armi STUB (valuable):    $($stubs.Count)"
Write-Host "  Armi MANCANTI dal JSON:  $($missing.Count)"
Write-Host "  Armi con DIFFERENZE:     $($issues.Count)"
