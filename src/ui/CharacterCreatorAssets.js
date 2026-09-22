/**
 * CharacterCreatorAssets.js - KidsLearnCode
 * Catálogo visual de opções de customização para a interface do Criador de Personagens.
 * 
 * Regra Estrita: Todos os componentes utilizam os assets oficiais de:
 * - Face Components.svg
 * - Hairs.svg
 * - Proporções de base_character.png
 * - Ícones visuais em SVG vetorial limpo (sem emojis).
 */

import {
  SVG_NOSES,
  SVG_MOUTHS,
  SVG_EYES,
  SVG_CHEEKS,
  SVG_HAIRS,
  SVG_TOPS
} from '../engine/animation/SvgAssetCatalog.js';

export const CREATOR_CATEGORIES = [
  {
    id: 'skin',
    label: 'Pele & Corpo',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ui-icon"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>`
  },
  {
    id: 'hair',
    label: 'Cabelo',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ui-icon"><path d="M4 14c0-4.4 3.6-8 8-8s8 3.6 8 8"/><path d="M12 2v4"/><path d="M8 6C6 9 5 13 5 18"/><path d="M16 6c2 3 3 7 3 12"/></svg>`
  },
  {
    id: 'face',
    label: 'Rosto & Olhos',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ui-icon"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`
  },
  {
    id: 'top',
    label: 'Camisa & Tronco',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ui-icon"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>`
  },
  {
    id: 'bottom',
    label: 'Calça & Shorts',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ui-icon"><path d="M6 3h12v7l-3 11H9L6 10V3z"/><path d="M12 10v11"/></svg>`
  },
  {
    id: 'shoes',
    label: 'Calçados',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ui-icon"><path d="M4 17h16a2 2 0 0 0 2-2v-2a4 4 0 0 0-4-4h-3L11 5H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2z"/><line x1="4" y1="14" x2="20" y2="14"/></svg>`
  },
  {
    id: 'glasses',
    label: 'Óculos',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ui-icon"><circle cx="6" cy="12" r="4"/><circle cx="18" cy="12" r="4"/><line x1="10" y1="12" x2="14" y2="12"/><line x1="2" y1="12" x2="2" y2="10"/><line x1="22" y1="12" x2="22" y2="10"/></svg>`
  }
];


export const HAIR_STYLE_OPTIONS = SVG_HAIRS.map(h => ({
  id: h.id,
  name: h.name,
  desc: h.desc
}));

export const EYE_SHAPE_OPTIONS = SVG_EYES.map(e => ({
  id: e.id,
  name: e.name,
  desc: 'Formato dos olhos'
}));

export const NOSE_OPTIONS = SVG_NOSES.map(n => ({
  id: n.id,
  name: n.name,
  desc: 'Formato do nariz'
}));

export const MOUTH_OPTIONS = SVG_MOUTHS.map(m => ({
  id: m.id,
  name: m.name,
  desc: 'Expressão da boca'
}));

export const CHEEKS_OPTIONS = SVG_CHEEKS.map(c => ({
  id: c.id,
  name: c.name,
  desc: 'Detalhes faciais'
}));

export const TOP_OPTIONS = SVG_TOPS.map(t => ({
  id: t.id,
  name: t.name,
  desc: t.desc
}));

export const BOTTOM_OPTIONS = [
  { id: 'shorts_denim', name: 'Shorts Jeans', desc: 'Shorts de brim' },
  { id: 'pants_cargo', name: 'Calça Cargo', desc: 'Calça com bolsos' },
  { id: 'skirt_pleated', name: 'Saia Plissada', desc: 'Saia plissada' }
];

export const SHOES_OPTIONS = [
  { id: 'sneakers_classic', name: 'Tênis de Passeio', desc: 'Tênis confortável' },
  { id: 'boots_hunter', name: 'Botas de Trilha', desc: 'Botas resistentes' },
  { id: 'sandals_beach', name: 'Sandálias de Praia', desc: 'Calçado aberto' }
];

