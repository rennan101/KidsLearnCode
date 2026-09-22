/**
 * CharacterCreatorAssets.js - KidsLearnCode
 * Catálogo visual de opções de customização para a interface do Criador de Personagens.
 * 
 * Regra Estrita: Todos os ícones visuais usam SVG vetorial limpo (sem emojis).
 */

import { SKIN_TONES, HAIR_COLORS, EYE_COLORS, CLOTH_PALETTES } from '../engine/animation/AvatarConfig.js';

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

export const HAIR_STYLE_OPTIONS = [
  { id: 'fluffy_curls', name: 'Cachos Fofos', desc: 'Volume aconchegante com ondas suaves' },
  { id: 'wavy_bob', name: 'Bob Ondulado', desc: 'Corte moderno com mechas laterais' },
  { id: 'curtains_middle', name: 'Franja Repartida', desc: 'Estilo clássico despojado' },
  { id: 'spiky_hero', name: 'Espetado de Aventura', desc: 'Penteado dinâmico de herói' },
  { id: 'high_ponytail', name: 'Rabo de Cavalo Alto', desc: 'Prendedor alto com balanço' },
  { id: 'twin_braids', name: 'Trancinhas Duplas', desc: 'Tranças delicadas estilo aldeão' },
  { id: 'afro_puff', name: 'Afro Volumoso', desc: 'Cachos naturais e volumosos' },
  { id: 'straight_long', name: 'Longo Liso', desc: 'Cabelo comprido pelas costas' }
];

export const EYE_SHAPE_OPTIONS = [
  { id: 'sparkle_round', name: 'Brilho Estrelado', desc: 'Olhos redondos com reflexos vivos' },
  { id: 'cheerful_arc', name: 'Sorriso Contente', desc: 'Olhinhos fechados alegres' },
  { id: 'determined_sharp', name: 'Determinado', desc: 'Olhar focado de explorador' },
  { id: 'cat_wide', name: 'Olhar de Gatinho', desc: 'Olhos grandes e curiosos' }
];

export const NOSE_OPTIONS = [
  { id: 'triangle_soft', name: 'Triângulo ACNH', desc: 'O clássico nariz de botão suave' },
  { id: 'button_dot', name: 'Ponto Delicado', desc: 'Pequeno nariz minimalista' },
  { id: 'cute_cat', name: 'Focinho de Bichinho', desc: 'Nariz delicado em forma de V' }
];

export const MOUTH_OPTIONS = [
  { id: 'happy_smile', name: 'Sorriso Feliz', desc: 'Expressão alegre e acolhedora' },
  { id: 'cat_w', name: 'Boquinha :3', desc: 'Sorriso felino arqueado' },
  { id: 'open_joy', name: 'Riso Aberto', desc: 'Gargalhada de comemoração' },
  { id: 'neutral_smirk', name: 'Meio Sorriso', desc: 'Expressão amigável e serena' }
];

export const CHEEKS_OPTIONS = [
  { id: 'blush_dots', name: 'Blush Rosado', desc: 'Bochechas coradas' },
  { id: 'freckles', name: 'Sardinhas', desc: 'Pequenas sardas nas bochechas' },
  { id: 'cat_whiskers', name: 'Bigodes de Gato', desc: 'Pintura facial de felino' },
  { id: 'none', name: 'Sem Marcação', desc: 'Pele lisa e limpa' }
];

export const TOP_OPTIONS = [
  { id: 'shirt_striped_teal', name: 'Listrada da Ilha', desc: 'Camiseta clássica náutica de algodão' },
  { id: 'tshirt_basic', name: 'Camiseta Básica', desc: 'Camiseta de manga curta lisa' },
  { id: 'hoodie_pocket', name: 'Moletom Confortável', desc: 'Moletom quentinho com bolso central' },
  { id: 'wizard_tunic', name: 'Túnica de Aprendiz', desc: 'Vestimenta leve de estudante de magia' }
];

export const BOTTOM_OPTIONS = [
  { id: 'shorts_denim', name: 'Shorts Jeans', desc: 'Shorts de brim azul resistente' },
  { id: 'pants_cargo', name: 'Calça Cargo', desc: 'Calça confortável com bolsos utilitários' },
  { id: 'skirt_pleated', name: 'Saia Plissada', desc: 'Saia clássica com dobras' }
];

export const SHOES_OPTIONS = [
  { id: 'sneakers_classic', name: 'Tênis de Passeio', desc: 'Tênis macio com sola branca' },
  { id: 'boots_hunter', name: 'Botas de Trilha', desc: 'Botas de couro resistentes para explorar' },
  { id: 'sandals_beach', name: 'Sandálias de Praia', desc: 'Calçado aberto e arejado' }
];

export const HAT_OPTIONS = [
  { id: 'none', name: 'Nenhum Chapéu', desc: 'Sem cobertura para a cabeça' },
  { id: 'straw_hat', name: 'Chapéu de Palha', desc: 'Aba larga com fita vermelha para o sol' },
  { id: 'cat_ears_band', name: 'Tiara de Gatinho', desc: 'Orelhinhas felinas fofas' },
  { id: 'witch_hat', name: 'Chapéu de Mago', desc: 'Chapéu cônico pontudo roxo' }
];

export const GLASSES_OPTIONS = [
  { id: 'none', name: 'Nenhum Óculos', desc: 'Visão limpa sem armação' },
  { id: 'round_wire', name: 'Óculos Redondos', desc: 'Armação fina de metal intelectual' },
  { id: 'sunglasses_cool', name: 'Óculos Escuros', desc: 'Lentes escuras contra o sol da ilha' }
];
