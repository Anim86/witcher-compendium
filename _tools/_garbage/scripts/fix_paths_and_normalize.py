import os
import json
import re
import unicodedata
import shutil

# Paths
ROOT = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main"
SRC_PACKS = os.path.join(ROOT, "_tools", "src-packs")
ASSETS_DIR = os.path.join(ROOT, "witcher-compendium", "assets")
LOG_PATH = os.path.join(ROOT, "_tools", "reports", "fix-paths-log.md")

# Exclusions
EXCLUDE_JSON = ["Fiammata_2810f6f48d3244c0.json"]

# Manual Corrections (RelPath in JSON -> New RelPath in assets)
MANUAL_FIXES = {
    "Artigiano_dda3513924004a52.json": "modules/witcher-compendium/assets/CORE/witcher-professions/artigiano.webp",
    "Medico_7ec8a90ac1d79862.json": "modules/witcher-compendium/assets/CORE/witcher-professions/medico.webp"
}

def slugify(value):
    """Normalizes string, converts to lowercase, removes non-alpha characters."""
    value = str(value)
    # Remove encoding artifacts often found in these files
    value = value.replace('â€™', "'").replace('â€˜', "'").replace('Ã ', "a").replace('Ã¨', "e").replace('Ã¬', "i").replace('Ã²', "o").replace('Ã¹', "u")
    value = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode('ascii')
    value = re.sub(r'[^\w\s-]', '', value).strip().lower()
    return re.sub(r'[-\s]+', '_', value)

def pure_name(value):
    """Returns only alphanumeric characters, lowercase, for fallback matching."""
    name, _ = os.path.splitext(str(value).lower())
    # Remove encoding artifacts
    name = name.replace('â€™', "").replace('â€˜', "").replace('â', "")
    name = unicodedata.normalize('NFKD', name).encode('ascii', 'ignore').decode('ascii')
    return re.sub(r'[^a-z0-9]', '', name)

def normalize_filename(filename):
    """Special handling for common encoding issues before slugifying."""
    name, ext = os.path.splitext(filename)
    # Fix common artifacts
    name = name.replace("’", "").replace("'", "")
    name = slugify(name)
    return name + ext.lower()

