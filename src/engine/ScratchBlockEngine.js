/**
 * ScratchBlockEngine - KidsLearnCode
 * Engine de Blocos Visuais de Quebra-Cabeça (Drag & Drop estilo Code Kit / Blockly).
 * Permite arrastar peças com encaixes puzzle para a mesa de montagem,
 * aninhar blocos de repetição e condição, e ver a transformação do código Lua em tempo real ao lado.
 */

import { soundFX } from './SoundFX.js';

export const BLOCK_CATEGORIES = {
  variables: { id: 'variables', name: 'Variáveis & Valores', color: '#EA580C', darkColor: '#C2410C', accentColor: '#ffedd5' },
  actions: { id: 'actions', name: 'Ações de Criação', color: '#0284C7', darkColor: '#0369A1', accentColor: '#e0f2fe' },
  conditions: { id: 'conditions', name: 'Lógica & Condições', color: '#059669', darkColor: '#047857', accentColor: '#d1fae5' },
  loops: { id: 'loops', name: 'Repetição (Loops)', color: '#7C3AED', darkColor: '#6D28D9', accentColor: '#ede9fe' },
  functions: { id: 'functions', name: 'Funções & Regras', color: '#DB2777', darkColor: '#BE185D', accentColor: '#fce7f3' }
};

/**
 * Visual Item/Option Resolver for Blocks (Icons instead of raw text strings)
 */
