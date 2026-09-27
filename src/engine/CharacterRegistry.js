/**
 * Character Registry - KidsLearnCode
 * Gerencia os 8 heróis jogáveis e os 9 NPCs mestres de construção e desafios de código.
 */

import { MASTER_NPC_CONFIGS, generateNPCAppearance } from './animation/NPCAppearanceGenerator.js';

// Personagens jogáveis: o jogador utiliza exclusivamente seu Avatar Customizável modular.
export const PLAYABLE_HEROES = [];

// Heróis da ilha convertidos em NPCs Secundários (com horários de aparição: vampiros e bruxos à noite, caçadores e arqueiros de dia)
export const SECONDARY_HERO_NPCS = [
  {
    id: "char_wolf_hunter_m",
    name: "Ragnar, o Caçador",
    role: "Guardião da Floresta & Rastreador",
    category: "hunter",
    timeOfDay: "day", // Aparece de dia / manhã
    avatarConfig: MASTER_NPC_CONFIGS.char_wolf_hunter_m,
    portrait: "assets/characters/char_wolf_hunter_m/portrait.jpg",
    greeting: "Saudações, jovem aventureiro! Os ventos da manhã trazem o rastro de feras e minérios raros. Mantenha os olhos abertos na vegetação!"
  },
  {
    id: "char_wolf_hunter_f",
    name: "Lyra, a Rastreadora",
    role: "Exploradora de Trilhas Selvagens",
    category: "hunter",
    timeOfDay: "day", // Aparece de dia / manhã
    avatarConfig: MASTER_NPC_CONFIGS.char_wolf_hunter_f,
    portrait: "assets/characters/char_wolf_hunter_f/portrait.jpg",
    greeting: "Olá! A floresta desperta com a luz do sol. Cada pegada na terra conta uma história para quem sabe observar!"
  },
  {
    id: "char_bat_vampire_m",
    name: "Vlad, o Andarilho Noturno",
    role: "Guardião das Sombras & Noite",
    category: "vampire",
    timeOfDay: "night", // Aparece apenas à noite
    avatarConfig: MASTER_NPC_CONFIGS.char_bat_vampire_m,
    portrait: "assets/characters/char_bat_vampire_m/portrait.jpg",
    greeting: "A noite é calma e cheia de mistérios... Quando a lua sobe aos céus, as energias secretas da ilha se revelam."
  },
  {
    id: "char_bat_vampire_f",
    name: "Carmilla, a Dama das Sombras",
    role: "Erudita da Meia-Noite",
    category: "vampire",
    timeOfDay: "night", // Aparece apenas à noite
    avatarConfig: MASTER_NPC_CONFIGS.char_bat_vampire_f,
    portrait: "assets/characters/char_bat_vampire_f/portrait.jpg",
    greeting: "Boa noite, viajante. O silêncio da escuridão guarda os melhores pensamentos para criar e contemplar o luar."
  },
  {
    id: "char_eagle_archer_m",
    name: "Zephyr, o Vigia dos Ventos",
    role: "Sentinela Celeste & Arqueiro",
    category: "archer",
    timeOfDay: "day", // Aparece de dia / manhã
    avatarConfig: MASTER_NPC_CONFIGS.char_eagle_archer_m,
    portrait: "assets/characters/char_eagle_archer_m/portrait.jpg",
    greeting: "O ar matutino é perfeito para mirar longe! As montanhas e falésias da ilha guardam vistas espetaculares."
  },
  {
    id: "char_eagle_archer_f",
    name: "Astra, a Franco-Atiradora",
    role: "Vigia das Alturas",
    category: "archer",
    timeOfDay: "day", // Aparece de dia / manhã
    avatarConfig: MASTER_NPC_CONFIGS.char_eagle_archer_f,
    portrait: "assets/characters/char_eagle_archer_f/portrait.jpg",
    greeting: "Bom dia! Com precisão e calma, nenhuma distância é grande demais para alcançar seus objetivos!"
  },
  {
    id: "char_cat_mage_m",
    name: "Merlin, o Arcanista",
    role: "Estudioso dos Astros Noturnos",
    category: "mage",
    timeOfDay: "night", // Aparece apenas à noite
    avatarConfig: MASTER_NPC_CONFIGS.char_cat_mage_m,
    portrait: "assets/characters/char_cat_mage_m/portrait.jpg",
    greeting: "As constelações noturnas revelam fórmulas fascinantes de código e lógica... Observe as estrelas com atenção!"
  },
  {
    id: "char_cat_witch_f",
    name: "Luna, a Mística Lunar",
    role: "Tecelã de Feitiços Lunares",
    category: "witch",
    timeOfDay: "night", // Aparece apenas à noite
    avatarConfig: MASTER_NPC_CONFIGS.char_cat_witch_f,
    portrait: "assets/characters/char_cat_witch_f/portrait.jpg",
    greeting: "Hihi! A lua cheia é a melhor conselheira para quem busca inspiração nos feitiços da ilha!"
  }
];