export const GLASSES_OPTIONS = [
  { id: 'none', name: 'Sem Óculos', desc: 'Nenhum acessório' },
  { id: 'round_wire', name: 'Óculos Redondos', desc: 'Armação fina' },
  { id: 'sunglasses_cool', name: 'Óculos Escuros', desc: 'Lentes solares' }
];

/* ========================================================================= */
/*  GERADORES DE PREVIEW SVG PARA OS BOTÕES VISUAIS                          */
/* ========================================================================= */

export function getHairSvg(hairId, color = '#3d2314') {
  const hair = SVG_HAIRS.find(h => h.id === hairId) || SVG_HAIRS[0];
  const paths = hair.frontPaths.map(d => `<path d="${d}" fill="${color}" stroke="#241208" stroke-width="2.5" stroke-linejoin="round"/>`).join('');
  const minX = hair.cx - 100;
  const minY = hair.topY - 10;
  return `<svg viewBox="${minX} ${minY} 200 180" class="cc-preview-icon">${paths}</svg>`;
}

export function getEyeSvg(eyeId, color = '#8C501D') {
  switch (eyeId) {
    case 'eye_cheerful_crescent':
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><path d="M8 22 C14 12 26 12 32 22" fill="none" stroke="#8C501D" stroke-width="4" stroke-linecap="round"/></svg>`;
    case 'eye_round_button':
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><circle cx="20" cy="20" r="14" fill="#FFFFFF" stroke="#8C501D" stroke-width="2"/><circle cx="21" cy="20" r="10" fill="${color}"/><circle cx="21" cy="20" r="6" fill="#0F172A"/><circle cx="17" cy="16" r="3.5" fill="#FFFFFF"/></svg>`;
    case 'eye_sharp_determined':
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><polygon points="8,14 32,18 28,26 12,24" fill="${color}" stroke="#8C501D" stroke-width="2"/><circle cx="16" cy="18" r="3" fill="#FFFFFF"/></svg>`;
    case 'eye_sleepy_calm':
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><ellipse cx="20" cy="22" rx="14" ry="9" fill="${color}"/><path d="M6 18 Q20 14 34 18" fill="none" stroke="#8C501D" stroke-width="3" stroke-linecap="round"/><circle cx="16" cy="20" r="2.5" fill="#FFFFFF"/></svg>`;
    case 'eye_almond_lash':
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><ellipse cx="20" cy="20" rx="13" ry="16" fill="${color}"/><path d="M6 12 Q20 6 34 14" fill="none" stroke="#8C501D" stroke-width="3" stroke-linecap="round"/><circle cx="16" cy="16" r="3" fill="#FFFFFF"/></svg>`;
    case 'eye_cat_lashes':
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><ellipse cx="20" cy="20" rx="12" ry="16" fill="${color}"/><path d="M7 16 Q20 10 33 12 L36 8" fill="none" stroke="#8C501D" stroke-width="2.5" stroke-linecap="round"/><circle cx="16" cy="16" r="3" fill="#FFFFFF"/></svg>`;
    case 'eye_gentle_oval':
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><ellipse cx="20" cy="20" rx="11" ry="15" fill="${color}" stroke="#8C501D" stroke-width="2"/><circle cx="17" cy="16" r="3.5" fill="#FFFFFF"/></svg>`;
    default:
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><ellipse cx="20" cy="20" rx="12" ry="16" fill="${color}"/><circle cx="16" cy="14" r="4.5" fill="#FFFFFF"/><circle cx="23" cy="24" r="2.5" fill="#FFFFFF"/></svg>`;
  }
}

export function getNoseSvg(noseId) {
  switch (noseId) {
    case 'nose_circle':
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><circle cx="20" cy="20" r="8" fill="#FF7E36" stroke="#D96522" stroke-width="2"/></svg>`;
    case 'nose_oval':
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><ellipse cx="20" cy="20" rx="11" ry="7" fill="#FF7E36" stroke="#D96522" stroke-width="2"/></svg>`;
    case 'nose_rect':
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><rect x="10" y="15" width="20" height="10" rx="3" fill="#FF7E36" stroke="#D96522" stroke-width="2"/></svg>`;
    default:
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><polygon points="20,10 31,30 9,30" fill="#FF7E36" stroke="#D96522" stroke-width="2"/></svg>`;
  }
}