export function getBlockOptionVisual(val) {
  if (val === undefined || val === null || val === '') {
    return { icon: '', label: '', color: '#64748b', bg: '#f1f5f9' };
  }
  const str = String(val).toLowerCase().replace(/["']/g, '').trim();

  // 1. Materials & Woods
  if (str === 'carvalho' || str === 'madeira' || str === 'wood' || str === 'madeira_macica' || str === 'palha') {
    return {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6c0-1.66 3.58-3 8-3s8 1.34 8 3v12c0 1.66-3.58 3-8 3s-8-1.34-8-3V6z"/><ellipse cx="12" cy="6" rx="8" ry="3"/></svg>`,
      label: str.replace(/_/g, ' '),
      color: '#d97706',
      bg: '#fef3c7'
    };
  }
  if (str === 'pinheiro' || str === 'pine') {
    return {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 19 21 5 21 12 2"/><line x1="12" y1="21" x2="12" y2="23"/></svg>`,
      label: 'Pinheiro',
      color: '#059669',
      bg: '#d1fae5'
    };
  }
  if (str === 'ferro' || str === 'ferro_puro' || str === 'iron' || str.includes('metal')) {
    return {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 2 18 2 22 8 12 22 2 8 6 2"/></svg>`,
      label: 'Ferro',
      color: '#0284c7',
      bg: '#e0f2fe'
    };
  }
  if (str === 'ouro' || str === 'gold') {
    return {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M9 9h6a1.5 1.5 0 0 1 0 3H9a1.5 1.5 0 0 0 0 3h6"/></svg>`,
      label: 'Ouro',
      color: '#d97706',
      bg: '#fef3c7'
    };
  }
  if (str === 'cobre') {
    return {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="12" rx="2"/></svg>`,
      label: 'Cobre',
      color: '#ea580c',
      bg: '#ffedd5'
    };
  }
  if (str === 'cristal') {
    return {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 22 8.5 12 22 2 8.5 12 2"/></svg>`,
      label: 'Cristal',
      color: '#8b5cf6',
      bg: '#ede9fe'
    };
  }

  // 2. Furniture & Props
  if (str.includes('chair') || str.includes('cadeira')) {
    return {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"/><path d="M3 11v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"/><path d="M5 18v2M19 18v2"/></svg>`,
      label: 'Cadeira',
      color: '#d97706',
      bg: '#fef3c7'
    };
  }
  if (str.includes('table') || str.includes('mesa')) {
    return {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#7a583e" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="4" rx="1"/><path d="M4 10v10M20 10v10M8 10v6M16 10v6"/></svg>`,
      label: 'Mesa',
      color: '#7a583e',
      bg: '#f5ebe0'
    };
  }
  if (str.includes('bed') || str.includes('cama')) {
    return {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"/></svg>`,
      label: 'Cama',
      color: '#6366f1',
      bg: '#e0e7ff'
    };
  }
  if (str.includes('tent') || str.includes('tenda')) {
    return {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21L12 3 5 21M12 3v18M9 21l3-6 3 6"/></svg>`,
      label: 'Tenda',
      color: '#10b981',
      bg: '#d1fae5'
    };
  }
  if (str.includes('house') || str.includes('cottage') || str.includes('casa')) {
    return {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
      label: 'Casa',
      color: '#ea580c',
      bg: '#ffedd5'
    };
  }

  // 3. Tools
  if (str.includes('shovel') || str.includes('pa')) {
    return {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 22l8-8M9 13l2 2M13 9l2 2M15 7l4 4-6 6-4-4 6-6z"/></svg>`,
      label: 'Pá',
      color: '#0284c7',
      bg: '#e0f2fe'
    };
  }
  if (str.includes('axe') || str.includes('machado')) {
    return {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4l6 6-4 4-6-6 4-4z"/><path d="M5 21l9-9"/></svg>`,
      label: 'Machado',
      color: '#ef4444',
      bg: '#fee2e2'
    };
  }
  if (str.includes('pickaxe') || str.includes('picareta')) {
    return {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
      label: 'Picareta',
      color: '#0284c7',
      bg: '#e0f2fe'
    };
  }
  if (str.includes('watering_can') || str.includes('regador')) {
    return {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10h12v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9z"/><path d="M16 14l5-3v-2l-5 3M8 6h4v4H8z"/></svg>`,
      label: 'Regador',
      color: '#10b981',
      bg: '#d1fae5'
    };
  }
  if (str.includes('rod') || str.includes('pesca')) {
    return {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20L20 4M20 4v8M20 12c0 2-2 4-4 4"/></svg>`,
      label: 'Vara de Pesca',
      color: '#06b6d4',
      bg: '#cffafe'
    };
  }
  if (str.includes('net') || str.includes('rede')) {
    return {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M12 14v8M9 22h6"/></svg>`,
      label: 'Rede',
      color: '#10b981',
      bg: '#d1fae5'
    };
  }

  // 4. Nature & Flora
  if (str.includes('bush') || str.includes('arbusto') || str.includes('berry') || str.includes('wheat') || str.includes('trigo')) {
    return {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12A10 10 0 0 1 12 2z"/><path d="M12 2c0 5.52 4.48 10 10 10"/></svg>`,
      label: 'Planta',
      color: '#10b981',
      bg: '#d1fae5'
    };
  }
  if (str.includes('tree') || str.includes('arvore') || str.includes('oak')) {
    return {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#047857" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-6M12 16a6 6 0 1 0-6-6c0 1.25.38 2.42 1.04 3.4M12 16a6 6 0 1 1 6-6c0 1.25-.38 2.42-1.04 3.4"/></svg>`,
      label: 'Árvore',
      color: '#047857',
      bg: '#d1fae5'
    };
  }

  // 5. Ground / Tiles
  if (str.includes('dirt') || str.includes('piso') || str.includes('ground') || str.includes('tile') || str.includes('stone') || str.includes('cobblestone')) {
    return {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#b45309" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
      label: 'Piso',
      color: '#b45309',
      bg: '#fef3c7'
    };
  }

  return {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><path d="M12 8v8M8 12h8"/></svg>`,
    label: str,
    color: '#64748b',
    bg: '#f1f5f9'
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
    this.dragDropTarget = null; // { parentArray, index, isInner }
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
        defaultValues: { VAL: 'carvalho' },
        options: { VAL: ['carvalho', 'pinheiro', 'madeira_macica', 'ferro_puro', 'cobre', 'veio_mineral'] },
        toLua: (b) => `local material = "${b.values.VAL || 'carvalho'}"`
      },
      {
        id: 'var_custom',
        category: 'variables',
        type: 'statement',
        label: 'Definir [NAME] = [VAL]',
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
        defaultValues: { TOOL: 'tool_shovel_iron' },
        options: { TOOL: ['tool_shovel_iron', 'tool_axe_woodcutter', 'tool_pickaxe_miner', 'tool_watering_can', 'tool_fishing_rod', 'tool_bug_net'] },
        toLua: (b) => `forjar_ferramenta("${b.values.TOOL || 'tool_shovel_iron'}", "ferro")`
      },
      {
        id: 'act_plantar_arbusto',
        category: 'actions',
        type: 'statement',
        label: 'Plantar na Ilha: [ARBUSTO]',
        defaultValues: { ARBUSTO: 'nature_berry_bush' },
        options: { ARBUSTO: ['nature_berry_bush', 'nature_oak_tree', 'nature_pine_tree', 'flower-magic'] },
        toLua: (b) => `plantar_arbusto("${b.values.ARBUSTO || 'nature_berry_bush'}")`
      },
      {
        id: 'act_fincar_cerca',
        category: 'actions',
        type: 'statement',
        label: 'Colocar Cerca na Posição [POS]',
        defaultValues: { POS: 'i' },
        toLua: (b) => `fincar_cerca("struct_fence_wood_segment", ${b.values.POS || 'i'})`
      },
      {
        id: 'act_assentar_piso',
        category: 'actions',
        type: 'statement',
        label: 'Assentar Piso: [PISO]',
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
        defaultValues: { COND: 'palha >= 5' },
        options: { COND: ['palha >= 5', 'ferro >= 5', 'madeira >= 8', 'ouro >= 10', 'amizade >= 50'] },
        children: [],
        toLua: (b, engine) => {
          const inner = engine.transpileBlockList(b.children || [], '  ');
          return `se ${b.values.COND || 'true'} entao\n${inner || '  -- encaixe uma acao aqui\n'}fim`;
        }
      },

      // 4. Loops & Repetição
      {
        id: 'loop_for',
        category: 'loops',
        type: 'container',
        label: 'Para i = 1 até [COUNT] Faça:',
        defaultValues: { COUNT: '4' },
        children: [],
        toLua: (b, engine) => {
          const inner = engine.transpileBlockList(b.children || [], '  ');
          return `para i = 1, ${b.values.COUNT || 4} faca\n${inner || '  -- encaixe uma acao aqui\n'}fim`;
        }
      },

      // 5. Funções
      {
        id: 'func_define',
        category: 'functions',
        type: 'container',
        label: 'Criar Regra: [NAME]()',
        defaultValues: { NAME: 'construir_estrutura' },
        children: [],
        toLua: (b, engine) => {
          const inner = engine.transpileBlockList(b.children || [], '  ');
          return `funcao ${b.values.NAME || 'minha_regra'}()\n${inner || '  -- acoes da regra\n'}fim`;
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

  // Intelligent block derivation for all 37+ NPC lessons
  deriveLessonBlocks(lesson) {
    const assetId = lesson.unlockedAssetId || 'prop_chair_wood';
    const assetName = lesson.unlockedAssetName || 'Item Especial';
    const starterLua = lesson.starterLua || '';
    const lines = starterLua.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('--'));

    const derived = [];
    const seenBlockIds = new Set();

    lines.forEach((line, idx) => {
      // 1. Variable definition: local name = "val" or num
      const varMatch = line.match(/^local\s+([a-zA-Z_]\w*)\s*=\s*(.*)$/);
      if (varMatch) {
        const varName = varMatch[1];
        let rawVal = varMatch[2].trim();
        const isString = rawVal.startsWith('"') || rawVal.startsWith("'");
        const cleanVal = rawVal.replace(/^["']|["']$/g, '');

        const blockId = `var_${varName}_${idx}`;
        if (!seenBlockIds.has(blockId)) {
          seenBlockIds.add(blockId);
          derived.push({
            id: blockId,
            category: 'variables',
            type: 'statement',
            label: `Definir [NAME] = [VAL]`,
            defaultValues: { NAME: varName, VAL: cleanVal },
            options: isString ? {
              VAL: [cleanVal, 'carvalho', 'pinheiro', 'madeira_macica', 'ferro_puro', 'ouro', 'cristal', 'azul', 'vermelho']
            } : {},
            toLua: (b) => {
              const name = b.values.NAME || varName;
              const val = b.values.VAL !== undefined ? b.values.VAL : cleanVal;
              const isNum = !isNaN(Number(val)) && String(val).trim() !== '';
              return `local ${name} = ${isNum ? val : `"${val}"`}`;
            }
          });
        }
        return;
      }

      // 2. Conditional: se condition entao ... senao ... fim
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
            defaultValues: { COND: condStr },
            options: {
              COND: [condStr, 'palha >= 5', 'ferro >= 5', 'madeira >= 8', 'ouro >= 10', 'energia >= 20', 'amizade >= 50']
            },
            children: [],
            toLua: (b, engine) => {
              const inner = engine.transpileBlockList(b.children || [], '  ');
              return `se ${b.values.COND || condStr} entao\n${inner || '  -- encaixe sua acao aqui\n'}fim`;
            }
          });
        }
        return;
      }

      // 3. Loop: para i = 1, N faca
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
            label: `Para ${varI} = ${countStart} até [COUNT] Faça:`,
            defaultValues: { COUNT: countEnd },
            children: [],
            toLua: (b, engine) => {
              const inner = engine.transpileBlockList(b.children || [], '  ');
              return `para ${varI} = ${countStart}, ${b.values.COUNT || countEnd} faca\n${inner || '  -- acao do laco\n'}fim`;
            }
          });
        }
        return;
      }

      // 4. Function definition: funcao name(param)
      const funcDefMatch = line.match(/^funcao\s+([a-zA-Z_]\w*)\s*\((.*?)\)$/);
      if (funcDefMatch) {
        const fName = funcDefMatch[1];
        const fParam = funcDefMatch[2];
        const blockId = `func_${fName}_${idx}`;
        if (!seenBlockIds.has(blockId)) {
          seenBlockIds.add(blockId);
          derived.push({
            id: blockId,
            category: 'functions',
            type: 'container',
            label: `Criar Função [NAME]([PARAM]):`,
            defaultValues: { NAME: fName, PARAM: fParam },
            children: [],
            toLua: (b, engine) => {
              const inner = engine.transpileBlockList(b.children || [], '  ');
              return `funcao ${b.values.NAME || fName}(${b.values.PARAM || fParam})\n${inner || '  -- acoes da funcao\n'}fim`;
            }
          });
        }
        return;
      }

      // 5. Function / Action call: action(args)
      const callMatch = line.match(/^([a-zA-Z_]\w*)\s*\((.*?)\)$/);
      if (callMatch) {
        const actName = callMatch[1];
        const rawArgs = callMatch[2].trim();
        const blockId = `act_${actName}_${idx}`;
        if (!seenBlockIds.has(blockId)) {
          seenBlockIds.add(blockId);

          let friendlyLabel = `${actName.replace(/_/g, ' ')}: [ARGS]`;
          if (actName === 'fabricar_movel') friendlyLabel = `Fabricar Móvel: [ARGS]`;
          else if (actName === 'forjar_ferramenta') friendlyLabel = `Forjar Ferramenta: [ARGS]`;
          else if (actName === 'fabricar_mesa') friendlyLabel = `Fabricar Mesa: [ARGS]`;
          else if (actName === 'fabricar_cama') friendlyLabel = `Fabricar Cama: [ARGS]`;
          else if (actName === 'fixar_estaca') friendlyLabel = `Fixar Estaca na Posição [ARGS]`;
          else if (actName === 'erguer_lona') friendlyLabel = `Erguer Lona de Acampamento`;
          else if (actName === 'assentar_piso') friendlyLabel = `Assentar Piso: [ARGS]`;
          else if (actName === 'plantar_arbusto') friendlyLabel = `Plantar na Ilha: [ARGS]`;

          derived.push({
            id: blockId,
            category: 'actions',
            type: 'statement',
            label: friendlyLabel,
            defaultValues: { ARGS: rawArgs },
            toLua: (b) => {
              const args = b.values.ARGS !== undefined ? b.values.ARGS : rawArgs;
              return `${actName}(${args})`;
            }
          });
        }
      }
    });

    // Fallback: If no blocks were derived, provide standard recipe block
    if (derived.length === 0) {
      derived.push({
        id: `var_${lesson.id || 'mat'}`,
        category: 'variables',
        type: 'statement',
        label: 'Definir material = [VAL]',
        defaultValues: { VAL: 'carvalho' },
        options: { VAL: ['carvalho', 'pinheiro', 'madeira_macica', 'ferro_puro', 'ouro'] },
        toLua: (b) => `local material = "${b.values.VAL || 'carvalho'}"`
      });
      derived.push({
        id: `act_${lesson.id || 'craft'}`,
        category: 'actions',
        type: 'statement',
        label: `Fabricar: ${assetName} com material`,
        defaultValues: {},
        toLua: () => `fabricar_movel("${assetId}", material)`
      });
    }

    // Always append extra customizable variable and action block for freedom of editing
    derived.push({
      id: 'var_extra_custom',
      category: 'variables',
      type: 'statement',
      label: '+ Criar Variável: [NAME] = [VAL]',
      defaultValues: { NAME: 'nova_var', VAL: '10' },
      toLua: (b) => {
        const v = b.values.VAL !== undefined ? b.values.VAL : '10';
        const isNum = !isNaN(Number(v)) && String(v).trim() !== '';
        return `local ${b.values.NAME || 'var'} = ${isNum ? v : `"${v}"`}`;
      }
    });

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
    // 1. local name = "val" or num
    const varMatch = line.match(/^local\s+([a-zA-Z_]\w*)\s*=\s*(.*)$/);
    if (varMatch) {
      const name = varMatch[1];
      let val = varMatch[2].replace(/^["']|["']$/g, '');
      const tmpl = this.availableBlocks.find(b => b.category === 'variables') || this.availableBlocks[0];
      return this.instantiateBlock(tmpl, { NAME: name, VAL: val });
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
      const tmpl = this.availableBlocks.find(b => b.category === 'functions') || this.availableBlocks[0];
      return this.instantiateBlock(tmpl, { NAME: funcDefMatch[1], PARAM: funcDefMatch[2] });
    }

    // 5. Function / Action call
    const actionMatch = line.match(/^([a-zA-Z_]\w*)\s*\((.*?)\)$/);
    if (actionMatch) {
      const actName = actionMatch[1];
      const args = actionMatch[2];
      const tmpl = this.availableBlocks.find(b => b.id.includes(actName) || b.category === 'actions') || this.availableBlocks[0];
      return this.instantiateBlock(tmpl, { ARGS: args, ITEM: args.replace(/^["']|["']$/g, ''), VAL: args.replace(/^["']|["']$/g, '') });
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
    
    // Number of droplets scales gracefully with the width of the snapped block
    const numPoints = Math.max(10, Math.min(22, Math.round(rect.width / 24)));

    // 1. Top Edge Droplets (spread across full width, shooting upwards & outwards)
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints; // 0 to 1 across width
      const x = rect.left + t * rect.width;
      const y = rect.top + 2;

      const droplet = document.createElement('div');
      droplet.className = 'animal-snap-droplet';
      droplet.style.left = `${x}px`;
      droplet.style.top = `${y}px`;

      // Angle spreads from -135deg (top-left) to -45deg (top-right)
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

    // 2. Bottom Edge Droplets (spread across full width, shooting downwards & outwards)
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

  // Helper to collect all template IDs currently in workspace (including nested containers)
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

  // Render the Block Palette (Left Column) with Block Consumption
  renderPalette() {
    if (!this.paletteEl) return;
    this.paletteEl.innerHTML = '';

    const usedTemplateIds = this.getUsedTemplateIds();
    const usedCounts = {};
    usedTemplateIds.forEach(id => {
      usedCounts[id] = (usedCounts[id] || 0) + 1;
    });

    // Filter available blocks by category and remaining count
    const pool = this.activeCategory === 'all'
      ? this.availableBlocks
      : this.availableBlocks.filter(b => b.category === this.activeCategory);

    // Track how many of each template we've seen in the pool so far
    const seenInPool = {};
    const blocksToShow = pool.filter(tmpl => {
      const tmplId = tmpl.id;
      seenInPool[tmplId] = (seenInPool[tmplId] || 0) + 1;
      const alreadyUsed = usedCounts[tmplId] || 0;
      // If we have seen more occurrences in the pool than have been used in workspace, show this one
      return seenInPool[tmplId] > alreadyUsed;
    });

    if (blocksToShow.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'codekit-empty-palette';
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

      let displayLabel = tmpl.label;
      const phMatches = tmpl.label.match(/\[([A-Z_]+)\]/g) || [];
      phMatches.forEach((ph) => {
        const fieldKey = ph.replace(/\[|\]/g, '');
        const defaultVal = tmpl.defaultValues?.[fieldKey] !== undefined ? tmpl.defaultValues[fieldKey] : '';
        const optList = tmpl.options && tmpl.options[fieldKey];
        if (optList && optList.length > 0) {
          const vis = getBlockOptionVisual(defaultVal);
          displayLabel = displayLabel.replace(ph, `<span class="codekit-palette-icon-badge" title="${defaultVal}">${vis.icon}</span>`);
        } else {
          displayLabel = displayLabel.replace(ph, `<span class="codekit-palette-text-badge">${defaultVal || '●'}</span>`);
        }
      });

      card.innerHTML = `
        <div class="puzzle-tab"></div>
        <div class="codekit-block-header">
          <span class="codekit-block-cat-dot" style="background: ${cat.accentColor};"></span>
          <span class="codekit-block-label">${displayLabel}</span>
        </div>
        <div class="puzzle-notch"></div>
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

      // Click to add directly to workspace
      card.addEventListener('click', () => {
        const newBlock = this.instantiateBlock(tmpl);
        this.blocksInWorkspace.push(newBlock);
        this.renderWorkspace();
        this.renderPalette(); // Update palette count immediately
        this.updateCodePreview();
        soundFX.playSnap();

        const lastBlockEl = this.workspaceEl?.querySelector('.codekit-block:last-child');
        if (lastBlockEl) this.spawnSnapDroplets(lastBlockEl);

        if (this.onBlockAdded) this.onBlockAdded(newBlock);
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
        this.renderPalette(); // Consume from palette
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
      placeholder.innerHTML = `
        <div class="codekit-empty-hero">
          <svg class="ui-icon" style="width: 44px; height: 44px; color: var(--animal-primary-dark, #0f8e83);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
          <span class="placeholder-title">Mesa de Montagem Pronta</span>
          <span class="placeholder-desc">Arraste as peças da paleta à esquerda ou clique nelas para montar seu código!</span>
        </div>
        <div class="tutorial-ghost-container" id="tutorial-ghost-container">
          <div class="tutorial-ghost-track">
            <div class="tutorial-ghost-target-zone">
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

    // When workspace has blocks, remove ghost demonstration overlay
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
      <div class="codekit-block ghost-demonstration-card" style="background: ${cat.color}; box-shadow: inset 0 -3px 0 ${cat.darkColor}, 0 8px 24px rgba(0,0,0,0.35);">
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

  // Update real x and y coordinates of the ghost hand from the left palette block into the center dropzone
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

  // Mentor help auto-snap assistant with smooth flying ghost block animation
  snapNextBlockWithAnimation(onComplete = null) {
    if (!this.availableBlocks || this.availableBlocks.length === 0) return;

    // Find the next unplaced template
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

    // Source rect from palette if available
    const paletteCards = this.paletteEl?.querySelectorAll('.palette-block');
    const startCard = paletteCards && paletteCards[0] ? paletteCards[0] : null;
    const startRect = startCard ? startCard.getBoundingClientRect() : { left: 120, top: 220, width: 160, height: 44 };
    const wsRect = this.workspaceEl ? this.workspaceEl.getBoundingClientRect() : { left: 450, top: 220, width: 260, height: 200 };

    const flyingGhost = document.createElement('div');
    flyingGhost.className = 'tutorial-fly-ghost';
    flyingGhost.style.left = `${startRect.left}px`;
    flyingGhost.style.top = `${startRect.top}px`;
    flyingGhost.innerHTML = `
      <div class="codekit-block ghost-flying-card" style="background: ${cat.color}; box-shadow: inset 0 -3px 0 ${cat.darkColor}, 0 8px 24px rgba(0,0,0,0.3);">
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

    // Fly smoothly across
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
      this.renderPalette(); // Update palette
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

    // Render interactive fields (inputs or selects) inside the label
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
            <button type="button" class="codekit-select-opt-btn ${opt === currentVal ? 'is-active' : ''}" data-val="${opt}" title="${opt}">
              <span class="codekit-opt-icon">${optVis.icon}</span>
            </button>
          `;
        });

        const selectHtml = `
          <div class="codekit-custom-select" data-field="${fieldKey}">
            <button type="button" class="codekit-select-trigger" title="${currentVal}">
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
          labelHtml = labelHtml.replace(ph, `<input type="number" step="1" min="1" class="block-input-text block-input-number" data-field="${fieldKey}" value="${currentVal}" />`);
        } else {
          labelHtml = labelHtml.replace(ph, `<input type="text" class="block-input-text" data-field="${fieldKey}" value="${currentVal}" />`);
        }
      }
    });

    // Outer puzzle structure (Statement vs Container)
    if (block.type === 'container') {
      el.innerHTML = `
        <div class="puzzle-tab"></div>
        <div class="codekit-block-header">
          <div class="codekit-block-content">${labelHtml}</div>
          <button class="block-delete-btn" title="Remover Peça"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
        </div>
        <div class="codekit-container-jaw drop-slot-inner"></div>
        <div class="codekit-container-footer">
          <span>fim</span>
        </div>
        <div class="puzzle-notch"></div>
      `;
    } else {
      el.innerHTML = `
        <div class="puzzle-tab"></div>
        <div class="codekit-block-header">
          <div class="codekit-block-content">${labelHtml}</div>
          <button class="block-delete-btn" title="Remover Peça"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
        </div>
        <div class="puzzle-notch"></div>
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
      this.renderPalette(); // Restores block to palette
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
            this.renderPalette(); // Consume from palette
            this.updateCodePreview();
            soundFX.playSnap();
            this.spawnSnapDroplets(innerSlot);
            if (this.onBlockAdded) this.onBlockAdded(childBlock);
          }
        });

        // Render inner children if any
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
        const keywords = ['local', 'se', 'entao', 'senao', 'fim', 'para', 'faca', 'funcao', 'enquanto', 'retorne', 'true', 'false', 'nil', 'and', 'or', 'not'];
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
    this.renderPalette(); // Restores all blocks to palette
    this.updateCodePreview();
    soundFX.playPop(0.75);
  }
}
