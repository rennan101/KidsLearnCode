/**
 * ScratchBlockEngine - KidsLearnCode
 * Engine de Blocos Visuais de Quebra-Cabeça (Drag & Drop estilo Code Kit / Blockly).
 * Permite arrastar peças com encaixes puzzle para a mesa de montagem,
 * aninhar blocos de repetição e condição, e ver a transformação do código Lua em tempo real ao lado.
 * Todas as legendas, dicas (mouse hover) e interações são 100% em Português Brasileiro (PT-BR).
 */

import { soundFX } from './SoundFX.js';

export const BLOCK_CATEGORIES = {
  variables: { 
    id: 'variables', 
    name: 'Variáveis & Valores', 
    color: '#EA580C', 
    darkColor: '#C2410C', 
    accentColor: '#ffedd5',
    description: 'Guarde dados e materiais em caixas com nome (ex: material, quantidade, listas).'
  },
  actions: { 
    id: 'actions', 
    name: 'Ações de Criação', 
    color: '#0284C7', 
    darkColor: '#0369A1', 
    accentColor: '#e0f2fe',
    description: 'Comandos para fabricar móveis, forjar ferramentas, plantar e construir na ilha.'
  },
  conditions: { 
    id: 'conditions', 
    name: 'Lógica & Condições', 
    color: '#059669', 
    darkColor: '#047857', 
    accentColor: '#d1fae5',
    description: 'Verifique se você possui os materiais necessários antes de executar uma ação.'
  },
  loops: { 
    id: 'loops', 
    name: 'Repetição (Loops)', 
    color: '#7C3AED', 
    darkColor: '#6D28D9', 
    accentColor: '#ede9fe',
    description: 'Repita um conjunto de comandos várias vezes de forma automática.'
  },
  functions: { 
    id: 'functions', 
    name: 'Funções & Regras', 
    color: '#DB2777', 
    darkColor: '#BE185D', 
    accentColor: '#fce7f3',
    description: 'Agrupe passos em uma regra reutilizável para construções avançadas.'
  }
};

/**
 * Dicionário PT-BR de Nomes e Descrições para Itens, Materiais e Ações
 */
export const PT_BR_DICTIONARY = {
  // Materiais & Madeiras
  carvalho: { name: 'Carvalho', desc: 'Madeira nobre e resistente da floresta.' },
  pinheiro: { name: 'Pinheiro', desc: 'Madeira perfumada das colinas boreais.' },
  madeira_macica: { name: 'Madeira Maciça', desc: 'Blocos espessos para tampos e estruturas fortes.' },
  ferro: { name: 'Ferro', desc: 'Metal fundido para lâminas e ferramentas.' },
  ferro_puro: { name: 'Ferro Puro', desc: 'Lingote de ferro puro de alta resistência.' },
  ouro: { name: 'Ouro', desc: 'Metal precioso reluzente para adornos reais.' },
  cobre: { name: 'Cobre', desc: 'Metal flexível ideal para regadores e fivelas.' },
  cristal: { name: 'Cristal Astral', desc: 'Gema mística com canalização de energia.' },
  veio_mineral: { name: 'Veio Mineral', desc: 'Rocha rica em minérios e metais preciosos.' },
  palha: { name: 'Palha Seca', desc: 'Fibras vegetais confortáveis para esteiras e camas.' },
  veludo: { name: 'Veludo Nobre', desc: 'Tecido macio de alta nobreza para camas com dossel.' },
  linha_seda: { name: 'Linha de Seda', desc: 'Fio forte e resistente para varas de pesca.' },
  bambu_flexivel: { name: 'Bambu Flexível', desc: 'Haste natural curvável para pesca artesanal.' },
  fina_encantada: { name: 'Malha Encantada', desc: 'Rede mágica para capturar pequenos insetos.' },
  esmeralda: { name: 'Verde Esmeralda', desc: 'Pigmento botânico das copas de pinheiros.' },
  petala_azul: { name: 'Pétala Azul', desc: 'Flores silvestres azuis para gramados.' },
  petala_amarela: { name: 'Pétala Dourada', desc: 'Flores campestres amarelas.' },
  geometrico_azul: { name: 'Geométrico Azul', desc: 'Padrão nobre de ardósia azul e mármore.' },
  rocha_solida: { name: 'Rocha Sólida', desc: 'Casca mineralizada para choque de ovos de dragão.' },
  perola_azul: { name: 'Pérola Azul', desc: 'Gema marinha brilhante das marés.' },
  espuma_mar: { name: 'Espuma do Mar', desc: 'Essência aquática das ondas oceânicas.' },
  celeste: { name: 'Elemento Celeste', desc: 'Ventos etéreos para dragões alados.' },
  terra_dourada: { name: 'Terra Dourada', desc: 'Chão batido aconchegante para trilhas.' },
  articulado: { name: 'Trinco Articulado', desc: 'Dobradiça reforçada com fechamento suave.' },

  // Ferramentas
  tool_shovel_iron: { name: 'Pá de Ferro Rústica', desc: 'Ferramenta forjada para escavar a terra e colher mudas.' },
  tool_axe_woodcutter: { name: 'Machado de Lenhador', desc: 'Lâmina afiada para corte de madeira e desbaste.' },
  tool_pickaxe_miner: { name: 'Picareta de Mineração', desc: 'Ferramenta pesada para extrair minérios e quebrar rochas.' },
  tool_watering_can: { name: 'Regador de Cobre', desc: 'Regador durável para irrigar plantações e hortas.' },
  tool_fishing_rod: { name: 'Vara de Pesca de Bambu', desc: 'Vara flexível para pescar peixes em rios e oceanos.' },
  tool_bug_net: { name: 'Rede de Captura', desc: 'Rede encantada para capturar insetos raros.' },
  feature_lua_terminal: { name: 'Grimório & Terminal Lua', desc: 'Terminal ancestral para execução de magias e códigos.' },
  dragon_whistle_call: { name: 'Apito de Dragão', desc: 'Apito sagrado para invocar e montar seu dragão.' },

  // Móveis & Estruturas
  prop_chair_wood: { name: 'Cadeira de Madeira', desc: 'Assento confortável de carvalho para interiores e jardins.' },
  prop_table_crafting: { name: 'Mesa de Estudos', desc: 'Mesa espaçosa de 4 pernas para projetos e alquimia.' },
  prop_bed_straw: { name: 'Cama Rústica de Palha', desc: 'Cama de palha e peles para descanso dos aventureiros.' },
  prop_bed_canopy: { name: 'Cama Real com Dossel', desc: 'Cama nobre ornada com cortinas de veludo.' },
  prop_tent_adventurer: { name: 'Tenda de Acampamento', desc: 'Abrigo de lona fixado com 4 estacas resistentes.' },
  prop_house_cottage: { name: 'Casa Pequena de Enxaimel', desc: 'Casa aconchegante com alvenaria e vigas de madeira.' },
  struct_fence_wood_segment: { name: 'Cerca de Madeira Rústica', desc: 'Módulo de cerca para delimitar áreas e proteger jardins.' },
  struct_fence_wood_gate: { name: 'Portão de Cerca de Madeira', desc: 'Portão articulado com trinco de segurança.' },
  struct_bridge_wood_horiz: { name: 'Ponte de Madeira (Horizontal)', desc: 'Ponte resistente para atravessar rios leste-oeste.' },
  struct_bridge_wood_vert: { name: 'Ponte de Madeira (Vertical)', desc: 'Ponte resistente para travessias norte-sul.' },
  struct_lantern_post: { name: 'Poste de Iluminação Medieval', desc: 'Poste com lanterna a óleo para iluminar caminhos noturnos.' },
  struct_water_well: { name: 'Poço de Pedra da Vila', desc: 'Reservatório comunitário de água potável límpida.' },
  struct_stairs_wood: { name: 'Escada de Madeira Nobre', desc: 'Escada de 4 degraus para subir colinas e desníveis.' },
  struct_ramp_stone: { name: 'Rampa de Pedra / Acesso', desc: 'Rampa suave para transporte e subida em colinas.' },
  prop_dragon_incubator: { name: 'Ninho Incubador de Dragão', desc: 'Ninho térmico para chocar ovos sagrados.' },
  prop_animated_campfire: { name: 'Fogueira de Acampamento', desc: 'Fogueira acesa com chamas vivas para aquecer noites frias.' },

  // Natureza & Pisos
  seed_wheat_packet: { name: 'Sementes de Trigo Dourado', desc: 'Pacote de sementes nutritivas para agricultura.' },
  nature_berry_bush: { name: 'Arbusto com Frutas Vermelhas', desc: 'Arbusto fértil que brota amoras silvestres doces.' },
  nature_oak_tree: { name: 'Carvalho Antigo', desc: 'Árvore majestosa de copa ampla para sombra e madeira.' },
  nature_pine_tree: { name: 'Pinheiro Nórdico', desc: 'Árvore perene verde-esmeralda típica de montanhas.' },
  nature_rock_boulder: { name: 'Formação de Rocha Mineral', desc: 'Rocha sólida rica em depósitos minerais.' },
  tile_ground_dirt_track: { name: 'Trilha de Terra Batida', desc: 'Piso de terra batida para estradas da vila.' },
  tile_ground_cobblestone: { name: 'Caminho de Paralelepípedo', desc: 'Pavimento clássico de pedras assentadas com musgo.' },
  tile_ground_wood_planks: { name: 'Tabuado de Madeira Rústica', desc: 'Piso de tábuas de carvalho para interiores e decks.' },
  tile_ground_flower_grass: { name: 'Grama Florida Silvestre', desc: 'Gramado verdejante decorado com pétalas coloridas.' },
  tile_ground_sand_beach: { name: 'Areia Dourada de Praia', desc: 'Areia fina litorânea para margens e praias.' },
  tile_ground_stone_mosaic: { name: 'Mosaico Real de Pedra', desc: 'Piso luxuoso com mosaico geométrico refinado.' },
  tile_animated_water_flow: { name: 'Ladrilho de Água Cristalina', desc: 'Água corrente animada com ondas límpidas.' },
  tile_animated_waterfall: { name: 'Queda d\'Água / Cachoeira', desc: 'Cachoeira vertical com espuma e borrifos de água.' },
  tile_animated_lava_bubble: { name: 'Ladrilho de Lava Vulcânica', desc: 'Magma incandescente com bolhas borbulhantes.' },
  dragon_egg_earth: { name: 'Ovo de Dragão Terrestre', desc: 'Ovo pesado protegido por casca de rocha mineral.' },
  dragon_egg_tide: { name: 'Ovo de Dragão Aquático', desc: 'Ovo encantado pelas marés com brilho perolado.' },
  dragon_egg_wind: { name: 'Ovo de Dragão Voador', desc: 'Ovo consagrado aos céus que canaliza rajadas de vento.' }
};

