$brainPath = "C:\Users\Manuel\.gemini\antigravity\brain\a3071980-f5ef-433f-af1f-e5bad12c6b5e"
$targetBase = "e:\AntigravitiProgetti\CompendioTheWitcher\temp_images"

$mappings = @(
    @{ src="voren_di_dillingen_1777959986493.png"; dst="witcher-characters\voren_di_dillingen.png" },
    @{ src="zoltan_chivay_1777960000192.png"; dst="witcher-characters\zoltan_chivay.png" },
    @{ src="spada_dargento_del_gatto_1777960013461.png"; dst="witcher-weapons\spada_dargento_del_gatto.png" },
    @{ src="balestra_del_gatto_1777960032495.png"; dst="witcher-weapons\balestra_del_gatto.png" },
    @{ src="spada_dargento_del_grifone_1777960044690.png"; dst="witcher-weapons\spada_dargento_del_grifone.png" },
    @{ src="balestra_del_grifone_1777960056788.png"; dst="witcher-weapons\balestra_del_grifone.png" },
    @{ src="spada_da_cavalleria_vrihedd_1777960072565.png"; dst="witcher-weapons\spada_da_cavalleria_vrihedd.png" },
    @{ src="spada_lunare_1777960087193.png"; dst="witcher-weapons\spada_lunare.png" },
    @{ src="spada_meteoritica_1777960107283.png"; dst="witcher-weapons\spada_meteoritica.png" },
    @{ src="sperone_darpia_1777960120048.png"; dst="witcher-weapons\sperone_darpia.png" },
    @{ src="spina_1777960133498.png"; dst="witcher-weapons\spina.png" },
    @{ src="zefhar_elfico_1777960151145.png"; dst="witcher-weapons\zefhar_elfico.png" },
    @{ src="balestra_da_caccia_1777960169736.png"; dst="witcher-weapons-racconti\balestra_da_caccia.png" },
    @{ src="lama_viroledana_1777960183687.png"; dst="witcher-weapons-racconti\lama_viroledana.png" },
    @{ src="lancia_da_guerra_1777960197257.png"; dst="witcher-weapons-racconti\lancia_da_guerra.png" },
    @{ src="lancia_smussata_1777960211812.png"; dst="witcher-weapons-racconti\lancia_smussata.png" },
    @{ src="maglio_del_contadino_1777960227808.png"; dst="witcher-weapons-racconti\maglio_del_contadino.png" }
)

foreach ($map in $mappings) {
    $src = Join-Path $brainPath $map.src
    $dst = Join-Path $targetBase $map.dst
    $dstDir = Split-Path $dst
    if (-not (Test-Path $dstDir)) {
        New-Item -ItemType Directory -Path $dstDir -Force
    }
    Write-Host "Copying $src to $dst"
    Copy-Item -Path $src -Destination $dst -Force
}
