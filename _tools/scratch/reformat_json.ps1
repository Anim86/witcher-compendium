# Reformat all JSON files to consistent style (4-space indent, no unicode escape)
$jsonDir = 'c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\src-packs\EQUIPAGGIAMENTO\witcher-weapons'

Add-Type -AssemblyName System.Web

$files = Get-ChildItem -Path $jsonDir -Filter '*.json'
$count = 0

foreach ($f in $files) {
    $raw = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)

    # Parse and re-serialize with Newtonsoft-style formatting
    # PowerShell's ConvertFrom/To-Json produces ugly output, so we do manual formatting
    $obj = $raw | ConvertFrom-Json

    # Use .NET serialization for clean output
    $json = $obj | ConvertTo-Json -Depth 10 -Compress:$false

    # Fix unicode escapes: \u003cp\u003e -> <p>, \u0027 -> ', etc.
    $json = $json -replace '\\u003c', '<'
    $json = $json -replace '\\u003e', '>'
    $json = $json -replace '\\u0027', "'"
    $json = $json -replace '\\u0026', '&'
    $json = $json -replace '\\u00e0', [char]0x00E0    # à
    $json = $json -replace '\\u00e8', [char]0x00E8    # è
    $json = $json -replace '\\u00e9', [char]0x00E9    # é
    $json = $json -replace '\\u00ec', [char]0x00EC    # ì
    $json = $json -replace '\\u00f2', [char]0x00F2    # ò
    $json = $json -replace '\\u00f9', [char]0x00F9    # ù
    $json = $json -replace '\\u00c8', [char]0x00C8    # È
    $json = $json -replace '\\u00c0', [char]0x00C0    # À

    # Normalize indentation: PS uses variable spaces, we want consistent 4-space
    $lines = $json -split "`r?`n"
    $normalized = @()
    foreach ($line in $lines) {
        # Count leading spaces
        $trimmed = $line.TrimStart()
        $leadingSpaces = $line.Length - $trimmed.Length
        # PS default indent is multiples of 4 but sometimes weird
        $indentLevel = [math]::Floor($leadingSpaces / 4)
        $newLine = ('    ' * $indentLevel) + $trimmed
        $normalized += $newLine
    }
    $json = $normalized -join "`n"

    # Remove trailing whitespace and ensure single newline at end
    $json = $json.TrimEnd() + "`n"

    [System.IO.File]::WriteAllText($f.FullName, $json, (New-Object System.Text.UTF8Encoding $false))
    $count++
}

Write-Host "Reformatted $count JSON files"
