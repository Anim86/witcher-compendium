// Script to apply Italian translations to the it.json file
// This replaces English fallback values with proper Italian translations

const fs = require('fs');
const path = require('path');

const itPath = path.join(__dirname, '..', 'TheWitcherItaNewSystem', 'lang', 'it.json');
const data = JSON.parse(fs.readFileSync(itPath, 'utf8'));

// Helper to set nested path
function setPath(obj, path, value) {
    const keys = path.split('.');
    let curr = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        if (!curr[keys[i]]) curr[keys[i]] = {};
        curr = curr[keys[i]];
    }
    curr[keys[keys.length - 1]] = value;
}

// ============================================================
// TYPES (document type labels shown in Foundry UI)
// ============================================================
const typesTranslations = {
    'TYPES.Item.alchemical': 'Alchemico',
    'TYPES.Item.armor': 'Armatura',
    'TYPES.Item.clue': 'Indizio',
    'TYPES.Item.component': 'Componente',
    'TYPES.Item.container': 'Contenitore',
    'TYPES.Item.criticalWound': 'Ferita Critica',
    'TYPES.Item.diagrams': 'Diagramma',
    'TYPES.Item.enhancement': 'Potenziamento',
    'TYPES.Item.hex': 'Maledizione',
    'TYPES.Item.homeland': 'Patria',
    'TYPES.Item.mount': 'Cavalcatura',
    'TYPES.Item.mutagen': 'Mutageno',
    'TYPES.Item.note': 'Nota',
    'TYPES.Item.obstacle': 'Ostacolo',
    'TYPES.Item.profession': 'Professione',
    'TYPES.Item.race': 'Razza',
    'TYPES.Item.ritual': 'Rituale',
    'TYPES.Item.skill': 'Abilità',
    'TYPES.Item.spell': 'Incantesimo',
    'TYPES.Item.valuable': 'Oggetto di Valore',
    'TYPES.Item.weapon': 'Arma',
    'TYPES.Actor.character': 'Personaggio',
    'TYPES.Actor.monster': 'Mostro',
    'TYPES.Actor.loot': 'Bottino',
    'TYPES.Actor.mystery': 'Mistero',
    'TYPES.ActiveEffect.temporaryItemImprovement': 'Miglioramento Temporaneo',

    // EFFECT
    'EFFECT.TABS.systemSpecific': 'Specifico di Sistema',
};

// Apply flat translations
for (const [key, value] of Object.entries(typesTranslations)) {
    setPath(data, key, value);
}

// ============================================================
// WITCHER root-level simple keys
// ============================================================
data.WITCHER.Name = 'Nome';
data.WITCHER.Type = 'Tipo';
data.WITCHER.Percentage = 'Percentuale';
data.WITCHER.NoEffects = 'Nessun Effetto';
data.WITCHER.DC = 'CD';

// ============================================================
// WITCHER.Actor – Character sheet core
// ============================================================
const actor = data.WITCHER.Actor;
actor.tabs = {
    stats: 'Statistiche',
    skills: 'Abilità',
    profession: 'Professione & Razza',
    inventory: 'Inventario',
    magic: 'Magia',
    background: 'Background',
    effects: 'Effetti Attivi'
};
actor.Name = 'Nome Personaggio';
actor.Race = 'Razza';
actor.Gender = 'Genere';
actor.Age = 'Età';
actor.Perks = 'Talenti';
actor['Adda.Profession'] = 'Aggiungi una Professione';
actor['Adda.Race'] = 'Aggiungi una Razza';
actor.woundState = 'Stato Ferite';
actor.TotalStats = 'Statistiche Totali';

// Stats abbreviations (keep short)
actor['Stat.Int'] = 'INT';
actor['Stat.Ref'] = 'RIF';
actor['Stat.Dex'] = 'DES';
actor['Stat.Body'] = 'FIS';
actor['Stat.Spd'] = 'VEL';
actor['Stat.Emp'] = 'EMP';
actor['Stat.Cra'] = 'TEC';
actor['Stat.Will'] = 'VOL';
actor['Stat.Luck'] = 'FOR';
actor['Stat.Toxicity'] = 'Tossicità';

actor['StatTitle.LableLeft'] = 'Statistiche';
actor['StatTitle.ModMax'] = 'Mod / Max';
actor['StatTitle.Derived'] = 'Derivate';

// Derived stats
actor['DerStat.Stun'] = 'STORD.';
actor['DerStat.Run'] = 'CORSA';
actor['DerStat.Leap'] = 'SALTO';
actor['DerStat.Enc'] = 'INGOM.';
actor['DerStat.Rec'] = 'REC.';
actor['DerStat.woundTreshold'] = 'SF';
actor['DerStat.Vigor'] = 'Vigore';
actor['DerStat.HP'] = 'PS Max';
actor['DerStat.Shield'] = 'Scudo';
actor['DerStat.Sta'] = 'STA';
actor['DerStat.Resolve'] = 'Risolutezza';
actor['DerStat.Focus'] = 'Focus';
actor['DerStat.Punch'] = 'Pugno';
actor['DerStat.Kick'] = 'Calcio';

