/**
 * SvgAssetCatalog.js - KidsLearnCode
 * Catálogo dos componentes extraídos dos arquivos SVG oficiais:
 * - Face Components.svg (Olhos, Narizes, Bocas, Bochechas e Detalhes)
 * - Hairs.svg (Penteados, Franjas e Cabelos Traseiros)
 */

export const SVG_NOSES = [
  {
    id: 'nose_triangle',
    name: 'Triângulo Clássico',
    type: 'path',
    d: 'M0 -7L8 8H-8L0 -7Z',
    color: '#FF7E36',
    scale: 0.4
  },
  {
    id: 'nose_oval',
    name: 'Botão Oval',
    type: 'ellipse',
    rx: 4.5,
    ry: 2.8,
    color: '#FF7E36'
  },
  {
    id: 'nose_rect',
    name: 'Quadrado Suave',
    type: 'rect',
    w: 7,
    h: 3.5,
    rx: 1,
    color: '#FF7E36'
  },
  {
    id: 'nose_circle',
    name: 'Botão Redondo',
    type: 'circle',
    r: 3.2,
    color: '#FF7E36'
  }
];

export const SVG_MOUTHS = [
  {
    id: 'mouth_smile_arc',
    name: 'Sorriso Suave',
    d: 'M-12 0C-12 5 -6 9 0 9C6 9 12 5 12 0',
    type: 'stroke',
    color: '#8C501D',
    strokeWidth: 2.2,
    scale: 0.45
  },
  {
    id: 'mouth_open_dot',
    name: 'Boquinha O',
    type: 'fill',
    rx: 3.5,
    ry: 4.2,
    color: '#8C501D'
  },
  {
    id: 'mouth_smirk_curl',
    name: 'Sorriso Travesso',
    d: 'M-4 -6C-2 -8 1 -8 3 -6C6 -3 3 0 0 -1C4 1 4 3 3 4C2 6 -1 6 -3 4',
    type: 'stroke',
    color: '#8C501D',
    strokeWidth: 1.8,
    scale: 0.5
  },
  {
    id: 'mouth_wide_smile',
    name: 'Sorriso Aberto',
    d: 'M-18 0C-18 6 -10 11 0 11C10 11 18 6 18 0',
    type: 'stroke',
    color: '#8C501D',
    strokeWidth: 2.4,
    scale: 0.45
  },
  {
    id: 'mouth_joyful_teeth',
    name: 'Riso com Dentes',
    d: 'M0 8C10 8 18 2 18 -4C18 -4 6 -2 0 -2C-6 -2 -18 -4 -18 -4C-18 2 -10 8 0 8Z',
    type: 'fill_stroke',
    fillColor: '#FFFFFF',
    strokeColor: '#8C501D',
    strokeWidth: 2.0,
    scale: 0.4
  },
  {
    id: 'mouth_cat_w',
    name: 'Boquinha Felina :3',
    d: 'M-22 0C-20 3 -14 8 -8 8C-2 8 2 5 4 3C6 5 10 8 16 8C22 8 28 3 30 0',
    type: 'stroke',
    color: '#8C501D',
    strokeWidth: 2.2,
    scale: 0.35
  },
  {
    id: 'mouth_buck_tooth',
    name: 'Sorriso Dentinho',
    d: 'M-18 0C-18 4 -10 6 0 6C10 6 18 4 18 0',
    toothD: 'M-4 6V1H4V6H-4Z',
    type: 'tooth',
    color: '#8C501D',
    strokeWidth: 2.0,
    scale: 0.45
  }
];

export const SVG_EYES = [
  {
    id: 'eye_anime_sparkle',
    name: 'Brilho Anime',
    type: 'anime_sparkle',
    color: '#8C501D'
  },
  {
    id: 'eye_almond_lash',
    name: 'Amendoado com Cílios',
    type: 'almond_lash',
    color: '#8C501D'
  },
  {
    id: 'eye_sharp_determined',
    name: 'Determinado / Focado',
    type: 'sharp_determined',
    color: '#8C501D'
  },
  {
    id: 'eye_sleepy_calm',
    name: 'Calmo / Sonhador',
    type: 'sleepy_calm',
    color: '#8C501D'
  },
  {
    id: 'eye_cheerful_crescent',
    name: 'Arco Sorridente ^_^',
    type: 'cheerful_crescent',
    color: '#8C501D'
  },
  {
    id: 'eye_cat_lashes',
    name: 'Olhar de Gatinho',
    type: 'cat_lashes',
    color: '#8C501D'
  },
  {
    id: 'eye_round_button',
    name: 'Botão Redondo ACNH',
    type: 'round_button',
    color: '#8C501D'
  },
  {
    id: 'eye_gentle_oval',
    name: 'Oval Acolhedor',
    type: 'gentle_oval',
    color: '#8C501D'
  }
];

