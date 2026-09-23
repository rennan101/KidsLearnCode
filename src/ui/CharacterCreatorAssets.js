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
  let minX = hair.cx - 120;
  let minY = hair.topY - 15;
  let width = 240;
  let height = 240;

  if (hairId === 'hair_side_swoosh') {
    minX = 40;
    minY = 180;
    width = 220;
    height = 110;
  } else if (hairId === 'hair_classic_bowl') {
    minX = 50;
    minY = 30;
    width = 190;
    height = 110;
  } else if (hairId === 'hair_curtains_bob') {
    minX = 320;
    minY = 15;
    width = 250;
    height = 250;
  } else if (hairId === 'hair_fluffy_afro') {
    minX = 300;
    minY = 270;
    width = 285;
    height = 210;
  } else if (hairId === 'hair_long_straight') {
    minX = 315;
    minY = 510;
    width = 255;
    height = 285;
  } else if (hairId === 'hair_short_spikes') {
    minX = 635;
    minY = 170;
    width = 205;
    height = 100;
  } else if (hairId === 'hair_wavy_bob') {
    minX = 610;
    minY = 345;
    width = 255;
    height = 195;
  } else if (hairId === 'hair_twin_buns') {
    minX = 10;
    minY = 465;
    width = 280;
    height = 140;
  } else if (hairId === 'hair_twin_braids') {
    minX = 610;
    minY = 565;
    width = 255;
    height = 220;
  } else if (hairId === 'hair_hero_spikes') {
    minX = 915;
    minY = 15;
    width = 235;
    height = 160;
  } else if (hairId === 'hair_high_ponytail') {
    minX = 940;
    minY = 420;
    width = 180;
    height = 140;
  }

  return `<svg viewBox="${minX} ${minY} ${width} ${height}" class="cc-preview-icon">${paths}</svg>`;
}