actor.Initiative = 'Iniziativa';
actor.SavingThrow = 'Tiro Salvezza';
actor['Crit/Fumble'] = 'Critico/Maldestro';
actor.Adrenaline = 'Adrenalina';
actor.Stamina = 'Stamina';
actor.RecoveryStamina = 'Recupero Stamina';
actor.Resolve = 'Risolutezza';
actor.Hp = 'PV';
actor.Shield = 'Scudo';

actor['Skill.Intelligence'] = 'Intelligenza';
actor['Skill.Reflex'] = 'Riflessi';
actor['Skill.Willpower'] = 'Volontà';
actor['Skill.Dexterity'] = 'Destrezza';
actor['Skill.Crafting'] = 'Tecnica';
actor['Skill.Body'] = 'Fisico';
actor['Skill.Empathy'] = 'Empatia';

actor['Profession.Level'] = 'Livello';
actor.ImprovementPoints = 'Punti Miglioramento';
actor.CurrentIP = 'PM Attuali:';
actor.SkillName = 'Nome abilità...';
actor.TotalSkill = 'Abilità Totali';
actor.TotalProfSkill = 'Abilità Profess. Totali';
actor.SpecialSkillModifier = 'Modificatori Abilità Speciali';

actor.focus = {
    name: 'Focus',
    first: 'Primo',
    second: 'Secondo',
    third: 'Terzo',
    fourth: 'Quarto'
};

actor.Lifepath = {
    Bonus: 'Bonus Percorso Vitale',
    strongStrikeAttackBonus: 'Bonus Attacco Colpo Forte',
    jointStrikeAttackBonus: 'Bonus Attacco Colpo Combinato',
    shieldParryBonus: 'Bonus Parata con Scudo',
    shieldParryThrownBonus: 'Bonus Parata Armi da Lancio',
    ignoredArmorEncumbrance: 'Ingombro Armatura Ignorato',
    ignoredEvWhenCasting: 'VIn Ignorato per Lancio'
};

actor.attackStats = {
    critLocationModifier: 'Modificatore Locazione Critica',
    critEffectModifier: 'Modificatore Effetto Critico'
};

actor.settings = {
    actor: 'Impostazioni Attore',
    general: 'Generali',
    skills: 'Abilità'
};

actor.rewards = {
    heading: 'Ricompense',
    currency: 'Valuta',
    ip: 'PM'
};

// ============================================================
// WITCHER.Attack & Defense
// ============================================================
data.WITCHER.Attack.name = 'Attacco';
data.WITCHER.Attack.attackOptions.label = "L'attacco è:";
data.WITCHER.Attack.attackOptions.melee = 'Mischia';
data.WITCHER.Attack.attackOptions.ranged = 'A Distanza';
data.WITCHER.Attack.attackOptions.spell = 'Incantesimo';
data.WITCHER.Attack.attackOptions.itemUse = 'Uso Oggetto';
data.WITCHER.Attack.meleeAttackSkill.label = 'Abilità Attacco in Mischia';
data.WITCHER.Attack.rangedAttackSkill.label = 'Abilità Attacco a Distanza';
data.WITCHER.Attack.spellAttackSkill.label = 'Abilità Attacco Magico';
data.WITCHER.Attack.itemUseAttackSkill.label = 'Abilità Uso Oggetto';

data.WITCHER.Defense.name = 'Difesa';
data.WITCHER.Defense.Crit = 'Hai subito un critico';
data.WITCHER.Defense.critStun = 'Tiro salvezza stordimento per critico';
data.WITCHER.Defense.defenseOptions.name = 'Opzioni di Difesa';
data.WITCHER.Defense.defenseOptions.dodge = 'Schivata';
data.WITCHER.Defense.defenseOptions.reposition = 'Riposizionamento';
data.WITCHER.Defense.defenseOptions.parry = 'Parata';
data.WITCHER.Defense.defenseOptions.block = 'Blocco';
data.WITCHER.Defense.defenseOptions.parryThrown = 'Parata arma da lancio';
data.WITCHER.Defense.defenseOptions.magicResist = 'Resistenza Magica';
data.WITCHER.Defense.stun = { button: 'Stordimento' };

// ============================================================
// WITCHER.Item
// ============================================================
const item = data.WITCHER.Item;
item.Equipped = 'Equipaggiato';
item.NotEquipped = 'Non Equipaggiato';
item.sendToChat = 'Invia in Chat';
item.ClickableImage = 'Ingrandibile';
item['Short.Availability'] = 'Disp.';
item.Weight = 'Peso';
item.Cost = 'Costo';
item.Carried = 'Trasportato';
item.notCarried = 'Non Trasportato';
item.isConsumable = 'È Consumabile';
item.Effect = 'Effetti';
item.statusEffect = 'Effetto di Stato';
item.Quantity = 'Quantità';
item.SourceBook = 'Manuale di Riferimento';
item.Description = 'Descrizione';
item.Attribute = 'Attributi';
item.ROF = 'RdF';
item.openDescription = 'Clicca per aprire la descrizione';
item.equipEnhancement = 'Equipaggia un potenziamento';
item.Availability = 'Disponibilità';
item.AddEffect = 'Aggiungi Effetto';
item.AddComponent = 'Aggiungi Componente';
item.AddAssociatedItem = 'Aggiungi Oggetto Associato';
item.RemoveAssociatedItem = 'Rimuovi Oggetto Associato';
item.RemoveEffect = 'Rimuovi Effetto';
item.RemoveComponent = 'Rimuovi Componente';
item.CraftingMaterial = 'Materiale da Artigianato';
item['Hides&AnimalParts'] = 'Pelli e Parti Animali';
item.AlchemicalTreatments = 'Trattamenti Alchemici';
item['Ingots&Minerals'] = 'Lingotti e Minerali';
item.AvailabilityEverywhere = 'O';
item.AvailabilityCommon = 'C';
item.AvailabilityPoor = 'S';
item.AvailabilityRare = 'R';
item.AvailabilityWitcher = 'W';
item.Tiny = 'M';
item.Small = 'P';
item.Large = 'G';
item.CantHide = 'NA';
item.containerItems = 'Contenuto';