export const SVG_CHEEKS = [
  {
    id: 'cheeks_peach_oval',
    name: 'Blush Pêssego',
    type: 'oval',
    color: 'rgba(255, 186, 165, 0.75)',
    rx: 5.5,
    ry: 4.2
  },
  {
    id: 'cheeks_coral_vibrant',
    name: 'Blush Coral',
    type: 'oval',
    color: 'rgba(255, 126, 54, 0.75)',
    rx: 5.5,
    ry: 4.2
  },
  {
    id: 'cheeks_freckles',
    name: 'Sardinhas Fofas',
    type: 'freckles',
    color: '#8C501D'
  },
  {
    id: 'cheeks_whiskers',
    name: 'Bigodinhos de Bichinho',
    type: 'whiskers',
    color: '#8C501D'
  },
  {
    id: 'none',
    name: 'Sem Marcação',
    type: 'none'
  }
];

export const SVG_HAIRS = [
  {
    id: 'hair_short_bangs',
    name: 'Franja Curta Espetada',
    desc: 'Corte curto com mechas leves',
    pathIndex: 3,
    d: 'M-87 -21C-81 -15 -79 3 -77 9C-60 6 -24 1 0 1C24 1 60 6 77 9C79 3 80 -15 87 -21C95 -27 91 -28 86 -33C81 -38 75 -42 71 -30C70 -31 70 -33 72 -36C73 -41 81 -44 69 -50C57 -57 58 -53 56 -46C54 -44 52 -39 50 -39C50 -40 51 -44 52 -47C53 -50 59 -56 50 -61C39 -67 41 -65 34 -47C33 -48 33 -51 33 -55C33 -61 39 -66 24 -67C13 -67 12 -66 12 -58C12 -52 11 -49 11 -48C10 -49 9 -52 9 -55C10 -64 13 -68 1 -68C-12 -68 -9 -63 -9 -58C-9 -55 -10 -51 -11 -48C-12 -49 -13 -52 -13 -58C-12 -65 -10 -68 -24 -67C-38 -65 -32 -62 -33 -55C-33 -52 -34 -48 -34 -47C-39 -67 -40 -67 -51 -61C-63 -55 -53 -48 -52 -45C-51 -42 -50 -40 -50 -39C-52 -39 -55 -43 -57 -45C-59 -52 -59 -55 -70 -50C-80 -45 -75 -41 -73 -37C-72 -33 -70 -31 -71 -30C-75 -42 -80 -37 -86 -33C-92 -29 -94 -28 -87 -21Z',
    scale: 0.17
  },
  {
    id: 'hair_wavy_medium',
    name: 'Bob Médio Ondulado',
    desc: 'Volume moderno com curvas laterais',
    pathIndex: 4,
    d: 'M-107 94C-98 81 -85 43 -71 26C-64 16 -52 0 0 0C51 0 62 16 69 26C82 43 98 81 107 94C117 108 140 138 65 173C70 149 77 96 62 73C52 72 32 69 29 69C28 62 24 47 24 43C23 51 20 68 18 69C17 70 3 70 0 70C-3 70 -17 70 -18 69C-20 68 -23 51 -24 43C-24 47 -28 62 -29 69C-32 69 -52 72 -62 73C-77 96 -71 149 -65 173C-140 138 -116 108 -107 94Z',
    scale: 0.16
  },
  {
    id: 'hair_curtains_bob',
    name: 'Franja Repartida (Curtains)',
    desc: 'Clássico estilo dividido ao meio',
    pathIndex: 5,
    d: 'M0 -115C28 -115 42 -115 68 -99C108 -75 125 46 114 81C106 108 78 116 65 116C56 110 32 96 0 96C-31 96 -56 110 -65 116C-78 116 -106 108 -114 81C-125 46 -108 -75 -68 -99C-42 -115 -28 -115 0 -115ZM51 -77C51 -70 50 -56 47 -53C43 -51 15 -46 0 -46C-15 -46 -43 -51 -47 -53C-50 -56 -51 -70 -51 -77C-59 -53 -70 -10 -73 33C-62 46 -45 55 -35 59C-31 61 -17 65 0 65C17 65 31 61 35 59C45 55 62 46 73 33C70 -10 59 -53 51 -77Z',
    scale: 0.15
  },
  {
    id: 'hair_fluffy_afro',
    name: 'Cachos Volumosos / Afro',
    desc: 'Volume fofo e aconchegante',
    pathIndex: 6,
    d: 'M0 -100C18 -100 59 -94 84 -69C116 -37 100 -28 96 -24C93 -20 104 -16 112 -11C119 -6 127 7 115 15C104 24 106 28 109 30C112 32 126 32 134 44C142 57 129 87 96 94C64 101 45 99 39 99H-41C-47 99 -66 101 -98 94C-131 87 -144 57 -136 44C-128 32 -114 32 -111 30C-108 28 -106 24 -117 15C-129 7 -121 -6 -114 -11C-106 -16 -95 -20 -98 -24C-102 -28 -118 -37 -86 -69C-61 -94 -19 -100 0 -100Z',
    scale: 0.14
  },
  {
    id: 'hair_long_straight',
    name: 'Longo Elegante',
    desc: 'Cabelo liso com caimento nos ombros',
    pathIndex: 7,
    d: 'M-76 -90C-61 -144 -12 -137 -1 -137C64 -137 74 -119 86 -90C99 -56 112 -28 116 -18C121 -9 130 14 123 32C120 40 115 45 111 48C105 52 101 55 101 61C106 71 117 82 112 92C107 104 90 111 82 114C79 107 68 127 52 128C54 120 57 105 58 93C49 97 27 103 13 104H-14C-28 103 -50 97 -59 93C-58 105 -55 120 -53 128C-69 127 -80 107 -83 114C-91 111 -108 104 -113 92C-119 78 -98 63 -98 51C-98 40 -113 41 -120 22C-127 4 -118 -19 -113 -28C-108 -38 -81 -79 -76 -90Z',
    scale: 0.13
  },
  {
    id: 'hair_classic_bowl',
    name: 'Tigelinha Retrô',
    desc: 'Corte arredondado clássico de vila',
    pathIndex: 8,
    d: 'M-83 40C-83 -31 -31 -42 0 -42C31 -42 83 -31 83 40L80 43C79 40 76 23 71 14C66 4 62 2 61 2L52 8L41 -4L26 4L12 -7L0 8L-12 -7L-26 4L-40 -4L-52 8L-61 2C-62 2 -65 4 -70 14C-75 23 -79 39 -80 43L-83 40Z',
    scale: 0.17
  },
  {
    id: 'hair_twin_buns',
    name: 'Coquinhos Duplos',
    desc: 'Dois laços e coquinhos fofos',
    pathIndex: 10,
    d: 'M0 -71C27 -71 37 -61 39 -52C56 -62 76 -42 81 -35C90 -25 106 12 117 12C123 12 126 11 132 9C129 20 121 44 104 48C90 48 85 24 84 13C71 13 59 6 55 -2C47 10 33 22 12 23C-22 24 -33 13 -34 9C-36 22 -44 48 -61 48C-73 48 -84 24 -89 12C-83 13 -80 13 -74 13C-63 13 -41 -27 -32 -37C-23 -48 2 -71 0 -71Z',
    scale: 0.14
  },
  {
    id: 'hair_hero_spikes',
    name: 'Espetado de Aventureiro',
    desc: 'Topete pontudo cheio de atitude',
    pathIndex: 17,
    d: 'M0 -66C-53 -66 -70 -39 -71 -26C-77 -28 -90 -32 -98 -26C-109 -18 -123 -3 -130 -1C-130 5 -127 13 -123 14C-119 16 -144 23 -145 30C-144 34 -141 43 -138 44C-135 45 -133 42 -130 40C-131 42 -134 46 -135 50C-136 53 -128 61 -123 60C-121 57 -116 52 -113 50C-110 50 -103 48 -98 44C-104 31 -92 7 -85 -3C-87 0 -90 7 -90 10C-89 13 -81 14 -77 15C-74 15 -71 -5 -70 -16C-54 -4 -22 17 -18 14C-13 10 -10 5 -9 1C-9 -4 -21 -5 -25 -9C-14 -6 9 -3 14 -9C34 1 50 26 52 32C58 47 63 57 68 66C72 71 87 58 90 56C90 53 81 40 76 34C80 35 80 37 82 38C84 38 93 32 96 30C97 21 85 7 79 1C82 1 85 -5 87 -12C80 -21 55 -31 57 -31C60 -31 65 -39 66 -43C66 -48 36 -66 0 -66Z',
    scale: 0.13
  }
];
