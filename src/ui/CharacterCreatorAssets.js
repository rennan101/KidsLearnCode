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
  SVG_HAIRS
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
    id: 'accessories',
    label: 'Chapéus & Óculos',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ui-icon"><path d="M2 18h20"/><path d="M12 4a7 7 0 0 0-7 7v7h14v-7a7 7 0 0 0-7-7z"/></svg>`
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
  desc: 'Extraído de Face Components.svg'
}));

export const NOSE_OPTIONS = SVG_NOSES.map(n => ({
  id: n.id,
  name: n.name,
  desc: 'Formato vetorial de Face Components'
}));

export const MOUTH_OPTIONS = SVG_MOUTHS.map(m => ({
  id: m.id,
  name: m.name,
  desc: 'Expressão clássica ACNH'
}));

export const CHEEKS_OPTIONS = SVG_CHEEKS.map(c => ({
  id: c.id,
  name: c.name,
  desc: 'Detalhes faciais e corados'
}));

export const TOP_OPTIONS = [
  { id: 'shirt_striped_teal', name: 'Listrada da Ilha', desc: 'Camiseta náutica de algodão' },
  { id: 'tshirt_basic', name: 'Camiseta Básica', desc: 'Camiseta lisa' },
  { id: 'hoodie_pocket', name: 'Moletom Confortável', desc: 'Moletom com bolso frontal' },
  { id: 'wizard_tunic', name: 'Túnica de Aprendiz', desc: 'Traje de explorador de magia' }
];

export const BOTTOM_OPTIONS = [
  { id: 'shorts_denim', name: 'Shorts Jeans', desc: 'Shorts de brim azul' },
  { id: 'pants_cargo', name: 'Calça Cargo', desc: 'Calça com bolsos' },
  { id: 'skirt_pleated', name: 'Saia Plissada', desc: 'Saia plissada clássica' }
];

export const SHOES_OPTIONS = [
  { id: 'sneakers_classic', name: 'Tênis de Passeio', desc: 'Tênis confortável com sola' },
  { id: 'boots_hunter', name: 'Botas de Trilha', desc: 'Botas resistentes' },
  { id: 'sandals_beach', name: 'Sandálias de Praia', desc: 'Calçado aberto' }
];

export const HAT_OPTIONS = [
  { id: 'none', name: 'Nenhum Chapéu', desc: 'Sem chapéu' },
  { id: 'straw_hat', name: 'Chapéu de Palha', desc: 'Aba larga com fita vermelha' },
  { id: 'cat_ears_band', name: 'Tiara de Gatinho', desc: 'Orelhinhas de gato' },
  { id: 'witch_hat', name: 'Chapéu de Mago', desc: 'Chapéu pontudo cônico' }
];

export const GLASSES_OPTIONS = [
  { id: 'none', name: 'Nenhum Óculos', desc: 'Sem armação' },
  { id: 'round_wire', name: 'Óculos Redondos', desc: 'Armação clássica fina' },
  { id: 'sunglasses_cool', name: 'Óculos Escuros', desc: 'Lentes solares escuras' }
];