// ============================================================
// WITCHER.Alchemy
// ============================================================
data.WITCHER.Alchemy = {
    Duration: 'Dur.',
    Toxicity: 'Toss.',
    Alchemical: 'Alchemico',
    Potion: 'Pozione',
    Decoction: 'Decotto',
    Oil: 'Olio'
};

// ============================================================
// WITCHER.Armor
// ============================================================
data.WITCHER.Armor.ArmorEnhancement = 'Potenziamento Armatura';
data.WITCHER.Armor.Reliable = 'Aff';
data.WITCHER.Armor.EncumbranceValue = 'Valore di Ingombro';
data.WITCHER.Armor.Resistances = 'Resistenze';
data.WITCHER.Armor.Res = 'Res';
data.WITCHER.Armor.Type = 'Tipo';
data.WITCHER.Armor.StoppingPower = 'Potere d\'Arresto Attuale';
data.WITCHER.Armor.MaxStoppingPower = 'Potere d\'Arresto Massimo';
data.WITCHER.Armor['Short.ArmorEnhancement'] = 'PA';
data.WITCHER.Armor['Short.EncumbranceValue'] = 'VIn';
data.WITCHER.Armor['Short.StoppingPower'] = 'PdA';
data.WITCHER.Armor['Short.MaxStoppingPower'] = 'PdA Max';
data.WITCHER.Armor.Light = 'Armatura Leggera';
data.WITCHER.Armor.Medium = 'Armatura Media';
data.WITCHER.Armor.Heavy = 'Armatura Pesante';
data.WITCHER.Armor.Natural = 'Armatura Naturale';
data.WITCHER.Armor.LayerBonus = 'Bonus Stratificazione';
data.WITCHER.Armor.LocationHead = 'Testa';
data.WITCHER.Armor.LocationTorso = 'Torso';
data.WITCHER.Armor.LocationLeg = 'Gamba';
data.WITCHER.Armor.LocationArm = 'Braccio';
data.WITCHER.Armor.LocationFull = 'Copertura Totale';
data.WITCHER.Armor.LocationShield = 'Scudo';
data.WITCHER.Armor.LocationLeft = 'S.';
data.WITCHER.Armor.LocationRight = 'D.';
data.WITCHER.Armor.Location = 'Locazione';
data.WITCHER.Armor.tooMuch = 'Troppe armature equipaggiate dello stesso tipo';

// ============================================================
// WITCHER.Weapon
// ============================================================
const weapon = data.WITCHER.Weapon;
weapon.Type = 'Tipo';
weapon['Short.WeaponAccuracy'] = 'PA';
weapon['Short.Damage'] = 'DAN';
weapon['Short.Reliability'] = 'Aff.';
weapon['Short.MaxReliability'] = 'Aff. Max';
weapon.Hands = { title: 'Mani', none: 'Nessuna', left: 'Sinistra', right: 'Destra', both: 'Entrambe' };
weapon['Short.Concealment'] = 'Occult.';
weapon['Short.Enhancements'] = 'POT';
weapon.Range = 'Gittata';
weapon.ElderFolk = 'Pop.Ant.';
weapon['Short.RateOfFire'] = 'RdF';
weapon.WeaponAccuracy = 'Precisione Arma';
weapon.Enhancements = 'Potenziamenti';
weapon.Reliability = 'Affidabilità Attuale';
weapon.MaxReliability = 'Affidabilità Massima';
weapon.RateOfFire = 'Rateo di Fuoco';
weapon.Damage = 'Danno';
weapon.Concealment = 'Occultabilità';
weapon.AttackSkill = 'Abilità di Attacco';
weapon.MeleeBonus = 'Bonus Mischia';
weapon.rangedMeleeBonus = 'Bonus Mischia a Distanza';
weapon.rangedMeleeBonusHint = 'Alcune armi a distanza applicano anche il bonus mischia';
weapon.isAmmunition = 'È una munizione';
weapon.Ammunition = 'Munizione';
weapon.isThrowable = 'È arma da lancio';
weapon.Broken = 'La tua arma è ora rotta';
weapon.onlyDmg = 'Tira solo i Danni';
weapon.useAmmo = 'Usa Munizioni';
weapon.armorPiercing = 'Perforante';
weapon.improvedArmorPiercing = 'Perforante Migliorato';
weapon.ablating = 'Ablativo';
weapon.crushingForce = 'Forza Devastante';
weapon.error = { noAttackSkill: 'Nessuna abilità di attacco configurata' };
weapon.attacks = {
    normal: 'Colpo Normale',
    fast: 'Colpo Rapido',
    strong: 'Colpo Forte',
    joint: 'Colpo Combinato',
    half: 'Danno Dimezzato'
};

