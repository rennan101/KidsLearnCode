/**
 * Dragon Manager - Sprint 5 Complete System
 * Catálogo dos 10 Dragões Oficiais, 4 Skills Elementais (Teclas 1 a 4),
 * Escalonamento de Alcance por Nível (1 Tile até a Tela Toda),
 * Interação com o Terreno (Destruir Árvores/Pedras, Congelar/Evaporar Água, Poças, Vento),
 * HUD Lateral de Formação (4 Slots), Drag & Drop e Pet Follow/Mount AI.
 */

export const DRAGON_CATALOG = [
  {
    id: 'dragon_fly_zephyr',
    name: 'Zephyra, o Dragão dos Ventos',
    category: 'fly',
    element: 'Ar / Vento',
    color: '#38bdf8',
    secondaryColor: '#fef08a',
    icon: 'Ar',
    fieldMove: 'Voo Livre sobre Penhascos e Rios',
    mountSpeedMultiplier: 1.8,
    socketOffset: { x: 0, y: -18 },
    desc: 'Dragão alado ágil de escamas celestes e asas emplumadas. Permite voar sobre a água.',
    skills: [
      {
        id: 'zephyr_s1',
        name: 'Lâmina de Vento',
        key: '1',
        type: 'attack',
        element: 'wind',
        cooldown: 1.2,
        energyCost: 8,
        baseDamage: 24,
        terrainAction: 'vegetation',
        desc: 'Rajada cortante de vento que destrói vegetação e corta inimigos.'
      },
      {
        id: 'zephyr_s2',
        name: 'Vendaval Propulsor',
        key: '2',
        type: 'terrain',
        element: 'wind',
        cooldown: 3.5,
        energyCost: 18,
        baseDamage: 18,
        knockback: 180,
        terrainAction: 'wind_push',
        desc: 'Cone de vento poderoso que empurra alvos e objetos para trás.'
      },
      {
        id: 'zephyr_s3',
        name: 'Ciclone Devastador',
        key: '3',
        type: 'ultimate',
        element: 'wind',
        cooldown: 8.0,
        energyCost: 40,
        baseDamage: 70,
        knockback: 250,
        terrainAction: 'vegetation_rock_push',
        desc: 'Vórtice colossal que suga, destrói obstáculos e atordoa alvos em grande área.'
      },
      {
        id: 'zephyr_s4',
        name: 'Salto Aéreo',
        key: '4',
        type: 'dodge',
        element: 'wind',
        cooldown: 3.0,
        energyCost: 12,
        invulnDuration: 0.8,
        desc: 'Salto acrobático no ar que garante invulnerabilidade e esquiva rápida.'
      }
    ]
  },
  {
    id: 'dragon_fly_storm',
    name: 'Volt, o Dragão do Trovão',
    category: 'fly',
    element: 'Elétrico',
    color: '#818cf8',
    secondaryColor: '#22d3ee',
    icon: 'Trovão',
    fieldMove: 'Iluminação por Faíscas e Voo Elétrico',
    mountSpeedMultiplier: 1.9,
    socketOffset: { x: 0, y: -18 },
    desc: 'Escamas roxo-índigo com chifrinhos de raio azul. Pisca em velocidade impressionante.',
    skills: [
      {
        id: 'volt_s1',
        name: 'Centelha Rápida',
        key: '1',
        type: 'attack',
        element: 'electric',
        cooldown: 1.0,
        energyCost: 10,
        baseDamage: 28,
        terrainAction: 'electric_shock',
        desc: 'Dardo elétrico veloz de alta chance crítica.'
      },
      {
        id: 'volt_s2',
        name: 'Descarga Terrestre',
        key: '2',
        type: 'terrain',
        element: 'electric',
        cooldown: 3.2,
        energyCost: 20,
        baseDamage: 32,
        terrainAction: 'rock',
        desc: 'Pulso de choque condutivo que fragmenta rochas e pedras frágeis.'
      },
      {
        id: 'volt_s3',
        name: 'Tempestade de Raios',
        key: '3',
        type: 'ultimate',
        element: 'electric',
        cooldown: 7.5,
        energyCost: 45,
        baseDamage: 85,
        terrainAction: 'rock_electric',
        desc: 'Raios múltiplos que caem do céu iluminando a tela e destruindo o solo.'
      },
      {
        id: 'volt_s4',
        name: 'Piscar Relâmpago',
        key: '4',
        type: 'dodge',
        element: 'electric',
        cooldown: 2.8,
        energyCost: 14,
        invulnDuration: 0.75,
        desc: 'Teleporte instantâneo em linha reta com descarga de faíscas protetora.'
      }
    ]
  },
  {
    id: 'dragon_fly_solar',
    name: 'Sol, o Dragão da Aurora',
    category: 'fly',
    element: 'Luz Solar',
    color: '#fbbf24',
    secondaryColor: '#f97316',
    icon: 'Solar',
    fieldMove: 'Acelera Cultivos e Clima Solar',
    mountSpeedMultiplier: 1.75,
    socketOffset: { x: 0, y: -18 },
    desc: 'Crista em leque como raios solares e escamas degradê amarelo e laranja.',
    skills: [
      {
        id: 'solar_s1',
        name: 'Raio da Aurora',
        key: '1',
        type: 'attack',
        element: 'solar',
        cooldown: 1.3,
        energyCost: 9,
        baseDamage: 26,
        terrainAction: 'vegetation',
        desc: 'Feixe de luz solar focado que queima folhagens e ilumina o ambiente.'
      },
      {
        id: 'solar_s2',
        name: 'Onda de Calor',
        key: '2',
        type: 'terrain',
        element: 'solar',
        cooldown: 3.5,
        energyCost: 22,
        baseDamage: 24,
        terrainAction: 'evaporate_water',
        desc: 'Calor intenso que evapora poças e água rasa em terra firme seca.'
      },
      {
        id: 'solar_s3',
        name: 'Supernova Solar',
        key: '3',
        type: 'ultimate',
        element: 'solar',
        cooldown: 8.5,
        energyCost: 48,
        baseDamage: 90,
        terrainAction: 'evaporate_vegetation',
        desc: 'Explosão estelar colossal que cega, queima e evapora toda a água ao redor.'
      },
      {
        id: 'solar_s4',
        name: 'Clarão Protetor',
        key: '4',
        type: 'dodge',
        element: 'solar',
        cooldown: 3.0,
        energyCost: 12,
        invulnDuration: 0.85,
        desc: 'Luz solar ofuscante que concede invulnerabilidade e repele agressores.'
      }
    ]
  },
  {
    id: 'dragon_land_boulder',
    name: 'Terran, o Dragão de Rocha',
    category: 'land',
    element: 'Terra / Rocha',
    color: '#78716c',
    secondaryColor: '#84cc16',
    icon: 'Rocha',
    fieldMove: 'Quebra de Rochas e Mineração Rápida',
    mountSpeedMultiplier: 1.45,
    socketOffset: { x: 0, y: -14 },
    desc: 'Dragão robusto com carapaça de pedra polida e placas de musgo verde no dorso.',
    skills: [
      {
        id: 'terran_s1',
        name: 'Garras de Pedra',
        key: '1',
        type: 'attack',
        element: 'earth',
        cooldown: 1.1,
        energyCost: 7,
        baseDamage: 30,
        terrainAction: 'rock_vegetation',
        desc: 'Golpe pesado de garras de granito que corta troncos e quebra pedras.'
      },
      {
        id: 'terran_s2',
        name: 'Impacto Sísmico',
        key: '2',
        type: 'terrain',
        element: 'earth',
        cooldown: 3.0,
        energyCost: 18,
        baseDamage: 38,
        terrainAction: 'rock',
        desc: 'Esmagamento de solo que destrói rochas, minérios e abre caminhos.'
      },
      {
        id: 'terran_s3',
        name: 'Terremoto Rochoso',
        key: '3',
        type: 'ultimate',
        element: 'earth',
        cooldown: 8.0,
        energyCost: 44,
        baseDamage: 80,
        terrainAction: 'rock_all',
        desc: 'Faz brotar estacas afiadas de rocha do chão em uma vasta onda sísmica.'
      },
      {
        id: 'terran_s4',
        name: 'Carapaça Blindada',
        key: '4',
        type: 'dodge',
        element: 'earth',
        cooldown: 3.0,
        energyCost: 10,
        invulnDuration: 0.9,
        desc: 'Postura defensiva pétrea impenetrável que absorve todo o impacto.'
      }
    ]
  },
  {
    id: 'dragon_land_magma',
    name: 'Ignis, o Dragão de Lava',
    category: 'land',
    element: 'Fogo Vulcânico',
    color: '#ef4444',
    secondaryColor: '#f97316',
    icon: 'Fogo',
    fieldMove: 'Derrete Gelo e Acende Tochas Noturnas',
    mountSpeedMultiplier: 1.6,
    socketOffset: { x: 0, y: -15 },
    desc: 'Obsidiana escura com barriga cor de brasa incandescente e rastro de calor.',
    skills: [
      {
        id: 'ignis_s1',
        name: 'Presas de Brasa',
        key: '1',
        type: 'attack',
        element: 'fire',
        cooldown: 1.2,
        energyCost: 9,
        baseDamage: 28,
        terrainAction: 'vegetation',
        desc: 'Mordida incandescente que incendeia árvores e folhagens transformando-as em cinzas.'
      },
      {
        id: 'ignis_s2',
        name: 'Bafo de Magma',
        key: '2',
        type: 'terrain',
        element: 'fire',
        cooldown: 3.4,
        energyCost: 22,
        baseDamage: 36,
        terrainAction: 'evaporate_rock_vegetation',
        desc: 'Jato de lava derretida que evapora água, quebra rochas e incendeia obstáculos.'
      },
      {
        id: 'ignis_s3',
        name: 'Erupção Vulcânica',
        key: '3',
        type: 'ultimate',
        element: 'fire',
        cooldown: 8.2,
        energyCost: 50,
        baseDamage: 95,
        terrainAction: 'fire_all',
        desc: 'Pilares gigantes de fogo vulcânico e magma cobrindo o campo de batalha.'
      },
      {
        id: 'ignis_s4',
        name: 'Explosão de Cinzas',
        key: '4',
        type: 'dodge',
        element: 'fire',
        cooldown: 2.9,
        energyCost: 12,
        invulnDuration: 0.8,
        desc: 'Nuvem de fumaça preta e brasas com salto evasivo para trás.'
      }
    ]
  },
  {
    id: 'dragon_land_forest',
    name: 'Sylva, a Guardiã da Floresta',
    category: 'land',
    element: 'Natureza',
    color: '#10b981',
    secondaryColor: '#f472b6',
    icon: 'Flora',
    fieldMove: 'Germina Flores e Aumenta Colheita',
    mountSpeedMultiplier: 1.5,
    socketOffset: { x: 0, y: -14 },
    desc: 'Escamas verde-menta com chifrinhos de galho floridos e cauda de samambaia.',
    skills: [
      {
        id: 'sylva_s1',
        name: 'Chicote de Cipó',
        key: '1',
        type: 'attack',
        element: 'nature',
        cooldown: 1.0,
        energyCost: 8,
        baseDamage: 25,
        terrainAction: 'vegetation',
        desc: 'Chicote de espinhos vegetais que poda arbustos e atinge alvos com precisão.'
      },
      {
        id: 'sylva_s2',
        name: 'Raízes Vivas',
        key: '2',
        type: 'terrain',
        element: 'nature',
        cooldown: 3.3,
        energyCost: 20,
        baseDamage: 26,
        terrainAction: 'nature_root',
        desc: 'Brota raízes do solo que imobilizam inimigos e colhem recursos florestais.'
      },
      {
        id: 'sylva_s3',
        name: 'Fúria da Floresta',
        key: '3',
        type: 'ultimate',
        element: 'nature',
        cooldown: 7.8,
        energyCost: 42,
        baseDamage: 78,
        terrainAction: 'nature_all',
        desc: 'Tormenta de pétalas afiadas e vinhas gigantes em área expansível.'
      },
      {
        id: 'sylva_s4',
        name: 'Manto de Folhas',
        key: '4',
        type: 'dodge',
        element: 'nature',
        cooldown: 2.8,
        energyCost: 10,
        invulnDuration: 0.8,
        desc: 'Giro evasivo que deixa um toco ilusório e camufla com folhas caindo.'
      }
    ]
  },
  {
    id: 'dragon_water_coral',
    name: 'Coralis, a Serpente dos Recifes',
    category: 'water',
    element: 'Água Marinha',
    color: '#06b6d4',
    secondaryColor: '#f43f5e',
    icon: 'Oceano',
    fieldMove: 'Navegação em Águas Profundas e Pesca',
    mountSpeedMultiplier: 1.7,
    socketOffset: { x: 0, y: -12 },
    desc: 'Corpo serpentino azul-turquesa com barbatanas de coral rosa-pastel.',
    skills: [
      {
        id: 'coralis_s1',
        name: 'Jato de Bolhas',
        key: '1',
        type: 'attack',
        element: 'water',
        cooldown: 1.1,
        energyCost: 8,
        baseDamage: 24,
        terrainAction: 'water_splash',
        desc: 'Disparo veloz de esferas d\'água pressurizadas.'
      },
      {
        id: 'coralis_s2',
        name: 'Torrente dos Recifes',
        key: '2',
        type: 'terrain',
        element: 'water',
        cooldown: 3.2,
        energyCost: 18,
        baseDamage: 28,
        terrainAction: 'create_puddle',
        desc: 'Enxurrada marinha que molha o solo criando poças transitáveis com reflexos.'
      },
      {
        id: 'coralis_s3',
        name: 'Maelstrom Oceânico',
        key: '3',
        type: 'ultimate',
        element: 'water',
        cooldown: 8.0,
        energyCost: 46,
        baseDamage: 82,
        terrainAction: 'puddle_water_all',
        desc: 'Turbilhão de água gigante que suga alvos e inunda a área ao redor.'
      },
      {
        id: 'coralis_s4',
        name: 'Mergulho Rápido',
        key: '4',
        type: 'dodge',
        element: 'water',
        cooldown: 2.9,
        energyCost: 12,
        invulnDuration: 0.85,
        desc: 'Submerge no solo ou água deixando um splash e reaparecendo com segurança.'
      }
    ]
  },
  {
    id: 'dragon_water_frost',
    name: 'Glacius, o Dragão dos Icebergs',
    category: 'water',
    element: 'Gelo Glacial',
    color: '#bae6fd',
    secondaryColor: '#38bdf8',
    icon: 'Gelo',
    fieldMove: 'Congela a Água Criando Pontes de Gelo',
    mountSpeedMultiplier: 1.65,
    socketOffset: { x: 0, y: -14 },
    desc: 'Escamas brancas como neve com espinhos de cristal de gelo translúcidos.',
    skills: [
      {
        id: 'glacius_s1',
        name: 'Lança de Gelo',
        key: '1',
        type: 'attack',
        element: 'ice',
        cooldown: 1.2,
        energyCost: 9,
        baseDamage: 27,
        terrainAction: 'frost',
        desc: 'Estalactite afiada de gelo que perfura alvos causando lentidão.'
      },
      {
        id: 'glacius_s2',
        name: 'Sopro Congelante',
        key: '2',
        type: 'terrain',
        element: 'ice',
        cooldown: 3.5,
        energyCost: 20,
        baseDamage: 25,
        terrainAction: 'freeze_water',
        desc: 'Jato glacial que congela a água criando pontes sólidas de gelo para caminhar.'
      },
      {
        id: 'glacius_s3',
        name: 'Nevasca Absoluta',
        key: '3',
        type: 'ultimate',
        element: 'ice',
        cooldown: 8.5,
        energyCost: 48,
        baseDamage: 88,
        terrainAction: 'freeze_all',
        desc: 'Nevasca glacial que congela toda a água visível e paralisa alvos na tela.'
      },
      {
        id: 'glacius_s4',
        name: 'Escudo Glacial',
        key: '4',
        type: 'dodge',
        element: 'ice',
        cooldown: 3.0,
        energyCost: 14,
        invulnDuration: 0.9,
        desc: 'Barreira protetora de cristais de gelo que estilhaça ao esquivar.'
      }
    ]
  },
  {
    id: 'dragon_water_abyss',
    name: 'Nox, o Dragão Abissal',
    category: 'water',
    element: 'Sombra Abissal',
    color: '#312e81',
    secondaryColor: '#06b6d4',
    icon: 'Abismo',
    fieldMove: 'Visão Noturna no Fundo do Mar e Baús Ocultos',
    mountSpeedMultiplier: 1.6,
    socketOffset: { x: 0, y: -14 },
    desc: 'Azul-marinho escuro com pintas neon ciano brilhantes e lanterninha luminescente.',
    skills: [
      {
        id: 'nox_s1',
        name: 'Orbe da Penumbra',
        key: '1',
        type: 'attack',
        element: 'shadow',
        cooldown: 1.1,
        energyCost: 9,
        baseDamage: 27,
        terrainAction: 'shadow',
        desc: 'Esfera concentrada de sombra abissal que drena energia do alvo.'
      },
      {
        id: 'nox_s2',
        name: 'Maré Negra',
        key: '2',
        type: 'terrain',
        element: 'shadow',
        cooldown: 3.4,
        energyCost: 20,
        baseDamage: 30,
        terrainAction: 'create_puddle',
        desc: 'Onda de água escura abissal que apaga tochas e umedece o terreno.'
      },
      {
        id: 'nox_s3',
        name: 'Chamado das Profundezas',
        key: '3',
        type: 'ultimate',
        element: 'shadow',
        cooldown: 8.2,
        energyCost: 46,
        baseDamage: 86,
        terrainAction: 'shadow_all',
        desc: 'Tentáculos sombrios que emergem do solo em grande área devorando a luz.'
      },
      {
        id: 'nox_s4',
        name: 'Névoa Bioluminescente',
        key: '4',
        type: 'dodge',
        element: 'shadow',
        cooldown: 2.8,
        energyCost: 12,
        invulnDuration: 0.8,
        desc: 'Dispersão de tinta abissal neon com esquiva invisível momentânea.'
      }
    ]
  },
  {
    id: 'dragon_mythic_lua',
    name: 'Astra, o Dragão Guardião da Lua',
    category: 'mythic',
    element: 'Arcano / Estelar',
    color: '#e0e7ff',
    secondaryColor: '#fbbf24',
    icon: 'Lua',
    fieldMove: 'Voo Supremo, Travessia Terrestre e Aquática',
    mountSpeedMultiplier: 2.1,
    socketOffset: { x: 0, y: -20 },
    desc: 'O dragão sagrado da Ilha Lua. Escamas prateadas, chifres de lua crescente e runas amarelas.',
    skills: [
      {
        id: 'astra_s1',
        name: 'Feixe Estelar',
        key: '1',
        type: 'attack',
        element: 'stellar',
        cooldown: 1.0,
        energyCost: 10,
        baseDamage: 34,
        terrainAction: 'stellar',
        desc: 'Raio de energia cósmica lunar que desintegra obstáculos.'
      },
      {
        id: 'astra_s2',
        name: 'Eclipse Elemental',
        key: '2',
        type: 'terrain',
        element: 'stellar',
        cooldown: 3.2,
        energyCost: 24,
        baseDamage: 38,
        terrainAction: 'evaporate_freeze_push',
        desc: 'Harmoniza os elementos em um pulso que transforma terrenos ao redor.'
      },
      {
        id: 'astra_s3',
        name: 'Meteoro Lunar',
        key: '3',
        type: 'ultimate',
        element: 'stellar',
        cooldown: 9.0,
        energyCost: 55,
        baseDamage: 110,
        terrainAction: 'stellar_all',
        desc: 'Invoca um meteoro de cristal colossal que impacta a tela toda em explosão estelar.'
      },
      {
        id: 'astra_s4',
        name: 'Dobra Temporal',
        key: '4',
        type: 'dodge',
        element: 'stellar',
        cooldown: 3.2,
        energyCost: 16,
        invulnDuration: 1.2,
        desc: 'Dobra a gravidade e o tempo, desacelerando o mundo ao redor durante a esquiva.'
      }
    ]
  }
];

