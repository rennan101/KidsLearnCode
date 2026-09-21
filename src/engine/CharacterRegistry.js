/**
 * Character Registry - KidsLearnCode
 * Gerencia os 8 heróis jogáveis e os 9 NPCs mestres de construção e desafios de código.
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
  {
    id: "npc_monkey_builder",
    name: "Bambu, o Engenheiro",
    role: "Mestre Construtor, Mobília & Casas",
    category: "furniture",
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

export const CharacterRegistry = {
  PLAYABLE_HEROES,
  VILLAGE_NPCS
};

export default CharacterRegistry;