def run_fix():
    # 1. Build Global Asset Map
    print("Step 1: Mappatura globale asset...")
    global_asset_map = {} # norm_filename -> abs_path
    pure_asset_map = {}   # alphanumeric_only -> abs_path
    rename_map = {}       # old_abs_path -> new_abs_path
    
    for root, dirs, files in os.walk(ASSETS_DIR):
        for f in files:
            if not f.lower().endswith(('.webp', '.png', '.jpg')): continue
            
            old_path = os.path.join(root, f)
            new_name = normalize_filename(f)
            new_path = os.path.join(root, new_name)

            # Map the pure version for fuzzy matching
            pure = pure_name(f)
            if pure:
                pure_asset_map[pure] = new_path # Map to the new path (normalized)

            if new_name != f:
                # Handle collision during rename
                counter = 1
                base, ext = os.path.splitext(new_path)
                while os.path.exists(new_path) and new_path.lower() != old_path.lower():
                    new_path = f"{base}_{counter}{ext}"
                    counter += 1
                
                print(f"Ridenominazione: {f} -> {os.path.basename(new_path)}")
                os.rename(old_path, new_path)
                rename_map[old_path.lower()] = new_path
                global_asset_map[os.path.basename(new_path)] = new_path
            else:
                global_asset_map[new_name] = old_path

    print(f"Mappati {len(global_asset_map)} asset unici ({len(pure_asset_map)} chiavi fuzzy).")

    # 1.5. Category mapping for equipment without individual icons
    CATEGORY_MAP = {
        # Witcher Special
        "decotto": "assets/EQUIPAGGIAMENTO/base/witcher-special/witcher_decotto.webp",
        "pozione": "assets/EQUIPAGGIAMENTO/base/witcher-special/witcher_pozione.webp",
        "unguento": "assets/EQUIPAGGIAMENTO/base/witcher-special/witcher_unguento.webp",
        "olio": "assets/EQUIPAGGIAMENTO/base/witcher-special/witcher_unguento.webp",
        "medaglione": "assets/EQUIPAGGIAMENTO/base/witcher-special/medaglione_witcher.webp",
        "runa": "assets/EQUIPAGGIAMENTO/base/witcher-special/runa_witcher.webp",
        "filtro": "assets/EQUIPAGGIAMENTO/base/witcher-special/witcher_pozione.webp",

        # Iconic Witcher Potions & Oils
        "foresta": "assets/EQUIPAGGIAMENTO/base/witcher-special/witcher_pozione.webp",
        "gatto": "assets/EQUIPAGGIAMENTO/base/witcher-special/witcher_pozione.webp",
        "gufo": "assets/EQUIPAGGIAMENTO/base/witcher-special/witcher_pozione.webp",
        "luna": "assets/EQUIPAGGIAMENTO/base/witcher-special/witcher_pozione.webp",
        "miele": "assets/EQUIPAGGIAMENTO/base/witcher-special/witcher_pozione.webp",
        "orca": "assets/EQUIPAGGIAMENTO/base/witcher-special/witcher_pozione.webp",
        "rigogolo": "assets/EQUIPAGGIAMENTO/base/witcher-special/witcher_pozione.webp",
        "rondine": "assets/EQUIPAGGIAMENTO/base/witcher-special/witcher_pozione.webp",
        "sangue nero": "assets/EQUIPAGGIAMENTO/base/witcher-special/witcher_pozione.webp",
        "tuono": "assets/EQUIPAGGIAMENTO/base/witcher-special/witcher_pozione.webp",
        "veleno": "assets/EQUIPAGGIAMENTO/base/witcher-special/witcher_unguento.webp",

        # Weapons
        "arco": "assets/EQUIPAGGIAMENTO/base/witcher-weapons/arco_da_guerra.webp",
        "balestra": "assets/EQUIPAGGIAMENTO/base/witcher-weapons/balestra.webp",
        "pugnale": "assets/EQUIPAGGIAMENTO/base/witcher-weapons/pugnale.webp",
        "stiletto": "assets/EQUIPAGGIAMENTO/base/witcher-weapons/stiletto.webp",
        "coltello": "assets/EQUIPAGGIAMENTO/base/witcher-weapons/pugnale.webp",
        "ascia": "assets/EQUIPAGGIAMENTO/base/witcher-weapons/ascia_da_battaglia.webp",
        "accetta": "assets/EQUIPAGGIAMENTO/base/witcher-weapons/accetta.webp",
        "spada": "assets/EQUIPAGGIAMENTO/base/witcher-weapons/spada_darme.webp",
        "munizioni": "assets/EQUIPAGGIAMENTO/base/witcher-weapons/munizioni_normali.webp",
        "dardo": "assets/EQUIPAGGIAMENTO/base/witcher-weapons/munizioni_normali.webp",
        "freccia": "assets/EQUIPAGGIAMENTO/base/witcher-weapons/munizioni_normali.webp",
        "bastone": "assets/EQUIPAGGIAMENTO/base/witcher-weapons/bastone.webp",
        "mazza": "assets/EQUIPAGGIAMENTO/base/witcher-weapons/mazza.webp",

        # Specialized/Iconic Weapons
        "gwyhyr": "assets/EQUIPAGGIAMENTO/base/witcher-weapons/spada_acciaio_militare.webp",
        "tir tochair": "assets/EQUIPAGGIAMENTO/base/witcher-weapons/spada_acciaio_militare.webp",
        "lupo": "assets/EQUIPAGGIAMENTO/base/witcher-weapons/spada_acciaio_militare.webp",
        "mannaia": "assets/EQUIPAGGIAMENTO/base/witcher-weapons/ascia_da_battaglia.webp",
        "maugrim": "assets/EQUIPAGGIAMENTO/base/witcher-weapons/spada_acciaio_militare.webp",
        "flamberga": "assets/EQUIPAGGIAMENTO/base/witcher-weapons/spada_darme.webp",
        "viroledana": "assets/EQUIPAGGIAMENTO/base/witcher-weapons/spada_darme.webp",
        "maglio": "assets/EQUIPAGGIAMENTO/base/witcher-weapons/maglio_altipiani.webp",
        "martello": "assets/EQUIPAGGIAMENTO/base/witcher-weapons/maglio_altipiani.webp",
        "partigiana": "assets/EQUIPAGGIAMENTO/base/witcher-weapons/lancia_v2.webp",
        "lancia": "assets/EQUIPAGGIAMENTO/base/witcher-weapons/lancia_v2.webp",
        "punta di lancia": "assets/EQUIPAGGIAMENTO/base/witcher-weapons/lancia_v2.webp",

        # Armor
        "elmo": "assets/EQUIPAGGIAMENTO/base/witcher-armor/grande_elmo.webp",
        "bacinetto": "assets/EQUIPAGGIAMENTO/base/witcher-armor/bacinetto_temeriano.webp",
        "cappuccio": "assets/EQUIPAGGIAMENTO/base/witcher-armor/cappuccio_corazzato.webp",
        "camaglio": "assets/EQUIPAGGIAMENTO/base/witcher-armor/camaglio.webp",
        "brache": "assets/EQUIPAGGIAMENTO/base/witcher-armor/brache_corazzate.webp",
        "gambali": "assets/EQUIPAGGIAMENTO/base/witcher-armor/gambali_di_maglia_di_hindarsfjall.webp",
        "schinieri": "assets/EQUIPAGGIAMENTO/base/witcher-armor/schinieri_di_piastre.webp",
        "scudo": "assets/EQUIPAGGIAMENTO/base/witcher-armor/scudo_di_cuoio.webp",
        "palvese": "assets/EQUIPAGGIAMENTO/base/witcher-armor/palvese.webp",
        "brocchiero": "assets/EQUIPAGGIAMENTO/base/witcher-armor/brocchiero_d_acciaio.webp",
        "giubba": "assets/EQUIPAGGIAMENTO/base/witcher-armor/giubba_di_cuoio_lyriana.webp",
        "gambesone": "assets/EQUIPAGGIAMENTO/base/witcher-armor/gambesone.webp",
        "brigantina": "assets/EQUIPAGGIAMENTO/base/witcher-armor/brigantina.webp",
        "armatura": "assets/EQUIPAGGIAMENTO/base/witcher-armor/armatura_a_piastre.webp",

        # Transports
        "barca": "assets/EQUIPAGGIAMENTO/base/witcher-transports/imbarcazione.webp",
        "nave": "assets/EQUIPAGGIAMENTO/base/witcher-transports/imbarcazione.webp",
        "cavallo": "assets/EQUIPAGGIAMENTO/base/witcher-transports/cavallo_comune.webp",
        "mulo": "assets/EQUIPAGGIAMENTO/base/witcher-transports/cavallo_comune.webp",
        "bue": "assets/EQUIPAGGIAMENTO/base/witcher-transports/cavallo_comune.webp",
        "bisacce": "assets/EQUIPAGGIAMENTO/base/witcher-transports/bisacce.webp",
        "carro": "assets/EQUIPAGGIAMENTO/base/witcher-transports/carro.webp",
        "carrozza": "assets/EQUIPAGGIAMENTO/base/witcher-transports/carro.webp",
        "sella": "assets/EQUIPAGGIAMENTO/base/witcher-transports/sella.webp",

        # Equipment (Generic)
        "abiti": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/abbigliamento.webp",
        "abbigliamento": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/abbigliamento.webp",
        "amuleto": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/abbigliamento.webp",
        "gioielli": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/abbigliamento.webp",
        "corda": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/strumenti.webp",
        "acciarino": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/strumenti.webp",
        "arnesi": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/strumenti.webp",
        "attrezzatura": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/strumenti.webp",
        "lanterna": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/strumenti.webp",
        "strumenti": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/strumenti.webp",
        "birra": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/viveri_e_bevande.webp",
        "pasto": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/viveri_e_bevande.webp",
        "banchetto": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/viveri_e_bevande.webp",
        "vino": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/viveri_e_bevande.webp",
        "cibo": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/viveri_e_bevande.webp",
        "aceto": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/viveri_e_bevande.webp",
        "zaino": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/contenitori.webp",
        "sacca": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/contenitori.webp",
        "alcohest": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/medicina_e_alchimia.webp",
        "arto": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/medicina_e_alchimia.webp",
        "medico": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/medicina_e_alchimia.webp",
        "avvocato": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/servizi.webp",
        "messaggero": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/servizi.webp",
        "diario": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/libri_e_documenti.webp",
        "libro": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/libri_e_documenti.webp",
        "mappa": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/libri_e_documenti.webp",
        "bagno": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/alloggio_e_riposo.webp",
        "stanza": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/alloggio_e_riposo.webp",
        "ceppi": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/oggetti_disonesti.webp",

        # Special Witcher Naming (Oils/Potions)
        "anti-": "assets/EQUIPAGGIAMENTO/base/witcher-special/witcher_unguento.webp",
        "bufera": "assets/EQUIPAGGIAMENTO/base/witcher-special/witcher_pozione.webp",

        # Transport Accessories
        "bardatura": "assets/EQUIPAGGIAMENTO/base/witcher-transports/sella.webp",
        "paraocchi": "assets/EQUIPAGGIAMENTO/base/witcher-transports/sella.webp",

        # More Equipment keywords
        "bandoliera": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/contenitori.webp",
        "borraccia": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/contenitori.webp",
        "borsello": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/contenitori.webp",
        "cesta": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/contenitori.webp",
        "scatola": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/contenitori.webp",
        "contenitore": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/contenitori.webp",
        "carne": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/viveri_e_bevande.webp",
        "pane": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/viveri_e_bevande.webp",
        "razion": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/viveri_e_bevande.webp",
        "uova": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/viveri_e_bevande.webp",
        "candele": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/strumenti.webp",
        "clessidra": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/strumenti.webp",
        "dadi": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/strumenti.webp",
        "gioco": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/strumenti.webp",
        "piuma": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/strumenti.webp",
        "inchiostro": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/strumenti.webp",
        "cronista": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/servizi.webp",
        "scriba": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/servizi.webp",
        "guida": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/servizi.webp",
        "interprete": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/servizi.webp",
        "servizio": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/servizi.webp",
        "investigatore": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/servizi.webp",
        "intrattenimento": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/servizi.webp",
        "galoppino": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/galoppino.png",
        "falsario": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/oggetti_disonesti.webp",
        "camuffamento": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/oggetti_disonesti.webp",
        "manette": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/oggetti_disonesti.webp",
        "ceppi": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/oggetti_disonesti.webp",
        "tasca": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/oggetti_disonesti.webp",

        # Specific Equipment
        "dolciumi": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/dolciumi.png",
        "giarrettiera": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/fodero_giarrettiera.png",
        "manica": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/fodero_manica.png",
        "fodero": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/fodero_giarrettiera.png", # Default for sheath
        "forgia": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/forgia_portatile.png",
        "forziere": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/forziere_legno.png",
        "gessetto": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/gessetto.png",
        "giaciglio": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/giaciglio.png",
        "incerata": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/incerata.png",
        "trucco": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/abbigliamento.webp",
        "lavanderia": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/servizi.webp",
        "pedaggio": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/servizi.webp",
        "lucchetto": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/strumenti.webp",
        "gwent": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/strumenti.webp",
        "scrivere": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/strumenti.webp",
        "strumento": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/strumenti.webp",
        "picchetti": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/strumenti.webp",
        "pipa": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/strumenti.webp",
        "poker": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/strumenti.webp",
        "profumo": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/abbigliamento.webp",
        "prostituta": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/servizi.webp",
        "rampino": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/strumenti.webp",
        "ricettatore": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/servizi.webp",
        "sacco": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/contenitori.webp",
        "sapone": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/strumenti.webp",
        "scrigno": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/contenitori.webp",
        "sacro": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/strumenti.webp",
        "specchio": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/strumenti.webp",
        "specchietto": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/strumenti.webp",
        "stallaggio": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/servizi.webp",
        "superalcolici": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/viveri_e_bevande.webp",
        "tabacco": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/viveri_e_bevande.webp",
        "telecomunicatore": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/strumenti.webp",
        "tenda": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/alloggio_e_riposo.webp",
        "paglia": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/alloggio_e_riposo.webp",
        "torcia": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/strumenti.webp",
        "traversata": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/servizi.webp",
        "utensili": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/strumenti.webp",
        "corda": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/strumenti.webp",
        "arto": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/medicina_e_alchimia.webp",
        "chirurgici": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/medicina_e_alchimia.webp",
        "pesca": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/strumenti.webp",
        "noleggiato": "assets/EQUIPAGGIAMENTO/base/witcher-equipment/servizi.webp",

        # Critical Wounds
        "frattur": "assets/GAMEPLAY/base/witcher-critical-wounds/frattura.webp",
        "incrinat": "assets/GAMEPLAY/base/witcher-critical-wounds/frattura.webp",
        "rotta": "assets/GAMEPLAY/base/witcher-critical-wounds/frattura.webp",
        "rotte": "assets/GAMEPLAY/base/witcher-critical-wounds/frattura.webp",
        "spezzata": "assets/GAMEPLAY/base/witcher-critical-wounds/frattura.webp",
        "braccio": "assets/GAMEPLAY/base/witcher-critical-wounds/frattura.webp",
        "gamba": "assets/GAMEPLAY/base/witcher-critical-wounds/frattura.webp",
        "costole": "assets/GAMEPLAY/base/witcher-critical-wounds/frattura.webp",
        "spina": "assets/GAMEPLAY/base/witcher-critical-wounds/frattura.webp",
        "cardiaci": "assets/GAMEPLAY/base/witcher-critical-wounds/interna.webp",
        "milza": "assets/GAMEPLAY/base/witcher-critical-wounds/interna.webp",
        "stomaco": "assets/GAMEPLAY/base/witcher-critical-wounds/interna.webp",
        "shock": "assets/GAMEPLAY/base/witcher-critical-wounds/interna.webp",
        "pneumotorace": "assets/GAMEPLAY/base/witcher-critical-wounds/interna.webp",
        "lesionata": "assets/GAMEPLAY/base/witcher-critical-wounds/interna.webp",
        "lacerat": "assets/GAMEPLAY/base/witcher-critical-wounds/interna.webp",
        "occhio": "assets/GAMEPLAY/base/witcher-critical-wounds/testa.webp",
        "mascella": "assets/GAMEPLAY/base/witcher-critical-wounds/testa.webp",
        "sfregio": "assets/GAMEPLAY/base/witcher-critical-wounds/testa.webp",

        # Races
        "nani": "assets/CORE/witcher-races/nano.webp",

        # Skills
        "alchimia": "assets/CORE/witcher-skills/abilita_alchimia.webp",
        "artigianato": "assets/CORE/witcher-skills/abilita_alchimia.webp",
        "archi": "assets/CORE/witcher-skills/abilita_archi.webp",
        "balestr": "assets/CORE/witcher-skills/abilita_archi.webp",
        "combattimento": "assets/CORE/witcher-skills/abilita_combattimento.webp",
        "mischia": "assets/CORE/witcher-skills/abilita_combattimento.webp",
        "atletica": "assets/CORE/witcher-skills/abilita_combattimento.webp",
        "rissa": "assets/CORE/witcher-skills/abilita_combattimento.webp",
        "spada": "assets/CORE/witcher-skills/abilita_combattimento.webp",
        "schivare": "assets/CORE/witcher-skills/abilita_combattimento.webp",
        "resistenza": "assets/CORE/witcher-skills/abilita_combattimento.webp",
        "parare": "assets/CORE/witcher-skills/abilita_combattimento.webp",
        "coraggio": "assets/CORE/witcher-skills/abilita_combattimento.webp",
        "agilità": "assets/CORE/witcher-skills/abilita_combattimento.webp",
        "fisico": "assets/CORE/witcher-skills/abilita_combattimento.webp",
        "percezione": "assets/CORE/witcher-skills/abilita_percezione.webp",
        "accortezza": "assets/CORE/witcher-skills/abilita_percezione.webp",
        "bestiario": "assets/CORE/witcher-skills/abilita_percezione.webp",
        "seguire": "assets/CORE/witcher-skills/abilita_percezione.webp",
        "sensi": "assets/CORE/witcher-skills/abilita_percezione.webp",
        "occhio": "assets/CORE/witcher-skills/abilita_percezione.webp",
        "osservare": "assets/CORE/witcher-skills/abilita_percezione.webp",
        "nuotare": "assets/CORE/witcher-skills/abilita_percezione.webp",
        "educazione": "assets/CORE/witcher-skills/abilita_percezione.webp",
        "anatomia": "assets/CORE/witcher-skills/abilita_percezione.webp",
        "albero": "assets/CORE/witcher-skills/abilita_percezione.webp",
        "sociale": "assets/CORE/witcher-skills/abilita_sociale.webp",
        "carisma": "assets/CORE/witcher-skills/abilita_sociale.webp",
        "commercio": "assets/CORE/witcher-skills/abilita_sociale.webp",
        "persuadere": "assets/CORE/witcher-skills/abilita_sociale.webp",
        "ingannare": "assets/CORE/witcher-skills/abilita_sociale.webp",
        "seduzione": "assets/CORE/witcher-skills/abilita_sociale.webp",
        "intimidire": "assets/CORE/witcher-skills/abilita_sociale.webp",
        "etimologia": "assets/CORE/witcher-skills/abilita_sociale.webp",
        "lingua": "assets/CORE/witcher-skills/abilita_sociale.webp",
        "belle arti": "assets/CORE/witcher-skills/abilita_sociale.webp",
        "recitazione": "assets/CORE/witcher-skills/abilita_sociale.webp",
        "benedizione": "assets/CORE/witcher-skills/abilita_sociale.webp",
        "bosco sacro": "assets/CORE/witcher-skills/abilita_sociale.webp",

        # Magic - Runes & Glyphs
        "runa": "assets/EQUIPAGGIAMENTO/base/witcher-special/runa_witcher.webp",
        "glifo": "assets/EQUIPAGGIAMENTO/base/witcher-special/runa_witcher.webp",
        "chernobog": "assets/EQUIPAGGIAMENTO/base/witcher-special/runa_witcher.webp",
        "dazhbog": "assets/EQUIPAGGIAMENTO/base/witcher-special/runa_witcher.webp",
        "devana": "assets/EQUIPAGGIAMENTO/base/witcher-special/runa_witcher.webp",
        "morana": "assets/EQUIPAGGIAMENTO/base/witcher-special/runa_witcher.webp",
        "perun": "assets/EQUIPAGGIAMENTO/base/witcher-special/runa_witcher.webp",
        "stribog": "assets/EQUIPAGGIAMENTO/base/witcher-special/runa_witcher.webp",
        "svarog": "assets/EQUIPAGGIAMENTO/base/witcher-special/runa_witcher.webp",
        "triglav": "assets/EQUIPAGGIAMENTO/base/witcher-special/runa_witcher.webp",
        "veles": "assets/EQUIPAGGIAMENTO/base/witcher-special/runa_witcher.webp",
        "zoria": "assets/EQUIPAGGIAMENTO/base/witcher-special/runa_witcher.webp",

        # Magic - Hexes (Fatture)
        "pesta": "assets/MAGIA/hexes/fattura_pesta.webp",
        "prurito": "assets/MAGIA/hexes/fattura_prurito.webp",
        "incubo": "assets/MAGIA/hexes/fattura_incubo.webp",
        "bestia": "assets/MAGIA/hexes/fattura_bestia.webp",
        "ombre": "assets/MAGIA/hexes/fattura_ombre.webp",
        "fortuna": "assets/MAGIA/hexes/fattura_sfortuna.webp",
        "odio": "assets/MAGIA/hexes/fattura_odio.webp",
        "fame": "assets/MAGIA/hexes/fattura_fame.webp",

        # Magic - Spells & Rituals (Elements)
        "aenye": "assets/SPECIAL/gift_fuoco.webp",
        "fiamm": "assets/SPECIAL/gift_fuoco.webp",
        "foco": "assets/SPECIAL/gift_fuoco.webp",
        "adenydd": "assets/SPECIAL/gift_aria.webp",
        "aria": "assets/SPECIAL/gift_aria.webp",
        "vent": "assets/SPECIAL/gift_aria.webp",
        "derviscio": "assets/SPECIAL/gift_aria.webp",
        "anialwch": "assets/SPECIAL/gift_aria.webp",
        "cenlly": "assets/SPECIAL/gift_terra.webp",
        "terra": "assets/SPECIAL/gift_terra.webp",
        "roccia": "assets/SPECIAL/gift_terra.webp",
        "graig": "assets/SPECIAL/gift_terra.webp",
        "acquazzone": "assets/SPECIAL/gift_ghiaccio.webp",
        "acque": "assets/SPECIAL/gift_ghiaccio.webp",
        "piog": "assets/SPECIAL/gift_ghiaccio.webp",
        "ghiaccio": "assets/SPECIAL/gift_ghiaccio.webp",
        "bywyd": "assets/SPECIAL/gift_natura.webp",
        "natura": "assets/SPECIAL/gift_natura.webp",
        "vita": "assets/SPECIAL/gift_natura.webp",
        "mente": "assets/SPECIAL/gift_mente.webp",
        "illus": "assets/SPECIAL/gift_mente.webp",
        "oniro": "assets/SPECIAL/gift_mente.webp",
        "incantesimo": "assets/ABILITA/abilita_magiche.webp",
        "rituale": "assets/ABILITA/abilita_magiche.webp",
        "magia": "assets/ABILITA/abilita_magiche.webp",

        # Animals
        "bue": "assets/BESTIARIO/MOSTRI/bue.png",
        "cane": "assets/BESTIARIO/MOSTRI/cane.png",
        "cavallo da guerra": "assets/BESTIARIO/MOSTRI/cavallo_da_guerra.png",
        "cavallo": "assets/BESTIARIO/MOSTRI/cavallo.png",
        "gatto": "assets/BESTIARIO/MOSTRI/gatto.png",
        "mulo": "assets/BESTIARIO/MOSTRI/mulo.png",
        "serpente": "assets/BESTIARIO/MOSTRI/serpente.png",
        "uccello": "assets/BESTIARIO/MOSTRI/uccello.png",
        "pantera": "assets/BESTIARIO/MOSTRI/pantera.webp",
    }

    print("\nStep 2: Aggiornamento file JSON...")
    updated_jsons = 0
    
    # Icons that can be overridden by more specific category matches
    ELIGIBLE_FOR_UPGRADE = ["cavallo_comune", "scrigno", "strumenti", "libri_e_documenti", "trait_generico", "pantera_lr", "placeholder_", "gift_"]
    
    for root, dirs, files in os.walk(SRC_PACKS):
        for f in files:
            if not f.endswith(".json"): continue
            if f in EXCLUDE_JSON: continue
            
            fpath = os.path.join(root, f)
            modified = False
            
            try:
                # Read with utf-8-sig to handle BOM
                with open(fpath, 'r', encoding='utf-8-sig') as j:
                    data = json.load(j)
                
                img = data.get("img", "")
                if not img or not isinstance(img, str): continue

                # 0. Clean encoding artifacts in the JSON data itself
                def clean_text(text):
                    if not isinstance(text, str): return text
                    # Remove placeholder markers first
                    text = text.replace('[PLACEHOLDER] ', '').replace('[PLACEHOLDER]', '')
                    return text.replace('â€™', "’").replace('â€œ', "“").replace('â€\u009d', "”") \
                               .replace('Ã ', "à").replace('Ã¨', "è").replace('Ã©', "é") \
                               .replace('Ã¬', "ì").replace('Ã²', "ò").replace('Ã¹', "ù") \
                               .replace('â€“', "–").replace('â€”', "—").replace('Ã§', "ç")

                if "name" in data:
                    old_val = data["name"]
                    data["name"] = clean_text(old_val)
                    if data["name"] != old_val: modified = True
                
                if "system" in data and "description" in data["system"]:
                    old_val = data["system"]["description"]
                    data["system"]["description"] = clean_text(old_val)
                    if data["system"]["description"] != old_val: modified = True

                # 1. Manual Fixes
                if f in MANUAL_FIXES:
                    data["img"] = MANUAL_FIXES[f]
                    modified = True
                
                # 2. Path Normalization & Global Mapping
                else:
                    rel_p = img.replace("modules/witcher-compendium/", "").replace("/", os.sep)
                    abs_p = os.path.normpath(os.path.join(ROOT, "witcher-compendium", rel_p))
                    
                    fname = os.path.basename(abs_p)
                    norm_fname = normalize_filename(fname)
                    pure = pure_name(fname)

                    # ALWAYS prioritize standardized path if found
                    if norm_fname in global_asset_map:
                        found_abs = global_asset_map[norm_fname]
                        found_rel = os.path.relpath(found_abs, os.path.join(ROOT, "witcher-compendium")).replace(os.sep, "/")
                        target_img = f"modules/witcher-compendium/{found_rel}"
                        if img != target_img:
                            data["img"] = target_img
                            print(f"NORM: {f} -> {found_rel}")
                            modified = True
                    # Fallback to rename_map if we have the specific old path tracked
                    elif abs_p.lower() in rename_map:
                        new_abs = rename_map[abs_p.lower()]
                        new_rel = os.path.relpath(new_abs, os.path.join(ROOT, "witcher-compendium")).replace(os.sep, "/")
                        data["img"] = f"modules/witcher-compendium/{new_rel}"
                        modified = True
                    # Final fallback: Fuzzy match by letter/numbers only
                    elif not os.path.exists(abs_p) and pure in pure_asset_map:
                        found_abs = pure_asset_map[pure]
                        found_rel = os.path.relpath(found_abs, os.path.join(ROOT, "witcher-compendium")).replace(os.sep, "/")
                        data["img"] = f"modules/witcher-compendium/{found_rel}"
                        print(f"FIX (FUZZY): {f} -> {found_rel}")
                        modified = True
                    
                    # Category Fallback (for equipment missing specific icons OR using generic ones)
                    can_upgrade = any(gen in img.lower() for gen in ELIGIBLE_FOR_UPGRADE)
                    if not os.path.exists(abs_p) or "placeholder" in img or can_upgrade:
                        lower_name = data["name"].lower()
                        for key, cat_rel in CATEGORY_MAP.items():
                            # Whole word match to avoid 'lancia' in 'plancia' or 'mente' in 'strumento'
                            if re.search(r'\b' + re.escape(key) + r'\b', lower_name):
                                target_img = f"modules/witcher-compendium/{cat_rel}"
                                if img != target_img:
                                    data["img"] = target_img
                                    print(f"CAT: {f} -> {cat_rel}")
                                    modified = True
                                break

                if modified:
                    with open(fpath, 'w', encoding='utf-8') as j:
                        json.dump(data, j, indent=4, ensure_ascii=False)
                    updated_jsons += 1

            except Exception as e:
                print(f"Errore su {f}: {e}")

    print(f"\nDONE. {len(rename_map)} file rinominati, {updated_jsons} JSON aggiornati.")

if __name__ == "__main__":
    run_fix()