export function getMouthSvg(mouthId) {
  switch (mouthId) {
    case 'mouth_open_dot':
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><ellipse cx="20" cy="20" rx="7" ry="9" fill="#8C501D"/></svg>`;
    case 'mouth_wide_smile':
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><path d="M8 18 Q20 30 32 18" fill="none" stroke="#8C501D" stroke-width="3.5" stroke-linecap="round"/></svg>`;
    case 'mouth_smirk_curl':
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><path d="M12 24 Q20 28 28 20 Q32 16 30 14" fill="none" stroke="#8C501D" stroke-width="3" stroke-linecap="round"/></svg>`;
    case 'mouth_joyful_teeth':
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><path d="M8 18 Q20 30 32 18 Z" fill="#FFFFFF" stroke="#8C501D" stroke-width="3" stroke-linejoin="round"/></svg>`;
    case 'mouth_cat_w':
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><path d="M10 18 Q15 25 20 20 Q25 25 30 18" fill="none" stroke="#8C501D" stroke-width="3" stroke-linecap="round"/></svg>`;
    case 'mouth_buck_tooth':
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><path d="M10 18 Q20 28 30 18" fill="none" stroke="#8C501D" stroke-width="3" stroke-linecap="round"/><rect x="17" y="21" width="6" height="6" fill="#FFFFFF" stroke="#8C501D" stroke-width="1.5"/></svg>`;
    default:
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><path d="M11 18 Q20 27 29 18" fill="none" stroke="#8C501D" stroke-width="3" stroke-linecap="round"/></svg>`;
  }
}

export function getCheeksSvg(cheeksId) {
  switch (cheeksId) {
    case 'cheeks_coral_vibrant':
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><ellipse cx="12" cy="20" rx="9" ry="7" fill="rgba(255, 126, 54, 0.85)"/><ellipse cx="28" cy="20" rx="9" ry="7" fill="rgba(255, 126, 54, 0.85)"/></svg>`;
    case 'cheeks_freckles':
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><circle cx="10" cy="18" r="1.5" fill="#8C501D"/><circle cx="14" cy="21" r="1.5" fill="#8C501D"/><circle cx="11" cy="24" r="1.5" fill="#8C501D"/><circle cx="29" cy="18" r="1.5" fill="#8C501D"/><circle cx="26" cy="21" r="1.5" fill="#8C501D"/><circle cx="29" cy="24" r="1.5" fill="#8C501D"/></svg>`;
    case 'cheeks_whiskers':
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><line x1="6" y1="17" x2="16" y2="18" stroke="#8C501D" stroke-width="2"/><line x1="6" y1="23" x2="16" y2="22" stroke="#8C501D" stroke-width="2"/><line x1="34" y1="17" x2="24" y2="18" stroke="#8C501D" stroke-width="2"/><line x1="34" y1="23" x2="24" y2="22" stroke="#8C501D" stroke-width="2"/></svg>`;
    case 'none':
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><circle cx="20" cy="20" r="12" fill="none" stroke="#c4b89e" stroke-width="2"/><line x1="12" y1="12" x2="28" y2="28" stroke="#c4b89e" stroke-width="2"/></svg>`;
    default:
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><ellipse cx="12" cy="20" rx="9" ry="7" fill="rgba(255, 186, 165, 0.85)"/><ellipse cx="28" cy="20" rx="9" ry="7" fill="rgba(255, 186, 165, 0.85)"/></svg>`;
  }
}

