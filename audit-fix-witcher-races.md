# Audit & Fix Report: witcher-races
**Data:** 10 Aprile 2026
**Versione modulo:** v14.1.25

## Obiettivo
Auditare e bonificare il pack `witcher-races` per Foundry VTT v14, assicurando la conformità strutturale e la fedeltà dei testi sorgente.

## Esito Audit
| Razza | Stato | Azioni Applicate |
| :--- | :--- | :--- |
| **Umani** | ✅ OK | Bonifica v14, re-estrazione doti HQ, corretto socialStanding (Dol Blathanna: Odiato, Mahakam: Tollerato). |
| **Elfi** | ✅ OK | Bonifica v14, re-estrazione doti HQ, corretto socialStanding (Nilfgaard, Skellige, etc.: Eguale). |
| **Nani** | ✅ OK | Bonifica v14, re-estrazione doti HQ, corretto socialStanding (Nilfgaard, Skellige, etc.: Eguale). |
| **Witcher** | ✅ OK | Bonifica v14, re-estrazione doti HQ, corretto socialStanding (Skellige, Dol Blathanna, Mahakam: Tollerato). |

## Fix Strutturali (v14)
- **Rimosso** `systemVersion` da tutti i file JSON.
- **Convertito** `coreVersion` in intero `14`.
- **Validato** `systemId` come `TheWitcherItaNewSystem`.
- **Verificato Path Perks**: Tutti i perk sono mappati correttamente in `system.perk[1-4].name` e `system.perk[1-4].description`.

## Testi HQ (Pag023_Razze.txt)
- Tutte le descrizioni delle doti (perks) sono state sostituite con il testo ufficiale in italiano, formattato in HTML pulito (`<p>`, `<strong>`).
- Verificati bonus numerici e meccaniche (ritiri doti, bonus abilità, PR naturale per i nani).

## Sourcebook & UUIDs
- **Sourcebook**: Impostato su `MB 23` per tutte le voci come richiesto.
- **UUID Audit**:
  - Umani: `racehuman0000001`
  - Elfi: `0raceelf00000001`
  - Nani: `racedwarf0000001`
  - Witcher: `racewitcher00001`
- Nessuna collisione UUID rilevata con i nuovi pack creati oggi.

⚠️ **NESSUNA compilazione DB eseguita.**
