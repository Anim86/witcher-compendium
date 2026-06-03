# Risultato del Confronto: report_alchimia_e_artigianato.md vs Repository

Data dell'analisi: 20/05/2026, 17:39:49
File analizzato: `TO DO/report_alchimia_e_artigianato.md`
Directory sorgente: `_tools/src-packs/ALCHIMIA_E_ARTIGIANATO`

## 📊 Sintesi Quantitativa

| Parametro | Valore | Note |
| :--- | :---: | :--- |
| **Voci nel Report** | **447** | Numero totale di righe tabellate trovate nel report |
| **JSON su Disco** | **447** | File JSON effettivamente presenti nella cartella sorgente |
| **Elementi Allineati (OK)** | **400** | Nessun errore riscontrato (Nome, Tipo, Asset, V14, _stats) |
| **Elementi Mancanti su Disco** | **0** | Presenti nel report ma il file JSON non esiste |
| **Elementi Extra su Disco** | **0** | File JSON su disco ma non menzionati nel report |
| **Discrepanze Nomi** | **0** | Differenze tra il nome nel report e il campo `name` del JSON |
| **Discrepanze Tipi** | **47** | Il tipo di Foundry (`type`) non corrisponde a quello descritto |
| **Asset Mancanti / Errori Path** | **0** | File immagine non trovati in `witcher-compendium/assets/` |
| **Asset non Slugificati** | **0** | Immagini con nomi contenenti maiuscole o caratteri speciali |
| **Incompatibilità V14 (_stats)** | **0** | Mancanza o non correttezza del blocco `_stats` |

## ❌ 1. Elementi nel Report ma Mancanti su Disco (0)
*Nessun elemento mancante.*

## ➕ 2. File JSON su Disco non Presenti nel Report (0)
*Nessun file extra su disco.*

## 🏷️ 3. Discrepanze nei Nomi (0)
*Tutti i nomi sono allineati.*

## ⚙️ 4. Discrepanze nel Tipo Meccanico di Foundry (47)
Il tipo indicato nel report (es. component, valuable, diagrams) non coincide con il campo `type` del file JSON:

