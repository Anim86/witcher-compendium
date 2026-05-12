# Audit descriptions: compare CSV vs JSON
$csvPath = 'c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\raw-data\armi.csv'
$jsonDir = 'c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\src-packs\EQUIPAGGIAMENTO\witcher-weapons'

$csv = Import-Csv -Path $csvPath -Encoding UTF8

# Name mapping
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

# Build JSON lookup
$jsonFiles = Get-ChildItem -Path $jsonDir -Filter '*.json'
$jsonLookup = @{}
foreach ($f in $jsonFiles) {
    $raw = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)
    $obj = $raw | ConvertFrom-Json
    $key = $obj.name.Trim().ToLower()
    $jsonLookup[$key] = @{ Obj = $obj; File = $f }
}

# Also map scorpione
$scorpioneRow = $null
foreach ($row in $csv) {
    if ($row.Nome -eq 'Scorpione (Balista)') { $scorpioneRow = $row; break }
}

$ok = 0
$csvDescUsed = 0
$customDesc = 0
$empty = 0
$different = @()

foreach ($row in $csv) {
    $csvName = $row.Nome.Trim().ToLower()
    $csvDesc = $row.Descrizione

    # Find JSON match
    $match = $jsonLookup[$csvName]
    if (-not $match -and $nameMap.ContainsKey($csvName)) {
        $match = $jsonLookup[$nameMap[$csvName].ToLower()]
    }
    if ($csvName -eq 'scorpione (balista)') {
        $match = $jsonLookup['scorpione']
    }

    if (-not $match) { continue }

    $jsonDesc = $match.Obj.system.description
    
    # Strip HTML tags for comparison
    $jsonPlain = $jsonDesc -replace '<[^>]+>', '' -replace '&amp;', '&'
    $jsonPlain = $jsonPlain.Trim()
    $csvPlain = $csvDesc.Trim()

    if (-not $jsonDesc -or $jsonDesc -eq '' -or $jsonDesc -eq '<p></p>') {
        $empty++
        Write-Host "EMPTY: $($row.Nome) | $($match.File.Name)"
    }
    elseif ($jsonPlain -eq $csvPlain) {
        $csvDescUsed++
    }
    elseif ($jsonPlain.Contains($csvPlain) -or $csvPlain.Contains($jsonPlain)) {
        # Partial match - CSV is subset or superset
        $csvDescUsed++
    }
    else {
        $customDesc++
        # Check if JSON has a more detailed/different description
        $csvShort = if ($csvPlain.Length -gt 80) { $csvPlain.Substring(0, 80) + '...' } else { $csvPlain }
        $jsonShort = if ($jsonPlain.Length -gt 80) { $jsonPlain.Substring(0, 80) + '...' } else { $jsonPlain }
        $different += [PSCustomObject]@{
            Nome = $row.Nome
            File = $match.File.Name
            JsonDesc = $jsonShort
            CsvDesc = $csvShort
            JsonLen = $jsonPlain.Length
            CsvLen = $csvPlain.Length
        }
    }
}

Write-Host ""
Write-Host "========================================="
Write-Host "  DESCRIPTION AUDIT SUMMARY"
Write-Host "========================================="
Write-Host "  Descrizioni VUOTE:                    $empty"
Write-Host "  Descrizioni = CSV (o simili):          $csvDescUsed"
Write-Host "  Descrizioni DIVERSE dal CSV:           $customDesc"
Write-Host ""

if ($different.Count -gt 0) {
    Write-Host "========================================="
    Write-Host "  DETAIL: Descriptions different from CSV"
    Write-Host "========================================="
    foreach ($d in $different) {
        Write-Host ""
        Write-Host "  [$($d.Nome)] ($($d.File))"
        Write-Host "    JSON ($($d.JsonLen) chars): $($d.JsonDesc)"
        Write-Host "    CSV  ($($d.CsvLen) chars): $($d.CsvDesc)"
    }
}

if ($empty -gt 0) {
    Write-Host ""
    Write-Host "  >>> $empty armi hanno descrizione VUOTA - servono le descrizioni dal CSV!"
}