export const VILLAGE_NPCS = [
  {
    id: "npc_monkey_builder",
    name: "Bambu, o Engenheiro",
    role: "Mestre Construtor, Mobília & Casas",
    category: "furniture",
    avatarConfig: MASTER_NPC_CONFIGS.npc_monkey_builder,
    portrait: "assets/characters/char_wolf_hunter_m/portrait.jpg",
    questIds: [
      'bambu_01_chair',
      'bambu_02_table',
      'bambu_03_straw_bed',
      'bambu_04_canopy_bed',
      'bambu_05_tent',
      'bambu_06_cottage'
    ],
    greeting: "Opa, e aí, parceiro! Sou o Bambu, o engenheiro deste pedaço de paraíso! Quer mobiliar sua cabana e erguer casas na ilha? Tenho novos projetos prontos para você programar!",
    masterDialogue: "Caramba, você é um verdadeiro arquiteto mestre! Todas as minhas receitas de mobílias, tendas e casas estão liberadas na sua bancada!"
  },
  {
    id: "npc_bull_blacksmith",
    name: "Brutus da Bigorna",
    role: "Ferreiro Real, Ferramentas & Minérios",
    category: "tools",
    avatarConfig: MASTER_NPC_CONFIGS.npc_bull_blacksmith,
    portrait: "assets/characters/char_wolf_hunter_f/portrait.jpg",
    questIds: [
      'brutus_01_shovel',
      'brutus_02_axe',
      'brutus_03_pickaxe',
      'brutus_04_boulder'
    ],
    greeting: "Humpf! Chegue mais perto da forja se aguenta o calor! Sou Brutus. Aqui as ferramentas só obedecem a quem sabe calcular as proporções exatas no código!",
    masterDialogue: "Pelos chifres ancestrais! Suas ferramentas de ferro cortam, cavam e quebram tudo na ilha! Todas as forjas e veios de minério estão liberados!"
  },
  {
    id: "npc_rabbit_farmer",
    name: "Flora dos Brotos",
    role: "Herbalista, Sementes & Flora da Ilha",
    category: "nature",
    avatarConfig: MASTER_NPC_CONFIGS.npc_rabbit_farmer,
    portrait: "assets/characters/char_eagle_archer_f/portrait.jpg",
    questIds: [
      'flora_01_watering_can',
      'flora_02_wheat',
      'flora_03_berry_bush',
      'flora_04_oak_tree',
      'flora_05_pine_tree'
    ],
    greeting: "Olá, docinho de cenoura! Eu sou a Flora. Cuido dos brotos mágicos, árvores nobres e flores da ilha! Venha aprender como fazer a natureza florescer com scripts Lua!",
    masterDialogue: "Que jardim encantado você criou! Agora você pode cultivar trigos, arbustos frutíferos, carvalhos e pinheiros por toda a ilha!"
  },
  {
    id: "npc_alligator_ferryman",
    name: "Barnabé, o Barqueiro",
    role: "Cercados, Portões & Pontes de Travessia",
    category: "structures",
    avatarConfig: MASTER_NPC_CONFIGS.npc_alligator_ferryman,
    portrait: "assets/characters/char_bat_vampire_m/portrait.jpg",
    questIds: [
      'barnabe_01_fence',
      'barnabe_02_gate',
      'barnabe_03_bridge_h',
      'barnabe_04_bridge_v'
    ],
    greeting: "Ora, ora... Bem-vindo ao canal. Sou Barnabé. Conheço cada curva de rio desta ilha. Vamos conectar os caminhos e erguer pontes seguras com seu código!",
    masterDialogue: "Excelente trabalho de engenharia! Nossos rios e vilas estão perfeitamente conectados com pontes de madeira e cercados modulares!"
  },
  {
    id: "npc_penguin_angler",
    name: "Pingo dos Icebergs",
    role: "Pesca, Redes & Elementos Aquáticos",
    category: "animated",
    avatarConfig: MASTER_NPC_CONFIGS.npc_penguin_angler,
    portrait: "assets/characters/char_bat_vampire_f/portrait.jpg",
    questIds: [
      'pingo_01_fishing_rod',
      'pingo_02_bug_net',
      'pingo_03_water_flow',
      'pingo_04_waterfall'
    ],
    greeting: "Brrr... Olá, amigo! Sou o Pingo! Vim dos mares do sul para ensinar você a forjar varas de pesca, redes e a desenhar riachos de água cristalina!",
    masterDialogue: "SPLASH! Os peixes e insetos da ilha estão em festa! Suas varas, redes, rios e cachoeiras dão vida ao nosso arquipélago!"
  },
  {
    id: "npc_chameleon_magician",
    name: "Cromos, o Tecelão de Cores",
    role: "Pisos, Pavimentações & Terrenos",
    category: "ground",
    avatarConfig: MASTER_NPC_CONFIGS.npc_chameleon_magician,
    portrait: "assets/characters/char_cat_mage_m/portrait.jpg",
    questIds: [
      'cromos_01_dirt_track',
      'cromos_02_cobblestone',
      'cromos_03_wood_planks',
      'cromos_04_flower_grass',
      'cromos_05_sand_beach',
      'cromos_06_stone_mosaic'
    ],
    greeting: "Saudações cromáticas! Eu sou Cromos! O chão da ilha é uma tela em branco esperando pelas suas trilhas, paralelepípedos, gramados floridos e mosaicos reais!",
    masterDialogue: "Deslumbrante! Você transformou a Ilha Lua numa obra-prima arquitetônica! Todos os pisos, praias e mosaicos estão à sua disposição!"
  },
  {
    id: "npc_shark_surfer",
    name: "Kai, o Tubarão das Ondas",
    role: "Infraestrutura da Vila, Desníveis & Poços",
    category: "structures",
    avatarConfig: MASTER_NPC_CONFIGS.npc_shark_surfer,
    portrait: "assets/characters/char_eagle_archer_m/portrait.jpg",
    questIds: [
      'kai_01_lantern_post',
      'kai_02_water_well',
      'kai_03_stairs_wood',
      'kai_04_ramp_stone'
    ],
    greeting: "E aí, radical! Sou o Kai! Vamos equipar a vila com postes de iluminação noturna, poços de pedra, escadas e rampas para subir qualquer montanha!",
    masterDialogue: "WOOHOO! A infraestrutura da ilha está de primeira linha! Seus postes, poços, escadas e rampas facilitam a vida de todos os aventureiros!"
  },
  {
    id: "npc_owl_professor",
    name: "Dr. Arquimedes",
    role: "Grão-Mestre da Academia, Fogo & Terminal",
    category: "tools",
    avatarConfig: MASTER_NPC_CONFIGS.npc_owl_professor,
    portrait: "assets/characters/char_cat_witch_f/portrait.jpg",
    questIds: [
      'arquimedes_01_terminal',
      'arquimedes_02_campfire',
      'arquimedes_03_lava'
    ],
    greeting: "Saudações, jovem explorador das estrelas! Eu sou o Dr. Arquimedes. Domine o Grimório Lua, aprenda a controlar o fogo das fogueiras e a lava dos vulcões!",
    masterDialogue: "Extraordinário! A sabedoria dos códigos corre livre em sua mente. O Grimório, as fogueiras e as forças magmáticas obedecem à sua vontade!"
  },
  {
    id: "npc_turtle_elder",
    name: "Mestre Casco",
    role: "Guardião Ancestral, Ovos & Ninhos de Dragão",
    category: "dragons",
    avatarConfig: MASTER_NPC_CONFIGS.npc_turtle_elder,
    portrait: "assets/characters/char_wolf_hunter_m/portrait.jpg",
    questIds: [
      'casco_01_incubator',
      'casco_02_whistle',
      'casco_03_egg_earth',
      'casco_04_egg_tide',
      'casco_05_egg_wind'
    ],
    greeting: "Seja bem-vindo, nobre coração. Eu sou o Mestre Casco. Os dragões da Ilha Lua aguardam seus ninhos acolhedores, apitos sagrados e o despertar de seus ovos elementais!",
    masterDialogue: "Os céus e mares ressoam com a harmonia dos dragões! Você despertou todos os ovos sagrados e construiu ninhos dignos de guardiões lendários!"
  }
];

