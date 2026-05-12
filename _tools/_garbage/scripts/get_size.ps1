$path = 'C:\Users\apaci\Desktop\Script\witcher-compendium-main\witcher-compendium\assets\BESTIARIO\MOSTRI\leshen.webp'
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile($path)
Write-Host "$($img.Width)x$($img.Height)"
$img.Dispose()