export class DragonManager {
  constructor() {
    this.dragonCatalog = DRAGON_CATALOG;

    // Player Bag B (Party up to 6 dragons)
    this.dragonParty = [
      {
        ...this.dragonCatalog[0], // Zephyra
        level: 5,
        xp: 120,
        maxXp: 300,
        hp: 120,
        maxHp: 120,
        energy: 100,
        maxEnergy: 100,
        bond: 85,
        status: 'ready'
      },
      {
        ...this.dragonCatalog[3], // Terran
        level: 4,
        xp: 80,
        maxXp: 250,
        hp: 150,
        maxHp: 150,
        energy: 90,
        maxEnergy: 100,
        bond: 70,
        status: 'ready'
      }
    ];

    // 4-Slot Battle Formation (Slots 0, 1, 2, 3)
    this.activeFormation = [
      'dragon_fly_zephyr',
      'dragon_land_boulder',
      null,
      null
    ];

    // Active state: companion (follows player) or mount (player rides)
    this.activeDragonId = 'dragon_fly_zephyr';
    this.mode = 'follow'; // 'follow', 'mounted', 'none'
    
    // Skill Cooldown Timers for Slots [1], [2], [3], [4]
    this.skillCooldowns = [0, 0, 0, 0];

    // Pet Follow Position and Physics
    this.x = 320;
    this.y = 320;
    this.targetX = 320;
    this.targetY = 320;
    this.direction = 'south';
    this.floatTimer = 0;
    this.state = 'idle'; // 'idle', 'follow', 'mounted', 'combat', 'dodge', 'field_move'

    // Flight Altitude System (Q: Descend/Land, E: Ascend/Fly higher)
    this.flightAltitude = 0; // Current altitude in pixels (0 to 120)
    this.targetFlightAltitude = 0; // Target altitude
    this.maxFlightAltitude = 120; // Max flight height

    // Tactical Dodge State
    this.isDodging = false;
    this.dodgeDuration = 0.8;
    this.dodgeTimer = 0;
    this.dodgeCooldown = 3.0;
    this.dodgeCooldownTimer = 0;

    // Combat Entities & Particle Systems
    this.combatParticles = [];
    this.damageNumbers = [];
    this.combatCooldown = 0;

    // Training Targets in World (placed dynamically by ADM in Edit Mode)
    this.trainingTargets = [];

    // Wild Dragon Nests in World (placed dynamically by ADM in Edit Mode)
    this.wildNests = [];

    // Autonomous Wild Dragons FSM Map (placed by ADM in Edit Mode)
    this.wildDragons = new Map();
  }

