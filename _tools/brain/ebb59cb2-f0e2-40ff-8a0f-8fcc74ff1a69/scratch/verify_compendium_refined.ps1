$packs = @(
    "e:\AntigravitiProgetti\CompendioTheWitcher\_tools\src-packs\CRAFTING",
    "e:\AntigravitiProgetti\CompendioTheWitcher\_tools\src-packs\EQUIPAGGIAMENTO\base\witcher-transports",
    "e:\AntigravitiProgetti\CompendioTheWitcher\_tools\src-packs\EQUIPAGGIAMENTO\caos\witcher-trophies",
    "e:\AntigravitiProgetti\CompendioTheWitcher\_tools\src-packs\EQUIPAGGIAMENTO\base\witcher-armor",
    "e:\AntigravitiProgetti\CompendioTheWitcher\_tools\src-packs\EQUIPAGGIAMENTO\base\witcher-weapons",
    "e:\AntigravitiProgetti\CompendioTheWitcher\_tools\src-packs\EQUIPAGGIAMENTO\base\witcher-equipment",
    "e:\AntigravitiProgetti\CompendioTheWitcher\_tools\src-packs\EQUIPAGGIAMENTO\base\witcher-special",
    "e:\AntigravitiProgetti\CompendioTheWitcher\_tools\src-packs\BESTIARIO\PNG\base\witcher-monsters",
    "e:\AntigravitiProgetti\CompendioTheWitcher\_tools\src-packs\BESTIARIO\NPC"
)

$uuids = @{}
$errors = @()

foreach ($pack in $packs) {
    if (-not (Test-Path $pack)) { continue }
    $files = Get-ChildItem -Path $pack -Filter *.json -Recurse
    foreach ($file in $files) {
        try {
            $data = Get-Content $file.FullName -Raw -Encoding UTF8 | ConvertFrom-Json
            
            # Check UUID
            if ($null -eq $data._id) {
                $errors += "Missing ID in $($file.FullName)"
            } elseif ($uuids.ContainsKey($data._id)) {
                $errors += "DUPLICATE ID $($data._id) in $($file.FullName) and $($uuids[$data._id])"
            } else {
                $uuids[$data._id] = $file.FullName
            }

            # Check coreVersion
            if ($data._stats.coreVersion -ne 14) {
                $errors += "Invalid coreVersion ($($data._stats.coreVersion)) in $($file.FullName)"
            }

            # Check systemVersion
            if ($data._stats.systemVersion) {
                $errors += "systemVersion residue in $($file.FullName)"
            }
            
            # Check description
            $desc = ""
            if ($data.system.description) { $desc = $data.system.description }
            if ($desc -eq "") {
                $errors += "Empty description in $($file.FullName)"
            }

        } catch {
            $errors += "JSON PARSE ERROR in $($file.FullName): $($_.Exception.Message)"
        }
    }
}

if ($errors.Count -eq 0) {
    Write-Host "Verification PASSED. All final packs clean."
} else {
    Write-Host "Verification FAILED with $($errors.Count) errors:"
    $errors | ForEach-Object { Write-Host " - $_" }
}
