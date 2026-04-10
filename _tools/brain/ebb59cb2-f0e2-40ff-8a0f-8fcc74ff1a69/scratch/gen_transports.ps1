$outputDir = "e:\AntigravitiProgetti\CompendioTheWitcher\_tools\src-packs\EQUIPAGGIAMENTO\base\witcher-transports"

if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Force -Path $outputDir
}

function Get-RandomHex([int]$length) {
    $chars = "0123456789abcdef"
    $result = ""
    for ($i=0; $i -lt $length; $i++) {
        $result += $chars[(Get-Random -Maximum 16)]
    }
    return $result
}

$transports = @(
    @{ name="Barca a Vela"; cost=230; weight=130; desc="Una piccola imbarcazione dotata di una sola vela, ideale per spostarsi lungo fiumi e coste." },
    @{ name="Bue"; cost=278; weight=300; desc="Famoso per la sua forza e resistenza, il bue è spesso impiegato per trainare carri carichi in lunghi viaggi." },
    @{ name="Carro"; cost=660; weight=600; desc="Un veicolo robusto a quattro ruote progettato per il trasporto di merci pesanti, solitamente trainato da buoi o cavalli." },
    @{ name="Carrozza"; cost=200; weight=300; desc="Una carrozza chiusa e confortevole, adatta al trasporto di nobili o mercanti benestanti lungo le strade principali." },
    @{ name="Cavallo"; cost=520; weight=100; desc="L'animale da trasporto più comune, veloce e affidabile per i viaggiatori di ogni estrazione sociale." },
    @{ name="Cavallo da Guerra"; cost=1600; weight=270; desc="Un cavallo addestrato al combattimento, più robusto e coraggioso rispetto ai normali cavalli da monta." },
    @{ name="Cutter (barca)"; cost=1670; weight=610; desc="Un'imbarcazione snella e veloce, utilizzata per trasporti rapidi o per piccole spedizioni marittime." },
    @{ name="Mulo"; cost=200; weight=150; desc="Testardo ma infaticabile, il mulo è eccellente per trasportare carichi in territori montuosi o impervi." },
    @{ name="Nave a Vela"; cost=2180; weight=2040; desc="Una grande imbarcazione oceanica in grado di trasportare ingenti equipaggi e merci attraverso i mari." }
)

$equipment = @(
    @{ name="Sella"; cost=100; weight=5; desc="Una sella standard, essenziale per cavalcare senza subire penalità." },
    @{ name="Sella da Cavalleria"; cost=325; weight=6; desc="Sella progettata per il combattimento, offre un migliore controllo e include un pratico fodero per l'arma." },
    @{ name="Sella da Corsa"; cost=200; weight=3; desc="Sella leggera e aerodinamica, progettata per massimizzare la velocità della cavalcatura." },
    @{ name="Paraocchi"; cost=100; weight=0.1; desc="Schermi laterali per gli occhi che aiutano a mantenere la calma della cavalcatura prevenendo distrazioni." },
    @{ name="Paraocchi da Corsa"; cost=125; weight=0.1; desc="Paraocchi specializzati che massimizzano la concentrazione della cavalcatura durante la corsa." },
    @{ name="Bisacce"; cost=100; weight=1.5; desc="Robuste borse da sella per il trasporto di oggetti personali o provviste." },
    @{ name="Bisacce Militari"; cost=150; weight=2; desc="Bisacce rinforzate e capienti, progettate per le necessità di una campagna militare prolungata." },
    @{ name="Bardatura di Cuoio"; cost=550; weight=10; desc="Armatura leggera in cuoio bollito per proteggere la cavalcatura senza appesantirla eccessivamente." },
    @{ name="Bardatura di Maglia di Ferro"; cost=1050; weight=25; desc="Pesante protezione in maglia di ferro che garantisce un'ottima difesa alla cavalcatura in battaglia." }
)

$allItems = $transports + $equipment

foreach ($item in $allItems) {
    $uid = Get-RandomHex 16
    $sanitizedName = $item.name -replace ' ', '_' -replace '\(', '' -replace '\)', ''
    $fileName = "$($sanitizedName)_$($uid).json"
    
    $jsonData = @{
        "_id" = $uid
        "name" = $item.name
        "type" = "item"
        "img" = "icons/svg/item-bag.svg"
        "system" = @{
            "description" = "<p>$($item.desc)</p>"
            "weight" = $item.weight
            "cost" = $item.cost
            "quantity" = 1
            "sourcebook" = "MB 93"
        }
        "_stats" = @{
            "systemId" = "TheWitcherItaNewSystem"
            "coreVersion" = 14
        }
    }
    
    $filePath = Join-Path $outputDir $fileName
    $jsonData | ConvertTo-Json -Depth 10 | Out-File -FilePath $filePath -Encoding utf8
}

Write-Host "Created $($allItems.Count) transport files."
