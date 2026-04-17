$compendioDir = "e:\AntigravitiProgetti\CompendioTheWitcher\_tools\src-packs"
$uuids = @{}
$errors = @()

$files = Get-ChildItem -Path $compendioDir -Filter *.json -Recurse

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
        if ($null -eq $data._stats.coreVersion) {
            $errors += "Missing coreVersion in $($file.FullName)"
        }
        if ($data._stats.coreVersion -is [string]) {
             $errors += "String coreVersion in $($file.FullName)"
        }

        # Check systemVersion
        if ($data._stats.systemVersion) {
            $errors += "systemVersion residue in $($file.FullName)"
        }
        
        # Check description
        if ($null -eq $data.system.description -or $data.system.description -eq "") {
            $errors += "Empty description in $($file.FullName)"
        }

    } catch {
        $errors += "JSON PARSE ERROR in $($file.FullName): $($_.Exception.Message)"
    }
}

if ($errors.Count -eq 0) {
    Write-Host "Verification PASSED. All files clean."
} else {
    Write-Host "Verification FAILED with $($errors.Count) errors:"
    $errors | ForEach-Object { Write-Host " - $_" }
}