export function getEyeSvg(eyeId, color = '#8C501D') {
  switch (eyeId) {
    case 'eye_pair_01':
      return `<svg viewBox="790 165 55 45" class="cc-preview-icon">
        <path d="M826.849 170.249C833.041 171.867 835.361 174.249 835.849 176.249C836.338 178.249 836.599 181.249 834.849 188.249C833.349 194.249 831.349 202.249 821.349 205.249C811.349 208.249 805.163 206.249 801.663 204.691C797.76 202.954 795.764 200.989 795.252 195.794C794.74 190.599 797.439 179.409 805.163 173.788C812.886 168.166 819.094 168.222 826.849 170.249Z" fill="white" stroke="#8C501D" stroke-width="2"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M829.259 170.981C828.53 170.724 827.729 170.478 826.849 170.249C826.365 170.122 825.888 170.003 825.415 169.893C824.739 169.798 824.049 169.749 823.349 169.749C814.513 169.749 807.349 177.584 807.349 187.249C807.349 196.73 814.243 204.45 822.848 204.74C831.556 201.421 833.427 193.936 834.849 188.249C836.567 181.378 836.346 178.361 835.876 176.36C834.151 173.989 831.875 172.119 829.259 170.981Z" fill="${color}"/>
      </svg>`;

    case 'eye_pair_02':
      return `<svg viewBox="790 245 60 45" class="cc-preview-icon">
        <path d="M822.314 249.951C832.059 253.101 837.431 263.332 834.381 272.768L834.372 272.794L834.366 272.82C833.628 275.609 831.849 278.785 828.524 281.108C825.207 283.425 820.263 284.955 813.081 284.3C809.759 283.998 805.592 283.169 802.107 282.107C800.364 281.575 798.821 280.995 797.652 280.408C797.067 280.114 796.599 279.83 796.251 279.563C795.892 279.288 795.723 279.077 795.658 278.95C795.587 278.813 795.508 278.527 795.475 278.036C795.443 277.562 795.46 276.973 795.523 276.282C795.649 274.903 795.952 273.213 796.355 271.415C797.159 267.823 798.334 263.905 799.171 261.397L799.174 261.388C802.225 251.952 812.569 246.8 822.314 249.951Z" fill="white" stroke="#8C501D" stroke-width="2"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M820.512 248.44C812.796 250.143 807 257.385 807 266.061C807 275.911 814.473 283.914 823.744 284.059C833.312 280.524 836.104 273.44 836.14 268.248C836.725 258.664 829.911 250.294 820.512 248.44Z" fill="${color}"/>
        <line x1="837" y1="251" x2="843" y2="247" stroke="#8C501D" stroke-width="2" stroke-linecap="round"/>
        <line x1="841" y1="259" x2="847" y2="257" stroke="#8C501D" stroke-width="2" stroke-linecap="round"/>
      </svg>`;

    case 'eye_pair_03':
      return `<svg viewBox="795 105 50 35" class="cc-preview-icon">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M821 132C828.18 132 834 126.18 834 119C834 117.99 833.885 117.008 833.667 116.064C830.331 113.066 823.841 109 815.797 109C814.642 109 813.513 109.084 812.417 109.236C809.709 111.619 808 115.11 808 119C808 126.18 813.82 132 821 132Z" fill="${color}"/>
        <path d="M795 117C797.773 114 805.814 108 815.797 108C825.78 108 833.425 114 836 117" stroke="#8C501D" stroke-width="4" stroke-linecap="round"/>
        <path d="M836 117C837 116.833 839.1 115.8 839.5 113" stroke="#8C501D" stroke-width="4" stroke-linecap="round"/>
      </svg>`;

    case 'eye_pair_04':
      return `<svg viewBox="790 320 55 45" class="cc-preview-icon">
        <path d="M822.314 323.951C832.059 327.101 837.431 337.332 834.381 346.768L834.372 346.794L834.366 346.82C833.628 349.609 831.849 352.785 828.524 355.108C825.207 357.425 820.263 358.955 813.081 358.3C809.759 357.998 805.592 357.169 802.107 356.107C800.364 355.575 798.821 354.995 797.652 354.408C797.067 354.114 796.599 353.83 796.251 353.563C795.892 353.288 795.723 353.077 795.658 352.95C795.587 352.813 795.508 352.527 795.475 352.036C795.443 351.562 795.46 350.973 795.523 350.282C795.649 348.903 795.952 347.213 796.355 345.415C797.159 341.823 798.334 337.905 799.171 335.397L799.174 335.388C802.225 325.952 812.569 320.8 822.314 323.951Z" fill="white" stroke="#8C501D" stroke-width="2"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M820.512 322.44C812.796 324.144 807 331.386 807 340.061C807 349.911 814.473 357.914 823.744 358.059C833.312 354.525 836.104 347.44 836.14 342.248C836.725 332.664 829.911 324.295 820.512 322.44Z" fill="${color}"/>
      </svg>`;

    case 'eye_pair_05':
      return `<svg viewBox="635 242 40 45" class="cc-preview-icon">
        <ellipse cx="655.5" cy="265.5" rx="14.5" ry="19.5" fill="${color}"/>
        <circle cx="651.5" cy="257.5" r="5.5" fill="white"/>
        <ellipse cx="661.5" cy="273" rx="2.5" ry="3" fill="white"/>
        <path d="M640 249C640 249.667 640.7 252.2 641.5 253C642.5 254 644 254.5 645.5 254" stroke="#8C501D" stroke-width="2" stroke-linecap="round"/>
      </svg>`;

    case 'eye_pair_06':
      return `<svg viewBox="635 165 48 52" class="cc-preview-icon">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M642.139 178.213C641.994 178.742 642.267 179.299 642.749 179.458L670.096 188.462L670.11 188.466C671.34 188.826 673.255 189.082 675.009 188.623C675.896 188.391 676.782 187.965 677.508 187.234C678.244 186.492 678.77 185.482 678.985 184.179C679.075 183.636 678.747 183.115 678.252 183.016C677.757 182.917 677.283 183.278 677.193 183.821C677.044 184.718 676.704 185.329 676.276 185.76C675.837 186.202 675.259 186.501 674.586 186.677C673.225 187.033 671.64 186.842 670.592 186.538L643.273 177.542C642.791 177.383 642.283 177.684 642.139 178.213Z" fill="#8C501D"/>
        <path d="M656.678 212C646.362 212 638 202.822 638 191.5C638 186.642 639.54 182.179 642.113 178.666C642.168 179.029 642.406 179.345 642.749 179.458L670.096 188.462L670.11 188.466C671.34 188.826 673.255 189.082 675.009 188.623C675.062 188.609 675.115 188.594 675.168 188.579C675.292 189.533 675.356 190.508 675.356 191.5C675.356 202.822 666.993 212 656.678 212Z" fill="${color}"/>
        <path d="M674.821 186.61C672.823 177.649 665.458 171 656.678 171C651.294 171 646.443 173.5 643.034 177.5C643.113 177.502 643.194 177.516 643.273 177.542L670.593 186.538C671.64 186.842 673.225 187.033 674.586 186.677C674.666 186.656 674.744 186.634 674.821 186.61Z" fill="#FFAFA4"/>
        <circle cx="648" cy="191" r="5" fill="white"/>
      </svg>`;

    case 'eye_pair_07':
      return `<svg viewBox="630 95 50 45" class="cc-preview-icon">
        <ellipse cx="655" cy="117.5" rx="22" ry="19.5" fill="white" stroke="#8C501D" stroke-width="2"/>
        <ellipse cx="660.5" cy="116" rx="17.5" ry="18" fill="${color}"/>
        <rect x="641.6" y="88.7" width="45.7" height="19" fill="#FFAFA4"/>
      </svg>`;

    case 'eye_pair_08':
      return `<svg viewBox="470 245 45 45" class="cc-preview-icon">
        <circle cx="493" cy="265" r="17" fill="white" stroke="#8C501D" stroke-width="2"/>
        <circle cx="491" cy="264" r="11" fill="${color}"/>
        <line x1="494" y1="282" x2="494" y2="287" stroke="#8C501D" stroke-width="2" stroke-linecap="round"/>
        <line x1="504" y1="277" x2="507" y2="281" stroke="#8C501D" stroke-width="2" stroke-linecap="round"/>
        <line x1="482" y1="278" x2="479" y2="282" stroke="#8C501D" stroke-width="2" stroke-linecap="round"/>
      </svg>`;

    case 'eye_pair_09':
      return `<svg viewBox="470 160 45 45" class="cc-preview-icon">
        <circle cx="493" cy="191" r="17" fill="white" stroke="#8C501D" stroke-width="2"/>
        <circle cx="491" cy="190" r="11" fill="${color}"/>
        <line x1="493" y1="173" x2="493" y2="168" stroke="#8C501D" stroke-width="2" stroke-linecap="round"/>
        <line x1="503.6" y1="177.7" x2="506.1" y2="173.4" stroke="#8C501D" stroke-width="2" stroke-linecap="round"/>
        <line x1="481.5" y1="179" x2="478.5" y2="175" stroke="#8C501D" stroke-width="2" stroke-linecap="round"/>
      </svg>`;

    case 'eye_pair_10':
      return `<svg viewBox="470 95 45 45" class="cc-preview-icon">
        <circle cx="493" cy="117" r="17" fill="white" stroke="#8C501D" stroke-width="2"/>
        <circle cx="491" cy="116" r="11" fill="${color}"/>
      </svg>`;

    case 'eye_pair_11':
      return `<svg viewBox="155 325 40 25" class="cc-preview-icon">
        <path d="M159.408 333.664C160.708 336.455 165.544 342.232 174.48 343.014C183.416 343.795 188.743 338.908 190.29 336.366" stroke="#8C501D" stroke-width="4" stroke-linecap="round"/>
      </svg>`;

    case 'eye_pair_12':
    default:
      return `<svg viewBox="470 330 45 25" class="cc-preview-icon">
        <path d="M477.408 345.336C478.708 342.545 483.544 336.768 492.48 335.986C501.416 335.205 506.743 340.092 508.29 342.634" stroke="#8C501D" stroke-width="4" stroke-linecap="round"/>
      </svg>`;
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
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><path d="M12 9 L28 9 L24 17 L33 32 L7 32 L16 17 Z" fill="${primary}" stroke="#0f8e83" stroke-width="2"/><path d="M7 32 Q13 29 20 32 Q27 29 33 32" fill="none" stroke="#ffffff" stroke-width="2"/></svg>`;
    case 'top_sweater':
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><path d="M10 8 L30 8 L36 24 L30 25 L28 32 L12 32 L10 25 L4 24 Z" fill="${primary}" stroke="#0f8e83" stroke-width="2"/><rect x="14" y="6" width="12" height="5" rx="2.5" fill="#ffffff" stroke="#0f8e83" stroke-width="1.5"/><rect x="12" y="29" width="16" height="3" fill="#ffffff"/></svg>`;
    case 'top_long_sleeve':
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><path d="M12 9 L28 9 L35 27 L30 28 L27 32 L13 32 L10 28 L5 27 Z" fill="${primary}" stroke="#0f8e83" stroke-width="2"/><rect x="13" y="29" width="14" height="3" fill="#ffffff"/><rect x="5" y="25" width="4" height="3" fill="#ffffff"/><rect x="31" y="25" width="4" height="3" fill="#ffffff"/></svg>`;
    case 'top_puffy_sleeve':
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><circle cx="9" cy="14" r="6" fill="${primary}" stroke="#0f8e83" stroke-width="1.5"/><circle cx="31" cy="14" r="6" fill="${primary}" stroke="#0f8e83" stroke-width="1.5"/><path d="M13 9 L27 9 L25 32 L15 32 Z" fill="${primary}" stroke="#0f8e83" stroke-width="2"/><path d="M15 9 Q20 15 25 9" fill="none" stroke="#ffffff" stroke-width="2"/></svg>`;
    case 'top_sleeveless':
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><path d="M14 9 L26 9 L24 32 L16 32 Z" fill="${primary}" stroke="#0f8e83" stroke-width="2"/><rect x="17" y="9" width="6" height="4" fill="#ffffff"/></svg>`;
    case 'top_crop_top':
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><path d="M12 9 L28 9 L25 21 L15 21 Z" fill="${primary}" stroke="#0f8e83" stroke-width="2"/><rect x="15" y="19" width="10" height="3" fill="#ffffff"/></svg>`;
    default:
      return `<svg viewBox="0 0 40 40" class="cc-preview-icon"><path d="M12 9 L28 9 L32 17 L28 19 L26 32 L14 32 L12 19 L8 17 Z" fill="${primary}" stroke="#0f8e83" stroke-width="2"/><path d="M16 9 Q20 14 24 9" fill="none" stroke="#ffffff" stroke-width="2"/></svg>`;
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


