/**
 * Character Registry - KidsLearnCode
 * Gerencia os 8 heróis jogáveis em 4 direções e os 9 NPCs moradores da ilha.
 */

export const PLAYABLE_HEROES = [
  {
    id: "char_wolf_hunter_m",
    name: "Lobo Caçador (Ragnar)",
    species: "wolf",
    gender: "male",
    archetype: "hunter",
    passive: { id: "wild_scent", name: "Faro Selvagem", desc: "Revela pegadas para ovos de dragão e minérios a 15 tiles." },
    metadataPath: "assets/characters/char_wolf_hunter_m/metadata.json"
  },
  {
    id: "char_wolf_hunter_f",
    name: "Lobo Caçadora (Lyra)",
    species: "wolf",
    gender: "female",
    archetype: "hunter",
    passive: { id: "wild_scent", name: "Faro Selvagem", desc: "Revela pegadas para ovos de dragão e minérios a 15 tiles." },
    metadataPath: "assets/characters/char_wolf_hunter_f/metadata.json"
  },
  {
    id: "char_bat_vampire_m",
    name: "Morcego Vampiro (Vlad)",
    species: "bat",
    gender: "male",
    archetype: "vampire",
    passive: { id: "night_echo", name: "Eco Noturno", desc: "+5 Ações Noturnas exclusivas (após 17h) e visão no escuro." },
    metadataPath: "assets/characters/char_bat_vampire_m/metadata.json"
  },
  {
    id: "char_bat_vampire_f",
    name: "Morcego Vampira (Carmilla)",
    species: "bat",
    gender: "female",
    archetype: "vampire",
    passive: { id: "night_echo", name: "Eco Noturno", desc: "+5 Ações Noturnas exclusivas (após 17h) e visão no escuro." },
    metadataPath: "assets/characters/char_bat_vampire_f/metadata.json"
  },
  {
    id: "char_eagle_archer_m",
    name: "Águia Arqueiro (Zephyr)",
    species: "eagle",
    gender: "male",
    archetype: "archer",
    passive: { id: "perfect_aim", name: "Mira Perfeita", desc: "+30% velocidade de coleta e -1s no cooldown da Esquiva." },
    metadataPath: "assets/characters/char_eagle_archer_m/metadata.json"
  },
  {
    id: "char_eagle_archer_f",
    name: "Águia Arqueira (Astra)",
    species: "eagle",
    gender: "female",
    archetype: "archer",
    passive: { id: "perfect_aim", name: "Mira Perfeita", desc: "+30% velocidade de coleta e -1s no cooldown da Esquiva." },
    metadataPath: "assets/characters/char_eagle_archer_f/metadata.json"
  },
  {
    id: "char_cat_mage_m",
    name: "Gato Bruxo (Merlin)",
    species: "cat",
    gender: "male",
    archetype: "mage",
    passive: { id: "arcane_affinity", name: "Afinidade Arcana", desc: "+10% ganho de XP aos dragões e dicas nos quebra-cabeças Lua." },
    metadataPath: "assets/characters/char_cat_mage_m/metadata.json"
  },
  {
    id: "char_cat_witch_f",
    name: "Gato Bruxa (Luna)",
    species: "cat",
    gender: "female",
    archetype: "witch",
    passive: { id: "arcane_affinity", name: "Afinidade Arcana", desc: "+10% ganho de XP aos dragões e dicas nos quebra-cabeças Lua." },
    metadataPath: "assets/characters/char_cat_witch_f/metadata.json"
  }
];

export const VILLAGE_NPCS = [
  { id: "npc_shark_surfer", name: "Kai, o Tubarão das Ondas", role: "Navegação, Pesca e Dragões Aquáticos" },
  { id: "npc_alligator_ferryman", name: "Barnabé, o Barqueiro", role: "Travessias, Balsas e Pontes" },
  { id: "npc_monkey_builder", name: "Bambu, o Engenheiro", role: "Workbench, Mobília e Casas" },
  { id: "npc_chameleon_magician", name: "Cromos, o Tecelão de Cores", role: "Tinturas, Ilusões e Customização" },
  { id: "npc_owl_professor", name: "Dr. Arquimedes", role: "Mentor de Programação Blockly e Lua" },
  { id: "npc_bull_blacksmith", name: "Brutus da Bigorna", role: "Ferreiro, Ferramentas e Armaduras" },
  { id: "npc_rabbit_farmer", name: "Flora dos Brotos", role: "Herbalista, Sementes e Ninhos" },
  { id: "npc_turtle_elder", name: "Mestre Casco", role: "Guardião Ancestral e Dragão Mítico" },
  { id: "npc_penguin_angler", name: "Pingo dos Icebergs", role: "Pesca Polar e Biomas Glaciais" }
];

export const CharacterRegistry = {
  PLAYABLE_HEROES,
  VILLAGE_NPCS
};

export default CharacterRegistry;