  // Formation Management Methods (4 Slots)
  getFormation() {
    return this.activeFormation.map((id, index) => {
      if (!id) return null;
      return this.dragonParty.find(d => d.id === id) || null;
    });
  }

  setFormationSlot(slotIndex, dragonId) {
    if (slotIndex < 0 || slotIndex >= 4) return false;
    // Check if dragon exists in party
    if (dragonId !== null && !this.dragonParty.some(d => d.id === dragonId)) {
      return false;
    }
    // Remove if duplicate in another slot
    if (dragonId !== null) {
      for (let i = 0; i < 4; i++) {
        if (i !== slotIndex && this.activeFormation[i] === dragonId) {
          this.activeFormation[i] = null;
        }
      }
    }
    this.activeFormation[slotIndex] = dragonId;
    return true;
  }

  swapFormation(fromIndex, toIndex) {
    if (fromIndex < 0 || fromIndex >= 4 || toIndex < 0 || toIndex >= 4) return false;
    const temp = this.activeFormation[fromIndex];
    this.activeFormation[fromIndex] = this.activeFormation[toIndex];
    this.activeFormation[toIndex] = temp;
    return true;
  }

  switchActiveDragonFromSlot(slotIndex) {
    if (slotIndex < 0 || slotIndex >= 4) return { success: false, reason: 'Slot inválido!' };
    const targetId = this.activeFormation[slotIndex];
    if (!targetId) return { success: false, reason: 'Nenhum dragão neste slot da formação!' };
    
    if (this.activeDragonId === targetId) {
      return { success: true, alreadyActive: true, dragon: this.getActiveDragon() };
    }

    const dragon = this.dragonParty.find(d => d.id === targetId);
    if (!dragon) return { success: false, reason: 'Dragão não encontrado!' };

    // Spawn summoning magical poof particle FX
    this.spawnSummonParticles(this.x, this.y, dragon);

    this.activeDragonId = targetId;
    return { success: true, switched: true, dragon };
  }

  getParty() {
    return this.dragonParty;
  }

  getActiveDragon() {
    return this.dragonParty.find(d => d.id === this.activeDragonId) || this.dragonParty[0] || null;
  }

  setActiveDragon(dragonId) {
    const dragon = this.dragonParty.find(d => d.id === dragonId);
    if (dragon) {
      this.activeDragonId = dragon.id;
      return { success: true, dragon };
    }
    return { success: false, reason: 'Dragão não encontrado na Bag B!' };
  }

  setMode(mode) {
    if (['follow', 'mounted', 'none'].includes(mode)) {
      this.mode = mode;
      return true;
    }
    return false;
  }

  isMounted() {
    return this.mode === 'mounted';
  }

  isFollowing() {
    return this.mode === 'follow';
  }

  canActiveDragonFly() {
    const active = this.getActiveDragon();
    // Apenas dragões voadores ('fly') e míticos ('mythic') possuem asas e capacidade de voo.
    // Dragões terrestres ('land') e aquáticos ('water') não podem voar.
    return !!(active && (active.category === 'fly' || active.category === 'mythic'));
  }

  ascendFlight(amount = 25) {
    if (!this.canActiveDragonFly() || this.mode !== 'mounted') return false;
    this.targetFlightAltitude = Math.min(this.maxFlightAltitude, this.targetFlightAltitude + amount);
    return true;
  }

  descendFlight(amount = 25) {
    if (!this.canActiveDragonFly() || this.mode !== 'mounted') return false;
    this.targetFlightAltitude = Math.max(0, this.targetFlightAltitude - amount);
    return true;
  }

  toggleMount() {
    const active = this.getActiveDragon();
    if (!active) return { success: false, reason: 'Nenhum dragão ativo selecionado!' };

    if (this.mode === 'mounted') {
      this.mode = 'follow';
      this.targetFlightAltitude = 0;
      this.flightAltitude = 0;
      return { success: true, mounted: false, dragon: active };
    } else {
      this.mode = 'mounted';
      return { success: true, mounted: true, dragon: active };
    }
  }