export function getTopSvg(topId, primary = '#19c8b9') {
  switch (topId) {
    case 'top_cupcake_dress':
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><path d="M12 10 L28 10 L24 18 L32 32 L8 32 L16 18 Z" fill="${primary}" stroke="#0f8e83" stroke-width="2"/></svg>`;
    case 'top_sweater':
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><path d="M10 8 L30 8 L36 24 L30 25 L28 32 L12 32 L10 25 L4 24 Z" fill="${primary}" stroke="#0f8e83" stroke-width="2"/><rect x="15" y="6" width="10" height="4" rx="2" fill="#ffffff"/></svg>`;
    case 'top_long_sleeve':
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><path d="M12 10 L28 10 L34 28 L29 29 L26 32 L14 32 L11 29 L6 28 Z" fill="${primary}" stroke="#0f8e83" stroke-width="2"/></svg>`;
    case 'top_puffy_sleeve':
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><circle cx="10" cy="14" r="5" fill="${primary}"/><circle cx="30" cy="14" r="5" fill="${primary}"/><path d="M13 10 L27 10 L25 32 L15 32 Z" fill="${primary}" stroke="#0f8e83" stroke-width="2"/></svg>`;
    case 'top_sleeveless':
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><path d="M14 10 L26 10 L24 32 L16 32 Z" fill="${primary}" stroke="#0f8e83" stroke-width="2"/></svg>`;
    case 'top_crop_top':
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><path d="M12 10 L28 10 L25 22 L15 22 Z" fill="${primary}" stroke="#0f8e83" stroke-width="2"/></svg>`;
    default:
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><path d="M12 10 L28 10 L32 18 L28 20 L26 32 L14 32 L12 20 L8 18 Z" fill="${primary}" stroke="#0f8e83" stroke-width="2"/></svg>`;
  }
}

export function getBottomSvg(bottomId, color = '#2563eb') {
  switch (bottomId) {
    case 'pants_cargo':
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><path d="M11 8 L29 8 L31 32 L22 32 L20 18 L18 32 L9 32 Z" fill="${color}" stroke="#1d4ed8" stroke-width="2"/></svg>`;
    case 'skirt_pleated':
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><path d="M13 10 L27 10 L33 28 L7 28 Z" fill="${color}" stroke="#1d4ed8" stroke-width="2"/></svg>`;
    default:
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><path d="M11 10 L29 10 L31 24 L22 24 L20 16 L18 24 L9 24 Z" fill="${color}" stroke="#1d4ed8" stroke-width="2"/></svg>`;
  }
}

export function getShoesSvg(shoesId, color = '#ea580c') {
  switch (shoesId) {
    case 'boots_hunter':
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><path d="M13 10 L22 10 L22 22 L27 22 C30 22 31 25 31 28 L11 28 L11 12 Z" fill="${color}" stroke="#9a3412" stroke-width="2"/></svg>`;
    case 'sandals_beach':
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><rect x="8" y="24" width="24" height="6" rx="3" fill="${color}" stroke="#9a3412" stroke-width="2"/><path d="M14 24 L20 16 L26 24" fill="none" stroke="#ffffff" stroke-width="2.5"/></svg>`;
    default:
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><path d="M10 18 L18 14 L23 20 L29 20 C31 20 32 23 32 26 L8 26 C8 23 9 19 10 18 Z" fill="${color}" stroke="#9a3412" stroke-width="2"/><rect x="8" y="26" width="24" height="4" fill="#ffffff"/></svg>`;
  }
}

export function getGlassesSvg(glassesId) {
  switch (glassesId) {
    case 'sunglasses_cool':
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><rect x="6" y="14" width="12" height="12" rx="3" fill="#0f172a"/><rect x="22" y="14" width="12" height="12" rx="3" fill="#0f172a"/><line x1="18" y1="18" x2="22" y2="18" stroke="#0f172a" stroke-width="2.5"/></svg>`;
    case 'round_wire':
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><circle cx="12" cy="20" r="7" fill="none" stroke="#5c3c26" stroke-width="2.5"/><circle cx="28" cy="20" r="7" fill="none" stroke="#5c3c26" stroke-width="2.5"/><line x1="19" y1="20" x2="21" y2="20" stroke="#5c3c26" stroke-width="2.5"/></svg>`;
    default:
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><circle cx="20" cy="20" r="12" fill="none" stroke="#c4b89e" stroke-width="2"/><line x1="12" y1="12" x2="28" y2="28" stroke="#c4b89e" stroke-width="2"/></svg>`;
  }
}