// ============================================================
// WITCHER.Dialog
// ============================================================
const dialog = data.WITCHER.Dialog;
dialog.NoComponents = 'Componenti insufficienti per la creazione';
dialog.CraftingDiagram = 'Hai un diagramma in mano';
dialog.RealCrafting = 'Creazione reale';
dialog.Crafting = 'Creazione di un';
dialog.CraftingTitle = 'Esecuzione di un\'azione di creazione';
dialog.AlchemyTitle = 'Esecuzione di un\'azione alchemica';
dialog.ButtonCraft = 'Crea';
dialog.CraftingAlchemycal = 'Creazione di un alchemico';
dialog.CraftingItem = 'Creazione di un oggetto';
dialog.Diagram = 'Diagramma';
dialog.after = 'Dopo';
dialog.DefenseExtra = 'Difesa extra';
dialog.DefenseWith = 'Difesa con';
dialog.DefenseTitle = 'Esecuzione di un\'azione di difesa';
dialog.attack = 'Umano Casuale';
dialog.attackRandomHuman = 'Umano Casuale';
dialog.attackRandomMonster = 'Mostro Casuale';
dialog.attackHead = 'Testa';
dialog.attackTorso = 'Torso';
dialog.attackRArm = 'Braccio D.';
dialog.attackLArm = 'Braccio S.';
dialog.attackRLeg = 'Gamba D.';
dialog.attackLLeg = 'Gamba S.';
dialog.attackLimb = 'Arto';
dialog.attackTail = 'Coda/Ala';
dialog.attackOutsideLOS = 'Fuori dal campo visivo del nemico';
dialog.attackIsFastDraw = 'Estrazione Rapida';
dialog.attackIsProne = 'Sei prono';
dialog.attackIsPinned = 'Bersaglio immobilizzato';
dialog.attackIsActivelyDodging = 'Bersaglio che schiva attivamente';
dialog.attackIsMoving = 'Bersaglio in movimento RIF > 10';
dialog.attackTargetOutsideLOS = 'Il bersaglio è fuori dal tuo campo visivo';
dialog.attackIsAmbush = 'Imboscata';
dialog.attackIsRicochet = 'Rimbalzo';
dialog.attackIsBlinded = 'Sei accecato';
dialog.attackIsSilhouetted = 'Sagoma visibile';
dialog.attackIsAiming = 'Turni di mira';
dialog.sizeMedium = 'Medio';
dialog.sizeSmall = 'Piccolo';
dialog.sizeLarge = 'Grande';
dialog.sizeHuge = 'Enorme';
dialog.rangeNone = 'Nessuna';
dialog.rangePointBlank = 'Bruciapelo (<2m)';
dialog.rangeClose = 'Ravvicinata (1/4 Gittata)';
dialog.rangeMedium = 'Media (1/2 Gittata)';
dialog.rangeLong = 'Lunga (Gittata Piena)';
dialog.rangeExtreme = 'Estrema (2x Gittata)';
dialog.attackUse = "L'attacco userà";
dialog.attackExtra = 'Attacco extra';
dialog.attackLocation = 'Locazione Colpo';
dialog.damageType = 'Tipo di Danno';
dialog.attackModifiers = 'Modificatori Attacco';
dialog.attackSize = 'Modificatori Taglia Avversario';
dialog.attackRange = 'Modificatori Gittata';
dialog.attackCustom = 'Modificatori Attacco Personalizzati';
dialog.attackStrike = 'Tipo di Colpo';
dialog.attackDamage = 'danno';
dialog.attackMeleeBonus = 'Bonus Mischia';
dialog.attackCustomDmg = 'Modificatori Danno Personalizzati';
dialog.attackWith = 'Esecuzione di un Attacco con';
dialog.chooseAmmunition = 'Scegli Munizione';
dialog.NoAmmunition = 'Nessuna munizione disponibile';
dialog.NoThrowable = 'Nessun oggetto lanciabile disponibile';
dialog.Ammunition = 'Munizione';
dialog.Throwable = 'Lanciabile';
dialog.ButtonRoll = 'Tira';
dialog.Enhancement = 'Potenziamento';
dialog.Apply = 'Applica';
dialog.Skill = 'Esecuzione di un Test di Abilità';
dialog['profession.skill'] = 'Esecuzione di un\'abilità professionale';
dialog.staDialog = 'Come vuoi recuperare stamina?';
dialog.recoveryAction = 'Azione di Recupero';
dialog.fullRecovery = 'Recupero Completo';
dialog.fullStaInfo = 'La tua stamina è già piena';
dialog.defense = { custom: 'Modificatori Difesa Personalizzati' };

// ============================================================
// WITCHER.DamageType
// ============================================================
data.WITCHER.DamageType = {
    name: 'Tipo di Danno',
    bludgeoning: 'Contundente',
    slashing: 'Tagliente',
    piercing: 'Perforante',
    elemental: 'Elementale',
    electricity: 'Elettricità',
    fire: 'Fuoco',
    ice: 'Ghiaccio'
};

