$sourceDir = "e:\AntigravitiProgetti\CompendioTheWitcher\_tools\src-packs\_DA_RICOLLOCARE\trofei"
$targetDir = "e:\AntigravitiProgetti\CompendioTheWitcher\_tools\src-packs\EQUIPAGGIAMENTO\caos\witcher-trophies"
$compendioDir = "e:\AntigravitiProgetti\CompendioTheWitcher\_tools\src-packs"

if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Force -Path $targetDir
}

# Collection of all UUIDs in the compendium to check for duplicates
$allUuids = @{}
Get-ChildItem -Path $compendioDir -Filter *.json -Recurse | ForEach-Object {
    try {
        $data = Get-Content $_.FullName -Raw -Encoding UTF8 | ConvertFrom-Json
        if ($data._id) { $allUuids[$data._id] = $_.FullName }
    } catch {}
}

function IsValidUuid($id) {
    if ($null -eq $id) { return $false }
    return $id -match '^[0-9a-f]{16}$'
}

function Get-RandomHex([int]$length) {
    $chars = "0123456789abcdef"
    $result = ""
    for ($i=0; $i -lt $length; $i++) { $result += $chars[(Get-Random -Maximum 16)] }
    return $result
}

$mappingTC126 = @("Botchling", "Lupo Mannaro", "Vendigo", "Cockatrice", "Fenice", "Scaltrocertola", "Viverna", "Elementale di Fuoco", "Elementale di Ghiaccio", "Elementale di Terra", "Golem", "Grifone", "Manticora", "Succube")
$mappingTC127 = @("Arachas", "Frightener", "Bullvore", "Foglet", "Strega dei Sepolcri", "Demonio", "Leshen", "Shaelmaar", "Hym", "Pesta", "Wraith Diurno", "Bruxa", "Garkain", "Katakan", "Ciclope", "Troll", "Troll di Roccia", "Orso", "Pantera")

$files = Get-ChildItem -Path $sourceDir -Filter *.json

foreach ($file in $files) {
    if ($file.Name -match "Immagini") { continue }

    $json = Get-Content $file.FullName -Raw -Encoding UTF8 | ConvertFrom-Json
    
    if ($json.name -eq "Trofeo: Wraith") { $json.name = "Trofeo: Wraith Diurno" }

    # Map to TC
    $cleanName = $json.name -replace 'Trofeo: ', ''
    $sb = "TC 126"
    $found = $false
    foreach ($m in $mappingTC126) { if ($cleanName -match $m) { $sb = "TC 126"; $found = $true; break } }
    if (-not $found) {
        foreach ($m in $mappingTC127) { if ($cleanName -match $m) { $sb = "TC 127"; $found = $true; break } }
    }

    # Description Fix
    $desc = $json.system.description
    if ($desc -notmatch '^<p>') { $desc = "<p>$desc</p>" }
    if ($json.name -eq "Trofeo: Wraith Diurno") { $desc = $desc -replace '<p>Diurno ', '<p>' }

    # UUID Fix
    $uid = $json._id
    if (-not (IsValidUuid $uid) -or $allUuids.ContainsKey($uid)) {
        $uid = Get-RandomHex 16
    }
    $allUuids[$uid] = $file.FullName

    # Reconstruct Hashtable for perfect control
    $output = [ordered]@{
        "_id" = $uid
        "name" = $json.name
        "type" = "item"
        "img" = $json.img
        "system" = [ordered]@{
            "description" = $desc
            "weight" = 0
            "cost" = 0
            "quantity" = 1
            "sourcebook" = $sb
        }
        "effects" = @()
        "folder" = $null
        "sort" = 0
        "ownership" = @{ "default" = 0 }
        "flags" = @{}
        "_stats" = @{
            "systemId" = "TheWitcherItaNewSystem"
            "coreVersion" = 14
        }
    }

    $sanitizedName = $json.name -replace ' ', '_' -replace ':', '' -replace '\(', '' -replace '\)', ''
    $targetFile = Join-Path $targetDir "$($sanitizedName)_$($uid).json"
    
    $jsonString = $output | ConvertTo-Json -Depth 10
    [System.IO.File]::WriteAllText($targetFile, $jsonString, [System.Text.Encoding]::UTF8)
}

Write-Host "Trophies processed successfully."
