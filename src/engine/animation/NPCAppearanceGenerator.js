/**
 * NPCAppearanceGenerator.js - KidsLearnCode
 * Gerador e repositório de configurações de aparência modular para NPCs.
 * Converte todos os personagens não-jogáveis da ilha em humanos/estilizados
 * consistentes, com base no acervo modular de tons de pele, cabelos, olhos,
 * narizes, bocas, bochechas, roupas e acessórios.
 */

import {
  SKIN_TONES,
  HAIR_COLORS,
  EYE_COLORS,
  CLOTH_PALETTES,
  DEFAULT_AVATAR_CONFIG
} from './AvatarConfig.js';

// Função utilitária de número pseudoaleatório determinístico (Mulberry32)
function createSeededRandom(seedStr) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 16777619);
  }
  return function () {
    h += 0x6D2B79F5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Configurações fixas e artesanais dos 9 NPCs Mestres da Ilha Lua.
 * Cada um possui paleta e roupas alinhadas com sua especialidade e personalidade.
 */
export const MASTER_NPC_CONFIGS = {
  // 1. Bambu, o Engenheiro (Mestre Construtor, Mobília & Casas)
  npc_monkey_builder: {
    ...DEFAULT_AVATAR_CONFIG,
    name: 'Bambu',
    gender: 'male',
    skinTone: '#ffd0a8',
    skinShadow: '#e0ae82',
    headStyle: 'head_07', // Cabelo curto despojado com volume
    hairColor: '#684022', // Castanho Médio
    hairShadow: '#452611',
    eyeShape: 'olhos_6',
    eyeColor: '#d97706', // Âmbar / Mel
    noseShape: 'nariz_1',
    mouthShape: 'boca_2', // Sorriso simpático
    cheeksShape: 'blush_1',
    cheeksColor: 'rgba(255, 126, 54, 0.5)',
    topStyle: 'top_sweater',
    topColorPrimary: '#c2410c', // Terracota
    topColorSecondary: '#fed7aa', // Pêssego
    bottomStyle: 'pants_cargo',
    bottomColor: '#78350f',
    shoesStyle: 'boots_hunter',
    shoesColor: '#78350f',
    glassesStyle: 'round_wire',
    glassesColor: '#5c3c26'
  },

  // 2. Brutus da Bigorna (Ferreiro Real, Ferramentas & Minérios)
  npc_bull_blacksmith: {
    ...DEFAULT_AVATAR_CONFIG,
    name: 'Brutus',
    gender: 'male',
    skinTone: '#9e5932', // Morena / Castanha
    skinShadow: '#773a15',
    headStyle: 'head_14', // Penteado robusto
    hairColor: '#1f242b', // Preto Ônix
    hairShadow: '#101317',
    eyeShape: 'olhos_3', // Olhar determinado
    eyeColor: '#8C501D',
    noseShape: 'nariz_3',
    mouthShape: 'boca_4', // Confiante / sério
    cheeksShape: 'none',
    topStyle: 'top_sleeveless', // Sem mangas para forja
    topColorPrimary: '#78350f', // Couro
    topColorSecondary: '#fed7aa',
    bottomStyle: 'pants_cargo',
    bottomColor: '#334155', // Carvão
    shoesStyle: 'boots_hunter',
    shoesColor: '#451a03',
    glassesStyle: 'none'
  },

  // 3. Flora dos Brotos (Herbalista, Sementes & Flora da Ilha)
  npc_rabbit_farmer: {
    ...DEFAULT_AVATAR_CONFIG,
    name: 'Flora',
    gender: 'female',
    skinTone: '#f8b88b', // Pêssego
    skinShadow: '#d69668',
    headStyle: 'head_12', // Cabelo ondulado com franja
    hairColor: '#a63a1e', // Ruivo Acobreado
    hairShadow: '#74200b',
    eyeShape: 'olhos_2', // Olhos expressivos com cílios suaves
    eyeColor: '#16a34a', // Verde Esmeralda
    noseShape: 'nariz_1',
    mouthShape: 'boca_1', // Sorriso alegre
    cheeksShape: 'blush_3', // Sardinhas / blush
    cheeksColor: 'rgba(255, 126, 54, 0.7)',
    topStyle: 'top_long_sleeve',
    topColorPrimary: '#059669', // Esmeralda
    topColorSecondary: '#fef08a', // Dourado
    bottomStyle: 'skirt_pleated',
    bottomColor: '#064e3b',
    shoesStyle: 'boots_hunter',
    shoesColor: '#78350f',
    glassesStyle: 'none'
  },

  // 4. Barnabé, o Barqueiro (Cercados, Portões & Pontes de Travessia)
  npc_alligator_ferryman: {
    ...DEFAULT_AVATAR_CONFIG,
    name: 'Barnabé',
    gender: 'male',
    skinTone: '#e59e6d', // Bronzeada
    skinShadow: '#be7847',
    headStyle: 'head_03',
    hairColor: '#3d2314', // Castanho Escuro
    hairShadow: '#241208',
    eyeShape: 'olhos_5',
    eyeColor: '#0d9488', // Teal
    noseShape: 'nariz_2',
    mouthShape: 'boca_3',
    cheeksShape: 'none',
    topStyle: 'top_tee',
    topColorPrimary: '#1e3a8a', // Azul Marinho
    topColorSecondary: '#93c5fd', // Celeste
    bottomStyle: 'shorts_denim',
    bottomColor: '#172554',
    shoesStyle: 'sandals_beach',
    shoesColor: '#78350f',
    glassesStyle: 'none'
  },

  // 5. Pingo dos Icebergs (Pesca, Redes & Elementos Aquáticos)
  npc_penguin_angler: {
    ...DEFAULT_AVATAR_CONFIG,
    name: 'Pingo',
    gender: 'male',
    skinTone: '#ffd0a8',
    skinShadow: '#e0ae82',
    headStyle: 'head_02',
    hairColor: '#2563eb', // Azul Oceano
    hairShadow: '#1d4ed8',
    eyeShape: 'olhos_1',
    eyeColor: '#2563eb', // Safira
    noseShape: 'nariz_1',
    mouthShape: 'boca_5', // Sorriso entusiasmado
    cheeksShape: 'blush_2',
    cheeksColor: 'rgba(56, 189, 248, 0.4)',
    topStyle: 'top_sweater',
    topColorPrimary: '#0891b2', // Turquesa
    topColorSecondary: '#fef08a',
    bottomStyle: 'pants_cargo',
    bottomColor: '#164e63',
    shoesStyle: 'boots_hunter',
    shoesColor: '#ea580c',
    glassesStyle: 'none'
  },

  // 6. Cromos, o Tecelão de Cores (Pisos, Pavimentações & Terrenos)
  npc_chameleon_magician: {
    ...DEFAULT_AVATAR_CONFIG,
    name: 'Cromos',
    gender: 'neutral',
    skinTone: '#ffdfc4', // Muito Clara
    skinShadow: '#e5be9e',
    headStyle: 'head_16', // Espetado Selvagem
    hairColor: '#a855f7', // Lavanda
    hairShadow: '#7e22ce',
    eyeShape: 'olhos_7',
    eyeColor: '#9333ea', // Ametista
    noseShape: 'nariz_4',
    mouthShape: 'boca_2',
    cheeksShape: 'blush_1',
    cheeksColor: 'rgba(168, 85, 247, 0.4)',
    topStyle: 'top_puffy_sleeve',
    topColorPrimary: '#7c3aed', // Violeta
    topColorSecondary: '#fbcfe8', // Lilás
    bottomStyle: 'pants_cargo',
    bottomColor: '#4c1d95',
    shoesStyle: 'sneakers_classic',
    shoesColor: '#19c8b9',
    glassesStyle: 'round_wire',
    glassesColor: '#d97706'
  },

  // 7. Kai, o Tubarão das Ondas (Infraestrutura da Vila, Desníveis & Poços)
  npc_shark_surfer: {
    ...DEFAULT_AVATAR_CONFIG,
    name: 'Kai',
    gender: 'male',
    skinTone: '#c97d4c', // Morena
    skinShadow: '#9e5628',
    headStyle: 'head_04', // Cabelo descontraído
    hairColor: '#f3c457', // Loiro Praiano
    hairShadow: '#c49429',
    eyeShape: 'olhos_4',
    eyeColor: '#0891b2',
    noseShape: 'nariz_2',
    mouthShape: 'boca_1',
    cheeksShape: 'blush_1',
    cheeksColor: 'rgba(255, 126, 54, 0.5)',
    topStyle: 'top_tee',
    topColorPrimary: '#ea580c', // Sunset Laranja
    topColorSecondary: '#fde047',
    bottomStyle: 'shorts_denim',
    bottomColor: '#2563eb',
    shoesStyle: 'sandals_beach',
    shoesColor: '#78350f',
    glassesStyle: 'sunglasses_cool',
    glassesColor: '#1e293b'
  },

  // 8. Dr. Arquimedes (Grão-Mestre da Academia, Fogo & Terminal)
  npc_owl_professor: {
    ...DEFAULT_AVATAR_CONFIG,
    name: 'Dr. Arquimedes',
    gender: 'male',
    skinTone: '#ffd0a8',
    skinShadow: '#e0ae82',
    headStyle: 'head_09', // Sábio com mechas
    hairColor: '#94a3b8', // Cinza Prata
    hairShadow: '#64748b',
    eyeShape: 'olhos_13', // Olhar acadêmico / focado
    eyeColor: '#8C501D',
    noseShape: 'nariz_3',
    mouthShape: 'boca_6',
    cheeksShape: 'none',
    topStyle: 'top_long_sleeve',
    topColorPrimary: '#312e81', // Índigo Noturno
    topColorSecondary: '#38bdf8',
    bottomStyle: 'pants_cargo',
    bottomColor: '#1e1b4b',
    shoesStyle: 'boots_hunter',
    shoesColor: '#0f172a',
    glassesStyle: 'round_wire',
    glassesColor: '#d97706'
  },

  // 9. Mestre Casco (Guardião Ancestral, Ovos & Ninhos de Dragão)
  npc_turtle_elder: {
    ...DEFAULT_AVATAR_CONFIG,
    name: 'Mestre Casco',
    gender: 'male',
    skinTone: '#9e5932',
    skinShadow: '#773a15',
    headStyle: 'head_01', // Calmo e respeitado
    hairColor: '#faeed1', // Platinado Ancestral
    hairShadow: '#c9ba9b',
    eyeShape: 'olhos_10', // Sereno e acolhedor
    eyeColor: '#d97706', // Âmbar Dourado
    noseShape: 'nariz_1',
    mouthShape: 'boca_2',
    cheeksShape: 'blush_1',
    cheeksColor: 'rgba(255, 126, 54, 0.4)',
    topStyle: 'top_sweater',
    topColorPrimary: '#059669', // Esmeralda & Dourado
    topColorSecondary: '#fef08a',
    bottomStyle: 'pants_cargo',
    bottomColor: '#064e3b',
    shoesStyle: 'sandals_beach',
    shoesColor: '#78350f',
    glassesStyle: 'none'
  }
};

/**
 * Gera determinística e consistentemente a configuração de aparência de qualquer NPC.
 * @param {string} npcId - Identificador único do NPC (ex: 'npc_villager_01', 'npc_guard')
 * @param {string} role - Papel do NPC (ex: 'guard', 'scholar', 'merchant', 'villager')
 * @returns {Object} Configuração completa compatível com AvatarConfig
 */
export function generateNPCAppearance(npcId, role = 'villager') {
  if (MASTER_NPC_CONFIGS[npcId]) {
    return { ...MASTER_NPC_CONFIGS[npcId] };
  }

  const rng = createSeededRandom(npcId || 'npc_default');

  const skin = SKIN_TONES[Math.floor(rng() * SKIN_TONES.length)];
  const hairC = HAIR_COLORS[Math.floor(rng() * HAIR_COLORS.length)];
  const eyeC = EYE_COLORS[Math.floor(rng() * EYE_COLORS.length)];
  const clothP = CLOTH_PALETTES[Math.floor(rng() * CLOTH_PALETTES.length)];

  const headStyles = [
    'head_01', 'head_02', 'head_03', 'head_04', 'head_05',
    'head_06', 'head_07', 'head_08', 'head_09', 'head_10',
    'head_11', 'head_12', 'head_13', 'head_14', 'head_15',
    'head_16', 'head_17', 'head_18', 'head_19', 'head_20', 'head_21'
  ];

  const eyeShapes = [
    'olhos_1', 'olhos_2', 'olhos_3', 'olhos_4', 'olhos_5',
    'olhos_6', 'olhos_7', 'olhos_8', 'olhos_9', 'olhos_10',
    'olhos_11', 'olhos_12', 'olhos_13', 'olhos_14', 'olhos_15',
    'olhos_16', 'olhos_17', 'olhos_18', 'olhos_19', 'olhos_20'
  ];

  const noseShapes = ['nariz_1', 'nariz_2', 'nariz_3', 'nariz_4'];
  const mouthShapes = ['boca_1', 'boca_2', 'boca_3', 'boca_4', 'boca_5', 'boca_6', 'boca_7', 'boca_8'];
  const cheekShapes = ['blush_1', 'blush_2', 'blush_3', 'blush_4', 'none'];

  let topStyle = 'top_tee';
  let bottomStyle = 'pants_cargo';
  let shoesStyle = 'sneakers_classic';
  let glassesStyle = 'none';

  if (role === 'scholar' || role === 'mage') {
    topStyle = rng() > 0.5 ? 'top_long_sleeve' : 'top_sweater';
    glassesStyle = rng() > 0.4 ? 'round_wire' : 'none';
    shoesStyle = 'boots_hunter';
  } else if (role === 'guard' || role === 'warrior') {
    topStyle = rng() > 0.5 ? 'top_sleeveless' : 'top_long_sleeve';
    bottomStyle = 'pants_cargo';
    shoesStyle = 'boots_hunter';
  } else if (role === 'merchant') {
    topStyle = rng() > 0.5 ? 'top_sweater' : 'top_puffy_sleeve';
    shoesStyle = 'sneakers_classic';
    glassesStyle = rng() > 0.7 ? 'round_wire' : 'none';
  } else {
    // Aldeão comum
    const topStyles = ['top_tee', 'top_sweater', 'top_long_sleeve', 'top_puffy_sleeve', 'top_cupcake_dress', 'top_sleeveless'];
    topStyle = topStyles[Math.floor(rng() * topStyles.length)];
    bottomStyle = rng() > 0.5 ? 'pants_cargo' : (rng() > 0.5 ? 'shorts_denim' : 'skirt_pleated');
    shoesStyle = rng() > 0.5 ? 'sneakers_classic' : (rng() > 0.5 ? 'boots_hunter' : 'sandals_beach');
    glassesStyle = rng() > 0.85 ? 'round_wire' : 'none';
  }

  return {
    version: 2,
    name: npcId,
    gender: 'neutral',
    skinTone: skin.color,
    skinShadow: skin.shadow,
    headStyle: headStyles[Math.floor(rng() * headStyles.length)],
    hairColor: hairC.color,
    hairShadow: hairC.shadow,
    eyeShape: eyeShapes[Math.floor(rng() * eyeShapes.length)],
    eyeColor: eyeC.color,
    noseShape: noseShapes[Math.floor(rng() * noseShapes.length)],
    mouthShape: mouthShapes[Math.floor(rng() * mouthShapes.length)],
    cheeksShape: cheekShapes[Math.floor(rng() * cheekShapes.length)],
    cheeksColor: 'rgba(255, 126, 54, 0.6)',
    topStyle,
    topColorPrimary: clothP.primary,
    topColorSecondary: clothP.secondary,
    bottomStyle,
    bottomColor: clothP.accent || clothP.primary,
    shoesStyle,
    shoesColor: clothP.primary,
    shoesTrim: '#ffffff',
    glassesStyle,
    glassesColor: '#5c3c26'
  };
}

/**
 * Obtém a configuração de avatar de um NPC por ID ou gera dinamicamente.
 */
export function getNPCConfig(npcId, role = 'villager') {
  if (!npcId) return { ...DEFAULT_AVATAR_CONFIG };
  return generateNPCAppearance(npcId, role);
}

export default {
  MASTER_NPC_CONFIGS,
  generateNPCAppearance,
  getNPCConfig
};