// ============================================================
// WITCHER.Inventory
// ============================================================
data.WITCHER.Inventory.Armor = 'Armature Equipaggiate';
data.WITCHER.Inventory.Weapons = 'Armi Equipaggiate';
data.WITCHER.Inventory.Valuables = 'Oggetti di Valore';
data.WITCHER.Inventory.Mounts = 'Cavalcature';
data.WITCHER.Inventory.Crafting = 'Artigianato';
data.WITCHER.Inventory.CraftingMaterials = 'Materiali da Artigianato';
data.WITCHER.Inventory.HidesAndAnimalParts = 'Pelli e Parti Animali';
data.WITCHER.Inventory.IngotsAndMinerals = 'Lingotti e Minerali';
data.WITCHER.Inventory.Enhancements = 'Potenziamenti';
data.WITCHER.Inventory.Alchemy = 'Alchimia';
data.WITCHER.Inventory.AlchemicalItems = 'Oggetti Alchemici';
data.WITCHER.Inventory.AlchemicalTreatments = 'Trattamenti Alchemici';
data.WITCHER.Inventory.WitcherPotionsAndDecoctions = 'Pozioni e Decotti Witcher';
data.WITCHER.Inventory.Oils = 'Oli per Lama';
data.WITCHER.Inventory.Mutagens = 'Mutageni';
data.WITCHER.Inventory.Substances = 'Sostanze';
data.WITCHER.Inventory.Components = 'Componenti';
data.WITCHER.Inventory.Diagrams = 'Diagrammi e Formule';
data.WITCHER.Inventory.RunesAndGlyphs = 'Rune e Glifi';
data.WITCHER.Inventory.Runes = 'Rune';
data.WITCHER.Inventory.Glyphs = 'Glifi';
data.WITCHER.Inventory.AlchemicalItemDiagrams = 'Formule Oggetti Alchemici';
data.WITCHER.Inventory.PotionDiagrams = 'Formule Pozioni Witcher';
data.WITCHER.Inventory.DecoctionDiagrams = 'Formule Decotti Witcher';
data.WITCHER.Inventory.OilDiagrams = 'Formule Oli';
data.WITCHER.Inventory.IngredientDiagrams = 'Diagrammi Componenti';
data.WITCHER.Inventory.WeaponDiagrams = 'Diagrammi Armi';
data.WITCHER.Inventory.ArmorDiagrams = 'Diagrammi Armature';
data.WITCHER.Inventory.enhancementDiagrams = 'Diagrammi Potenziamenti';
data.WITCHER.Inventory.ElderfolkWeaponDiagrams = 'Diagrammi Armi Pop. Antico';
data.WITCHER.Inventory.ElderfolkArmorDiagrams = 'Diagrammi Armature Pop. Antico';
data.WITCHER.Inventory.AmmunitionDiagrams = 'Diagrammi Munizioni';
data.WITCHER.Inventory.BombDiagrams = 'Diagrammi Bombe';
data.WITCHER.Inventory.TrapDiagrams = 'Diagrammi Trappole';
data.WITCHER.Inventory.Substance = 'Sostanza';
data.WITCHER.Inventory.Vitriol = 'Vetriolo';
data.WITCHER.Inventory.Rebis = 'Rebis';
data.WITCHER.Inventory.Aether = 'Etere';
data.WITCHER.Inventory.Quebrith = 'Quebrith';
data.WITCHER.Inventory.Hydragenum = 'Idrogenum';
data.WITCHER.Inventory.Vermilion = 'Vermiglio';
data.WITCHER.Inventory.Sol = 'Sol';
data.WITCHER.Inventory.Caelum = 'Caelum';
data.WITCHER.Inventory.Fulgur = 'Fulgur';

// ============================================================
// WITCHER root-level misc
// ============================================================
data.WITCHER.Reputation = 'Reputazione';
data.WITCHER.SocialStanding = 'Posizione Sociale';
data.WITCHER.Profession = 'Professione';
data.WITCHER.Homeland = 'Patria';
data.WITCHER['Resources.modifiers'] = 'Modificatori Risorse';
data.WITCHER.Notes = 'Note';
data.WITCHER['background.other'] = 'Altro';
data.WITCHER['character.socialStanding'] = 'Posizione Sociale';

// Button
data.WITCHER.Button = {
    Cancel: 'Annulla',
    Confirm: 'Conferma',
    Continue: 'Continua',
    All: 'Tutti'
};

// Social Standing
data.WITCHER.socialStanding = {
    equal: 'Uguale',
    tolerated: 'Tollerato',
    hated: 'Odiato',
    feared: 'Temuto',
    hatedFeared: 'Odiato e Temuto',
    toleratedFeared: 'Tollerato e Temuto',
    north: 'Il Nord',
    nilfgaard: 'Nilfgaard',
    skellige: 'Skellige',
    dolBlathanna: 'Dol Blathanna',
    mahakam: 'Mahakam'
};