export const MASTER_SEQUENCE_IDS = [
  'npc_monkey_builder',
  'npc_bull_blacksmith',
  'npc_rabbit_farmer',
  'npc_alligator_ferryman',
  'npc_penguin_angler',
  'npc_chameleon_magician',
  'npc_shark_surfer',
  'npc_owl_professor',
  'npc_turtle_elder'
];

/**
 * Returns true if and only if this NPC has a quest available to be done right now.
 */
export function hasAvailableQuestForNpc(npcId, blocklySystem = null) {
  if (!blocklySystem && typeof window !== 'undefined') {
    blocklySystem = window.gameBlocklySystem;
  }
  if (!blocklySystem) return false;

  const npcData = getNPCData(npcId);
  if (!npcData || !npcData.questIds || npcData.questIds.length === 0) {
    return false;
  }

  const prog = blocklySystem.getNpcProgress(npcId);
  if (!prog || prog.totalCount === 0 || prog.isFinished) {
    return false;
  }

  // Linear progression check for Master NPCs
  const masterIdx = MASTER_SEQUENCE_IDS.indexOf(npcId);
  if (masterIdx > 0) {
    const currentUnfinishedIndex = MASTER_SEQUENCE_IDS.findIndex(mid => {
      const p = blocklySystem.getNpcProgress(mid);
      return !p || !p.isFinished;
    });
    if (currentUnfinishedIndex !== -1 && masterIdx > currentUnfinishedIndex) {
      // Locked behind an earlier master
      return false;
    }
  }

  return true;
}

export const CharacterRegistry = {
  PLAYABLE_HEROES,
  VILLAGE_NPCS,
  SECONDARY_HERO_NPCS,
  MASTER_SEQUENCE_IDS,
  getNPCData,
  hasAvailableQuestForNpc
};

export default CharacterRegistry;
