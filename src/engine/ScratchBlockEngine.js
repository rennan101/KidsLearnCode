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

  // Visual droplet splash on snap (Animal Island Checkbox Style)
  spawnSnapDroplets(element) {
    if (!element || typeof document === 'undefined') return;
    const rect = element.getBoundingClientRect();
    const container = document.createElement('div');
    container.className = 'animal-snap-droplet-container';
    container.style.left = `${rect.left + rect.width / 2}px`;
    container.style.top = `${rect.top + 14}px`;

    const dropletCount = 6;
    const colors = ['#19c8b9', '#3dd4c6', '#14b8a6', '#5eead4', '#2dd4bf', '#0f8e83'];

    for (let i = 0; i < dropletCount; i++) {
      const droplet = document.createElement('div');
      droplet.className = 'animal-snap-droplet';
      const angle = (i / dropletCount) * Math.PI * 2;
      const distance = 26 + Math.random() * 14;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;

      droplet.style.setProperty('--splash-dx', `${dx}px`);
      droplet.style.setProperty('--splash-dy', `${dy}px`);
      droplet.style.background = colors[i % colors.length];
      container.appendChild(droplet);
    }

    document.body.appendChild(container);
    element.classList.add('snap-glow-active');
    setTimeout(() => {
      element.classList.remove('snap-glow-active');
      container.remove();
    }, 600);
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

      let displayLabel = tmpl.label.replace(/\[([A-Z_]+)\]/g, '●');

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
          <div class="tutorial-ghost-actor">
            <div class="codekit-block ghost-demonstration-card" style="background: ${cat.color}; box-shadow: inset 0 -3px 0 ${cat.darkColor}, 0 6px 16px rgba(0,0,0,0.25);">
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
          </div>
        </div>
      `;
      this.workspaceEl.appendChild(placeholder);
      return;
    }

    const tree = document.createElement('div');
    tree.className = 'codekit-block-tree';

    this.blocksInWorkspace.forEach((block, index) => {
      const blockEl = this.createWorkspaceBlockElement(block, this.blocksInWorkspace, index);
      tree.appendChild(blockEl);
    });

    this.workspaceEl.appendChild(tree);
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
        let optHtml = `<select class="block-input-select" data-field="${fieldKey}">`;
        optList.forEach(opt => {
          optHtml += `<option value="${opt}" ${opt === currentVal ? 'selected' : ''}>${opt}</option>`;
        });
        optHtml += `</select>`;
        labelHtml = labelHtml.replace(ph, optHtml);
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
    el.querySelectorAll('.block-input-text, .block-input-select').forEach((input) => {
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