// Skills (short labels)
data.WITCHER.skills.name = 'Abilità';
data.WITCHER.skills.profession = 'Prof';
data.WITCHER.skills.pickup = 'Pick';
data.WITCHER.skills.learn = 'App.';
data.WITCHER.skills.skillGroups = {
    name: 'Gruppi di Abilità',
    allSkills: 'Tutte le Abilità',
    meleeSkills: 'Abilità in Mischia',
    rangedSkills: 'Abilità a Distanza',
    magicSkills: 'Abilità Magiche',
    verbalCombatSkills: 'Abilità Combattimento Verbale',
    empatheticVerbalCombatSkills: 'Abilità Comb. Verbale Empatico'
};

// Individual skill labels
const skillTranslations = {
    awareness: { label: 'Percezione' },
    business: { label: 'Mercanteggiare' },
    deduction: { label: 'Deduzione' },
    education: { label: 'Istruzione' },
    commonSpeech: { label: 'Lingua Comune (2)', rollLabel: 'Lingua Comune' },
    elderSpeech: { label: 'Linguaggio Antico (2)', rollLabel: 'Linguaggio Antico' },
    dwarvenSpeech: { label: 'Lingua Nanica (2)', rollLabel: 'Lingua Nanica' },
    monsterLore: { label: 'Conoscenza Mostri (2)', rollLabel: 'Conoscenza Mostri' },
    socialEtiquette: { label: 'Etichetta Sociale' },
    streetwise: { label: 'Vita di Strada' },
    tactics: { label: 'Tattica (2)', rollLabel: 'Tattica' },
    teaching: { label: 'Insegnamento' },
    wildernessSurvival: { label: 'Sopravvivenza' },
    brawling: { label: 'Rissa' },
    dodgeEscape: { label: 'Schivata/Fuga' },
    melee: { label: 'Mischia' },
    riding: { label: 'Cavalcare' },
    sailing: { label: 'Navigazione' },
    smallblades: { label: 'Lame Corte' },
    staffspear: { label: 'Bastone/Lancia' },
    swordsmanship: { label: 'Scherma' },
    archery: { label: 'Arco' },
    athletics: { label: 'Atletica' },
    crossbow: { label: 'Balestra' },
    sleightOfHand: { label: 'Giochi di Mano' },
    stealth: { label: 'Furtività' },
    physique: { label: 'Prestanza Fisica' },
    endurance: { label: 'Resistenza' },
    charisma: { label: 'Carisma' },
    deceit: { label: 'Inganno' },
    fineArts: { label: 'Belle Arti' },
    gambling: { label: 'Gioco d\'Azzardo' },
    groomingAndStyle: { label: 'Cura e Stile' },
    humanPerception: { label: 'Percezione Umana' },
    leadership: { label: 'Comando' },
    persuasion: { label: 'Persuasione' },
    performance: { label: 'Esibizione' },
    seduction: { label: 'Seduzione' },
    alchemy: { label: 'Alchimia (2)', rollLabel: 'Alchimia' },
    crafting: { label: 'Artigianato (2)', rollLabel: 'Artigianato' },
    disguise: { label: 'Travestimento' },
    firstAid: { label: 'Primo Soccorso' },
    forgery: { label: 'Falsificazione' },
    pickLock: { label: 'Scassinare' },
    trapCrafting: { label: 'Creare Trappole (2)', rollLabel: 'Creare Trappole' },
    courage: { label: 'Coraggio' },
    hexWeaving: { label: 'Tessere Maledizioni (2)', rollLabel: 'Tessere Maledizioni' },
    intimidation: { label: 'Intimidazione' },
    spellCasting: { label: 'Lancio Incantesimi (2)', rollLabel: 'Lancio Incantesimi' },
    resistMagic: { label: 'Resistere alla Magia (2)', rollLabel: 'Resistere alla Magia' },
    resistCoercion: { label: 'Resistere alla Coercizione' },
    ritualCrafting: { label: 'Creazione Rituali (2)', rollLabel: 'Creazione Rituali' }
};
for (const [key, value] of Object.entries(skillTranslations)) {
    data.WITCHER.skills[key] = value;
}

