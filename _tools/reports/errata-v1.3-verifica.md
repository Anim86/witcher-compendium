# Verifica Errata v1.3

Data verifica: 2026-06-02.

## Corretti nei sorgenti e nei pack compilati

- Scudi: verificato che gli oggetti scudo non contengano campi `poa`.
- Triss Merigold: aggiunti `REC 7` e `GRI 7` nelle statistiche derivate.
- Prete: il wizard assegna ora `2` invocazioni, `2` rituali e `2` fatture iniziali.
- Armigero: Zweihand specifica che funziona solo con armi da mischia.
- Artigiano: Riparare usa `MAN` (`cra`) e cita armi/scudi a meta Affidabilita.
- Witcher: testi di Frenesia e Stomaco di Ferro aggiornati secondo errata.
- Effetto Rissa: Tirapugni gia corretto; resta verificato nel pack.
- Effetti armi pag. 83: Messer Elfico senza effetti, Spada da Cavalleria con Sanguinamento 25%, Spada Meteoritica con Bilanciata/Meteorite, Gwyhyr Gnomesca con Sanguinamento 50%, Lama del Tir Tochair con Sanguinamento 25%.
- Cavalcature: Cavallo, Mulo, Bue e Cavallo da Guerra allineati sui valori di Atletica/Velocita/PS indicati.
- Utensili/cibi: Borraccia, Torcia e Razioni da Viaggio aggiornate su descrizione/costo/peso dove applicabile.
- Invocazioni pag. 111: aggiunte Benedizione della Buona Sorte e Rete di Menzogne.
- Schemi: aggiornati investimenti e componenti per Krigsverd, Maglio degli Altipiani, Armatura da Alabardiere Redaniano, Armatura Pesante di Hindarsfjall, Gambali di Maglia di Hindarsfjall, Elmo Nilfgaardiano, Gwyhyr Gnomesca.
- Bestiario: Demoni con Lanciare Incantesimi +15, Sirene verificata con +10, Viverne con peso 408 kg.
- Pack Foundry: ricompilati con `_tools/scripts/core/compile_packs.mjs`.

## Gia corretti/verificati nei testi o nei sorgenti esistenti

- Kaedwen conferisce `+1 Tempra` in `StrumentiGM/patria.json`.
- I testi estratti del manuale v1.3 contengono gia le correzioni su Lingua Madre, Procurarsi Cibo, VI e Magia, Uso dei Luoghi di Potere, Componenti dei rituali, Possedere lo Schema, Affidabilita, Sovraffaticamento, Bersagli della Magia, Guarire col Tempo e Scontri Verbali.
- Cenlly Graig, Zefiro, Grandinata di Carys e Yrden risultano gia privi delle frasi errate o con effetto aggiornato.
- Banditi: Balestrino gia con `PA +1`.
- Arcieri Scoia'tael: Falchion gia senza `Focus (2)`.
- Armatura di Draugr: `VI 3` gia corretto.
- Trappola `Morso`: aggiunti oggetto e schema usando i dati da `Manuali/Witcher-v1.3_Estrazione/Testi/Pag254_L254_Tecnologia Sperimentale.txt`; componenti dello schema allineate all'errata.

## Non rappresentati come oggetti autonomi

- Alcuni paragrafi puramente regolamentari dell'errata non hanno una scheda Foundry dedicata; sono stati verificati nei testi estratti, non trasformati in nuove entry.
