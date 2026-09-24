/**
 * CharacterCreatorAssets.js - KidsLearnCode
 * Catálogo visual de opções de customização para a interface do Criador de Personagens.
 * 
 * Regra Estrita: Todos os componentes utilizam os assets oficiais de:
 * - assets/characters/Heads (21 cabeças/penteados)
 * - assets/characters/Eyes (20 olhos)
 * - assets/characters/Mouth (8 bocas)
 * - assets/characters/Nose (4 narizes)
 * - assets/characters/Blush (4 blushes)
 * - Ícones visuais em SVG vetorial limpo (sem emojis).
 */

import {
  SVG_HEADS,
  SVG_EYES,
  SVG_NOSES,
  SVG_MOUTHS,
  SVG_BLUSHES,
  getHeadSvgContent,
  getHeadBackSvgContent,
  getEyeSvgContent,
  getNoseSvgContent,
  getMouthSvgContent,
  getBlushSvgContent
} from '../engine/animation/CharacterSvgAssets.js';
import { SVG_TOPS } from '../engine/animation/SvgAssetCatalog.js';

export const CREATOR_CATEGORIES = [
  {
    id: 'skin',
    label: 'Pele & Corpo',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ui-icon"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>`
  },
  {
    id: 'head',
    label: 'Cabeça & Cabelo',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ui-icon"><path d="M4 14c0-4.4 3.6-8 8-8s8 3.6 8 8"/><path d="M12 2v4"/><path d="M8 6C6 9 5 13 5 18"/><path d="M16 6c2 3 3 7 3 12"/></svg>`
  },
  {
    id: 'face',
    label: 'Rosto & Feições',
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

export const HEAD_STYLE_OPTIONS = SVG_HEADS.map(h => ({
  id: h.id,
  name: h.name,
  desc: 'Penteado e formato da cabeça'
}));

export const EYE_SHAPE_OPTIONS = SVG_EYES.map(e => ({
  id: e.id,
  name: e.name,
  desc: 'Formato e estilo dos olhos'
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

export const BLUSH_OPTIONS = [
  ...SVG_BLUSHES.map(b => ({
    id: b.id,
    name: b.name,
    desc: 'Blush e bochechas'
  })),
  {
    id: 'none',
    name: 'Sem Blush',
    desc: 'Sem marcação nas bochechas'
  }
];

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

export function getHeadSvg(headId, skinTone = '#f6dab9', hairColor = '#4a2e18') {
  const frontSvg = getHeadSvgContent(headId, skinTone, hairColor);
  const backSvg = getHeadBackSvgContent(headId, hairColor);

  if (backSvg) {
    const backMatch = backSvg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
    if (backMatch) {
      const backInner = backMatch[1];
      const combined = frontSvg.replace(/(<svg[^>]*>)/, `$1\n${backInner}`);
      return combined.replace('<svg ', '<svg class="cc-preview-icon" ');
    }
  }

  return frontSvg.replace('<svg ', '<svg class="cc-preview-icon" ');
}

export function getEyeSvg(eyeId, eyeColor = '#8C501D') {
  let svg = getEyeSvgContent(eyeId, eyeColor);
  svg = svg.replace('<svg ', '<svg class="cc-preview-icon" ');
  return svg;
}

export function getNoseSvg(noseId) {
  let svg = getNoseSvgContent(noseId);
  svg = svg.replace('<svg ', '<svg class="cc-preview-icon" ');
  return svg;
}

export function getMouthSvg(mouthId) {
  let svg = getMouthSvgContent(mouthId);
  svg = svg.replace('<svg ', '<svg class="cc-preview-icon" ');
  return svg;
}

export function getBlushSvg(blushId) {
  let svg = getBlushSvgContent(blushId);
  if (!svg.includes('class=')) {
    svg = svg.replace('<svg ', '<svg class="cc-preview-icon" ');
  }
  return svg;
}

export function getTopSvg(topId) {
  const top = SVG_TOPS.find(t => t.id === topId) || SVG_TOPS[0];
  let svg = top.svgContent;
  if (!svg.includes('class=')) {
    svg = svg.replace('<svg ', '<svg class="cc-preview-icon" ');
  }
  return svg;
}

export function getBottomSvg(bottomId, color = '#2563eb') {
  switch (bottomId) {
    case 'pants_cargo':
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><path d="M11 8 L29 8 L31 32 L22 32 L20 18 L18 32 L9 32 Z" fill="${color}"/></svg>`;
    case 'skirt_pleated':
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><path d="M13 10 L27 10 L33 28 L7 28 Z" fill="${color}"/></svg>`;
    default:
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><path d="M11 10 L29 10 L31 24 L22 24 L20 16 L18 24 L9 24 Z" fill="${color}"/></svg>`;
  }
}

export function getShoesSvg(shoesId, color = '#ea580c') {
  switch (shoesId) {
    case 'boots_hunter':
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><path d="M13 10 L22 10 L22 22 L27 22 C30 22 31 25 31 28 L11 28 L11 12 Z" fill="${color}"/></svg>`;
    case 'sandals_beach':
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><rect x="8" y="24" width="24" height="6" rx="3" fill="${color}"/><path d="M14 24 L20 16 L26 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/></svg>`;
    default:
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><path d="M10 18 L18 14 L23 20 L29 20 C31 20 32 23 32 26 L8 26 C8 23 9 19 10 18 Z" fill="${color}"/><rect x="8" y="26" width="24" height="4" rx="1" fill="#ffffff"/></svg>`;
  }
}

export function getGlassesSvg(glassesId) {
  switch (glassesId) {
    case 'sunglasses_cool':
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><rect x="6" y="14" width="12" height="12" rx="3" fill="#0f172a"/><rect x="22" y="14" width="12" height="12" rx="3" fill="#0f172a"/><rect x="18" y="18" width="4" height="3" fill="#0f172a"/></svg>`;
    case 'round_wire':
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><circle cx="12" cy="20" r="7" fill="none" stroke="#5c3c26" stroke-width="2"/><circle cx="28" cy="20" r="7" fill="none" stroke="#5c3c26" stroke-width="2"/><line x1="19" y1="20" x2="21" y2="20" stroke="#5c3c26" stroke-width="2"/></svg>`;
    default:
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><circle cx="20" cy="20" r="12" fill="none" stroke="#c4b89e" stroke-width="2"/><line x1="12" y1="12" x2="28" y2="28" stroke="#c4b89e" stroke-width="2"/></svg>`;
  }
}