// ============================================================
// WITCHER.Spell
// ============================================================
const spell = data.WITCHER.Spell;
spell.type = 'Tipo';
spell.Spells = 'Incantesimi';
spell.Ritual = { name: 'Rituale', components: 'Componenti', alternateComponents: 'Componenti Alternati' };
spell.Invocations = 'Invocazioni';
spell.Witcher = 'Segni del Witcher';
spell.Rituals = 'Rituali';
spell.Hexes = 'Maledizioni';
spell.MagicalGift = 'Dono Magico';
spell.Danger = 'Pericolo';
spell.DangerLow = 'Basso';
spell.DangerMedium = 'Medio';
spell.DangerHigh = 'Alto';
spell.Novice = 'Novizio';
spell.Journeyman = 'Apprendista';
spell.Master = 'Maestro';
spell.Mixed = 'Elementi Misti';
spell.Earth = 'Terra';
spell.Air = 'Aria';
spell.Fire = 'Fuoco';
spell.Water = 'Acqua';
spell.Druid = 'Druido';
spell.Preacher = 'Predicatore';
spell.Archpriest = 'Arciprete';
spell.Basic = 'Base';
spell.Alt = 'Alternativo';
spell.Duration = 'Durata';
spell.Range = 'Raggio';
spell.Defence = 'Difesa';
spell.PrepTime = 'Tempo Prep.';
spell.DC = 'Prova di Difficoltà';
spell.Requirements = 'Requisiti per Annullare';
spell.Effect = 'Effetto';
spell.SideEffect = 'Effetto Collaterale';
spell.Signs = 'Segni';
spell.Sign = 'Segno';
spell.Element = 'Elemento';
spell.MinorGift = 'Dono Minore';
spell.MajorGift = 'Dono Maggiore';
spell.StaCost = 'Costo Stamina';
spell.Variable = 'Stamina Variabile';
spell.variableEffect = 'Effetto Stamina Variabile';
spell.staminaDialog = 'Quanta stamina vuoi usare?';
spell.notEnoughSta = 'Stamina insufficiente.';
spell.MagicCost = 'Costi Magici';
spell.ChooseFocus = 'Usa un focus';
spell.ChooseExpandedFocus = 'Usa un focus di Magia Espansa';
spell.CreateTemplate = 'Crea un Modello';
spell.meters = 'm';
spell.Size = 'Dimensione';
spell.Type = 'Tipo';
spell.VisualEffectDuration = 'Durata Visiva (sec)';
spell.Square = 'Quadrato';
spell.Circle = 'Cerchio';
spell.Cone = 'Cono';
spell.Ray = 'Raggio';
spell.Damage = 'Causa Danni';
spell.createsShield = 'Crea Scudo';
spell.doesHeal = 'Applica Cura';
spell.Short = {
    StaCost: 'Costo STA',
    Variable: 'V.STA',
    Shield: 'Scudo',
    Heal: 'Cura'
};

// ============================================================
// WITCHER.Heal
// ============================================================
data.WITCHER.Heal = {
    button: 'Cura',
    dialogTitle: 'Cura dopo il Riposo',
    title: 'Circostanze di Guarigione',
    resting: 'Giorno di Riposo',
    sterilized: 'Ricevuto Fluido Sterilizzante',
    healinghand: 'Ricevuto Mani Guaritrici',
    healingTent: 'Ricevuto Tenda Medica',
    resetTempHealth: 'Reimposta salute temporanea',
    recovered: ' si è ripreso da un giorno',
    restful: 'riposante',
    active: 'attivo',
    day: 'giorno',
    totalRecover: 'Recupero Totale:',
    criticalWounds: 'Le ferite critiche guariranno 2 giorni prima'
};

// ============================================================
// WITCHER.rewards
// ============================================================
data.WITCHER.rewards = {
    dialog: {
        title: 'Seleziona attori per la ricompensa',
        label: 'Etichetta: ',
        ip: 'PM: ',
        magicIp: 'PM Magici: ',
        currency: 'Importo Valuta',
        currencyType: 'Tipo di Valuta',
        confirm: 'Conferma'
    },
    chat: {
        title: 'Ricompense',
        ip: 'PM',
        currency: 'Valuta'
    }
};

// ============================================================
// WITCHER.Chat
// ============================================================
data.WITCHER.Chat = {
    SaveText: 'Per riuscire devi tirare sotto',
    FullDmg: 'Danno Pieno',
    Success: 'Successo',
    Fail: 'Fallimento',
    Resting: 'ha passato il giorno riposando e recupera:',
    Active: 'ha passato il giorno in attività e recupera:',
    WoundHealing: 'sulla Soglia Guarigione Critica',
    fullStamina: 'Stamina Piena'
};

// ============================================================
// WITCHER.Currency
// ============================================================
data.WITCHER.Currency = {
    bizant: 'Bisante',
    ducat: 'Ducato',
    lintar: 'Lintar',
    floren: 'Florino',
    crown: 'Corona',
    oren: 'Oren',
    falsecoin: 'Moneta Falsa'
};

// ============================================================
// WITCHER.verbalCombat
// ============================================================
data.WITCHER.verbalCombat.Title = 'Combattimento Verbale';
data.WITCHER.verbalCombat.DialogTitle = 'Esecuzione di un\'azione di combattimento verbale';
data.WITCHER.verbalCombat.EmpatheticAttacks = 'Attacchi Empatici';
data.WITCHER.verbalCombat.AntagonisticAttacks = 'Attacchi Antagonistici';
data.WITCHER.verbalCombat.Defenses = 'Difese';
data.WITCHER.verbalCombat.EmpatheticTools = 'Strumenti Empatici';
data.WITCHER.verbalCombat.AntagonisticTools = 'Strumenti Antagonistici';

// ============================================================
// WITCHER.activeEffect
// ============================================================
data.WITCHER.activeEffect = {
    tab: 'Effetto Attivo',
    source: 'Fonte',
    toggle: 'Attiva/Disattiva',
    temporary: 'Temporaneo',
    passive: 'Passivo',
    inactive: 'Inattivo',
    temporaryItemImprovement: 'Miglioramento Temporaneo Oggetto'
};