| Nome | Tipo Atteso (Report) | Tipo Effettivo (JSON) | File JSON |
| :--- | :---: | :---: | :--- |
| **Allucinogeno** | `valuable` | `component` | [`allucinogeno_a0ab73529a76e3be.json`](file:///C:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-alchemy/allucinogeno_a0ab73529a76e3be.json) |
| **Amico dell'Avvelenatore** | `valuable` | `component` | [`amico_dell_avvelenatore_8e0f7b69e906a7fa.json`](file:///C:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-alchemy/amico_dell_avvelenatore_8e0f7b69e906a7fa.json) |
| **Cloroformio** | `valuable` | `component` | [`cloroformio_cc2473566a52a29e.json`](file:///C:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-alchemy/cloroformio_cc2473566a52a29e.json) |
| **Colla Alchemica** | `valuable` | `component` | [`colla_alchemica_a326940a6776f35c.json`](file:///C:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-alchemy/colla_alchemica_a326940a6776f35c.json) |
| **Erbe Anestetiche** | `valuable` | `component` | [`erbe_anestetiche_b86b6da09193b060.json`](file:///C:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-alchemy/erbe_anestetiche_b86b6da09193b060.json) |
| **Fisstech** | `valuable` | `component` | [`fisstech_c103820acd304c54.json`](file:///C:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-alchemy/fisstech_c103820acd304c54.json) |
| **Fluido Sterilizzante** | `valuable` | `component` | [`fluido_sterilizzante_82ba18f6f6b49b83.json`](file:///C:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-alchemy/fluido_sterilizzante_82ba18f6f6b49b83.json) |
| **Inchiostro Invisibile** | `valuable` | `component` | [`inchiostro_invisibile_447aacbc4d25e0e6.json`](file:///C:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-alchemy/inchiostro_invisibile_447aacbc4d25e0e6.json) |
| **Lacrime di Talgar** | `valuable` | `component` | [`lacrime_di_talgar_980b172264413962.json`](file:///C:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-alchemy/lacrime_di_talgar_980b172264413962.json) |
| **Polvere Basica** | `valuable` | `component` | [`polvere_basica_340b9390ba7f61d4.json`](file:///C:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-alchemy/polvere_basica_340b9390ba7f61d4.json) |
| **Polvere Coagulante** | `valuable` | `component` | [`polvere_coagulante_4fdeed830f7b35f5.json`](file:///C:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-alchemy/polvere_coagulante_4fdeed830f7b35f5.json) |
| **Pozione di Lacrime di Mogli** | `valuable` | `component` | [`pozione_di_lacrime_di_mogli_2d1d8cdbf0e0eba5.json`](file:///C:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-alchemy/pozione_di_lacrime_di_mogli_2d1d8cdbf0e0eba5.json) |
| **Pozione Profumo** | `valuable` | `component` | [`pozione_profumo_86680cb7205d86ad.json`](file:///C:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-alchemy/pozione_profumo_86680cb7205d86ad.json) |
| **Respiro di Succube** | `valuable` | `component` | [`respiro_di_succube_af70f412e3b85cd9.json`](file:///C:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-alchemy/respiro_di_succube_af70f412e3b85cd9.json) |
| **Sali da Fiuto** | `valuable` | `component` | [`sali_da_fiuto_4b3aa40fa1cada12.json`](file:///C:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-alchemy/sali_da_fiuto_4b3aa40fa1cada12.json) |
| **Soluzione Acida** | `valuable` | `component` | [`soluzione_acida_4ab85f40147fe7fe.json`](file:///C:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-alchemy/soluzione_acida_4ab85f40147fe7fe.json) |
| **Veleno Nero** | `valuable` | `component` | [`veleno_nero_b2c17a34289de8e2.json`](file:///C:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-alchemy/veleno_nero_b2c17a34289de8e2.json) |
| **Denti di Gatto Mannaro** | `component` | `valuable` | [`denti_di_gatto_mannaro_919d7a0a2dfe49df.json`](file:///C:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-components/denti_di_gatto_mannaro_919d7a0a2dfe49df.json) |
| **Saliva di Alp** | `component` | `valuable` | [`saliva_di_alp_ec383db7dcb23e3d.json`](file:///C:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-components/saliva_di_alp_ec383db7dcb23e3d.json) |
| **Stomaco di Glustyworp** | `component` | `valuable` | [`stomaco_di_glustyworp_b09c83c2eb84888e.json`](file:///C:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-components/stomaco_di_glustyworp_b09c83c2eb84888e.json) |
| **Schema: Schema Armatura del Gatto** | `diagrams` | `valuable` | [`schema_armatura_del_gatto_e856cd522c2b65c9.json`](file:///C:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-schematics/schema_armatura_del_gatto_e856cd522c2b65c9.json) |
| **Schema: Schema Armatura del Grifone** | `diagrams` | `valuable` | [`schema_armatura_del_grifone_417dfb3b4fcdda5f.json`](file:///C:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-schematics/schema_armatura_del_grifone_417dfb3b4fcdda5f.json) |
| **Schema: Schema Armatura del Lupo** | `diagrams` | `valuable` | [`schema_armatura_del_lupo_caf7c265416b63c7.json`](file:///C:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-schematics/schema_armatura_del_lupo_caf7c265416b63c7.json) |
| **Schema: Schema Armatura del Manticora** | `diagrams` | `valuable` | [`schema_armatura_del_manticora_aedd6699267138f5.json`](file:///C:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-schematics/schema_armatura_del_manticora_aedd6699267138f5.json) |
| **Schema: Schema Armatura del Orso** | `diagrams` | `valuable` | [`schema_armatura_del_orso_4faf34eb649331cd.json`](file:///C:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-schematics/schema_armatura_del_orso_4faf34eb649331cd.json) |
| **Schema: Schema Armatura del Vipera** | `diagrams` | `valuable` | [`schema_armatura_del_vipera_7820eaeccdca5b0d.json`](file:///C:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-schematics/schema_armatura_del_vipera_7820eaeccdca5b0d.json) |
| **Schema: Schema Armatura della Lumaca** | `diagrams` | `valuable` | [`schema_armatura_della_lumaca_c5b2337b0e663674.json`](file:///C:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-schematics/schema_armatura_della_lumaca_c5b2337b0e663674.json) |
| **Schema: Schema Armi di Toussaint** | `diagrams` | `valuable` | [`schema_armi_di_toussaint_24886ddd935af3d9.json`](file:///C:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-schematics/schema_armi_di_toussaint_24886ddd935af3d9.json) |
| **Schema: Schema Balestra del Gatto** | `diagrams` | `valuable` | [`schema_balestra_del_gatto_7caa5c5f6eb87dc9.json`](file:///C:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-schematics/schema_balestra_del_gatto_7caa5c5f6eb87dc9.json) |
| **Schema: Schema Balestra del Grifone** | `diagrams` | `valuable` | [`schema_balestra_del_grifone_a2b15b1251f52e72.json`](file:///C:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-schematics/schema_balestra_del_grifone_a2b15b1251f52e72.json) |
| **Schema: Schema Balestra del Orso** | `diagrams` | `valuable` | [`schema_balestra_del_orso_9407a5179b6438cb.json`](file:///C:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-schematics/schema_balestra_del_orso_9407a5179b6438cb.json) |
| **Schema: Schema Scudo del Manticora** | `diagrams` | `valuable` | [`schema_scudo_del_manticora_409dc7f8f730ae6e.json`](file:///C:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-schematics/schema_scudo_del_manticora_409dc7f8f730ae6e.json) |
| **Schema: Schema Spada d'Acciaio del Gatto** | `diagrams` | `valuable` | [`schema_spada_d_acciaio_del_gatto_46cfed86ca7d9b3a.json`](file:///C:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-schematics/schema_spada_d_acciaio_del_gatto_46cfed86ca7d9b3a.json) |
| **Schema: Schema Spada d'Acciaio del Grifone** | `diagrams` | `valuable` | [`schema_spada_d_acciaio_del_grifone_a44bb4f798676e69.json`](file:///C:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-schematics/schema_spada_d_acciaio_del_grifone_a44bb4f798676e69.json) |
| **Schema: Schema Spada d'Acciaio del Lupo** | `diagrams` | `valuable` | [`schema_spada_d_acciaio_del_lupo_7e212d7c7abb7550.json`](file:///C:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-schematics/schema_spada_d_acciaio_del_lupo_7e212d7c7abb7550.json) |
| **Schema: Schema Spada d'Acciaio del Manticora** | `diagrams` | `valuable` | [`schema_spada_d_acciaio_del_manticora_c96248758b2c1bce.json`](file:///C:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-schematics/schema_spada_d_acciaio_del_manticora_c96248758b2c1bce.json) |
| **Schema: Schema Spada d'Acciaio del Orso** | `diagrams` | `valuable` | [`schema_spada_d_acciaio_del_orso_09658d766401261d.json`](file:///C:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-schematics/schema_spada_d_acciaio_del_orso_09658d766401261d.json) |
| **Schema: Schema Spada d'Acciaio del Vipera** | `diagrams` | `valuable` | [`schema_spada_d_acciaio_del_vipera_2b285bd6d0b28320.json`](file:///C:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-schematics/schema_spada_d_acciaio_del_vipera_2b285bd6d0b28320.json) |
| **Schema: Schema Spada d'Acciaio della Lumaca** | `diagrams` | `valuable` | [`schema_spada_d_acciaio_della_lumaca_8740d6ca0ec69f89.json`](file:///C:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-schematics/schema_spada_d_acciaio_della_lumaca_8740d6ca0ec69f89.json) |
| **Schema: Schema Spada d'Argento del Gatto** | `diagrams` | `valuable` | [`schema_spada_d_argento_del_gatto_1a300f6f3080d37e.json`](file:///C:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-schematics/schema_spada_d_argento_del_gatto_1a300f6f3080d37e.json) |
| **Schema: Schema Spada d'Argento del Grifone** | `diagrams` | `valuable` | [`schema_spada_d_argento_del_grifone_194ea9f9d9c7d479.json`](file:///C:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-schematics/schema_spada_d_argento_del_grifone_194ea9f9d9c7d479.json) |
| **Schema: Schema Spada d'Argento del Lupo** | `diagrams` | `valuable` | [`schema_spada_d_argento_del_lupo_bb049103886bdafc.json`](file:///C:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-schematics/schema_spada_d_argento_del_lupo_bb049103886bdafc.json) |
| **Schema: Schema Spada d'Argento del Manticora** | `diagrams` | `valuable` | [`schema_spada_d_argento_del_manticora_f19cb95d6b19abfe.json`](file:///C:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-schematics/schema_spada_d_argento_del_manticora_f19cb95d6b19abfe.json) |
| **Schema: Schema Spada d'Argento del Orso** | `diagrams` | `valuable` | [`schema_spada_d_argento_del_orso_1e19004d01539483.json`](file:///C:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-schematics/schema_spada_d_argento_del_orso_1e19004d01539483.json) |
| **Schema: Schema Spada d'Argento del Vipera** | `diagrams` | `valuable` | [`schema_spada_d_argento_del_vipera_6cc6acfeb594bd07.json`](file:///C:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-schematics/schema_spada_d_argento_del_vipera_6cc6acfeb594bd07.json) |
| **Schema: Schema Spada d'Argento della Lumaca** | `diagrams` | `valuable` | [`schema_spada_d_argento_della_lumaca_542bee0e7a3953eb.json`](file:///C:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-schematics/schema_spada_d_argento_della_lumaca_542bee0e7a3953eb.json) |
| **Schema: Schema Zanna del Vipera** | `diagrams` | `valuable` | [`schema_zanna_del_vipera_d9748aefddd55105.json`](file:///C:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-schematics/schema_zanna_del_vipera_d9748aefddd55105.json) |

## 🖼️ 5. Errori Asset Immagine (Mancanti / Path Errate) (0)
*Nessun errore di asset mancante riscontrato.*

## 🔤 6. Immagini non Slugificate (0)
*Tutte le immagini seguono lo standard di slugify.*

## ⚠️ 7. Incompatibilità Foundry V14 (_stats) (0)
*Tutti i file hanno un blocco _stats corretto per V14.*

