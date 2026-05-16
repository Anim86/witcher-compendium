# Check if there are weapon-type counterparts for Gatto/Grifone/Lupo swords
$srcPacks = 'c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\src-packs'
$jsonFiles = Get-ChildItem -Path $srcPacks -Recurse -Filter '*.json'

Write-Host '=== ALL items with Gatto/Grifone/Lupo in name ==='
foreach ($f in $jsonFiles) {
    $c = Get-Content $f.FullName -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($c.name -match '(Gatto|Grifone|Lupo)' -and $c.name -match 'Spada') {
        $rel = $f.FullName.Replace($srcPacks + '\', '')
        Write-Host ($c.name + ' | type=' + $c.type + ' | ' + $rel)
    }
}