// ============================================================
// WITCHER.Settings
// ============================================================
data.WITCHER.Settings.Adrenaline = 'Usa la Regola Opzionale dell\'Adrenalina';
data.WITCHER.Settings.AdrenalineDetails = 'L\'adrenalina è la forza di volontà per andare avanti e combattere più duramente';
data.WITCHER.Settings.WoundsAffectSkillBase = 'Le ferite influenzano la base dell\'abilità';
data.WITCHER.Settings.WoundsAffectSkillBaseDetails = 'Le ferite influenzano la base dell\'abilità invece del solo valore. Rende le ferite più impattanti.';
data.WITCHER.Settings.useVerbalCombatRule = 'Usa la Regola del Combattimento Verbale';
data.WITCHER.Settings.useVerbalCombatRuleHint = 'Permette ai giocatori di vedere il valore di Risolutezza e tirare per azioni di combattimento verbale';
data.WITCHER.Settings.displayRollDetails = 'Mostra i dettagli dei tiri';
data.WITCHER.Settings.displayRollDetailsHint = 'Mostra i dettagli dei tiri di dado: 1d10+2[stat]+4[abilità]-3[parata]';
data.WITCHER.Settings.Custom = 'Personalizzato';
data.WITCHER.Settings.displayReputation = 'Mostra la Reputazione ai giocatori';
data.WITCHER.Settings.displayReputationHint = 'Permette ai giocatori di vedere e modificare la propria reputazione';
data.WITCHER.Settings.specialFont = 'Usa il font speciale witcher';

// ============================================================
// WITCHER.Location
// ============================================================
data.WITCHER.Location = {
    Random: 'Casuale',
    All: 'non specificato',
    Left: 'Sinistra',
    Right: 'Destra',
    Head: 'Testa',
    Torso: 'Torso',
    rightArm: 'Braccio D.',
    leftArm: 'Braccio S.',
    rightLeg: 'Gamba D.',
    leftLeg: 'Gamba S.'
};

// ============================================================
// WITCHER.Diagram
// ============================================================
data.WITCHER.Diagram = {
    alchemyDC: 'CD Alchimia',
    craftingDC: 'CD Creazione',
    craftingTime: 'Tempo',
    components: 'Componenti',
    otherComponents: 'Altri Componenti',
    investment: 'Investimento',
    Learned: 'Appreso',
    notLearned: 'Non Appreso',
    Formulae: 'Formule',
    Ingredient: 'Ingrediente',
    Weapon: 'Arma',
    Armor: 'Armatura',
    ArmorEnhancement: 'Potenziamento Armatura',
    ElderFolkWeapon: 'Arma Popolo Antico',
    ElderFolkArmor: 'Armatura Popolo Antico',
    Ammunition: 'Munizione',
    Bomb: 'Bomba',
    Traps: 'Trappole',
    Level: 'Livello',
    Novice: 'Novizio',
    Journeyman: 'Apprendista',
    Master: 'Maestro',
    GrandMaster: 'Gran Maestro',
    Witcher: 'Witcher'
};

// ============================================================
// WITCHER.Valuable
// ============================================================
data.WITCHER.Valuable = {
    Conceal: 'Occultare',
    Quality: 'Qualità',
    Toolkit: 'Kit di Attrezzi',
    General: 'Generico',
    Containers: 'Contenitori',
    'Food&Drinks': 'Cibo e Bevande',
    Clothings: 'Abbigliamento',
    AlchemicalItem: 'Oggetto Alchemico',
    Service: 'Servizio',
    Loging: 'Alloggio',
    MountAccessories: 'Accessori Cavalcatura',
    QuestItem: 'Oggetto Missione'
};

// ============================================================
// Misc remaining keys
// ============================================================
data.WITCHER.MinValue = 'Valore Minimo';
data.WITCHER.MaxValue = 'Valore Massimo';
data.WITCHER.Value = 'Valore';
data.WITCHER.ValuedPerson = 'Persona Cara';
data.WITCHER.Affectations = 'Affettazioni';
data.WITCHER.Hair = 'Acconciatura';
data.WITCHER.Personality = 'Personalità';
data.WITCHER.Clothing = 'Abbigliamento';
data.WITCHER.FeelingsOnPeople = 'Sentimenti verso la Gente';
data.WITCHER.LifeEvents = 'Eventi della Vita';
data.WITCHER.Decade = 'Decennio';
data.WITCHER.Event = 'Evento';
data.WITCHER.DeathSave = 'Tiro Stordimento/Morte';
data.WITCHER.BeforeCrit = 'Prima del Critico';
data.WITCHER.Crit = 'Critico';
data.WITCHER.Fumble = 'Maldestro';
data.WITCHER.CritTotal = 'Per un totale di';
data.WITCHER.NoDamageSpecified = 'Danno non specificato';
data.WITCHER['Shield.Broken'] = 'Il tuo scudo è ora rotto';
data.WITCHER['Items.transferTitle'] = 'Trasferimento Oggetti';
data.WITCHER['Items.transferMany'] = 'Quanti oggetti trasferire';
data.WITCHER['Apply.Mod'] = 'Applica un modificatore';
data.WITCHER.ReputationTitle = 'Esecuzione di un tiro di reputazione';
data.WITCHER['ReputationButton.Save'] = 'Salvare';
data.WITCHER['ReputationButton.FaceDown'] = 'Confronto';
data.WITCHER['ReputationSave.Title'] = 'Salvare';
data.WITCHER['ReputationFaceDown.Title'] = 'Confronto di Reputazione';

data.WITCHER.magic = {
    magicImprovementPoints: 'PM Magici'
};

// ============================================================
// Write final file
// ============================================================
fs.writeFileSync(itPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log('✅ Italian translation complete! Written to', itPath);
