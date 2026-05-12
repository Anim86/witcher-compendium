# Compare the 6 DLC valuable swords with their weapon counterparts
$srcPacks = 'c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\src-packs'
$names = @(
    'Spada d''Acciaio del Gatto',
    'Spada d''Acciaio del Grifone',
    'Spada d''Acciaio del Lupo',
    'Spada d''Argento del Gatto',
    'Spada d''Argento del Grifone',
    'Spada d''Argento del Lupo'
)

$jsonFiles = Get-ChildItem -Path $srcPacks -Recurse -Filter '*.json'

foreach ($n in $names) {
    Write-Host ('=== ' + $n + ' ===')
    foreach ($f in $jsonFiles) {
        $content = Get-Content $f.FullName -Raw -Encoding UTF8 | ConvertFrom-Json
        if ($content.name -eq $n) {
            $rel = $f.FullName.Replace($srcPacks + '\', '')
            Write-Host ('  FILE: ' + $rel)
            Write-Host ('  type: ' + $content.type)
            Write-Host ('  img:  ' + $content.img)
            Write-Host ('  _id:  ' + $content._id)
            if ($content.system.description) {
                $desc = $content.system.description -replace '<[^>]+>', ''
                if ($desc.Length -gt 100) { $desc = $desc.Substring(0, 100) + '...' }
                Write-Host ('  desc: ' + $desc)
            }
            Write-Host ''
        }
    }
}
