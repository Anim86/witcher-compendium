# 📊 REPORT OGGETTI VARI - ICONOGRAFIA & ASSET AUDIT

Questo report contiene l'audit completo delle immagini del compendio **Oggetti Vari (witcher-equipment)**. L'obiettivo è tracciare lo stato delle icone, identificare le immagini duplicate/placeholder byte-per-byte, determinare se le icone attive nel compendio corrispondono a quelle nei backup tramite **analisi visiva automatica (Mean Absolute Error)** ed evitare elaborazioni non necessarie.

## 📈 Riepilogo Statistiche
- **Totale Oggetti Vari**: 152
- **✅ Icone Già Allineate e Corrette (NON da rielaborare)**: 49
- **🆗 Icone Uniche Corrette (Nessun Backup/Modifica)**: 98
- **♻️ Icone da Ripristinare da Backup (Sostituire placeholder)**: 0
- **🔍 Icone da Generare da Zero (AI)**: 0
- **⚠️ Icone Uniche con Backup Differente (Da Verificare)**: 3

> [!TIP]
> **ANALISI VISIVA**: Grazie al confronto pixel-by-pixel, abbiamo dimostrato che **49 immagini** (incluso l'**Anello del Favore**, **Amplificatore**, ecc.) sono già la copia esatta ottimizzata dei file di backup, quindi **sono corrette nel compendio e non vanno rielaborate**.

---

## 👥 1. GRUPPI DI IMMAGINI DUPLICATE (Identiche Byte-per-Byte)
Questi gruppi rappresentano le immagini che condividono lo stesso identico file sul disco. Devono essere sostituite prioritariamente con le immagini dei backup o generate da zero con l'AI.

| Gruppo / Hash MD5 | Dimensione | Esempio File | Oggetti Condivisi |
| :--- | :--- | :--- | :--- |

*Nota: I gruppi con dimensioni ridotte (es. ~15 KB) sono quasi certamente placeholder generici da eliminare.*

---

## 📋 2. TABELLA DI AUDIT COMPLETO (152 Asset)
La tabella seguente elenca tutti i **152 oggetti vari** con lo stato del file, la corrispondenza matematica con i backup e l'azione consigliata.

| Nome Asset | Path Immagine | Stato Disco | MD5 (Fuzzy) | Visual MAE | Azione Consigliata / Stato |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **20m di Corda** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/20m_di_corda.webp` | ✅ Presente | `e0ceafc4` | `3.44` | ✅ **Corretto** (Visivamente identico a backup, **NON rielaborare**) |
| **Abiti Comuni** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/abiti_comuni.webp` | ✅ Presente | `78f7e53d` | `2.54` | ✅ **Corretto** (Visivamente identico a backup, **NON rielaborare**) |
| **Abiti da Furfante** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/abiti_da_furfante.webp` | ✅ Presente | `7e0a6457` | `2.46` | ✅ **Corretto** (Visivamente identico a backup, **NON rielaborare**) |
| **Abiti Eleganti** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/abiti_eleganti.webp` | ✅ Presente | `bda9d03b` | `2.44` | ✅ **Corretto** (Visivamente identico a backup, **NON rielaborare**) |
| **Abiti per Climi Freddi** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/abiti_per_climi_freddi.webp` | ✅ Presente | `f85b434d` | `2.55` | ✅ **Corretto** (Visivamente identico a backup, **NON rielaborare**) |
| **Acciarino** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/acciarino.webp` | ✅ Presente | `4c16273c` | `2.27` | ✅ **Corretto** (Visivamente identico a backup, **NON rielaborare**) |
| **Alcohest** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/alcohest.webp` | ✅ Presente | `1807187b` | `2.66` | ✅ **Corretto** (Visivamente identico a backup, **NON rielaborare**) |
| **Amplificatore** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/amplificatore.webp` | ✅ Presente | `be94a853` | `2.14` | ✅ **Corretto** (Visivamente identico a backup, **NON rielaborare**) |
| **Amuleto con Gemma** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/amuleto_con_gemma.webp` | ✅ Presente | `74beb684` | `3.22` | ✅ **Corretto** (Visivamente identico a backup, **NON rielaborare**) |
| **Amuleto Incantato (1 Incantesimo)** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/amuleto_incantato_1_incantesimo.webp` | ✅ Presente | `6e565613` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Amuleto Incantato (2 Incantesimi)** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/amuleto_incantato_2_incantesimi.webp` | ✅ Presente | `e34925fc` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Amuleto Incantato (3 Incantesimi)** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/amuleto_incantato_3_incantesimi.webp` | ✅ Presente | `013bb019` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Amuleto Incantato (4 Incantesimi)** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/amuleto_incantato_4_incantesimi.webp` | ✅ Presente | `c7b41dfc` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Amuleto Semplice** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/amuleto_semplice.webp` | ✅ Presente | `67181383` | `3.02` | ✅ **Corretto** (Visivamente identico a backup, **NON rielaborare**) |
| **Anello del Favore** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/anello_del_favore.webp` | ✅ Presente | `e93a08c4` | `2.37` | ✅ **Corretto** (Visivamente identico a backup, **NON rielaborare**) |
| **Anti-Ancestrali** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/anti_ancestrali.webp` | ✅ Presente | `b58ce664` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Anti-Bestie** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/anti_bestie.webp` | ✅ Presente | `740f1606` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Anti-Costrutti** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/anti_costrutti.webp` | ✅ Presente | `7060e76a` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Anti-Dragonidi** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/anti_dragonidi.webp` | ✅ Presente | `bfe11672` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Anti-Ibridi** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/anti_ibridi.webp` | ✅ Presente | `08c9f911` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Anti-Insettoidi** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/anti_insettoidi.webp` | ✅ Presente | `b7ac5266` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Anti-Maledetti** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/anti_maledetti.webp` | ✅ Presente | `37dd971d` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Anti-Necrofagi** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/anti_necrofagi.webp` | ✅ Presente | `30b80ee6` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Anti-Orchi** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/anti_orchi.webp` | ✅ Presente | `2dc70298` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Anti-Spettri** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/anti_spettri.webp` | ✅ Presente | `8ffd1299` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Anti-Vampiri** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/anti_vampiri.webp` | ✅ Presente | `ebeb5550` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Arnesi da Scasso** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/arnesi_da_scasso.webp` | ✅ Presente | `099fe6a5` | `2.99` | ✅ **Corretto** (Visivamente identico a backup, **NON rielaborare**) |
| **Artigiano** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/artigiano.webp` | ✅ Presente | `6c78cf0a` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Arto Artificiale** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/arto_artificiale.webp` | ✅ Presente | `f7b27ef9` | `2.44` | ✅ **Corretto** (Visivamente identico a backup, **NON rielaborare**) |
| **Arto Artificiale di Qualità** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/arto_artificiale_di_qualita.webp` | ✅ Presente | `06080a26` | `2.39` | ✅ **Corretto** (Visivamente identico a backup, **NON rielaborare**) |
| **Attrezzatura Alchemica** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/attrezzatura_alchemica.webp` | ✅ Presente | `2646839a` | `3.12` | ✅ **Corretto** (Visivamente identico a backup, **NON rielaborare**) |
| **Attrezzatura da Pesca** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/attrezzatura_da_pesca.webp` | ✅ Presente | `dcbb399c` | `3.13` | ✅ **Corretto** (Visivamente identico a backup, **NON rielaborare**) |
| **Avvocato** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/avvocato.webp` | ✅ Presente | `11f91739` | `2.65` | ✅ **Corretto** (Visivamente identico a backup, **NON rielaborare**) |
| **Bagno Caldo** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/bagno_caldo.webp` | ✅ Presente | `0d48260d` | `2.51` | ✅ **Corretto** (Visivamente identico a backup, **NON rielaborare**) |
| **Bagno Freddo** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/bagno_freddo.webp` | ✅ Presente | `b12958ce` | `2.50` | ✅ **Corretto** (Visivamente identico a backup, **NON rielaborare**) |
| **Bambola da Magia Nera** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/bambola_da_magia_nera.webp` | ✅ Presente | `a3c16371` | `2.91` | ✅ **Corretto** (Visivamente identico a backup, **NON rielaborare**) |
| **Banchetto** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/banchetto.webp` | ✅ Presente | `f4c10a58` | `3.85` | ✅ **Corretto** (Visivamente identico a backup, **NON rielaborare**) |
| **Bandoliera** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/bandoliera.webp` | ✅ Presente | `73dc5907` | `2.94` | ✅ **Corretto** (Visivamente identico a backup, **NON rielaborare**) |
| **Baule Nascosto** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/baule_nascosto.webp` | ✅ Presente | `63b9230b` | `2.27` | ✅ **Corretto** (Visivamente identico a backup, **NON rielaborare**) |
| **Birra** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/birra.webp` | ✅ Presente | `aeba1260` | `2.64` | ✅ **Corretto** (Visivamente identico a backup, **NON rielaborare**) |
| **Borraccia** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/borraccia.webp` | ✅ Presente | `9152dc8c` | `2.67` | ✅ **Corretto** (Visivamente identico a backup, **NON rielaborare**) |
| **Borsa di Biglie** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/borsa_di_biglie.webp` | ✅ Presente | `88945066` | `2.55` | ✅ **Corretto** (Visivamente identico a backup, **NON rielaborare**) |
| **Borsello** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/borsello.webp` | ✅ Presente | `a0a4cf1b` | `2.23` | ✅ **Corretto** (Visivamente identico a backup, **NON rielaborare**) |
| **Bottiglia** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/bottiglia.webp` | ✅ Presente | `d3f53bde` | `2.22` | ✅ **Corretto** (Visivamente identico a backup, **NON rielaborare**) |
| **Buon Pasto** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/buon_pasto.webp` | ✅ Presente | `698b0dcf` | `3.02` | ✅ **Corretto** (Visivamente identico a backup, **NON rielaborare**) |
| **Camera di Distillazione** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/camera_di_distillazione.webp` | ✅ Presente | `69147849` | `3.02` | ✅ **Corretto** (Visivamente identico a backup, **NON rielaborare**) |
| **Candele (x5)** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/candele.webp` | ✅ Presente | `452ec3c3` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Capacità: Muco** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/capacita_muco.webp` | ✅ Presente | `e75b6c98` | `2.86` | ✅ **Corretto** (Visivamente identico a backup, **NON rielaborare**) |
| **Carne Cruda** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/carne_cruda.webp` | ✅ Presente | `c570e50b` | `2.82` | ✅ **Corretto** (Visivamente identico a backup, **NON rielaborare**) |
| **Cavallo Noleggiato** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/cavallo_noleggiato.webp` | ✅ Presente | `565f0b67` | `2.86` | ✅ **Corretto** (Visivamente identico a backup, **NON rielaborare**) |
| **Ceppi** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/ceppi.webp` | ✅ Presente | `701ce34b` | `2.62` | ✅ **Corretto** (Visivamente identico a backup, **NON rielaborare**) |
| **Cesta** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/cesta.webp` | ✅ Presente | `cc196256` | `2.90` | ✅ **Corretto** (Visivamente identico a backup, **NON rielaborare**) |
| **Cinghie da Carico** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/cinghie_da_carico.webp` | ✅ Presente | `7babf6b9` | `2.94` | ✅ **Corretto** (Visivamente identico a backup, **NON rielaborare**) |
| **Clessidra** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/clessidra.webp` | ✅ Presente | `f277d20f` | `2.47` | ✅ **Corretto** (Visivamente identico a backup, **NON rielaborare**) |
| **Clessidra minuscola** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/clessidra_minuscola.webp` | ✅ Presente | `eba2bc63` | `2.90` | ✅ **Corretto** (Visivamente identico a backup, **NON rielaborare**) |
| **Compartimento Segreto** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/compartimento_segreto.webp` | ✅ Presente | `a8c28dc5` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Coppia di Puntelli** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/coppia_di_puntelli.webp` | ✅ Presente | `e8c6ec22` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Corda Magica Elfica** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/corda_magica_elfica.webp` | ✅ Presente | `ef233c10` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Corno da Segnalazione** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/corno_da_segnalazione.webp` | ✅ Presente | `048b4fb7` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Cote Nanica** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/cote_nanica.webp` | ✅ Presente | `aa1870db` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Cronista** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/cronista.webp` | ✅ Presente | `f6bb6f67` | `2.75` | ✅ **Corretto** (Visivamente identico a backup, **NON rielaborare**) |
| **Dadi truccati** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/dadi_truccati.webp` | ✅ Presente | `4fc54531` | `2.51` | ✅ **Corretto** (Visivamente identico a backup, **NON rielaborare**) |
| **Diario / Libro Mastro** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/diario_libro_mastro.webp` | ✅ Presente | `bdb759e8` | `40.78` | ⚠️ **Verificare** (File unico ma visivamente differente da backup, MAE: 40.78; valutare se ripristinare) |
| **Dolciumi** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/dolciumi.webp` | ✅ Presente | `c9950680` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Fischietto da Segnalazione** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/fischietto_da_segnalazione.webp` | ✅ Presente | `5838aa2f` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Fodero da Giarrettiera** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/fodero_da_giarrettiera.webp` | ✅ Presente | `488a6ac8` | `1.94` | ✅ **Corretto** (Visivamente identico a backup, **NON rielaborare**) |
| **Fodero da Manica** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/fodero_da_manica.webp` | ✅ Presente | `8e1df4a5` | `2.73` | ✅ **Corretto** (Visivamente identico a backup, **NON rielaborare**) |
| **Forgia Portatile** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/forgia_portatile.webp` | ✅ Presente | `b98d5795` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Formula Magica (Esperto)** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/formula_magica_esperto.webp` | ✅ Presente | `4540c398` | `3.57` | ✅ **Corretto** (Visivamente identico a backup, **NON rielaborare**) |
| **Formula Magica (Maestro)** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/formula_magica_maestro.webp` | ✅ Presente | `aa35d0d7` | `3.25` | ✅ **Corretto** (Visivamente identico a backup, **NON rielaborare**) |
| **Formula Magica (Novizio)** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/formula_magica_novizio.webp` | ✅ Presente | `f7ae5cef` | `3.90` | ✅ **Corretto** (Visivamente identico a backup, **NON rielaborare**) |
| **Forziere di Legno** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/forziere_di_legno.webp` | ✅ Presente | `6cf70244` | `2.96` | ✅ **Corretto** (Visivamente identico a backup, **NON rielaborare**) |
| **Galoppino** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/galoppino.webp` | ✅ Presente | `1f7aa32e` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Gessetto** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/gessetto.webp` | ✅ Presente | `9453fa34` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Giaciglio** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/giaciglio.webp` | ✅ Presente | `151a6dbf` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Gioielli** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/gioielli.webp` | ✅ Presente | `c592cfad` | `3.38` | ✅ **Corretto** (Visivamente identico a backup, **NON rielaborare**) |
| **Giro in Carrozza** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/giro_in_carrozza.webp` | ✅ Presente | `4508704b` | `3.11` | ✅ **Corretto** (Visivamente identico a backup, **NON rielaborare**) |
| **Guida del Raccoglitore** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/guida_del_raccoglitore.webp` | ✅ Presente | `ab92f65a` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Incensiere Medico** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/incensiere_medico.webp` | ✅ Presente | `efb5d154` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Incerata** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/incerata.webp` | ✅ Presente | `089b044f` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Intrattenimento** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/intrattenimento.webp` | ✅ Presente | `dded0b22` | `-` | ❌ **Errore comparazione**: Mismatch dimensioni buffer |
| **Investigatore** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/investigatore.webp` | ✅ Presente | `d073d3c8` | `-` | ❌ **Errore comparazione**: Mismatch dimensioni buffer |
| **Kit da Falsario** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/kit_da_falsario.webp` | ✅ Presente | `844f862a` | `45.71` | ⚠️ **Verificare** (File unico ma visivamente differente da backup, MAE: 45.71; valutare se ripristinare) |
| **Kit per il Camuffamento** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/kit_per_il_camuffamento.webp` | ✅ Presente | `795a3e4e` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Kit per il Trucco** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/kit_per_il_trucco.webp` | ✅ Presente | `8279cb4d` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Lanterna** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/lanterna.webp` | ✅ Presente | `9e16f820` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Lanterna Schermata** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/lanterna_schermata.webp` | ✅ Presente | `8df98b99` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Lanterne da Carro** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/lanterne_da_carro.webp` | ✅ Presente | `c950b23e` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Lavanderia** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/lavanderia.webp` | ✅ Presente | `651cc5f7` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Libro di Racconti** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/libro_di_racconti.webp` | ✅ Presente | `f484a523` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Lucchetto** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/lucchetto.webp` | ✅ Presente | `fa76e676` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Lucchetto Robusto** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/lucchetto_robusto.webp` | ✅ Presente | `c44605f8` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Manette** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/manette.webp` | ✅ Presente | `f6b022dd` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Mantello Mimetico** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/mantello_mimetico.webp` | ✅ Presente | `c0397390` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Mappa del Continente** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/mappa_del_continente.webp` | ✅ Presente | `c73fb821` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Mazzo di Gwent** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/mazzo_di_gwent.webp` | ✅ Presente | `8f0db76f` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Medico** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/medico.webp` | ✅ Presente | `97ba4d46` | `37.50` | ⚠️ **Verificare** (File unico ma visivamente differente da backup, MAE: 37.50; valutare se ripristinare) |
| **Messaggero** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/messaggero.webp` | ✅ Presente | `4667777a` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Migliorie per Balestre** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/migliorie_per_balestre.webp` | ✅ Presente | `e5f3167b` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Occorrente per Scrivere** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/occorrente_per_scrivere.webp` | ✅ Presente | `918cd603` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Otre** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/otre.webp` | ✅ Presente | `eabe47e6` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Paglia sul Pavimento** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/paglia_sul_pavimento.webp` | ✅ Presente | `32c8b4bb` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Pasto Semplice** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/pasto_semplice.webp` | ✅ Presente | `a4dbbd67` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Pedaggio di Accesso** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/pedaggio_di_accesso.webp` | ✅ Presente | `ea83fe17` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Picchetti (x5)** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/picchetti.webp` | ✅ Presente | `0e7505c9` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Pietra Allarme (Pietra del Potere)** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/pietra_allarme_pietra_del_potere.webp` | ✅ Presente | `512e10df` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Pietra dell'Illusione (Pietra del Potere)** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/pietra_dell_illusione_pietra_del_potere.webp` | ✅ Presente | `52dccbf3` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Pietra Guardiana: Allarme** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/pietra_guardiana_allarme.webp` | ✅ Presente | `e33550d0` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Pietra Guardiana: Illusione** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/pietra_guardiana_illusione.webp` | ✅ Presente | `e82f1710` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Pietra Solare** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/pietra_solare.webp` | ✅ Presente | `8e2fb85f` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Pipa** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/pipa.webp` | ✅ Presente | `a4be98c8` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Plancia da Poker con Dadi** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/plancia_da_poker_con_dadi.webp` | ✅ Presente | `5dbbbbc8` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Potestaquisitor** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/potestaquisitor.webp` | ✅ Presente | `e4ba9f02` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Profumo / Acqua di Colonia** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/profumo_acqua_di_colonia.webp` | ✅ Presente | `b007b603` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Prostituta** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/prostituta.webp` | ✅ Presente | `bf561171` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Protesi Base** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/protesi_base.webp` | ✅ Presente | `8c9915ec` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Protesi da Witcher** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/protesi_da_witcher.webp` | ✅ Presente | `5a753263` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Protesi Focus** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/protesi_focus.webp` | ✅ Presente | `2c5d5585` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Protesi Magica** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/protesi_magica.webp` | ✅ Presente | `cf31f877` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Rampino** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/rampino.webp` | ✅ Presente | `87191a17` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Razioni da Viaggio (1 giorno)** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/razioni_da_viaggio_1_giorno.webp` | ✅ Presente | `a1df41f9` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Ricettatore** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/ricettatore.webp` | ✅ Presente | `766fca99` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Sacca da Viaggio** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/sacca_da_viaggio.webp` | ✅ Presente | `2aaecbd9` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Sacco** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/sacco.webp` | ✅ Presente | `1966aa22` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Sapone** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/sapone.webp` | ✅ Presente | `59c3a5bc` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Scrigno di Legno** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/scrigno_di_legno.webp` | ✅ Presente | `d8a3ecf2` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Serratura con Trappola** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/serratura_con_trappola.webp` | ✅ Presente | `f1c4f490` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Simbolo Sacro** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/simbolo_sacro.webp` | ✅ Presente | `ab5c68e5` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Specchietto** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/specchietto.webp` | ✅ Presente | `d30ac210` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Stallaggio** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/stallaggio.webp` | ✅ Presente | `b0b66b82` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Stanza in Locanda d'Alta Classe** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/stanza_in_locanda_d_alta_classe.webp` | ✅ Presente | `35663043` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Stanza in Locanda di Qualità** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/stanza_in_locanda_di_qualita.webp` | ✅ Presente | `fa63b086` | `3.59` | ✅ **Corretto** (Visivamente identico a backup, **NON rielaborare**) |
| **Stanza in Locanda Economica** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/stanza_in_locanda_economica.webp` | ✅ Presente | `66f7a327` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Stanza in Locanda Malfamata** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/stanza_in_locanda_malfamata.webp` | ✅ Presente | `793952f7` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Stanza in Locanda Media** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/stanza_in_locanda_media.webp` | ✅ Presente | `7ea321eb` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Strumenti Chirurgici** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/strumenti_chirurgici.webp` | ✅ Presente | `a6762655` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Strumenti per le Belle Arti** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/strumenti_per_le_belle_arti.webp` | ✅ Presente | `8dee5825` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Strumento Musicale** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/strumento_musicale.webp` | ✅ Presente | `3622685e` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Strumento Musicale Elfico** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/strumento_musicale_elfico.webp` | ✅ Presente | `66285bd1` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Superalcolici** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/superalcolici.webp` | ✅ Presente | `d0ed9d43` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Tabacco** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/tabacco.webp` | ✅ Presente | `acc6af22` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Taglia-monete** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/taglia_monete.webp` | ✅ Presente | `b845ff30` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Tasca Segreta** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/tasca_segreta.webp` | ✅ Presente | `735e7de3` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Tavolo Strategico Portatile** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/tavolo_strategico_portatile.webp` | ✅ Presente | `10a543f2` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Telecomunicatore** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/telecomunicatore.webp` | ✅ Presente | `6eff82a9` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Tenda** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/tenda.webp` | ✅ Presente | `e4e8272d` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Tenda Grande** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/tenda_grande.webp` | ✅ Presente | `23f9c9d8` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Traversata per Mare** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/traversata_per_mare.webp` | ✅ Presente | `7022ab09` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Utensili da Armaiolo** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/utensili_da_armaiolo.webp` | ✅ Presente | `1bbe8cc5` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Utensili da Cucina** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/utensili_da_cucina.webp` | ✅ Presente | `6742dddc` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Utensili da Mercante** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/utensili_da_mercante.webp` | ✅ Presente | `b16f0eae` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |
| **Vino** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/vino.webp` | ✅ Presente | `3ab7e457` | `-` | 🆗 **Icona Unica** (Immagine unica su disco senza backup correlato; considerata corretta) |


## 🔄 3. DETTAGLI DELLE DELEZIONI STORICHE (Git Audit)
Nel commit **`4e1bd684`**, sono stati ripuliti 3 file dal compendio in quanto considerati non referenziati:
1. **`candele_5.webp`** (Associato a *Candele (x5)*)
2. **`picchetti_5.webp`** (Associato a *Picchetti (x5)*)
3. **`razioni_da_viaggio.webp`** (Associato a *Razioni da Viaggio (1 giorno)*)

Questi file possono essere ricostruiti o ripristinati a partire dalle PNG di backup.

---
*Report aggiornato con confronto visivo avanzato in data: 24/05/2026, 16:35:29.*