/**
 * Visual Item/Option Resolver for Blocks (Icons, PT-BR labels and friendly tooltips)
 */
export function getBlockOptionVisual(val) {
  if (val === undefined || val === null || val === '') {
    return { icon: '', label: '', color: '#64748b', bg: '#f1f5f9', title: 'Opção Padrão', desc: 'Valor padrão' };
  }
  const str = String(val).toLowerCase().replace(/["']/g, '').trim();
  const dictEntry = PT_BR_DICTIONARY[str];
  const translatedLabel = dictEntry?.name || str.replace(/_/g, ' ');
  const translatedDesc = dictEntry?.desc || `Opção: ${translatedLabel}`;

  // 1. Materials & Woods
  if (str === 'material' || str === 'tampo' || str === 'mat' || str === 'carvalho' || str === 'madeira' || str === 'wood' || str === 'madeira_macica' || str === 'palha') {
    return {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6c0-1.66 3.58-3 8-3s8 1.34 8 3v12c0 1.66-3.58 3-8 3s-8-1.34-8-3V6z"/><ellipse cx="12" cy="6" rx="8" ry="3"/></svg>`,
      label: translatedLabel,
      color: '#d97706',
      bg: '#fef3c7',
      title: `${translatedLabel}: ${translatedDesc}`,
      desc: translatedDesc
    };
  }
  if (str === 'pinheiro' || str === 'pine') {
    return {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 19 21 5 21 12 2"/><line x1="12" y1="21" x2="12" y2="23"/></svg>`,
      label: translatedLabel,
      color: '#059669',
      bg: '#d1fae5',
      title: `${translatedLabel}: ${translatedDesc}`,
      desc: translatedDesc
    };
  }
  if (str === 'ferro' || str === 'ferro_puro' || str === 'iron' || str.includes('metal')) {
    return {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 2 18 2 22 8 12 22 2 8 6 2"/></svg>`,
      label: translatedLabel,
      color: '#0284c7',
      bg: '#e0f2fe',
      title: `${translatedLabel}: ${translatedDesc}`,
      desc: translatedDesc
    };
  }
  if (str === 'ouro' || str === 'gold') {
    return {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M9 9h6a1.5 1.5 0 0 1 0 3H9a1.5 1.5 0 0 0 0 3h6"/></svg>`,
      label: translatedLabel,
      color: '#d97706',
      bg: '#fef3c7',
      title: `${translatedLabel}: ${translatedDesc}`,
      desc: translatedDesc
    };
  }
  if (str === 'cobre') {
    return {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="12" rx="2"/></svg>`,
      label: translatedLabel,
      color: '#ea580c',
      bg: '#ffedd5',
      title: `${translatedLabel}: ${translatedDesc}`,
      desc: translatedDesc
    };
  }
  if (str === 'cristal' || str.includes('astral') || str === 'celeste') {
    return {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 22 8.5 12 22 2 8.5 12 2"/></svg>`,
      label: translatedLabel,
      color: '#8b5cf6',
      bg: '#ede9fe',
      title: `${translatedLabel}: ${translatedDesc}`,
      desc: translatedDesc
    };
  }

  // 2. Furniture & Props
  if (str.includes('chair') || str.includes('cadeira')) {
    return {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"/><path d="M3 11v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"/><path d="M5 18v2M19 18v2"/></svg>`,
      label: translatedLabel,
      color: '#d97706',
      bg: '#fef3c7',
      title: `${translatedLabel}: ${translatedDesc}`,
      desc: translatedDesc
    };
  }
  if (str.includes('table') || str.includes('mesa')) {
    return {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#7a583e" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="4" rx="1"/><path d="M4 10v10M20 10v10M8 10v6M16 10v6"/></svg>`,
      label: translatedLabel,
      color: '#7a583e',
      bg: '#f5ebe0',
      title: `${translatedLabel}: ${translatedDesc}`,
      desc: translatedDesc
    };
  }
  if (str.includes('bed') || str.includes('cama')) {
    return {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"/></svg>`,
      label: translatedLabel,
      color: '#6366f1',
      bg: '#e0e7ff',
      title: `${translatedLabel}: ${translatedDesc}`,
      desc: translatedDesc
    };
  }
  if (str.includes('tent') || str.includes('tenda')) {
    return {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21L12 3 5 21M12 3v18M9 21l3-6 3 6"/></svg>`,
      label: translatedLabel,
      color: '#10b981',
      bg: '#d1fae5',
      title: `${translatedLabel}: ${translatedDesc}`,
      desc: translatedDesc
    };
  }
  if (str.includes('house') || str.includes('cottage') || str.includes('casa')) {
    return {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
      label: translatedLabel,
      color: '#ea580c',
      bg: '#ffedd5',
      title: `${translatedLabel}: ${translatedDesc}`,
      desc: translatedDesc
    };
  }

  // 3. Tools
  if (str.includes('shovel') || str.includes('pa')) {
    return {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 22l8-8M9 13l2 2M13 9l2 2M15 7l4 4-6 6-4-4 6-6z"/></svg>`,
      label: translatedLabel,
      color: '#0284c7',
      bg: '#e0f2fe',
      title: `${translatedLabel}: ${translatedDesc}`,
      desc: translatedDesc
    };
  }
  if (str.includes('axe') || str.includes('machado')) {
    return {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4l6 6-4 4-6-6 4-4z"/><path d="M5 21l9-9"/></svg>`,
      label: translatedLabel,
      color: '#ef4444',
      bg: '#fee2e2',
      title: `${translatedLabel}: ${translatedDesc}`,
      desc: translatedDesc
    };
  }
  if (str.includes('pickaxe') || str.includes('picareta')) {
    return {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
      label: translatedLabel,
      color: '#0284c7',
      bg: '#e0f2fe',
      title: `${translatedLabel}: ${translatedDesc}`,
      desc: translatedDesc
    };
  }
  if (str.includes('watering_can') || str.includes('regador')) {
    return {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10h12v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9z"/><path d="M16 14l5-3v-2l-5 3M8 6h4v4H8z"/></svg>`,
      label: translatedLabel,
      color: '#10b981',
      bg: '#d1fae5',
      title: `${translatedLabel}: ${translatedDesc}`,
      desc: translatedDesc
    };
  }
  if (str.includes('rod') || str.includes('pesca')) {
    return {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20L20 4M20 4v8M20 12c0 2-2 4-4 4"/></svg>`,
      label: translatedLabel,
      color: '#06b6d4',
      bg: '#cffafe',
      title: `${translatedLabel}: ${translatedDesc}`,
      desc: translatedDesc
    };
  }
  if (str.includes('net') || str.includes('rede')) {
    return {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M12 14v8M9 22h6"/></svg>`,
      label: translatedLabel,
      color: '#10b981',
      bg: '#d1fae5',
      title: `${translatedLabel}: ${translatedDesc}`,
      desc: translatedDesc
    };
  }

  // 4. Nature & Flora
  if (str.includes('bush') || str.includes('arbusto') || str.includes('berry') || str.includes('wheat') || str.includes('trigo') || str.includes('seed')) {
    return {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12A10 10 0 0 1 12 2z"/><path d="M12 2c0 5.52 4.48 10 10 10"/></svg>`,
      label: translatedLabel,
      color: '#10b981',
      bg: '#d1fae5',
      title: `${translatedLabel}: ${translatedDesc}`,
      desc: translatedDesc
    };
  }
  if (str.includes('tree') || str.includes('arvore') || str.includes('oak')) {
    return {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#047857" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-6M12 16a6 6 0 1 0-6-6c0 1.25.38 2.42 1.04 3.4M12 16a6 6 0 1 1 6-6c0 1.25-.38 2.42-1.04 3.4"/></svg>`,
      label: translatedLabel,
      color: '#047857',
      bg: '#d1fae5',
      title: `${translatedLabel}: ${translatedDesc}`,
      desc: translatedDesc
    };
  }

  // 5. Ground / Tiles / Structures
  if (str.includes('dirt') || str.includes('piso') || str.includes('ground') || str.includes('tile') || str.includes('stone') || str.includes('cobblestone') || str.includes('bridge') || str.includes('fence') || str.includes('ramp') || str.includes('stairs')) {
    return {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#b45309" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
      label: translatedLabel,
      color: '#b45309',
      bg: '#fef3c7',
      title: `${translatedLabel}: ${translatedDesc}`,
      desc: translatedDesc
    };
  }

  return {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><path d="M12 8v8M8 12h8"/></svg>`,
    label: translatedLabel,
    color: '#64748b',
    bg: '#f1f5f9',
    title: `${translatedLabel}: ${translatedDesc}`,
    desc: translatedDesc
  };
}

export class ScratchBlockEngine {
  constructor(options = {}) {
    this.workspaceEl = options.workspaceEl || null;
    this.paletteEl = options.paletteEl || null;
    this.codeOutputEl = options.codeOutputEl || null;
    this.syntaxDisplayEl = options.syntaxDisplayEl || null;
    this.blocksInWorkspace = []; // Array of top-level block objects or nested trees
    this.draggedBlockTemplate = null;
    this.draggedWorkspaceBlockId = null;
    this.dragDropTarget = null;
    this.onCodeChange = options.onCodeChange || null;
    this.activeCategory = 'all';

    this.availableBlocks = [];
    this.initDefaultBlockCatalog();
  }

  initDefaultBlockCatalog() {
    this.availableBlocks = [
      // 1. Materiais & Variáveis
      {
        id: 'var_material',
        category: 'variables',
        type: 'statement',
        label: 'Definir material = [VAL]',
        title: 'Variável: Define o material base para fabricações e construções.',
        defaultValues: { VAL: 'carvalho' },
        options: { VAL: ['carvalho', 'pinheiro', 'madeira_macica', 'ferro_puro', 'cobre', 'veio_mineral'] },
        toLua: (b) => `local material = "${b.values.VAL || 'carvalho'}"`
      },
      {
        id: 'var_custom',
        category: 'variables',
        type: 'statement',
        label: 'Definir [NAME] = [VAL]',
        title: 'Variável Customizada: Cria uma variável com nome e valor à sua escolha.',
        defaultValues: { NAME: 'quantidade', VAL: '5' },
        toLua: (b) => {
          const v = b.values.VAL !== undefined ? b.values.VAL : '0';
          const isNum = !isNaN(Number(v)) && String(v).trim() !== '';
          return `local ${b.values.NAME || 'var'} = ${isNum ? v : `"${v}"`}`;
        }
      },

      // 2. Ações de Criação
      {
        id: 'act_fabricar_movel',
        category: 'actions',
        type: 'statement',
        label: 'Fabricar Móvel: [ITEM] de [MAT]',
        title: 'Ação: Constrói móveis artesanais combinando o modelo do item e o material escolhido.',
        defaultValues: { ITEM: 'prop_chair_wood', MAT: 'material' },
        options: {
          ITEM: ['prop_chair_wood', 'prop_table_crafting', 'prop_bed_straw', 'prop_bed_canopy', 'prop_tent_adventurer', 'prop_house_cottage'],
          MAT: ['material', '"carvalho"', '"pinheiro"', '"madeira_macica"', '"ferro"']
        },
        toLua: (b) => {
          const mat = b.values.MAT || 'material';
          return `fabricar_movel("${b.values.ITEM || 'prop_chair_wood'}", ${mat})`;
        }
      },
      {
        id: 'act_forjar_ferramenta',
        category: 'actions',
        type: 'statement',
        label: 'Forjar Ferramenta: [TOOL]',
        title: 'Ação de Ferraria: Forja ferramentas de trabalho resistentes para explorar e construir.',
        defaultValues: { TOOL: 'tool_shovel_iron' },
        options: { TOOL: ['tool_shovel_iron', 'tool_axe_woodcutter', 'tool_pickaxe_miner', 'tool_watering_can', 'tool_fishing_rod', 'tool_bug_net'] },
        toLua: (b) => `forjar_ferramenta("${b.values.TOOL || 'tool_shovel_iron'}", "ferro")`
      },
      {
        id: 'act_plantar_arbusto',
        category: 'actions',
        type: 'statement',
        label: 'Plantar na Ilha: [ARBUSTO]',
        title: 'Ação Botânica: Cultiva arbustos, flores e árvores na ilha.',
        defaultValues: { ARBUSTO: 'nature_berry_bush' },
        options: { ARBUSTO: ['nature_berry_bush', 'nature_oak_tree', 'nature_pine_tree', 'flower-magic'] },
        toLua: (b) => `plantar_arbusto("${b.values.ARBUSTO || 'nature_berry_bush'}")`
      },
      {
        id: 'act_fincar_cerca',
        category: 'actions',
        type: 'statement',
        label: 'Colocar Cerca na Posição [POS]',
        title: 'Ação Estrutural: Finca mourões de cerca para delimitar pastos e jardins.',
        defaultValues: { POS: 'i' },
        toLua: (b) => `fincar_cerca("struct_fence_wood_segment", ${b.values.POS || 'i'})`
      },
      {
        id: 'act_assentar_piso',
        category: 'actions',
        type: 'statement',
        label: 'Assentar Piso: [PISO]',
        title: 'Ação de Pavimentação: Pinta e assenta novos tipos de pisos e terrenos no mapa.',
        defaultValues: { PISO: 'tile_ground_dirt_track' },
        options: { PISO: ['tile_ground_dirt_track', 'tile_ground_cobblestone', 'tile_ground_wood_planks', 'tile_ground_flower_grass', 'tile_ground_sand_beach', 'tile_ground_stone_mosaic'] },
        toLua: (b) => `assentar_piso("${b.values.PISO || 'tile_ground_dirt_track'}")`
      },

      // 3. Condicionais
      {
        id: 'cond_if_simple',
        category: 'conditions',
        type: 'container',
        label: 'Se [COND] Então:',
        title: 'Condicional: Executa os blocos internos apenas se a condição for verdadeira.',
        defaultValues: { COND: 'palha >= 5' },
        options: { COND: ['palha >= 5', 'ferro >= 5', 'madeira >= 8', 'ouro >= 10', 'amizade >= 50'] },
        children: [],
        toLua: (b, engine) => {
          const inner = engine.transpileBlockList(b.children || [], '  ');
          return `se ${b.values.COND || 'true'} entao\n${inner ? inner + '\n' : '  -- encaixe uma acao aqui\n'}fim`;
        }
      },

      // 4. Loops & Repetição
      {
        id: 'loop_for',
        category: 'loops',
        type: 'container',
        label: 'Para i = 1 até [COUNT] Faça:',
        title: 'Laço de Repetição: Repete os blocos internos o número de vezes configurado.',
        defaultValues: { COUNT: '4' },
        children: [],
        toLua: (b, engine) => {
          const inner = engine.transpileBlockList(b.children || [], '  ');
          return `para i = 1, ${b.values.COUNT || 4} faca\n${inner ? inner + '\n' : '  -- encaixe uma acao aqui\n'}fim`;
        }
      },

      // 5. Funções
      {
        id: 'func_define',
        category: 'functions',
        type: 'container',
        label: 'Criar Regra: [NAME]()',
        title: 'Função / Regra: Cria um bloco de código reutilizável.',
        defaultValues: { NAME: 'construir_estrutura' },
        children: [],
        toLua: (b, engine) => {
          const inner = engine.transpileBlockList(b.children || [], '  ');
          return `funcao ${b.values.NAME || 'minha_regra'}()\n${inner ? inner + '\n' : '  -- acoes da regra\n'}fim`;
        }
      }
    ];
  }

  setPaletteContainer(el) {
    this.paletteEl = el;
    this.renderPalette();
  }

  setWorkspaceContainer(el) {
    this.workspaceEl = el;
    this.setupWorkspaceEvents();
    this.renderWorkspace();
  }

  setCodeOutputContainer(editorEl, syntaxDisplayEl = null) {
    this.codeOutputEl = editorEl;
    this.syntaxDisplayEl = syntaxDisplayEl;
    this.updateCodePreview();
  }

  setFilterCategory(catId) {
    this.activeCategory = catId;
    this.renderPalette();
  }

  // Load modular CodeKit blocks for an NPC lesson
  loadLessonBlocks(customBlockDefs = null, starterLua = null, lesson = null) {
    if (customBlockDefs && customBlockDefs.length > 0) {
      this.availableBlocks = [...customBlockDefs];
    } else if (lesson) {
      this.availableBlocks = this.deriveLessonBlocks(lesson);
    } else {
      this.initDefaultBlockCatalog();
    }

    // Challenges start empty so the student builds the code themselves
    this.blocksInWorkspace = [];

    this.renderPalette();
    this.renderWorkspace();
    this.updateCodePreview();
  }

  // Intelligent block derivation for all 41+ NPC lessons
  deriveLessonBlocks(lesson) {
    const starterLua = lesson.starterLua || '';
    const lines = starterLua.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('--'));

    const derived = [];
    const seenBlockIds = new Set();

    lines.forEach((line, idx) => {
      // Ignore block closers and else branches in line iteration
      if (line === 'fim' || line === 'end' || line === 'senao') return;

      // 1. Variable definition: local name = "val", local name = 10, local name = { ... }
      const varMatch = line.match(/^local\s+([a-zA-Z_]\w*)\s*=\s*(.*)$/);
      if (varMatch) {
        const varName = varMatch[1];
        let rawVal = varMatch[2].trim();
        const isTable = rawVal.startsWith('{');
        const isStringLiteral = !isTable && (rawVal.startsWith('"') || rawVal.startsWith("'"));
        const isVarReference = !isTable && !isStringLiteral && /^[a-zA-Z_]\w*$/.test(rawVal);
        const cleanVal = isStringLiteral ? rawVal.replace(/^["']|["']$/g, '') : rawVal;

        const blockId = `var_${varName}_${idx}`;
        if (!seenBlockIds.has(blockId)) {
          seenBlockIds.add(blockId);
          const varVisual = getBlockOptionVisual(cleanVal);
          const varLabelPT = PT_BR_DICTIONARY[varName]?.name || varName.replace(/_/g, ' ');

          derived.push({
            id: blockId,
            category: 'variables',
            type: 'statement',
            label: isTable ? `Definir [NAME] = ${cleanVal}` : (isVarReference ? `Definir [NAME] = ${cleanVal}` : `Definir [NAME] = [VAL]`),
            title: `Variável: Define o valor de "${varLabelPT}" para ${varVisual.label || cleanVal}.`,
            defaultValues: { NAME: varName, VAL: cleanVal },
            options: isStringLiteral ? {
              VAL: [cleanVal, 'carvalho', 'pinheiro', 'madeira_macica', 'ferro_puro', 'ouro', 'cobre', 'cristal', 'azul', 'vermelho', 'esmeralda', 'celeste']
            } : {},
            toLua: (b) => {
              const name = b.values.NAME || varName;
              if (isTable) {
                return `local ${name} = ${cleanVal}`;
              }
              if (isVarReference) {
                return `local ${name} = ${b.values.VAL !== undefined ? b.values.VAL : cleanVal}`;
              }
              const val = b.values.VAL !== undefined ? b.values.VAL : cleanVal;
              const isNum = !isNaN(Number(val)) && String(val).trim() !== '';
              return `local ${name} = ${isNum ? val : `"${val}"`}`;
            }
          });
        }
        return;
      }

      // 2. Return statement: retornar res
      const retMatch = line.match(/^retornar\s+(.*)$/);
      if (retMatch) {
        const expr = retMatch[1].trim();
        const blockId = `ret_${idx}`;
        if (!seenBlockIds.has(blockId)) {
          seenBlockIds.add(blockId);
          derived.push({
            id: blockId,
            category: 'functions',
            type: 'statement',
            label: `Retornar Resultado: [VAL]`,
            title: `Retorno de Função: Devolve o valor calculado "${expr}" como resultado final da regra.`,
            defaultValues: { VAL: expr },
            toLua: (b) => `retornar ${b.values.VAL || expr}`
          });
        }
        return;
      }

      // 3. Conditional: se condition entao
      const ifMatch = line.match(/^se\s+(.+)\s+entao$/);
      if (ifMatch) {
        const condStr = ifMatch[1].trim();
        const blockId = `cond_if_${idx}`;
        if (!seenBlockIds.has(blockId)) {
          seenBlockIds.add(blockId);
          derived.push({
            id: blockId,
            category: 'conditions',
            type: 'container',
            label: `Se [COND] Então:`,
            title: `Condição Lógica: Verifica se "${condStr}" antes de prosseguir com a fabricação.`,
            defaultValues: { COND: condStr },
            options: {
              COND: [condStr, 'palha >= 5', 'ferro >= 5', 'madeira >= 8', 'ouro >= 10', 'energia >= 20', 'amizade >= 50', 'horario >= 18', 'temperatura >= 1000']
            },
            children: [],
            toLua: (b, engine) => {
              const inner = engine.transpileBlockList(b.children || [], '  ');
              return `se ${b.values.COND || condStr} entao\n${inner ? inner + '\n' : '  -- encaixe sua acao aqui\n'}fim`;
            }
          });
        }
        return;
      }

      // 4. Loop: para i = 1, N faca
      const forMatch = line.match(/^para\s+([a-zA-Z_]\w*)\s*=\s*(\d+)\s*,\s*(\d+)\s+faca$/);
      if (forMatch) {
        const varI = forMatch[1];
        const countStart = forMatch[2];
        const countEnd = forMatch[3];
        const blockId = `loop_for_${idx}`;
        if (!seenBlockIds.has(blockId)) {
          seenBlockIds.add(blockId);
          derived.push({
            id: blockId,
            category: 'loops',
            type: 'container',
            label: `Repetir ${countEnd} Vezes (${varI} = ${countStart} até [COUNT]):`,
            title: `Laço de Repetição: Executa as ações internas ${countEnd} vezes automaticamente.`,
            defaultValues: { COUNT: countEnd },
            children: [],
            toLua: (b, engine) => {
              const inner = engine.transpileBlockList(b.children || [], '  ');
              return `para ${varI} = ${countStart}, ${b.values.COUNT || countEnd} faca\n${inner ? inner + '\n' : '  -- acao do laco\n'}fim`;
            }
          });
        }
        return;
      }

      // 5. Function definition: funcao name(param)
      const funcDefMatch = line.match(/^funcao\s+([a-zA-Z_]\w*)\s*\((.*?)\)$/);
      if (funcDefMatch) {
        const fName = funcDefMatch[1];
        const fParam = funcDefMatch[2];
        const blockId = `func_def_${fName}_${idx}`;
        const fNamePT = fName.replace(/_/g, ' ');
        if (!seenBlockIds.has(blockId)) {
          seenBlockIds.add(blockId);
          derived.push({
            id: blockId,
            category: 'functions',
            type: 'container',
            label: fParam ? `Definir Regra ${fNamePT}([PARAM]):` : `Definir Regra ${fNamePT}():`,
            title: `Definição de Função: Cria uma regra especial com todos os passos para ${fNamePT}.`,
            defaultValues: { NAME: fName, PARAM: fParam },
            children: [],
            toLua: (b, engine) => {
              const inner = engine.transpileBlockList(b.children || [], '  ');
              return `funcao ${fName}(${b.values.PARAM !== undefined ? b.values.PARAM : fParam})\n${inner ? inner + '\n' : '  -- acoes da funcao\n'}fim`;
            }
          });
        }
        return;
      }

      // 6. Function / Action call: action(args)
      const callMatch = line.match(/^([a-zA-Z_]\w*)\s*\((.*?)\)$/);
      if (callMatch) {
        const actName = callMatch[1];
        const rawArgs = callMatch[2].trim();
        const blockId = `call_${actName}_${idx}`;
        if (!seenBlockIds.has(blockId)) {
          seenBlockIds.add(blockId);

          if (actName === 'fabricar_movel') {
            const parts = rawArgs.split(',').map(s => s.trim());
            const itemVal = parts[0] ? parts[0].replace(/^["']|["']$/g, '') : (lesson.unlockedAssetId || 'prop_chair_wood');
            const matVal = parts[1] || 'material';

            derived.push({
              id: blockId,
              category: 'actions',
              type: 'statement',
              label: `Fabricar Móvel: [ITEM] com [MAT]`,
              title: `Ação de Carpintaria: Constrói a peça de mobília "${PT_BR_DICTIONARY[itemVal]?.name || itemVal}" usando ${matVal}.`,
              defaultValues: { ITEM: itemVal, MAT: matVal },
              options: {
                ITEM: [itemVal, 'prop_chair_wood', 'prop_table_crafting', 'prop_bed_straw', 'prop_bed_canopy', 'prop_tent_adventurer', 'prop_house_cottage'],
                MAT: [matVal, 'material', 'carvalho', 'pinheiro', 'madeira_macica', 'ferro']
              },
              toLua: (b) => {
                const it = b.values.ITEM || itemVal;
                const mt = b.values.MAT || matVal;
                return `fabricar_movel("${it}", ${mt})`;
              }
            });
          } else if (actName === 'fabricar_mesa') {
            const parts = rawArgs.split(',').map(s => s.trim());
            const tampoVal = parts[0] || 'tampo';
            const pernasVal = parts[1] || '4';

            derived.push({
              id: blockId,
              category: 'actions',
              type: 'statement',
              label: `Fabricar Mesa: [TAMPO] com [PERNAS] pernas`,
              title: `Ação de Carpintaria: Fabrica uma mesa de estudos com 4 pernas e tampo de madeira maciça.`,
              defaultValues: { TAMPO: tampoVal, PERNAS: pernasVal },
              options: {
                TAMPO: [tampoVal, 'tampo', 'madeira_macica', 'carvalho', 'pinheiro'],
                PERNAS: ['4', '3', '6']
              },
              toLua: (b) => {
                const tp = b.values.TAMPO || tampoVal;
                const pr = b.values.PERNAS || pernasVal;
                return `fabricar_mesa(${tp}, ${pr})`;
              }
            });
          } else if (actName === 'forjar_ferramenta') {
            const parts = rawArgs.split(',').map(s => s.trim());
            const toolVal = parts[0] ? parts[0].replace(/^["']|["']$/g, '') : 'tool_shovel_iron';
            const matVal = parts[1] || 'metal';

            derived.push({
              id: blockId,
              category: 'actions',
              type: 'statement',
              label: `Forjar Ferramenta: [TOOL] com [MAT]`,
              title: `Ação de Ferraria: Forja a ferramenta "${PT_BR_DICTIONARY[toolVal]?.name || toolVal}" na bigorna.`,
              defaultValues: { TOOL: toolVal, MAT: matVal },
              options: {
                TOOL: [toolVal, 'tool_shovel_iron', 'tool_axe_woodcutter', 'tool_pickaxe_miner', 'tool_watering_can', 'tool_fishing_rod', 'tool_bug_net'],
                MAT: [matVal, 'metal', 'ferro', 'ouro', 'cobre']
              },
              toLua: (b) => `forjar_ferramenta("${b.values.TOOL || toolVal}", ${b.values.MAT || matVal})`
            });
          } else if (actName === 'assentar_piso') {
            const parts = rawArgs.split(',').map(s => s.trim());
            const pisoVal = parts[0] ? parts[0].replace(/^["']|["']$/g, '') : 'tile_ground_dirt_track';
            const soloVal = parts[1] || '';

            derived.push({
              id: blockId,
              category: 'actions',
              type: 'statement',
              label: soloVal ? `Assentar Piso: [PISO] no [SOLO]` : `Assentar Piso: [PISO]`,
              title: `Ação de Pavimentação: Assenta o piso "${PT_BR_DICTIONARY[pisoVal]?.name || pisoVal}" no terreno.`,
              defaultValues: { PISO: pisoVal, SOLO: soloVal },
              options: {
                PISO: [pisoVal, 'tile_ground_dirt_track', 'tile_ground_cobblestone', 'tile_ground_wood_planks', 'tile_ground_flower_grass', 'tile_ground_sand_beach', 'tile_ground_stone_mosaic']
              },
              toLua: (b) => {
                const p = b.values.PISO || pisoVal;
                const s = b.values.SOLO || soloVal;
                return s ? `assentar_piso("${p}", ${s})` : `assentar_piso("${p}")`;
              }
            });
          } else {
            // General function or action call
            const actNamePT = PT_BR_DICTIONARY[actName]?.name || actName.replace(/_/g, ' ');
            derived.push({
              id: blockId,
              category: 'actions',
              type: 'statement',
              label: rawArgs ? `Executar ${actNamePT}: [ARGS]` : `Executar ${actNamePT}()`,
              title: `Ação: Chama e executa o comando "${actNamePT}".`,
              defaultValues: { ARGS: rawArgs },
              toLua: (b) => {
                const args = b.values.ARGS !== undefined ? b.values.ARGS : rawArgs;
                return `${actName}(${args})`;
              }
            });
          }
        }
        return;
      }
    });

    // Fallback: If no blocks were derived, provide standard recipe block
    if (derived.length === 0) {
      derived.push({
        id: `var_${lesson.id || 'mat'}`,
        category: 'variables',
        type: 'statement',
        label: 'Definir material = [VAL]',
        title: 'Variável: Define o material base para o desafio.',
        defaultValues: { VAL: 'carvalho' },
        options: { VAL: ['carvalho', 'pinheiro', 'madeira_macica', 'ferro_puro', 'ouro'] },
        toLua: (b) => `local material = "${b.values.VAL || 'carvalho'}"`
      });
      derived.push({
        id: `act_${lesson.id || 'craft'}`,
        category: 'actions',
        type: 'statement',
        label: `Fabricar: ${lesson.unlockedAssetName || 'Item Especial'}`,
        title: `Ação: Fabrica o item ${lesson.unlockedAssetName || 'Item Especial'}.`,
        defaultValues: {},
        toLua: () => `fabricar_movel("${lesson.unlockedAssetId || 'prop_chair_wood'}", material)`
      });
    }

    return derived;
  }

  parseStarterLuaToBlocks(luaCode) {
    const lines = (luaCode || '').split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('--'));
    this.blocksInWorkspace = [];

    let currentContainer = null;

    lines.forEach((line) => {
      if (line === 'fim' || line === 'end') {
        currentContainer = null;
        return;
      }

      const block = this.createBlockFromLuaLine(line);
      if (block) {
        if (currentContainer && currentContainer.type === 'container') {
          currentContainer.children = currentContainer.children || [];
          currentContainer.children.push(block);
        } else {
          this.blocksInWorkspace.push(block);
          if (block.type === 'container') {
            currentContainer = block;
          }
        }
      }
    });
  }

  createBlockFromLuaLine(line) {
    // 1. local name = "val" or num or table
    const varMatch = line.match(/^local\s+([a-zA-Z_]\w*)\s*=\s*(.*)$/);
    if (varMatch) {
      const name = varMatch[1];
      let val = varMatch[2].trim();
      const isTable = val.startsWith('{');
      const cleanVal = isTable ? val : val.replace(/^["']|["']$/g, '');
      const tmpl = this.availableBlocks.find(b => b.category === 'variables' && (b.id.includes(name) || !b.id.includes('custom'))) || this.availableBlocks.find(b => b.category === 'variables') || this.availableBlocks[0];
      return this.instantiateBlock(tmpl, { NAME: name, VAL: cleanVal });
    }

    // 2. Loop for
    const forMatch = line.match(/^para\s+([a-zA-Z_]\w*)\s*=\s*(\d+)\s*,\s*(\d+)\s+faca$/);
    if (forMatch) {
      const tmpl = this.availableBlocks.find(b => b.category === 'loops') || this.availableBlocks[0];
      return this.instantiateBlock(tmpl, { COUNT: forMatch[3] });
    }

    // 3. Condition se
    const ifMatch = line.match(/^se\s+(.+)\s+entao$/);
    if (ifMatch) {
      const tmpl = this.availableBlocks.find(b => b.category === 'conditions') || this.availableBlocks[0];
      return this.instantiateBlock(tmpl, { COND: ifMatch[1] });
    }

    // 4. Function definition
    const funcDefMatch = line.match(/^funcao\s+([a-zA-Z_]\w*)\s*\((.*?)\)$/);
    if (funcDefMatch) {
      const fName = funcDefMatch[1];
      const fParam = funcDefMatch[2];
      const tmpl = this.availableBlocks.find(b => b.category === 'functions' && b.type === 'container') || this.availableBlocks[0];
      return this.instantiateBlock(tmpl, { NAME: fName, PARAM: fParam });
    }

    // 5. Return statement
    const retMatch = line.match(/^retornar\s+(.*)$/);
    if (retMatch) {
      const tmpl = this.availableBlocks.find(b => b.id.includes('ret') || (b.category === 'functions' && b.type === 'statement')) || this.availableBlocks[0];
      return this.instantiateBlock(tmpl, { VAL: retMatch[1].trim() });
    }

    // 6. Function / Action call
    const actionMatch = line.match(/^([a-zA-Z_]\w*)\s*\((.*?)\)$/);
    if (actionMatch) {
      const actName = actionMatch[1];
      const args = actionMatch[2];
      const tmpl = this.availableBlocks.find(b => b.id === `call_${actName}` || b.id.includes(`call_${actName}`) || (b.category === 'actions' && b.id.includes(actName))) ||
                   this.availableBlocks.find(b => b.category === 'actions') || this.availableBlocks[0];

      const parts = args.split(',').map(s => s.trim());
      const itemVal = parts[0] ? parts[0].replace(/^["']|["']$/g, '') : '';
      const matVal = parts[1] ? parts[1].replace(/^["']|["']$/g, '') : 'material';

      return this.instantiateBlock(tmpl, {
        ARGS: args,
        ITEM: itemVal,
        MAT: matVal,
        TAMPO: parts[0] ? parts[0].replace(/^["']|["']$/g, '') : 'tampo',
        PERNAS: parts[1] ? parts[1].replace(/^["']|["']$/g, '') : '4',
        TOOL: itemVal,
        ARBUSTO: itemVal,
        PISO: itemVal,
        SOLO: parts[1] || '',
        VAL: itemVal
      });
    }

    return null;
  }

  instantiateBlock(template, initialValues = {}) {
    if (!template) return null;
    return {
      instanceId: `block_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      templateId: template.id,
      category: template.category,
      type: template.type || 'statement',
      label: template.label,
      title: template.title || 'Bloco de Programação',
      values: { ...(template.defaultValues || {}), ...initialValues },
      options: template.options || {},
      toLua: template.toLua,
      children: [],
      elseChildren: []
    };
  }

  // Visual droplet splash on snap across the full block width (Animal Island Checkbox Style)
  spawnSnapDroplets(element) {
    if (!element || typeof document === 'undefined') return;
    const rect = element.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const container = document.createElement('div');
    container.className = 'animal-snap-droplet-container';

    // Animal Island mint, cyan, turquoise and warm golden accent palette
    const colors = ['#19c8b9', '#3dd4c6', '#0f8e83', '#5eead4', '#2dd4bf', '#f59e0b', '#38bdf8'];
    const numPoints = Math.max(10, Math.min(22, Math.round(rect.width / 24)));

    // Top Edge Droplets
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const x = rect.left + t * rect.width;
      const y = rect.top + 2;

      const droplet = document.createElement('div');
      droplet.className = 'animal-snap-droplet';
      droplet.style.left = `${x}px`;
      droplet.style.top = `${y}px`;

      const angle = (-135 + t * 90) * (Math.PI / 180);
      const distance = 26 + Math.random() * 24;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;
      const size = 8 + Math.random() * 6;
      const delay = Math.random() * 0.08;

      droplet.style.width = `${size}px`;
      droplet.style.height = `${size}px`;
      droplet.style.setProperty('--splash-dx', `${dx.toFixed(1)}px`);
      droplet.style.setProperty('--splash-dy', `${dy.toFixed(1)}px`);
      droplet.style.background = colors[i % colors.length];
      droplet.style.animationDelay = `${delay.toFixed(3)}s`;

      container.appendChild(droplet);
    }

    // Bottom Edge Droplets
    const bottomPoints = Math.max(6, Math.round(numPoints * 0.7));
    for (let i = 0; i <= bottomPoints; i++) {
      const t = i / bottomPoints;
      const x = rect.left + t * rect.width;
      const y = rect.bottom - 2;

      const droplet = document.createElement('div');
      droplet.className = 'animal-snap-droplet';
      droplet.style.left = `${x}px`;
      droplet.style.top = `${y}px`;

      const angle = (135 - t * 90) * (Math.PI / 180);
      const distance = 22 + Math.random() * 20;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;
      const size = 7 + Math.random() * 5;
      const delay = 0.02 + Math.random() * 0.08;

      droplet.style.width = `${size}px`;
      droplet.style.height = `${size}px`;
      droplet.style.setProperty('--splash-dx', `${dx.toFixed(1)}px`);
      droplet.style.setProperty('--splash-dy', `${dy.toFixed(1)}px`);
      droplet.style.background = colors[(i + 2) % colors.length];
      droplet.style.animationDelay = `${delay.toFixed(3)}s`;

      container.appendChild(droplet);
    }

    document.body.appendChild(container);
    element.classList.add('snap-glow-active');

    setTimeout(() => {
      element.classList.remove('snap-glow-active');
      container.remove();
    }, 1150);
  }

  // Helper to collect all template IDs currently in workspace
  getUsedTemplateIds() {
    const used = [];
    const collect = (blocks) => {
      if (!blocks || !Array.isArray(blocks)) return;
      blocks.forEach(b => {
        if (b.templateId) used.push(b.templateId);
        if (b.children && b.children.length > 0) collect(b.children);
        if (b.elseChildren && b.elseChildren.length > 0) collect(b.elseChildren);
      });
    };
    collect(this.blocksInWorkspace);
    return used;
  }

  // Render the Block Palette (Left Column) with Portuguese Tooltips
  renderPalette() {
    if (!this.paletteEl) return;
    this.paletteEl.innerHTML = '';

    const usedTemplateIds = this.getUsedTemplateIds();
    const usedCounts = {};
    usedTemplateIds.forEach(id => {
      usedCounts[id] = (usedCounts[id] || 0) + 1;
    });

    const pool = this.activeCategory === 'all'
      ? this.availableBlocks
      : this.availableBlocks.filter(b => b.category === this.activeCategory);

    const seenInPool = {};
    const blocksToShow = pool.filter(tmpl => {
      const tmplId = tmpl.id;
      seenInPool[tmplId] = (seenInPool[tmplId] || 0) + 1;
      const alreadyUsed = usedCounts[tmplId] || 0;
      return seenInPool[tmplId] > alreadyUsed;
    });

    if (blocksToShow.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'codekit-empty-palette';
      empty.setAttribute('title', 'Todas as peças necessárias já foram arrastadas para a mesa de montagem!');
      empty.innerHTML = `
        <svg class="ui-icon" style="width: 28px; height: 28px; color: var(--animal-primary, #19c8b9); margin-bottom: 6px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>Todas as peças da missão foram colocadas na mesa!</span>
      `;
      this.paletteEl.appendChild(empty);
      return;
    }

    blocksToShow.forEach((tmpl) => {
      const cat = BLOCK_CATEGORIES[tmpl.category] || BLOCK_CATEGORIES.actions;
      const card = document.createElement('div');
      card.className = `codekit-block palette-block block-${tmpl.category} ${tmpl.type || 'statement'}`;
      card.style.setProperty('--block-color', cat.color);
      card.style.setProperty('--block-dark', cat.darkColor);
      card.setAttribute('draggable', 'true');
      card.setAttribute('title', tmpl.title || `Arraste para a mesa: ${cat.name}`);

      let displayLabel = tmpl.label;
      const phMatches = tmpl.label.match(/\[([A-Z_]+)\]/g) || [];
      phMatches.forEach((ph) => {
        const fieldKey = ph.replace(/\[|\]/g, '');
        const defaultVal = tmpl.defaultValues?.[fieldKey] !== undefined ? tmpl.defaultValues[fieldKey] : '';
        const optList = tmpl.options && tmpl.options[fieldKey];
        if (optList && optList.length > 0) {
          const vis = getBlockOptionVisual(defaultVal);
          displayLabel = displayLabel.replace(ph, `<span class="codekit-palette-icon-badge" title="${vis.title}">${vis.icon}</span>`);
        } else {
          displayLabel = displayLabel.replace(ph, `<span class="codekit-palette-text-badge" title="${defaultVal || 'Valor padrão'}">${defaultVal || '●'}</span>`);
        }
      });

      card.innerHTML = `
        <div class="puzzle-tab" title="Encaixe superior da peça"></div>
        <div class="codekit-block-header">
          <span class="codekit-block-cat-dot" style="background: ${cat.accentColor};" title="${cat.name}"></span>
          <span class="codekit-block-label">${displayLabel}</span>
        </div>
        <div class="puzzle-notch" title="Encaixe inferior da peça"></div>
      `;

      card.addEventListener('dragstart', (e) => {
        soundFX.playPickUp();
        this.draggedBlockTemplate = tmpl;
        this.draggedWorkspaceBlockId = null;
        e.dataTransfer.setData('text/plain', tmpl.id);
        card.classList.add('is-dragging');
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('is-dragging');
        this.draggedBlockTemplate = null;
      });

      this.paletteEl.appendChild(card);
    });
  }

  setupWorkspaceEvents() {
    if (!this.workspaceEl) return;

    this.workspaceEl.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.workspaceEl.classList.add('drag-over-workspace');
    });

    this.workspaceEl.addEventListener('dragleave', () => {
      this.workspaceEl.classList.remove('drag-over-workspace');
    });

    this.workspaceEl.addEventListener('drop', (e) => {
      e.preventDefault();
      this.workspaceEl.classList.remove('drag-over-workspace');

      if (this.draggedBlockTemplate) {
        const newBlock = this.instantiateBlock(this.draggedBlockTemplate);
        this.blocksInWorkspace.push(newBlock);
        this.renderWorkspace();
        this.renderPalette();
        this.updateCodePreview();
        soundFX.playSnap();

        const lastBlockEl = this.workspaceEl?.querySelector('.codekit-block:last-child');
        if (lastBlockEl) this.spawnSnapDroplets(lastBlockEl);

        if (this.onBlockAdded) this.onBlockAdded(newBlock);
      }
    });
  }

  // Render the Workspace (Center Canvas)
  renderWorkspace() {
    if (!this.workspaceEl) return;
    this.workspaceEl.innerHTML = '';

    if (this.blocksInWorkspace.length === 0) {
      const firstTmpl = this.availableBlocks && this.availableBlocks[0];
      const cat = firstTmpl ? (BLOCK_CATEGORIES[firstTmpl.category] || BLOCK_CATEGORIES.actions) : BLOCK_CATEGORIES.actions;
      const ghostLabel = firstTmpl ? firstTmpl.label.replace(/\[([A-Z_]+)\]/g, '●') : 'Definir Material';

      const placeholder = document.createElement('div');
      placeholder.className = 'codekit-workspace-placeholder';
      placeholder.setAttribute('title', 'Área de Montagem de Códigos: Arraste blocos da esquerda para construir.');
      placeholder.innerHTML = `
        <div class="codekit-empty-hero">
          <svg class="ui-icon" style="width: 44px; height: 44px; color: var(--animal-primary-dark, #0f8e83);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
          <span class="placeholder-title">Mesa de Montagem Pronta</span>
          <span class="placeholder-desc">Arraste as peças da paleta à esquerda para montar seu código!</span>
        </div>
        <div class="tutorial-ghost-container" id="tutorial-ghost-container">
          <div class="tutorial-ghost-track">
            <div class="tutorial-ghost-target-zone" title="Solte a peça aqui">
              <svg class="ui-icon" style="width: 18px; height: 18px; color: #19c8b9;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14"></path>
              </svg>
              <span>Solte a peça aqui</span>
            </div>
          </div>
        </div>
      `;
      this.workspaceEl.appendChild(placeholder);
      this.ensureGhostOverlay(cat, ghostLabel);
      requestAnimationFrame(() => {
        this.updateGhostAnimationCoordinates();
      });
      setTimeout(() => {
        this.updateGhostAnimationCoordinates();
      }, 100);
      return;
    }

    this.removeGhostOverlay();

    const tree = document.createElement('div');
    tree.className = 'codekit-block-tree';

    this.blocksInWorkspace.forEach((block, index) => {
      const blockEl = this.createWorkspaceBlockElement(block, this.blocksInWorkspace, index);
      tree.appendChild(blockEl);
    });

    this.workspaceEl.appendChild(tree);
  }

  removeGhostOverlay() {
    const existing = document.getElementById('tutorial-ghost-actor-overlay');
    if (existing) existing.remove();
  }

  ensureGhostOverlay(cat, ghostLabel) {
    let overlay = document.getElementById('tutorial-ghost-actor-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'tutorial-ghost-actor-overlay';
      overlay.className = 'tutorial-ghost-actor';
      document.body.appendChild(overlay);
    }
    overlay.innerHTML = `
      <div class="codekit-block ghost-demonstration-card" style="background: ${cat.color}; box-shadow: inset 0 -3px 0 ${cat.darkColor}, 0 8px 24px rgba(0,0,0,0.35);" title="Demonstração: Arraste a peça">
        <div class="puzzle-tab"></div>
        <div class="codekit-block-header">
          <span class="codekit-block-cat-dot" style="background: ${cat.accentColor};"></span>
          <span class="codekit-block-label">${ghostLabel}</span>
        </div>
        <div class="puzzle-notch"></div>
      </div>
      <div class="tutorial-ghost-hand">
        <svg class="tutorial-hand-svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 11.24V7.5a2.5 2.5 0 0 1 5 0v3.74c1.21-.81 2-2.18 2-3.74a4.5 4.5 0 0 0-9 0c0 1.56.79 2.93 2 3.74zm9.84 4.63-4.54-2.26A2 2 0 0 0 13.4 13.5H13v-6a1.5 1.5 0 0 0-3 0v10.74l-3.44-.72a1.5 1.5 0 0 0-1.57.65l-.79 1.18 5.4 5.4c.56.56 1.33.88 2.12.88H18a3 3 0 0 0 3-3v-4.24a2 2 0 0 0-1.16-1.82z"/>
        </svg>
        <span class="tutorial-hand-tip">Encaixar Bloco</span>
      </div>
    `;
    this.updateGhostAnimationCoordinates();
  }

  updateGhostAnimationCoordinates() {
    const ghostActor = document.getElementById('tutorial-ghost-actor-overlay');
    const targetSlot = this.workspaceEl?.querySelector('.tutorial-ghost-target-zone');
    const paletteBlock = this.paletteEl?.querySelector('.palette-block');

    if (!ghostActor || !targetSlot) {
      if (ghostActor && (!targetSlot || this.blocksInWorkspace.length > 0)) {
        this.removeGhostOverlay();
      }
      return;
    }

    const codingModal = document.getElementById('coding-modal') || document.getElementById('coding-studio-modal');
    if (codingModal && (codingModal.style.display === 'none' || getComputedStyle(codingModal).display === 'none')) {
      this.removeGhostOverlay();
      return;
    }

    const paletteRect = paletteBlock ? paletteBlock.getBoundingClientRect() : (this.paletteEl ? this.paletteEl.getBoundingClientRect() : null);
    const targetRect = targetSlot.getBoundingClientRect();

    if (paletteRect && paletteRect.width > 0 && targetRect.width > 0) {
      const startX = paletteRect.left + (paletteRect.width / 2) - 80;
      const startY = paletteRect.top + (paletteRect.height / 2) - 20;

      const endX = targetRect.left + (targetRect.width / 2) - 80;
      const endY = targetRect.top + (targetRect.height / 2) - 20;

      ghostActor.style.setProperty('--start-x', `${Math.round(startX)}px`);
      ghostActor.style.setProperty('--start-y', `${Math.round(startY)}px`);
      ghostActor.style.setProperty('--end-x', `${Math.round(endX)}px`);
      ghostActor.style.setProperty('--end-y', `${Math.round(endY)}px`);
    }
  }

  // Mentor help auto-snap assistant
  snapNextBlockWithAnimation(onComplete = null) {
    if (!this.availableBlocks || this.availableBlocks.length === 0) return;

    const usedTemplateIds = this.getUsedTemplateIds();
    const usedCounts = {};
    usedTemplateIds.forEach(id => {
      usedCounts[id] = (usedCounts[id] || 0) + 1;
    });

    const seenInPool = {};
    const nextTmpl = this.availableBlocks.find(tmpl => {
      seenInPool[tmpl.id] = (seenInPool[tmpl.id] || 0) + 1;
      return seenInPool[tmpl.id] > (usedCounts[tmpl.id] || 0);
    }) || this.availableBlocks[0];

    if (!nextTmpl) return;

    const cat = BLOCK_CATEGORIES[nextTmpl.category] || BLOCK_CATEGORIES.actions;
    const ghostLabel = nextTmpl.label.replace(/\[([A-Z_]+)\]/g, '●');

    const paletteCards = this.paletteEl?.querySelectorAll('.palette-block');
    const startCard = paletteCards && paletteCards[0] ? paletteCards[0] : null;
    const startRect = startCard ? startCard.getBoundingClientRect() : { left: 120, top: 220, width: 160, height: 44 };
    const wsRect = this.workspaceEl ? this.workspaceEl.getBoundingClientRect() : { left: 450, top: 220, width: 260, height: 200 };

    const flyingGhost = document.createElement('div');
    flyingGhost.className = 'tutorial-fly-ghost';
    flyingGhost.style.left = `${startRect.left}px`;
    flyingGhost.style.top = `${startRect.top}px`;
    flyingGhost.innerHTML = `
      <div class="codekit-block ghost-flying-card" style="background: ${cat.color}; box-shadow: inset 0 -3px 0 ${cat.darkColor}, 0 8px 24px rgba(0,0,0,0.3);" title="Encaixando bloco...">
        <div class="puzzle-tab"></div>
        <div class="codekit-block-header">
          <span class="codekit-block-cat-dot" style="background: ${cat.accentColor};"></span>
          <span class="codekit-block-label">${ghostLabel}</span>
        </div>
        <div class="puzzle-notch"></div>
      </div>
      <div class="tutorial-flying-hand">
        <svg class="tutorial-hand-svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 11.24V7.5a2.5 2.5 0 0 1 5 0v3.74c1.21-.81 2-2.18 2-3.74a4.5 4.5 0 0 0-9 0c0 1.56.79 2.93 2 3.74zm9.84 4.63-4.54-2.26A2 2 0 0 0 13.4 13.5H13v-6a1.5 1.5 0 0 0-3 0v10.74l-3.44-.72a1.5 1.5 0 0 0-1.57.65l-.79 1.18 5.4 5.4c.56.56 1.33.88 2.12.88H18a3 3 0 0 0 3-3v-4.24a2 2 0 0 0-1.16-1.82z"/>
        </svg>
      </div>
    `;
    document.body.appendChild(flyingGhost);
    soundFX.playPickUp();

    requestAnimationFrame(() => {
      flyingGhost.style.transition = 'all 0.65s cubic-bezier(0.25, 1, 0.5, 1)';
      flyingGhost.style.left = `${wsRect.left + 35}px`;
      flyingGhost.style.top = `${wsRect.top + 35 + (this.blocksInWorkspace.length * 48)}px`;
      flyingGhost.style.transform = 'scale(1.04)';
    });

    setTimeout(() => {
      flyingGhost.remove();
      const newBlock = this.instantiateBlock(nextTmpl);
      this.blocksInWorkspace.push(newBlock);
      this.renderWorkspace();
      this.renderPalette();
      this.updateCodePreview();
      soundFX.playSnap();

      const lastBlockEl = this.workspaceEl?.querySelector('.codekit-block:last-child');
      if (lastBlockEl) this.spawnSnapDroplets(lastBlockEl);

      if (this.onBlockAdded) this.onBlockAdded(newBlock);
      if (onComplete) onComplete(newBlock);
    }, 680);
  }

  createWorkspaceBlockElement(block, parentArray, index) {
    const cat = BLOCK_CATEGORIES[block.category] || BLOCK_CATEGORIES.actions;
    const el = document.createElement('div');
    el.className = `codekit-block workspace-block block-${block.category} ${block.type}`;
    el.style.setProperty('--block-color', cat.color);
    el.style.setProperty('--block-dark', cat.darkColor);
    el.setAttribute('draggable', 'true');
    el.setAttribute('title', block.title || `Bloco de ${cat.name}: Arraste para reposicionar.`);

    let labelHtml = block.label;
    const placeholderMatches = block.label.match(/\[([A-Z_]+)\]/g) || [];

    placeholderMatches.forEach((ph) => {
      const fieldKey = ph.replace(/\[|\]/g, '');
      const currentVal = block.values[fieldKey] !== undefined ? block.values[fieldKey] : '';
      const optList = block.options && block.options[fieldKey];

      if (optList && optList.length > 0) {
        const curVis = getBlockOptionVisual(currentVal);
        let optOptionsHtml = '';
        optList.forEach(opt => {
          const optVis = getBlockOptionVisual(opt);
          optOptionsHtml += `
            <button type="button" class="codekit-select-opt-btn ${opt === currentVal ? 'is-active' : ''}" data-val="${opt}" title="${optVis.title}">
              <span class="codekit-opt-icon">${optVis.icon}</span>
            </button>
          `;
        });

        const selectHtml = `
          <div class="codekit-custom-select" data-field="${fieldKey}">
            <button type="button" class="codekit-select-trigger" title="${curVis.title}">
              <span class="codekit-select-curr-icon">${curVis.icon}</span>
              <svg class="codekit-select-caret" viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="3"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
            <div class="codekit-select-menu" style="display: none;">
              ${optOptionsHtml}
            </div>
          </div>
        `;
        labelHtml = labelHtml.replace(ph, selectHtml);
      } else {
        const isNumeric = (fieldKey === 'COUNT' || fieldKey === 'START' || fieldKey === 'END' || fieldKey === 'POS' || (!isNaN(Number(currentVal)) && String(currentVal).trim() !== '' && !isNaN(parseFloat(currentVal))));
        if (isNumeric) {
          labelHtml = labelHtml.replace(ph, `<input type="number" step="1" min="1" class="block-input-text block-input-number" data-field="${fieldKey}" value="${currentVal}" title="Digite o número desejado" />`);
        } else {
          labelHtml = labelHtml.replace(ph, `<input type="text" class="block-input-text" data-field="${fieldKey}" value="${currentVal}" title="Digite o texto ou nome da variável" />`);
        }
      }
    });

    if (block.type === 'container') {
      el.innerHTML = `
        <div class="puzzle-tab" title="Encaixe superior"></div>
        <div class="codekit-block-header">
          <div class="codekit-block-content">${labelHtml}</div>
          <button class="block-delete-btn" title="Remover este bloco da mesa de montagem"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
        </div>
        <div class="codekit-container-jaw drop-slot-inner" title="Encaixe ações ou comandos aqui dentro"></div>
        <div class="codekit-container-footer" title="Fim do bloco de repetição ou condição">
          <span>fim</span>
        </div>
        <div class="puzzle-notch" title="Encaixe inferior"></div>
      `;
    } else {
      el.innerHTML = `
        <div class="puzzle-tab" title="Encaixe superior"></div>
        <div class="codekit-block-header">
          <div class="codekit-block-content">${labelHtml}</div>
          <button class="block-delete-btn" title="Remover este bloco da mesa de montagem"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
        </div>
        <div class="puzzle-notch" title="Encaixe inferior"></div>
      `;
    }

    // Input change events
    el.querySelectorAll('.block-input-text').forEach((input) => {
      input.addEventListener('input', (e) => {
        const key = input.dataset.field;
        block.values[key] = e.target.value;
        this.updateCodePreview();
      });
      input.addEventListener('change', (e) => {
        const key = input.dataset.field;
        block.values[key] = e.target.value;
        this.updateCodePreview();
      });
      input.addEventListener('mousedown', (e) => e.stopPropagation());
    });

    // Custom Visual Dropdown events
    el.querySelectorAll('.codekit-custom-select').forEach((selectWrapper) => {
      const fieldKey = selectWrapper.dataset.field;
      const trigger = selectWrapper.querySelector('.codekit-select-trigger');
      const menu = selectWrapper.querySelector('.codekit-select-menu');

      trigger?.addEventListener('click', (e) => {
        e.stopPropagation();
        soundFX.playPop(1.1);
        document.querySelectorAll('.codekit-select-menu').forEach(m => {
          if (m !== menu) m.style.display = 'none';
        });
        menu.style.display = (menu.style.display === 'none' || !menu.style.display) ? 'flex' : 'none';
      });

      menu?.querySelectorAll('.codekit-select-opt-btn').forEach((optBtn) => {
        optBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const chosenVal = optBtn.dataset.val;
          block.values[fieldKey] = chosenVal;
          soundFX.playPop(1.2);
          menu.style.display = 'none';
          this.renderWorkspace();
          this.updateCodePreview();
        });
      });

      selectWrapper.addEventListener('mousedown', (e) => e.stopPropagation());
    });

    // Delete button returns block to palette
    const deleteBtn = el.querySelector('.block-delete-btn');
    deleteBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      parentArray.splice(index, 1);
      this.renderWorkspace();
      this.renderPalette();
      this.updateCodePreview();
      soundFX.playPop(0.85);
    });

    // Drag events for workspace reordering
    el.addEventListener('dragstart', (e) => {
      e.stopPropagation();
      soundFX.playPickUp();
      this.draggedWorkspaceBlockId = block.instanceId;
      this.draggedBlockTemplate = null;
      e.dataTransfer.setData('text/plain', block.instanceId);
      el.classList.add('is-dragging');
    });

    el.addEventListener('dragend', () => {
      el.classList.remove('is-dragging');
      this.draggedWorkspaceBlockId = null;
    });

    // Nested children in C-block
    if (block.type === 'container') {
      const innerSlot = el.querySelector('.drop-slot-inner');
      if (innerSlot) {
        innerSlot.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.stopPropagation();
          innerSlot.classList.add('drag-over-inner');
        });

        innerSlot.addEventListener('dragleave', () => {
          innerSlot.classList.remove('drag-over-inner');
        });

        innerSlot.addEventListener('drop', (e) => {
          e.preventDefault();
          e.stopPropagation();
          innerSlot.classList.remove('drag-over-inner');

          if (this.draggedBlockTemplate) {
            const childBlock = this.instantiateBlock(this.draggedBlockTemplate);
            block.children = block.children || [];
            block.children.push(childBlock);
            this.renderWorkspace();
            this.renderPalette();
            this.updateCodePreview();
            soundFX.playSnap();
            this.spawnSnapDroplets(innerSlot);
            if (this.onBlockAdded) this.onBlockAdded(childBlock);
          }
        });

        if (block.children && block.children.length > 0) {
          block.children.forEach((child, cIdx) => {
            const childEl = this.createWorkspaceBlockElement(child, block.children, cIdx);
            innerSlot.appendChild(childEl);
          });
        }
      }
    }

    return el;
  }

  // Transpile visual workspace blocks to clean Lua code
  transpileBlockList(blocks, indent = '') {
    return blocks.map((b) => {
      if (typeof b.toLua === 'function') {
        const res = b.toLua(b, this);
        return res ? indent + res : '';
      }
      return '';
    }).filter(Boolean).join('\n');
  }

  generateLuaCode() {
    return this.transpileBlockList(this.blocksInWorkspace, '');
  }

  updateCodePreview() {
    const code = this.generateLuaCode();
    if (this.codeOutputEl) {
      this.codeOutputEl.value = code;
    }
    if (this.syntaxDisplayEl) {
      this.syntaxDisplayEl.innerHTML = this.renderSyntaxHighlightedLua(code);
    }
    if (this.onCodeChange) {
      this.onCodeChange(code);
    }
  }

  renderSyntaxHighlightedLua(rawCode) {
    if (!rawCode || rawCode.trim() === '') {
      return `<div class="codekit-code-line"><span class="codekit-line-num">1</span><span class="codekit-line-code"><span class="tok-comment">-- Monte as peças na mesa de montagem para gerar o código Lua</span></span></div>`;
    }

    const lines = rawCode.split('\n');
    return lines.map((line, idx) => {
      let lineHtml = line
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      // Comments
      if (lineHtml.trim().startsWith('--')) {
        lineHtml = `<span class="tok-comment">${lineHtml}</span>`;
      } else {
        // Strings
        lineHtml = lineHtml.replace(/(["'])(.*?)\1/g, '<span class="tok-string">$1$2$1</span>');

        // Keywords
        const keywords = ['local', 'se', 'entao', 'senao', 'fim', 'para', 'faca', 'funcao', 'enquanto', 'retorne', 'retornar', 'true', 'false', 'nil', 'and', 'or', 'not'];
        keywords.forEach(kw => {
          const reg = new RegExp(`\\b${kw}\\b`, 'g');
          lineHtml = lineHtml.replace(reg, `<span class="tok-keyword">${kw}</span>`);
        });

        // Function Calls
        lineHtml = lineHtml.replace(/\b([a-zA-Z_]\w*)\s*(?=\()/g, '<span class="tok-fn">$1</span>');

        // Numbers
        lineHtml = lineHtml.replace(/\b(\d+)\b/g, '<span class="tok-num">$1</span>');
      }

      return `<div class="codekit-code-line"><span class="codekit-line-num">${idx + 1}</span><span class="codekit-line-code">${lineHtml}</span></div>`;
    }).join('');
  }

  clearWorkspace() {
    this.blocksInWorkspace = [];
    this.renderWorkspace();
    this.renderPalette();
    this.updateCodePreview();
    soundFX.playPop(0.75);
  }
}

export default ScratchBlockEngine;