  // Calculate Level-Scaled AoE Affected Tiles (Lv 1 = 1 tile frontal -> Lv 80+ = screen-wide AoE)
  calculateSkillAoETiles(dragon, slotIndex, player) {
    const level = dragon.level || 1;
    const px = player ? (player.x + 32) : (this.x + 32);
    const py = player ? (player.y + 32) : (this.y + 32);
    const dir = player ? player.direction : 'south';
    const tileSize = 64;

    let fwdX = 0, fwdY = 1;
    let rightX = 1, rightY = 0;
    if (dir === 'north') { fwdX = 0; fwdY = -1; rightX = 1; rightY = 0; }
    else if (dir === 'south') { fwdX = 0; fwdY = 1; rightX = 1; rightY = 0; }
    else if (dir === 'east') { fwdX = 1; fwdY = 0; rightX = 0; rightY = 1; }
    else if (dir === 'west') { fwdX = -1; fwdY = 0; rightX = 0; rightY = 1; }

    const tiles = [];
    const isUltimate = (slotIndex === 2);
    const isTerrain = (slotIndex === 1);

    if (level <= 4) {
      // Lv 1-4: Exactly 1 tile in front (64px)
      tiles.push({ x: px + fwdX * tileSize, y: py + fwdY * tileSize });
    } else if (level <= 14) {
      // Lv 5-14: 2 to 3 tiles in front / narrow line
      const reach = isUltimate ? 3 : 2;
      for (let r = 1; r <= reach; r++) {
        tiles.push({ x: px + fwdX * (r * tileSize), y: py + fwdY * (r * tileSize) });
      }
      if (isUltimate || isTerrain) {
        tiles.push({ x: px + fwdX * tileSize + rightX * tileSize, y: py + fwdY * tileSize + rightY * tileSize });
        tiles.push({ x: px + fwdX * tileSize - rightX * tileSize, y: py + fwdY * tileSize - rightY * tileSize });
      }
    } else if (level <= 39) {
      // Lv 15-39: 4 to 6 tiles AoE
      const reach = isUltimate ? 5 : 3;
      for (let r = 1; r <= reach; r++) {
        tiles.push({ x: px + fwdX * (r * tileSize), y: py + fwdY * (r * tileSize) });
        tiles.push({ x: px + fwdX * (r * tileSize) + rightX * tileSize, y: py + fwdY * (r * tileSize) + rightY * tileSize });
        tiles.push({ x: px + fwdX * (r * tileSize) - rightX * tileSize, y: py + fwdY * (r * tileSize) - rightY * tileSize });
      }
    } else if (level <= 79) {
      // Lv 40-79: 8 to 12 tiles AoE
      const reach = isUltimate ? 8 : 5;
      const width = isUltimate ? 3 : 2;
      for (let r = 1; r <= reach; r++) {
        for (let w = -width; w <= width; w++) {
          tiles.push({ x: px + fwdX * (r * tileSize) + rightX * (w * tileSize), y: py + fwdY * (r * tileSize) + rightY * (w * tileSize) });
        }
      }
    } else {
      // Lv 80-100: Mega AoE / Full Screen (15+ tiles radius)
      const radius = isUltimate ? 9 : 6;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (Math.hypot(dx, dy) <= radius) {
            tiles.push({ x: px + dx * tileSize, y: py + dy * tileSize });
          }
        }
      }
    }
    return tiles;
  }

  getAoEDescription(dragon) {
    const level = dragon?.level || 1;
    if (level <= 4) return '1 Tile Frontal';
    if (level <= 14) return '2-3 Tiles';
    if (level <= 39) return '4-6 Tiles';
    if (level <= 79) return '8-12 Tiles';
    return 'Tela Toda (Mega AoE)';
  }

  // 4 Skills Combat & Field System (Keys 1 to 4)
  castSkill(slotIndex, player, tileMap, camera = null) {
    const dragon = this.getActiveDragon();
    if (!dragon) return { success: false, reason: 'Nenhum dragão ativo selecionado!' };

    // Skills can ONLY be cast when mounted or in combat
    const canCast = (this.mode === 'mounted') || (this.state === 'combat');
    if (!canCast) {
      return { 
        success: false, 
        reason: 'Habilidades só podem ser utilizadas em montaria [R] ou em batalha!' 
      };
    }

    if (slotIndex < 0 || slotIndex >= 4) {
      return { success: false, reason: 'Slot de habilidade inválido!' };
    }

    const skills = dragon.skills || DRAGON_CATALOG.find(d => d.id === dragon.id)?.skills || [];
    const skill = skills[slotIndex];
    if (!skill) {
      return { success: false, reason: 'Habilidade não disponível!' };
    }

    // Cooldown check
    if (this.skillCooldowns[slotIndex] > 0) {
      return { 
        success: false, 
        reason: `${skill.name} em recarga! (${this.skillCooldowns[slotIndex].toFixed(1)}s)` 
      };
    }

    // Energy check
    if (dragon.energy < (skill.energyCost || 0)) {
      return { success: false, reason: 'Energia insuficiente!' };
    }

    // Deduct energy & set cooldown
    dragon.energy = Math.max(0, dragon.energy - (skill.energyCost || 0));
    this.skillCooldowns[slotIndex] = skill.cooldown || 2.0;

    const level = dragon.level || 1;
    const px = player ? (player.x + 32) : (this.x + 32);
    const py = player ? (player.y + 32) : (this.y + 32);

    // Slot 4 (index 3): Universal Tactical Dodge
    if (skill.type === 'dodge' || slotIndex === 3) {
      this.isDodging = true;
      this.dodgeTimer = skill.invulnDuration || 0.8;
      this.spawnDodgeParticles(this.x, this.y, dragon);
      if (camera && dragon.level >= 20) {
        camera.shake(0.15, 3);
      }
      return {
        success: true,
        isDodge: true,
        skill,
        message: `Esquiva Tática! ${skill.name}`
      };
    }

    // Slots 1, 2, 3: Calculate Level-Scaled AoE Tiles
    const affectedTiles = this.calculateSkillAoETiles(dragon, slotIndex, player);

    // 1. Terrain Interaction on affected tiles
    if (tileMap) {
      for (const tile of affectedTiles) {
        const action = skill.terrainAction || '';
        if (action.includes('vegetation') || action.includes('fire_all') || action.includes('nature_all') || action.includes('rock_vegetation')) {
          tileMap.destroyVegetationAt(tile.x, tile.y, 40);
        }
        if (action.includes('rock') || action.includes('earth') || action.includes('fire_all') || action.includes('stellar_all')) {
          tileMap.destroyRockAt(tile.x, tile.y, 40);
        }
        if (action.includes('evaporate') || action.includes('fire') || action.includes('solar')) {
          tileMap.evaporateWaterAt(tile.x, tile.y, 40);
        }
        if (action.includes('freeze') || action.includes('ice') || action.includes('frost')) {
          tileMap.freezeWaterAt(tile.x, tile.y, 40, 10 + Math.min(15, level * 0.2));
        }
        if (action.includes('puddle') || action.includes('create_puddle') || action.includes('water')) {
          tileMap.createPuddleAt(tile.x, tile.y, 40, 14);
        }
      }
    }

    // 2. Damage & Combat Hit on Targets and Hostile / Wild Dragons
    const baseDmg = skill.baseDamage || 25;
    const finalDamage = Math.floor(baseDmg * (1 + (level - 1) * 0.22));

    const dir = player ? player.direction : 'south';
    let kx = 0, ky = 1;
    if (dir === 'north') { kx = 0; ky = -1; }
    else if (dir === 'south') { kx = 0; ky = 1; }
    else if (dir === 'east') { kx = 1; ky = 0; }
    else if (dir === 'west') { kx = -1; ky = 0; }

    const knockbackDist = skill.knockback || (level >= 80 ? 180 : (level >= 20 ? 80 : 30));

    // Check training targets in AoE
    for (const target of this.trainingTargets) {
      if (target.hp <= 0) continue;
      for (const tile of affectedTiles) {
        if (Math.hypot(target.x + 20 - tile.x, target.y + 20 - tile.y) < 48) {
          target.hp = Math.max(0, target.hp - finalDamage);
          target.hitTimer = 0.35;
          target.isAggro = true;
          target.x += kx * knockbackDist * 0.5;
          target.y += ky * knockbackDist * 0.5;

          this.damageNumbers.push({
            x: target.x + 16,
            y: target.y - 12,
            text: `-${finalDamage}`,
            color: dragon.color || '#f59e0b',
            alpha: 1.0,
            life: 0,
            maxLife: 1.0
          });
          break;
        }
      }
    }

    // Check wild dragons in AoE (Push & Battle Reaction)
    for (const wild of this.wildDragons.values()) {
      for (const tile of affectedTiles) {
        if (Math.hypot(wild.x + 32 - tile.x, wild.y + 32 - tile.y) < 54) {
          wild.x += kx * knockbackDist;
          wild.y += ky * knockbackDist;
          wild.fsmState = 'curious';
          wild.stateTimer = 2.0;
          wild.emote = { type: 'curious', timer: 1.8 };

          this.damageNumbers.push({
            x: wild.x + 32,
            y: wild.y - 14,
            text: `HIT! -${finalDamage}`,
            color: dragon.color || '#38bdf8',
            alpha: 1.0,
            life: 0,
            maxLife: 1.0
          });
          break;
        }
      }
    }

    // 3. Spawn Visual FX Particles for Skill Element & Level
    this.spawnSkillParticles(px, py, skill.element, skill.type, level, affectedTiles);

    // 4. Camera Screen Shake
    if (camera) {
      const shakeIntensity = (level >= 80 ? 12 : (level >= 40 ? 7 : (level >= 15 ? 4 : 2)));
      const shakeDuration = (level >= 80 ? 0.45 : 0.25);
      camera.shake(shakeDuration, shakeIntensity);
    }

    return {
      success: true,
      skill,
      affectedTilesCount: affectedTiles.length,
      message: `${dragon.name} usou ${skill.name}!`
    };
  }

  spawnSummonParticles(x, y, dragon) {
    for (let i = 0; i < 24; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 100;
      this.combatParticles.push({
        x: x + 24,
        y: y + 24,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: i % 2 === 0 ? '#19c8b9' : (dragon?.color || '#fef08a'),
        size: 5 + Math.random() * 6,
        life: 0,
        maxLife: 0.7,
        alpha: 1.0,
        type: 'summon'
      });
    }
  }

  spawnSkillParticles(fromX, fromY, element, skillType, level, affectedTiles) {
    const isUltra = level >= 80;
    const count = isUltra ? 45 : (level >= 20 ? 28 : 14);

    for (const tile of affectedTiles) {
      const perTileCount = Math.max(1, Math.min(6, Math.ceil(count / affectedTiles.length)));
      for (let i = 0; i < perTileCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 30 + Math.random() * 120;
        let pColor = '#38bdf8';
        if (element === 'fire') pColor = i % 2 === 0 ? '#ef4444' : '#f97316';
        else if (element === 'ice') pColor = i % 2 === 0 ? '#bae6fd' : '#38bdf8';
        else if (element === 'electric') pColor = i % 2 === 0 ? '#fef08a' : '#818cf8';
        else if (element === 'earth') pColor = i % 2 === 0 ? '#78716c' : '#84cc16';
        else if (element === 'nature') pColor = i % 2 === 0 ? '#10b981' : '#f472b6';
        else if (element === 'water') pColor = i % 2 === 0 ? '#06b6d4' : '#67e8f9';
        else if (element === 'solar') pColor = i % 2 === 0 ? '#fbbf24' : '#f97316';
        else if (element === 'shadow') pColor = i % 2 === 0 ? '#312e81' : '#06b6d4';
        else if (element === 'stellar') pColor = i % 2 === 0 ? '#e0e7ff' : '#fbbf24';

        this.combatParticles.push({
          x: tile.x + (Math.random() - 0.5) * 32,
          y: tile.y + (Math.random() - 0.5) * 32,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: pColor,
          size: (isUltra ? 6 : 4) + Math.random() * (isUltra ? 6 : 4),
          life: 0,
          maxLife: 0.5 + Math.random() * 0.4,
          alpha: 1.0,
          type: element || 'generic'
        });
      }
    }
  }

  spawnDodgeParticles(x, y, dragon) {
    for (let i = 0; i < 18; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 120;
      this.combatParticles.push({
        x: x + 24,
        y: y + 24,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: i % 2 === 0 ? dragon.color : dragon.secondaryColor,
        size: 4 + Math.random() * 6,
        life: 0,
        maxLife: 0.6 + Math.random() * 0.3,
        alpha: 1.0,
        type: 'dodge'
      });
    }
  }

  // Dragon Egg Nest Interaction (Warmth & Hatching)
  interactWithNest(nestId, nestData = null) {
    let nest = this.wildNests.find(n => n.id === nestId);
    if (!nest && nestData) {
      nest = {
        id: nestId,
        name: nestData.name || 'Ninho de Dragão',
        eggType: nestData.eggType || 'dragon_fly_solar',
        eggName: nestData.eggName || 'Ovo de Dragão',
        eggIcon: nestData.eggIcon || 'solar',
        warmthProgress: 0,
        hatched: false
      };
      this.wildNests.push(nest);
    }
    if (!nest) return { success: false, reason: 'Ninho não encontrado.' };

    if (nest.hatched) {
      return { success: false, reason: 'Este ninho já foi chocado!' };
    }

    nest.warmthProgress = Math.min(100, nest.warmthProgress + 34);

    if (nest.warmthProgress >= 100) {
      nest.hatched = true;
      const speciesData = this.dragonCatalog.find(d => d.id === nest.eggType) || this.dragonCatalog[0];
      return {
        success: true,
        hatched: true,
        speciesData,
        message: `O ${nest.eggName} chocou! Um adorável ${speciesData.name} nasceu!`
      };
    }

    return {
      success: true,
      hatched: false,
      progress: nest.warmthProgress,
      message: `Você aqueceu o ${nest.eggName}! Incubação: ${nest.warmthProgress}%`
    };
  }

  adoptHatchedDragon(speciesId) {
    const species = this.dragonCatalog.find(d => d.id === speciesId);
    if (!species) return false;

    if (this.dragonParty.length >= 6) {
      return { success: false, reason: 'Mochila de Dragões cheia! (Máximo 6)' };
    }

    const newDragon = {
      ...species,
      level: 1,
      xp: 0,
      maxXp: 100,
      hp: 80,
      maxHp: 80,
      energy: 100,
      maxEnergy: 100,
      bond: 50,
      status: 'ready'
    };

    this.dragonParty.push(newDragon);
    this.setActiveDragon(newDragon.id);

    return { success: true, dragon: newDragon };
  }

  recruitWildDragon(speciesData, level = 1) {
    if (!speciesData) return { success: false, reason: 'Dragão inválido' };
    const species = this.dragonCatalog.find(d => d.id === speciesData.id) || speciesData;

    if (this.dragonParty.length >= 6) {
      return { success: false, reason: 'Sua Bolsa de Dragões está cheia! (Máximo 6)' };
    }

    const lvl = Math.max(1, parseInt(level, 10) || 1);
    const calculatedHp = 80 + (lvl - 1) * 20;

    const newDragon = {
      ...species,
      level: lvl,
      xp: 0,
      maxXp: Math.round(100 * Math.pow(1.3, lvl - 1)),
      hp: calculatedHp,
      maxHp: calculatedHp,
      energy: 100,
      maxEnergy: 100,
      bond: 60,
      status: 'ready'
    };

    this.dragonParty.push(newDragon);
    this.setActiveDragon(newDragon.id);
    return { success: true, dragon: newDragon };
  }

  // Update Game Loop AI & Combat Logic
  update(deltaTime, player, tileMap) {
    const dt = Math.min(deltaTime / 1000, 0.1);
    this.floatTimer += dt;

    // 0. Synchronize and Update Autonomous Wild Dragons in Scene (FSM)
    if (tileMap) {
      this.syncWildDragonsFromMap(tileMap);
    }
    this.updateWildDragons(dt, player, tileMap);

    // Update Skill Cooldowns for Slots 1 to 4
    for (let i = 0; i < 4; i++) {
      if (this.skillCooldowns[i] > 0) {
        this.skillCooldowns[i] = Math.max(0, this.skillCooldowns[i] - dt);
      }
    }

    // Tactical Dodge Timer
    if (this.isDodging) {
      this.dodgeTimer -= dt;
      if (this.dodgeTimer <= 0) {
        this.isDodging = false;
      }
    }

    // Update Flight Altitude System (Q: Descend, E: Ascend)
    const canFly = this.canActiveDragonFly();
    if (this.mode === 'mounted' && canFly) {
      if (player && player.keys) {
        if (player.keys.e || player.keys.KeyE) {
          this.targetFlightAltitude = Math.min(this.maxFlightAltitude, this.targetFlightAltitude + 95 * dt);
        }
        if (player.keys.q || player.keys.KeyQ) {
          this.targetFlightAltitude = Math.max(0, this.targetFlightAltitude - 95 * dt);
        }
      }
      this.flightAltitude += (this.targetFlightAltitude - this.flightAltitude) * Math.min(1.0, 7.0 * dt);
    } else {
      this.targetFlightAltitude = 0;
      this.flightAltitude += (0 - this.flightAltitude) * Math.min(1.0, 10.0 * dt);
    }

    const dragon = this.getActiveDragon();
    if (!dragon || this.mode === 'none') return;

    // 1. Pet Follow AI Logic
    if (this.mode === 'mounted') {
      // Rider is positioned on socket
      this.x = player.x;
      this.y = player.y;
      this.direction = player.direction;
      this.state = 'mounted';
    } else if (this.mode === 'follow') {
      // Follow target anchor point slightly behind player
      let offsetX = -42;
      let offsetY = 12;
      if (player.direction === 'east') { offsetX = -46; offsetY = 6; }
      else if (player.direction === 'west') { offsetX = 46; offsetY = 6; }
      else if (player.direction === 'north') { offsetX = 0; offsetY = 46; }
      else if (player.direction === 'south') { offsetX = 0; offsetY = -42; }

      this.targetX = player.x + offsetX;
      this.targetY = player.y + offsetY;

      // Smooth exponential lerp toward target
      const lerpSpeed = player.isSprinting ? 8.0 : 5.0;
      this.x += (this.targetX - this.x) * Math.min(1.0, lerpSpeed * dt);
      this.y += (this.targetY - this.y) * Math.min(1.0, lerpSpeed * dt);

      const dist = Math.hypot(player.x - this.x, player.y - this.y);
      this.state = dist > 20 ? 'follow' : 'idle';
      this.direction = player.direction;
    }

    // 2. Auto-Combat Logic with Targets
    this.combatCooldown += dt;
    for (const target of this.trainingTargets) {
      const dist = Math.hypot(target.x - (this.x + 24), target.y - (this.y + 24));
      if (dist < 140 && target.hp > 0) {
        this.state = 'combat';
        target.isAggro = true;

        // Companion Auto-Attack every 1.2s
        if (this.combatCooldown >= 1.2) {
          this.combatCooldown = 0;
          const isCrit = Math.random() < 0.25;
          const damage = isCrit ? Math.floor(22 + Math.random() * 8) : Math.floor(12 + Math.random() * 6);
          target.hp = Math.max(0, target.hp - damage);
          target.hitTimer = 0.3;

          // Spawn damage floating number
          this.damageNumbers.push({
            x: target.x + 16,
            y: target.y - 10,
            text: isCrit ? `CRIT! -${damage}` : `-${damage}`,
            color: isCrit ? '#f59e0b' : '#ef4444',
            alpha: 1.0,
            life: 0,
            maxLife: 1.0
          });

          // Spawn elemental attack particles toward target
          this.spawnAttackParticles(this.x + 24, this.y + 24, target.x + 16, target.y + 16, dragon);

          // Gain XP on victory
          if (target.hp <= 0) {
            dragon.xp += 40;
            if (dragon.xp >= dragon.maxXp) {
              dragon.level++;
              dragon.xp -= dragon.maxXp;
              dragon.maxXp = Math.round(dragon.maxXp * 1.4);
              dragon.maxHp += 20;
              dragon.hp = dragon.maxHp;
            }
          }
        }
      }
    }

    // 3. Update Combat Particles
    for (let i = this.combatParticles.length - 1; i >= 0; i--) {
      const p = this.combatParticles[i];
      p.life += dt;
      p.x += (p.vx || 0) * dt;
      p.y += (p.vy || 0) * dt;
      p.alpha = Math.max(0, 1 - (p.life / p.maxLife));
      if (p.life >= p.maxLife) {
        this.combatParticles.splice(i, 1);
      }
    }

    // 4. Update Damage Floating Numbers
    for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
      const d = this.damageNumbers[i];
      d.life += dt;
      d.y -= 25 * dt;
      d.alpha = Math.max(0, 1 - (d.life / d.maxLife));
      if (d.life >= d.maxLife) {
        this.damageNumbers.splice(i, 1);
      }
    }
  }

  // Synchronize Placed Wild Dragons from TileMap
  syncWildDragonsFromMap(tileMap) {
    if (!tileMap || !tileMap.layers) return;
    const currentKeys = new Set();
    const layersToCheck = ['characters', 'solid', 'decor', 'top', 'ground'];

    for (const layerName of layersToCheck) {
      const layer = tileMap.layers[layerName];
      if (!layer) continue;

      for (const [coordKey, cell] of layer.entries()) {
        const tileId = (typeof cell === 'object' && cell !== null) ? cell.tileId : (typeof cell === 'string' ? cell : null);
        if (tileId && typeof tileId === 'string' && (tileId.startsWith('dragon_') || tileId.includes('dragon'))) {
          const uniqueKey = `${layerName}_${coordKey}`;
          currentKeys.add(uniqueKey);

          const [tx, ty] = coordKey.split(',').map(Number);
          const cellLevel = (typeof cell === 'object' && cell?.level) ? cell.level : 1;
          const cellFlip = (typeof cell === 'object' && cell?.flipX) ? cell.flipX : false;

          let entity = this.wildDragons.get(uniqueKey);
          if (!entity) {
            const catalogItem = DRAGON_CATALOG.find(d => d.id === tileId) || {
              id: tileId,
              name: 'Dragão Selvagem',
              category: 'land',
              color: '#38bdf8',
              secondaryColor: '#fef08a'
            };

            entity = {
              key: uniqueKey,
              tileId,
              layerName,
              coordKey,
              name: catalogItem.name,
              catalog: catalogItem,
              category: catalogItem.category || 'land',
              color: catalogItem.color || '#38bdf8',
              secondaryColor: catalogItem.secondaryColor || '#fef08a',
              level: cellLevel,
              flipX: cellFlip,
              originX: tx * 64,
              originY: ty * 64,
              x: tx * 64,
              y: ty * 64,
              targetX: tx * 64,
              targetY: ty * 64,
              direction: cellFlip ? 'west' : 'east',
              fsmState: 'idle', // 'idle', 'roam', 'fly_hover', 'curious', 'sleep'
              stateTimer: 2.0 + Math.random() * 3.0,
              flightAltitude: 0,
              targetAltitude: 0,
              animTimer: Math.random() * 10,
              emote: null,
              territoryRadius: 160
            };
            this.wildDragons.set(uniqueKey, entity);
          } else {
            entity.level = cellLevel;
            entity.flipX = cellFlip;
          }
        }
      }
    }

    // Clean up removed dragons
    for (const [key] of this.wildDragons.entries()) {
      if (!currentKeys.has(key)) {
        this.wildDragons.delete(key);
      }
    }
  }

  // Update FSM for all Wild Dragons
  updateWildDragons(dt, player, tileMap) {
    for (const entity of this.wildDragons.values()) {
      entity.animTimer += dt;

      // Update Emote Timer
      if (entity.emote) {
        entity.emote.timer -= dt;
        if (entity.emote.timer <= 0) {
          entity.emote = null;
        }
      }

      // Smooth Altitude transition
      entity.flightAltitude += (entity.targetAltitude - entity.flightAltitude) * Math.min(1.0, 5.0 * dt);

      // Distance to player
      const distToPlayer = player ? Math.hypot((player.x + 24) - (entity.x + 32), (player.y + 24) - (entity.y + 32)) : 999;

      // Player proximity curiosity trigger
      if (distToPlayer < 90 && entity.fsmState !== 'curious' && entity.fsmState !== 'sleep') {
        if (Math.random() < 0.20) {
          entity.fsmState = 'curious';
          entity.stateTimer = 2.5;
          entity.emote = { type: Math.random() < 0.5 ? 'curious' : 'heart', timer: 2.2 };
          entity.direction = (player.x < entity.x) ? 'west' : 'east';
        }
      }

      entity.stateTimer -= dt;

      switch (entity.fsmState) {
        case 'idle':
          // Hover occasionally if flying dragon
          if (entity.category === 'fly') {
            entity.targetAltitude = (Math.sin(entity.animTimer * 0.8) > 0.3) ? 18 : 0;
          } else {
            entity.targetAltitude = 0;
          }

          if (entity.stateTimer <= 0) {
            const roll = Math.random();
            if (roll < 0.60) {
              // Switch to Roam / Flight Hover
              entity.fsmState = (entity.category === 'fly' && Math.random() < 0.6) ? 'fly_hover' : 'roam';
              const angle = Math.random() * Math.PI * 2;
              const dist = 30 + Math.random() * entity.territoryRadius;
              entity.targetX = entity.originX + Math.cos(angle) * dist;
              entity.targetY = entity.originY + Math.sin(angle) * dist;
              entity.stateTimer = 3.0 + Math.random() * 4.0;
            } else if (roll < 0.85) {
              // Continue Idle
              entity.stateTimer = 2.0 + Math.random() * 3.0;
            } else {
              // Take a quick rest / nap
              entity.fsmState = 'sleep';
              entity.stateTimer = 4.0 + Math.random() * 3.0;
              entity.targetAltitude = 0;
              entity.emote = { type: 'zzz', timer: 3.5 };
            }
          }
          break;

        case 'fly_hover':
          entity.targetAltitude = 28 + Math.sin(entity.animTimer * 2) * 8;
          // fall-through to roam movement logic
        case 'roam':
          {
            const dx = entity.targetX - entity.x;
            const dy = entity.targetY - entity.y;
            const dist = Math.hypot(dx, dy);

            if (dist > 6) {
              let speed = 28;
              if (entity.category === 'fly' && entity.flightAltitude > 10) speed = 46;
              else if (entity.category === 'water') speed = 36;

              entity.x += (dx / dist) * speed * dt;
              entity.y += (dy / dist) * speed * dt;

              if (Math.abs(dx) > Math.abs(dy)) {
                entity.direction = dx > 0 ? 'east' : 'west';
              } else {
                entity.direction = dy > 0 ? 'south' : 'north';
              }
            } else {
              entity.fsmState = 'idle';
              entity.stateTimer = 2.0 + Math.random() * 3.0;
            }

            if (entity.stateTimer <= 0) {
              entity.fsmState = 'idle';
              entity.stateTimer = 2.0 + Math.random() * 2.0;
            }
          }
          break;

        case 'curious':
          // Look at player
          if (player) {
            entity.direction = (player.x < entity.x) ? 'west' : 'east';
          }
          if (distToPlayer > 120 || entity.stateTimer <= 0) {
            entity.fsmState = 'idle';
            entity.stateTimer = 2.0 + Math.random() * 2.0;
          }
          break;

        case 'sleep':
          entity.targetAltitude = 0;
          if (distToPlayer < 45) {
            // Player startled sleeping dragon
            entity.fsmState = 'curious';
            entity.stateTimer = 2.0;
            entity.emote = { type: 'curious', timer: 1.8 };
          } else if (entity.stateTimer <= 0) {
            entity.fsmState = 'idle';
            entity.stateTimer = 2.0 + Math.random() * 2.0;
          }
          break;
      }
    }
  }

  spawnAttackParticles(fromX, fromY, toX, toY, dragon) {
    for (let i = 0; i < 8; i++) {
      const angle = Math.atan2(toY - fromY, toX - fromX) + (Math.random() - 0.5) * 0.4;
      const speed = 140 + Math.random() * 80;
      this.combatParticles.push({
        x: fromX,
        y: fromY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: dragon.color,
        size: 4 + Math.random() * 4,
        life: 0,
        maxLife: 0.5,
        alpha: 1.0,
        type: 'attack'
      });
    }
  }

  // Render Companion, Targets, Nests, and Combat UI in World Space
  render(ctx, assetLoader, player = null) {
    // 1. Render Wild Dragon Nests
    this.renderWildNests(ctx);

    // 2. Render Training Targets
    this.renderTrainingTargets(ctx);

    // 3. Render Autonomous Wild Dragons (placed in world by ADM)
    this.renderWildDragons(ctx, player, assetLoader);

    // 4. Render Active Dragon Companion (if not mounted, or socket underlay)
    const dragon = this.getActiveDragon();
    if (dragon && this.mode !== 'none') {
      this.renderDragonEntity(ctx, dragon, player);
    }

    // 5. Render Combat Particles
    this.renderParticles(ctx);

    // 6. Render Floating Damage Numbers
    this.renderDamageNumbers(ctx);
  }

  // Render Autonomous Wild Dragons with FSM Animations, Shadows, Badges, and Emotes
  renderWildDragons(ctx, player, assetLoader) {
    for (const entity of this.wildDragons.values()) {
      this.renderWildDragonEntity(ctx, entity, player);
    }
  }

  renderWildDragonEntity(ctx, entity, player = null) {
    ctx.save();

    const alt = entity.flightAltitude || 0;
    const bounce = (entity.fsmState === 'sleep') ? 0 : Math.sin(entity.animTimer * (alt > 10 ? 8 : 4)) * (alt > 10 ? 6 : 4);
    const drawX = Math.round(entity.x);
    const drawY = Math.round(entity.y + bounce - alt);

    // 1. Ground Shadow (Always on floor terrain)
    ctx.save();
    const shadowScaleX = 20 + (alt * 0.14);
    const shadowScaleY = 8 + (alt * 0.06);
    const shadowAlpha = Math.max(0.12, 0.32 - (alt / 120) * 0.18);
    ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
    ctx.beginPath();
    ctx.ellipse(drawX + 32, entity.y + 52, shadowScaleX, shadowScaleY, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 1b. Water Ripple Waves for Aquatic Dragons
    if (entity.category === 'water') {
      ctx.save();
      const wavePhase = (entity.animTimer * 3.5) % (Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(drawX + 32, entity.y + 52, 22 + Math.sin(wavePhase) * 4, 9 + Math.cos(wavePhase) * 2, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 2. Dragon Drawing (with direction flipping)
    ctx.save();
    const isWest = entity.direction === 'west';
    if (isWest) {
      ctx.translate(drawX + 64, drawY);
      ctx.scale(-1, 1);
    } else {
      ctx.translate(drawX, drawY);
    }

    const bodyColor = entity.color || '#38bdf8';
    const accentColor = entity.secondaryColor || '#fef08a';

    // 2a. Wings / Fins with dynamic flap
    ctx.fillStyle = accentColor;
    const flapFreq = alt > 10 ? 14 : 7;
    const flapAmp = alt > 10 ? 9 : 5;
    const wingFlap = (entity.fsmState === 'sleep') ? 0 : Math.sin(entity.animTimer * flapFreq) * flapAmp;
    // Left wing
    ctx.beginPath();
    ctx.ellipse(14, 26 + wingFlap, 12, 8, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    // Right wing
    ctx.beginPath();
    ctx.ellipse(50, 26 - wingFlap, 12, 8, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    // 2b. Chubby Body
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(32, 34, 18, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2c. Belly Highlight
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.ellipse(32, 36, 11, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2d. Head
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(32, 20, 14, 0, Math.PI * 2);
    ctx.fill();

    // 2e. Horns / Ears
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.moveTo(24, 12);
    ctx.lineTo(20, 2);
    ctx.lineTo(28, 10);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(40, 12);
    ctx.lineTo(44, 2);
    ctx.lineTo(36, 10);
    ctx.fill();

    // 2f. Eyes (sleeping or open)
    if (entity.fsmState === 'sleep') {
      // Sleeping curved eye lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(27, 20, 3, 0.1 * Math.PI, 0.9 * Math.PI, false);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(37, 20, 3, 0.1 * Math.PI, 0.9 * Math.PI, false);
      ctx.stroke();
    } else {
      // Big expressive eyes
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(27, 19, 3.2, 0, Math.PI * 2);
      ctx.arc(37, 19, 3.2, 0, Math.PI * 2);
      ctx.fill();

      // Eye catchlights
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(26, 18, 1.2, 0, Math.PI * 2);
      ctx.arc(36, 18, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Rosy cute cheeks
    ctx.fillStyle = 'rgba(244, 114, 182, 0.65)';
    ctx.beginPath();
    ctx.arc(23, 23, 2.5, 0, Math.PI * 2);
    ctx.arc(41, 23, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // 3. Overhead Level Badge (Animal Island UI 3D Pill, non-flipped)
    ctx.save();
    const lvlText = `Nv. ${entity.level || 1}`;
    ctx.font = 'bold 10px "Nunito", sans-serif';
    const textMetrics = ctx.measureText(lvlText);
    const badgeW = Math.max(38, textMetrics.width + 12);
    const badgeH = 16;
    const badgeX = drawX + 32 - badgeW / 2;
    const badgeY = drawY - 14;

    // Badge shadow 3D
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(badgeX, badgeY + 2, badgeW, badgeH, 50);
    else ctx.rect(badgeX, badgeY + 2, badgeW, badgeH);
    ctx.fill();

    // Badge body
    ctx.fillStyle = '#fffdf5';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 50);
    else ctx.rect(badgeX, badgeY, badgeW, badgeH);
    ctx.fill();

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.3;
    ctx.stroke();

    ctx.fillStyle = '#7a583e';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(lvlText, drawX + 32, badgeY + badgeH / 2);
    ctx.restore();

    // 4. Emote Balloon above head (ACNH Style)
    if (entity.emote) {
      ctx.save();
      const emoteX = drawX + 32;
      const emoteY = drawY - 34;

      if (entity.emote.type === 'zzz') {
        // Floating Zzz
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 12px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        const zOffset = (entity.animTimer * 10) % 15;
        ctx.fillText('Zzz...', emoteX, emoteY - zOffset);
      } else if (entity.emote.type === 'heart') {
        // Heart Bubble
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(emoteX, emoteY, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('♥', emoteX, emoteY);
      } else if (entity.emote.type === 'curious') {
        // Curious Question Mark
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(emoteX, emoteY, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', emoteX, emoteY + 0.5);
      }
      ctx.restore();
    }

    // 5. Proximity [R] Keycap Prompt when Player is close
    const distToPlayer = player ? Math.hypot((player.x + 24) - (entity.x + 32), (player.y + 24) - (entity.y + 32)) : 999;
    if (distToPlayer < 90) {
      ctx.save();
      const badgeSize = 22;
      const badgeX = drawX + 32 - badgeSize / 2;
      const badgeY = drawY - (entity.emote ? 58 : 38);

      // Sombra suave do badge
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(badgeX - 1, badgeY - 1, badgeSize + 2, badgeSize + 2, 6);
      else ctx.rect(badgeX - 1, badgeY - 1, badgeSize + 2, badgeSize + 2);
      ctx.fill();

      // Keycap dourado
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(badgeX, badgeY, badgeSize, badgeSize, 5);
      else ctx.rect(badgeX, badgeY, badgeSize, badgeSize);
      ctx.fill();

      // Borda dourada suave
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Letra R centralizada
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('R', badgeX + badgeSize / 2, badgeY + badgeSize / 2 + 0.5);

      // Pontinha triangular sutil abaixo do badge
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(drawX + 29, badgeY + badgeSize);
      ctx.lineTo(drawX + 32, badgeY + badgeSize + 3);
      ctx.lineTo(drawX + 35, badgeY + badgeSize);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  renderDragonEntity(ctx, dragon, player = null) {
    ctx.save();

    const isMounted = this.mode === 'mounted';
    const alt = isMounted ? (this.flightAltitude || 0) : 0;
    const bounce = Math.sin(this.floatTimer * (alt > 10 ? 8 : 4)) * (alt > 10 ? 6 : 4);
    const drawX = Math.round(this.x);
    const drawY = Math.round(this.y + bounce - alt);

    // 1. Single Unified Ground Shadow (Always rendered on the terrain floor, expands & softens with altitude)
    ctx.save();
    const shadowScaleX = 20 + (alt * 0.14);
    const shadowScaleY = 8 + (alt * 0.06);
    const shadowAlpha = isMounted 
      ? Math.max(0.12, 0.38 - (alt / 120) * 0.20)
      : 0.28;
    ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
    ctx.beginPath();
    ctx.ellipse(drawX + 24, this.y + 44, shadowScaleX, shadowScaleY, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 1b. Aquatic Swimming Wave Ripples for Water Dragons
    if (dragon.category === 'water' && isMounted) {
      ctx.save();
      const wavePhase = (this.floatTimer * 3.5) % (Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(drawX + 24, this.y + 44, 22 + Math.sin(wavePhase) * 4, 9 + Math.cos(wavePhase) * 2, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Invulnerability flashing when dodging
    if (this.isDodging && Math.floor(this.floatTimer * 20) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    // Draw Cute Harmonized Animal Crossing-style Dragon (2.5D Vector Canvas)
    const bodyColor = dragon.color || '#38bdf8';
    const accentColor = dragon.secondaryColor || '#fef08a';

    // 1. Dragon Wings / Fins with dynamic flap frequency in flight
    ctx.fillStyle = accentColor;
    const flapFreq = alt > 10 ? 14 : 8;
    const flapAmp = alt > 10 ? 9 : 6;
    const wingFlap = Math.sin(this.floatTimer * flapFreq) * flapAmp;
    // Left wing
    ctx.beginPath();
    ctx.ellipse(drawX + 8, drawY + 16 + wingFlap, 12, 8, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    // Right wing
    ctx.beginPath();
    ctx.ellipse(drawX + 40, drawY + 16 - wingFlap, 12, 8, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    // 2. Dragon Chubby Body
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(drawX + 24, drawY + 26, 18, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. Belly highlight
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.ellipse(drawX + 24, drawY + 28, 11, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // 4. Head with cute round snout
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(drawX + 24, drawY + 12, 14, 0, Math.PI * 2);
    ctx.fill();

    // 5. Cute Horns / Ears
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.moveTo(drawX + 16, drawY + 4);
    ctx.lineTo(drawX + 12, drawY - 6);
    ctx.lineTo(drawX + 20, drawY + 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(drawX + 32, drawY + 4);
    ctx.lineTo(drawX + 36, drawY - 6);
    ctx.lineTo(drawX + 28, drawY + 2);
    ctx.fill();

    // 6. Big Expressive Eyes
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(drawX + 19, drawY + 11, 3.2, 0, Math.PI * 2);
    ctx.arc(drawX + 29, drawY + 11, 3.2, 0, Math.PI * 2);
    ctx.fill();

    // Eye catchlights (sparkle)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(drawX + 18, drawY + 10, 1.2, 0, Math.PI * 2);
    ctx.arc(drawX + 28, drawY + 10, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Rosy cute cheeks
    ctx.fillStyle = 'rgba(244, 114, 182, 0.6)';
    ctx.beginPath();
    ctx.arc(drawX + 15, drawY + 15, 2.5, 0, Math.PI * 2);
    ctx.arc(drawX + 33, drawY + 15, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // 7. Mini Overhead Companion Badge & Proximity Mount [R] Keycap Balloon
    if (this.mode === 'follow') {
      const dist = player ? Math.hypot(player.x - this.x, player.y - this.y) : 999;
      const isNearby = dist < 120;

      if (isNearby) {
        // Balão compacto com apenas a tecla [R] estilo Zelda/Animal Crossing
        const badgeSize = 22;
        const badgeX = drawX + 24 - badgeSize / 2;
        const badgeY = drawY - 26;

        // Sombra suave do badge
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.roundRect(badgeX - 1, badgeY - 1, badgeSize + 2, badgeSize + 2, 6);
        ctx.fill();

        // Keycap dourado
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeSize, badgeSize, 5);
        ctx.fill();

        // Borda dourada suave
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Letra R centralizada
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('R', badgeX + badgeSize / 2, badgeY + badgeSize / 2 + 0.5);

        // Pontinha triangular sutil abaixo do badge apontando para a cabeça do dragão
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(drawX + 21, badgeY + badgeSize);
        ctx.lineTo(drawX + 24, badgeY + badgeSize + 3);
        ctx.lineTo(drawX + 27, badgeY + badgeSize);
        ctx.fill();
      } else {
        // Badge simples de nível quando longe
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.roundRect(drawX + 4, drawY - 14, 40, 12, 4);
        ctx.fill();

        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 8px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Lv.${dragon.level}`, drawX + 24, drawY - 5);
      }
    } else if (isMounted && this.canActiveDragonFly() && alt > 8) {
      // Altitude Indicator & Controls Prompt (Animal Island UI 3D Pill)
      const hudText = `Altitude: ${Math.round(alt)}m [Q ⬇ / E ⬆]`;
      ctx.font = 'bold 10px "Nunito", sans-serif';
      const tw = ctx.measureText(hudText).width;
      const bw = tw + 18;
      const bh = 18;
      const bx = drawX + 24 - bw / 2;
      const by = drawY - 24;

      // 3D Pill shadow
      ctx.fillStyle = '#0f8e83';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(bx, by + 2, bw, bh, 50);
      else ctx.rect(bx, by + 2, bw, bh);
      ctx.fill();

      // Pill body
      ctx.fillStyle = '#19c8b9';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 50);
      else ctx.rect(bx, by, bw, bh);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(hudText, drawX + 24, by + bh / 2);
    }

    ctx.restore();
  }

  renderWildNests(ctx) {
    for (const nest of this.wildNests) {
      ctx.save();
      // Nest Straw Circle
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.ellipse(nest.x + 32, nest.y + 36, 26, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      if (!nest.hatched) {
        // Egg
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.ellipse(nest.x + 32, nest.y + 26, 12, 16, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Warmth Mini Bar
        if (nest.warmthProgress > 0) {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
          ctx.fillRect(nest.x + 12, nest.y + 44, 40, 6);

          ctx.fillStyle = '#f97316';
          ctx.fillRect(nest.x + 12, nest.y + 44, 40 * (nest.warmthProgress / 100), 6);
        }

        // Floating Title
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 9px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(nest.name, nest.x + 32, nest.y + 6);
      } else {
        // Hatched Empty Shell
        ctx.fillStyle = '#a1a1aa';
        ctx.font = 'italic 8px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('(Chocado)', nest.x + 32, nest.y + 30);
      }

      ctx.restore();
    }
  }

  renderTrainingTargets(ctx) {
    for (const target of this.trainingTargets) {
      if (target.hp <= 0) continue;

      ctx.save();
      const isHit = target.hitTimer > 0;
      target.hitTimer = Math.max(0, (target.hitTimer || 0) - 0.016);

      // Dummy Body
      ctx.fillStyle = isHit ? '#ef4444' : '#64748b';
      ctx.beginPath();
      ctx.arc(target.x + 20, target.y + 20, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.stroke();

      // HP Bar above target
      const barW = 44;
      const barH = 5;
      const hpPct = target.hp / target.maxHp;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.fillRect(target.x - 2, target.y - 12, barW, barH);

      ctx.fillStyle = hpPct > 0.4 ? '#10b981' : '#ef4444';
      ctx.fillRect(target.x - 2, target.y - 12, barW * hpPct, barH);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 8px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Lv.${target.level} ${target.name}`, target.x + 20, target.y - 16);

      ctx.restore();
    }
  }

  renderParticles(ctx) {
    for (const p of this.combatParticles) {
      const alpha = typeof p.alpha === 'number' && !isNaN(p.alpha) ? Math.max(0, Math.min(1, p.alpha)) : 1;
      if (alpha <= 0) continue;
      ctx.save();
      ctx.fillStyle = p.color || '#38bdf8';
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(p.x || 0, p.y || 0, Math.max(1, p.size || 4), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  renderDamageNumbers(ctx) {
    for (const d of this.damageNumbers) {
      const alpha = typeof d.alpha === 'number' && !isNaN(d.alpha) ? Math.max(0, Math.min(1, d.alpha)) : 1;
      if (alpha <= 0) continue;
      ctx.save();
      ctx.fillStyle = d.color || '#ffffff';
      ctx.globalAlpha = alpha;
      ctx.font = 'bold 12px "JetBrains Mono", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(d.text, d.x || 0, d.y || 0);
      ctx.restore();
    }
  }
}
