# 📊 Report dei Collegamenti e degli Asset - Witcher TRPG Compendio

Questo report fornisce una sintesi delle relazioni estrattive, collegamenti iconografici ed anomalie strutturali rilevate nei pack compendio sorgente.

## 📈 Sintesi Statistiche Generali
| Metrica | Conteggio |
|---|---|
| **Totale Voci Analizzate** | 1465 |
| **Totale Asset Fisici Rilevati** | 1481 |
| **Image Link (Mappature Iconografiche)** | 1816 |
| **Cross Reference (Relazioni Strutturate o Testuali)** | 2257 |
| **Semantic Link (Relazioni Semantiche Forti)** | 139 |
| **Ambiguous Links (Relazioni Incerte o Fallite)** | 249 |
| **Asset Fisici Orfani (Non Referenziati)** | 12 |
| **Voci Senza Immagine o con Placeholder** | 15 |
| **Voci Isolate (Senza Relazioni)** | 317 |
| **Asset Duplicati (Referenziati da più voci)** | 6 |
| **Voci Duplicate (Stesso Nome e Tipo)** | 3 |
| **Voci Quasi Duplicate (Alta Somiglianza)** | 23 |

## 📂 Analisi Dettagliata per Pack Compendio
| Pack Sorgente | Voci | Image Links | Cross Refs | Semantic Links | Ambiguous |
|---|---|---|---|---|---|
| `ALCHIMIA_E_ARTIGIANATO/witcher-alchemy` | 168 | 168 | 111 | 0 | 0 |
| `ALCHIMIA_E_ARTIGIANATO/witcher-components` | 70 | 70 | 35 | 0 | 0 |
| `ALCHIMIA_E_ARTIGIANATO/witcher-mutations` | 36 | 36 | 42 | 5 | 9 |
| `ALCHIMIA_E_ARTIGIANATO/witcher-mutazioni-tc` | 15 | 15 | 18 | 0 | 0 |
| `ALCHIMIA_E_ARTIGIANATO/witcher-schematics` | 158 | 158 | 445 | 109 | 81 |
| `BESTIARIO/witcher-animals` | 14 | 64 | 9 | 0 | 0 |
| `BESTIARIO/witcher-characters` | 61 | 87 | 631 | 0 | 0 |
| `BESTIARIO/witcher-monsters` | 71 | 346 | 103 | 0 | 0 |
| `EQUIPAGGIAMENTO/witcher-armor` | 50 | 50 | 69 | 0 | 0 |
| `EQUIPAGGIAMENTO/witcher-equipment` | 152 | 152 | 87 | 0 | 0 |
| `EQUIPAGGIAMENTO/witcher-magic-items` | 11 | 11 | 23 | 0 | 0 |
| `EQUIPAGGIAMENTO/witcher-special` | 26 | 26 | 34 | 0 | 0 |
| `EQUIPAGGIAMENTO/witcher-transports` | 26 | 26 | 13 | 0 | 0 |
| `EQUIPAGGIAMENTO/witcher-weapons` | 123 | 123 | 96 | 0 | 0 |
| `MAGIA_E_MALEDIZIONI/Doni_del_Caos` | 52 | 52 | 73 | 0 | 33 |
| `MAGIA_E_MALEDIZIONI/Incantesimi_e_Rituali` | 157 | 157 | 161 | 0 | 116 |
| `MAGIA_E_MALEDIZIONI/Maledizioni_e_Fatture` | 17 | 17 | 13 | 0 | 0 |
| `MAGIA_E_MALEDIZIONI/Necromanzia` | 9 | 9 | 37 | 0 | 0 |
| `MAGIA_E_MALEDIZIONI/Segni` | 12 | 12 | 20 | 0 | 10 |
| `REGOLAMENTO_E_NARRATIVA/Ferite_Critiche` | 14 | 14 | 17 | 0 | 0 |
| `REGOLAMENTO_E_NARRATIVA/Geografia` | 12 | 12 | 10 | 0 | 0 |
| `REGOLAMENTO_E_NARRATIVA/Investigazioni` | 24 | 24 | 13 | 0 | 0 |
| `REGOLAMENTO_E_NARRATIVA/Lore_e_Racconti` | 50 | 50 | 148 | 0 | 0 |
| `REGOLAMENTO_E_NARRATIVA/Professioni_e_Abilita` | 90 | 90 | 39 | 0 | 0 |
| `REGOLAMENTO_E_NARRATIVA/Tabelle_Operative` | 11 | 11 | 0 | 0 | 0 |
| `REGOLAMENTO_E_NARRATIVA/Trofei` | 36 | 36 | 10 | 25 | 0 |

## 🏷️ Collegamenti Rilevati per Macro Categoria
| Categoria | Collegamenti Rilevati |
|---|---|
| `ALCHIMIA_E_ARTIGIANATO` | 1302 |
| `BESTIARIO` | 1240 |
| `EQUIPAGGIAMENTO` | 710 |
| `MAGIA_E_MALEDIZIONI` | 710 |
| `REGOLAMENTO_E_NARRATIVA` | 499 |

## 🏆 Top Voci con Maggior Numero di Collegamenti (Grado del Grafo)
Questo elenco mostra le prime 15 entità del compendio ordinate per grado di relazione (somma di collegamenti in ingresso e in uscita).

| Grado | Nome Voca | Compendio Pack | Collegamenti Totali |
|---|---|---|---|
| 1 | **Manifattura** | `REGOLAMENTO_E_NARRATIVA/Professioni_e_Abilita` | 82 |
| 2 | **Cuoio** | `ALCHIMIA_E_ARTIGIANATO/witcher-components` | 72 |
| 3 | **Rodolf Kazmer** | `BESTIARIO/witcher-characters` | 71 |
| 4 | **Witcher** | `REGOLAMENTO_E_NARRATIVA/Professioni_e_Abilita` | 69 |
| 5 | **Witcher** | `REGOLAMENTO_E_NARRATIVA/Professioni_e_Abilita` | 66 |
| 6 | **Lanciare Incantesimi** | `REGOLAMENTO_E_NARRATIVA/Professioni_e_Abilita` | 46 |
| 7 | **Bastone** | `EQUIPAGGIAMENTO/witcher-weapons` | 41 |
| 8 | **Philippa Eilhart** | `BESTIARIO/witcher-characters` | 40 |
| 9 | **Francesca Findabair** | `BESTIARIO/witcher-characters` | 38 |
| 10 | **Dorregaray di Vole** | `BESTIARIO/witcher-characters` | 37 |
| 11 | **Fringilla Vigo** | `BESTIARIO/witcher-characters` | 37 |
| 12 | **Cadfan di Ebbing** | `BESTIARIO/witcher-characters` | 36 |
| 13 | **Maghi** | `BESTIARIO/witcher-characters` | 35 |
| 14 | **Margarita Laux-Antille** | `BESTIARIO/witcher-characters` | 34 |
| 15 | **Artorius Vigo** | `BESTIARIO/witcher-characters` | 33 |

> [!NOTE]
> I report dettagliati in formato CSV contenenti l'intero grafo, le anomalie e i duplicati sono disponibili nella cartella: `TO DO/Iperlink/`.
