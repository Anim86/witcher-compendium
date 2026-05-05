# WITCHER COMPENDIUM — PROTOCOLLO OPERATIVO

> \\\\\\\[!IMPORTANT]
> \\\\\\\*\\\\\\\*TARGET\\\\\\\*\\\\\\\*: \\\\\\\[Foundry VTT Stable 14 build 361](https://foundryvtt.com/releases/14.361)



## Documenti di riferimento per LLM / AI Builder

> \\\\\\\[!IMPORTANT]
> Per istruzioni rapide sulla sincronizzazione e l'uso del nuovo toolset professionale, consultare prioritariamente:
> briefing-operativo-ai.md e foundry-v14-css-selectors-guide.md all'interno di questo Space "Team Compendio"



\---

## 0\. CONTESTO DEL PROGETTO

Stiamo costruendo un modulo compendio completo per **The Witcher TTRPG** su **Foundry VTT v14**.
Il modulo si chiama `witcher-compendium` e gira sul sistema `TheWitcherItaNewSystem`.
Tutto il contenuto è in italiano e si basa su diversi manuali ufficiali:

* **Tomo Base (MB)** — manuale principale
* **Tomo del Caos (TC)** — espansione magia
* **Libro dei Racconti (LR)** — espansione avventure e razze
* **Diario di un Witcher (DW)** — espansione bestiario e indagini
* **DLC** — diversi piccoli manuali con alcune aggiunte sparse



Il compendio contiene \~1000+ entries divise in pack LevelDB.
**L'obiettivo attuale è mantenere la struttura rigorosa e garantire la piena compatibilità con Foundry V14.**

\---

## 1\. IL TEAM E I RUOLI

|Membro|Ruolo|Cosa fa|
|-|-|-|
|**Manuel**|Team Manager|Supervisiona, valida, fa da tramite fisico, testa in Foundry|
|**Perplexity claude sonnet 4.6**|Strategist|Coordina il lavoro, prepara brief, interroga NotebookLM, analizza risultati|
|**Antigravity gemini flash**|Builder|Riceve brief precisi, legge TXT, modifica JSON, esegue script, produce log|
|**NotebookLM**|Database|Ha tutti i pdf dei manuali a disposizione da cui può attingere e fornire dati precisi per qualsiasi richiesta|
|**Gemini Pro**|Creatore immagini|Se non sono presenti delle immagini nei manuali, si occupa di creare tutto ciò che è necessario per completare i compendi|





**Flusso di comunicazione:**

```
Perplexity prepara brief → Manuel lo passa ad Antigravity o NotebookLM
Antigravity o NotebookLM produce output → Manuel lo porta a Perplexity
Perplexity analizza → prepara prossimo brief
```

\---

### 2\. Dove vivono i testi originali

```
Tomo Base:           Witcher-v1.3\\\\\\\_Estrazione/Testi/PagXXX\\\\\\\_\\\\\\\_LXXX\\\\\\\_NomeSezione.txt
Tomo del Caos:       the-witcher-tomo-del-caos\\\\\\\_Estrazione/Testi/PagXXX\\\\\\\_\\\\\\\_LXXX\\\\\\\_NomeSezione.txt
Libro dei Racconti:  Witcher - Libro dei Racconti (italian)\\\\\\\_Estrazione/Testi/PagXXX\\\\\\\_\\\\\\\_LXXX\\\\\\\_NomeSezione.txt
Diario di un Witcher: Diario di un Witcher\\\\\\\_Estrazione/Testi/PagXXX\\\\\\\_\\\\\\\_LXXX\\\\\\\_NomeSezione.txt
DLC:	             DLC/"NOME CARTELLA DLC"/Testi/PagXXX\\\\\\\_\\\\\\\_LXXX\\\\\\\_NomeSezione.txt
```

All'interno di ogni cartella sono presenti anche dei report di estrazione testi e immagini dove sono segnati TUTTI i file presenti dentro le cartelle di estrazione:

Tomo Base: Report\_Estrazione\_Witcher-v1.3.txt

Tomo del Caos: Report\_Estrazione\_the-witcher-tomo-del-caos.txt
Libro dei Racconti: Report\_Estrazione\_Witcher - Libro dei Racconti (italian).txt
Diario di un Witcher: Report\_Estrazione\_Diario di un Witcher.txt

DLC: Report\_Estrazione.txt generico, uno per DLC

\---

## 3\. Dove vivono i JSON sorgente e le immagini provvisorie

```
JSON: \\\\\\\_tools/src-packs/\\\\\\\[CATEGORIA]/\\\\\\\[sottocartella]/\\\\\\\[NomePack]/\\\\\\\[NomeVoce].json
Immagini: \\\\\\\_temp\\\\\\\_images/\\\\\\\[sottocartella]



### 4\\\\. Campo \\\\\\\_stats — OBBLIGATORIO (Foundry V14)

```json
"\\\\\\\_stats": {
  "systemId": "TheWitcherItaNewSystem",
  "coreVersion": 14
}
```

⚠️ `coreVersion` intero (`14`). `systemVersion` **VIETATO**. No BOM.

\---

## 5\. NOTE OBBLIGATORIE

```

\\- IMPORTANTE: ANTIGRAVITY LAVORA IN Modalità GEMINI FLASH. PERPLEXITY Dovrà FORNIRE PROMPT ADATTI. GEMINI NON DEVE PRENDERE INIZIATIVE E DEVE ESSERE PRECISO E FINE NELL'ELABORARE LE RICHIESTE
- SI LAVORA SOLO SU tool/src-pack
- NESSUNA COMPILAZIONE DB
- NESSUN COMMIT SE NON RICHIESTO
- NESSUN PUSH SE NON RICHIESTO





