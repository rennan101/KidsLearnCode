/**
 * AvatarConfig.js - KidsLearnCode
 * Esquema de dados e utilitários para a configuração modular do personagem customizável.
 */

export const SKIN_TONES = [
  { id: 'skin_fair_1', color: '#ffdfc4', shadow: '#e5be9e', name: 'Muito Clara' },
  { id: 'skin_fair_2', color: '#ffd0a8', shadow: '#e0ae82', name: 'Clara Quente' },
  { id: 'skin_peach',  color: '#f8b88b', shadow: '#d69668', name: 'Pêssego' },
  { id: 'skin_tan_1',  color: '#e59e6d', shadow: '#be7847', name: 'Bronzeada' },
  { id: 'skin_tan_2',  color: '#c97d4c', shadow: '#9e5628', name: 'Morena' },
  { id: 'skin_brown_1',color: '#9e5932', shadow: '#773a15', name: 'Castanha' },
  { id: 'skin_brown_2',color: '#6e381b', shadow: '#4d2008', name: 'Escura' },
  { id: 'skin_deep',   color: '#4a2511', shadow: '#2e1204', name: 'Ébano' }
];

export const HAIR_COLORS = [
  { id: 'hair_dark_brown', color: '#3d2314', shadow: '#241208', name: 'Castanho Escuro' },
  { id: 'hair_medium_brown', color: '#684022', shadow: '#452611', name: 'Castanho Médio' },
  { id: 'hair_light_brown', color: '#8c582f', shadow: '#5f3616', name: 'Castanho Claro' },
  { id: 'hair_black', color: '#1f242b', shadow: '#101317', name: 'Preto Natural' },
  { id: 'hair_golden_blonde', color: '#f3c457', shadow: '#c49429', name: 'Loiro Dourado' },
  { id: 'hair_platinum', color: '#faeed1', shadow: '#c9ba9b', name: 'Platinado' },
  { id: 'hair_auburn', color: '#a63a1e', shadow: '#74200b', name: 'Ruivo Acobreado' },
  { id: 'hair_ginger', color: '#e06226', shadow: '#aa3f0f', name: 'Laranja / Ginger' },
  { id: 'hair_ruby_red', color: '#b91c1c', shadow: '#7f1d1d', name: 'Vermelho Rubi' },
  { id: 'hair_mint_teal', color: '#19c8b9', shadow: '#0f8e83', name: 'Verde Menta' },
  { id: 'hair_emerald', color: '#059669', shadow: '#065f46', name: 'Verde Esmeralda' },
  { id: 'hair_ocean_blue', color: '#2563eb', shadow: '#1d4ed8', name: 'Azul Oceano' },
  { id: 'hair_lavender', color: '#a855f7', shadow: '#7e22ce', name: 'Lavanda' },
  { id: 'hair_sakura_pink', color: '#f472b6', shadow: '#db2777', name: 'Rosa Cerejeira' },
  { id: 'hair_coral', color: '#fb7185', shadow: '#e11d48', name: 'Coral Suave' },
  { id: 'hair_silver_gray', color: '#94a3b8', shadow: '#64748b', name: 'Cinza Prata' }
];

export const EYE_COLORS = [
  { id: 'eye_brown', color: '#8C501D', name: 'Castanho ACNH' },
  { id: 'eye_dark', color: '#1e293b', name: 'Preto / Ônix' },
  { id: 'eye_blue', color: '#2563eb', name: 'Azul Safira' },
  { id: 'eye_teal', color: '#0d9488', name: 'Teal / Turquesa' },
  { id: 'eye_green', color: '#16a34a', name: 'Verde Esmeralda' },
  { id: 'eye_amber', color: '#d97706', name: 'Âmbar / Mel' },
  { id: 'eye_purple', color: '#9333ea', name: 'Ametista' },
  { id: 'eye_ruby', color: '#dc2626', name: 'Rubi' }
];

export const CLOTH_PALETTES = [
  { id: 'c_teal', primary: '#19c8b9', secondary: '#ffffff', accent: '#0f8e83', name: 'Teal da Ilha' },
  { id: 'c_navy', primary: '#1e3a8a', secondary: '#93c5fd', accent: '#172554', name: 'Azul Marinho' },
  { id: 'c_emerald', primary: '#059669', secondary: '#a7f3d0', accent: '#064e3b', name: 'Verde Floresta' },
  { id: 'c_sunset', primary: '#ea580c', secondary: '#fde047', accent: '#9a3412', name: 'Pôr do Sol' },
  { id: 'c_berry', primary: '#be185d', secondary: '#fbcfe8', accent: '#831843', name: 'Framboesa' },
  { id: 'c_gold', primary: '#d97706', secondary: '#fef3c7', accent: '#92400e', name: 'Dourado Real' },
  { id: 'c_earth', primary: '#78350f', secondary: '#fef3c7', accent: '#451a03', name: 'Madeira & Couro' },
  { id: 'c_charcoal', primary: '#334155', secondary: '#94a3b8', accent: '#0f172a', name: 'Cinza Carvão' },
  { id: 'c_cream', primary: '#fdfbf7', secondary: '#19c8b9', accent: '#d6cdb7', name: 'Creme Natural' },
  { id: 'c_violet', primary: '#7c3aed', secondary: '#ddd6fe', accent: '#4c1d95', name: 'Violeta Arcano' }
];

export const DEFAULT_AVATAR_CONFIG = {
  version: 2,
  name: 'Aventureiro',
  gender: 'neutral',
  skinTone: '#ffd0a8',
  skinShadow: '#e0ae82',
  headStyle: 'head_01',
  hairColor: '#3d2314',
  hairShadow: '#241208',
  eyeShape: 'olhos_1',
  eyeColor: '#8C501D',
  noseShape: 'nariz_1',
  mouthShape: 'boca_1',
  cheeksShape: 'blush_1',
  cheeksColor: 'rgba(255, 126, 54, 0.7)',
  topStyle: 'top_tee',
  topColorPrimary: '#19c8b9',
  topColorSecondary: '#ffffff',
  bottomStyle: 'shorts_denim',
  bottomColor: '#2563eb',
  shoesStyle: 'sneakers_classic',
  shoesColor: '#ea580c',
  shoesTrim: '#ffffff',
  glassesStyle: 'none',
  glassesColor: '#5c3c26'
};

export function createDefaultAvatarConfig(name = 'Aventureiro') {
  return {
    ...DEFAULT_AVATAR_CONFIG,
    name
  };
}

export function randomizeAvatarConfig(currentName) {
  const skin = SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)];
  const hairC = HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)];
  const eyeC = EYE_COLORS[Math.floor(Math.random() * EYE_COLORS.length)];
  const clothP = CLOTH_PALETTES[Math.floor(Math.random() * CLOTH_PALETTES.length)];

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
  const mouthShapes = [
    'boca_1', 'boca_2', 'boca_3', 'boca_4',
    'boca_5', 'boca_6', 'boca_7', 'boca_8'
  ];
  const cheekShapes = ['blush_1', 'blush_2', 'blush_3', 'blush_4', 'none'];

  const topStyles = [
    'top_tee', 'top_cupcake_dress', 'top_sweater',
    'top_long_sleeve', 'top_puffy_sleeve', 'top_sleeveless', 'top_crop_top'
  ];

  const bottomStyles = ['shorts_denim', 'pants_cargo', 'skirt_pleated'];
  const shoeStyles = ['sneakers_classic', 'boots_hunter', 'sandals_beach'];
  const glassesStyles = ['none', 'none', 'none', 'round_wire', 'sunglasses_cool'];

  return {
    version: 2,
    name: currentName || 'Aventureiro',
    gender: 'neutral',
    skinTone: skin.color,
    skinShadow: skin.shadow,
    headStyle: headStyles[Math.floor(Math.random() * headStyles.length)],
    hairColor: hairC.color,
    hairShadow: hairC.shadow,
    eyeShape: eyeShapes[Math.floor(Math.random() * eyeShapes.length)],
    eyeColor: eyeC.color,
    noseShape: noseShapes[Math.floor(Math.random() * noseShapes.length)],
    mouthShape: mouthShapes[Math.floor(Math.random() * mouthShapes.length)],
    cheeksShape: cheekShapes[Math.floor(Math.random() * cheekShapes.length)],
    cheeksColor: 'rgba(255, 126, 54, 0.7)',
    topStyle: topStyles[Math.floor(Math.random() * topStyles.length)],
    topColorPrimary: clothP.primary,
    topColorSecondary: clothP.secondary,
    bottomStyle: bottomStyles[Math.floor(Math.random() * bottomStyles.length)],
    bottomColor: clothP.accent || clothP.primary,
    shoesStyle: shoeStyles[Math.floor(Math.random() * shoeStyles.length)],
    shoesColor: clothP.primary,
    shoesTrim: '#ffffff',
    glassesStyle: glassesStyles[Math.floor(Math.random() * glassesStyles.length)],
    glassesColor: '#5c3c26'
  };
}


