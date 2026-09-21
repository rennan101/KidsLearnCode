/**
 * ScratchBlockEngine - KidsLearnCode
 * Engine de Blocos Visuais de Quebra-Cabeça (Drag & Drop estilo Code Kit / Blockly).
 * Permite arrastar peças com encaixes puzzle para a mesa de montagem,
 * aninhar blocos de repetição e condição, e ver a transformação do código Lua em tempo real ao lado.
 */

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
          const v = b.values.VAL || '0';
          const isNum = !isNaN(Number(v));
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
        label: 'Repetir [COUNT] Vezes:',
        defaultValues: { COUNT: '4' },
        options: { COUNT: ['2', '3', '4', '5', '8', '10'] },
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

  setCodeOutputContainer(editorEl, syntaxEl = null) {
    this.codeOutputEl = editorEl;
    this.syntaxDisplayEl = syntaxEl || document.getElementById('codekit-syntax-display');
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

    this.blocksInWorkspace = [];
    if (starterLua) {
      this.parseStarterLuaToBlocks(starterLua);
    } else if (this.availableBlocks.length > 0) {
      this.blocksInWorkspace.push(this.instantiateBlock(this.availableBlocks[0]));
    }

    this.renderPalette();
    this.renderWorkspace();
    this.updateCodePreview();
  }

  deriveLessonBlocks(lesson) {
    const assetId = lesson.unlockedAssetId || 'prop_chair_wood';
    const assetName = lesson.unlockedAssetName || 'Item Especial';
    const concept = lesson.concept || '';

    const blocks = [];

    if (concept.includes('Variáveis') || concept.includes('Atribuição') || concept.includes('Parâmetros')) {
      blocks.push({
        id: `var_${lesson.id || 'mat'}`,
        category: 'variables',
        type: 'statement',
        label: 'Definir material = [VAL]',
        defaultValues: { VAL: 'carvalho' },
        options: { VAL: ['carvalho', 'pinheiro', 'madeira_macica', 'ferro_puro', 'cobre', 'veio_mineral'] },
        toLua: (b) => `local material = "${b.values.VAL || 'carvalho'}"`
      });
      blocks.push({
        id: `act_${lesson.id || 'craft'}`,
        category: 'actions',
        type: 'statement',
        label: `Fabricar ${assetName} com material`,
        defaultValues: {},
        toLua: () => `fabricar_movel("${assetId}", material)`
      });
      return blocks;
    }

    if (concept.includes('Condicional')) {
      blocks.push({
        id: `cond_${lesson.id || 'if'}`,
        category: 'conditions',
        type: 'container',
        label: `Se estoque >= [QTD] Então:`,
        defaultValues: { QTD: '5' },
        options: { QTD: ['3', '5', '8', '10'] },
        children: [],
        toLua: (b, engine) => {
          const inner = engine.transpileBlockList(b.children || [], '  ');
          return `se palha >= ${b.values.QTD || 5} entao\n${inner || `  fabricar_cama("${assetId}")\n`}fim`;
        }
      });
      blocks.push({
        id: `act_${lesson.id || 'action'}`,
        category: 'actions',
        type: 'statement',
        label: `Fabricar: ${assetName}`,
        defaultValues: {},
        toLua: () => `fabricar_cama("${assetId}")`
      });
      return blocks;
    }

    if (concept.includes('Loop') || concept.includes('Repetição')) {
      blocks.push({
        id: `loop_${lesson.id || 'for'}`,
        category: 'loops',
        type: 'container',
        label: `Repetir [COUNT] Vezes:`,
        defaultValues: { COUNT: '4' },
        options: { COUNT: ['2', '3', '4', '5'] },
        children: [],
        toLua: (b, engine) => {
          const inner = engine.transpileBlockList(b.children || [], '  ');
          return `para i = 1, ${b.values.COUNT || 4} faca\n${inner || `  fixar_estaca(i)\n`}fim`;
        }
      });
      blocks.push({
        id: `act_${lesson.id || 'step'}`,
        category: 'actions',
        type: 'statement',
        label: `Construir etapa na posição [I]`,
        defaultValues: { I: 'i' },
        toLua: (b) => `fixar_estaca(${b.values.I || 'i'})`
      });
      blocks.push({
        id: `act_${lesson.id || 'finish'}`,
        category: 'actions',
        type: 'statement',
        label: `Finalizar ${assetName}`,
        defaultValues: {},
        toLua: () => `erguer_lona()`
      });
      return blocks;
    }

    // Default block pair
    blocks.push({
      id: `block_act_${lesson.id || 'craft'}`,
      category: 'actions',
      type: 'statement',
      label: `Fabricar: ${assetName} ([VAL])`,
      defaultValues: { VAL: 'carvalho' },
      options: { VAL: ['carvalho', 'pinheiro', 'ferro', 'ouro', 'cristal'] },
      toLua: (b) => `fabricar_movel("${assetId}", "${b.values.VAL || 'carvalho'}")`
    });

    return blocks;
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
    const forMatch = line.match(/^para\s+i\s*=\s*1\s*,\s*(\d+)\s+faca$/);
    if (forMatch) {
      const tmpl = this.availableBlocks.find(b => b.category === 'loops') || this.availableBlocks[0];
      return this.instantiateBlock(tmpl, { COUNT: forMatch[1] });
    }

    // 3. Condition se
    const ifMatch = line.match(/^se\s+(.+)\s+entao$/);
    if (ifMatch) {
      const tmpl = this.availableBlocks.find(b => b.category === 'conditions') || this.availableBlocks[0];
      return this.instantiateBlock(tmpl, { COND: ifMatch[1] });
    }

    // 4. Function / Action call
    const actionMatch = line.match(/^([a-zA-Z_]\w*)\s*\((.*?)\)$/);
    if (actionMatch) {
      const actName = actionMatch[1];
      const args = actionMatch[2];
      const tmpl = this.availableBlocks.find(b => b.category === 'actions' || b.id.includes(actName)) || this.availableBlocks[0];
      return this.instantiateBlock(tmpl, { ITEM: args.replace(/^["']|["']$/g, ''), VAL: args.replace(/^["']|["']$/g, '') });
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

  // Render the Block Palette (Left Column)
  renderPalette() {
    if (!this.paletteEl) return;
    this.paletteEl.innerHTML = '';

    const blocksToShow = this.activeCategory === 'all'
      ? this.availableBlocks
      : this.availableBlocks.filter(b => b.category === this.activeCategory);

    if (blocksToShow.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'codekit-empty-palette';
      empty.innerText = 'Nenhum bloco disponível.';
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

      // Authentic CodeKit / Blockly puzzle structure
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
        this.updateCodePreview();
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
        this.updateCodePreview();
        if (this.onBlockAdded) this.onBlockAdded(newBlock);
      }
    });
  }

  // Render the Workspace (Center Canvas)
  renderWorkspace() {
    if (!this.workspaceEl) return;
    this.workspaceEl.innerHTML = '';

    if (this.blocksInWorkspace.length === 0) {
      const placeholder = document.createElement('div');
      placeholder.className = 'codekit-workspace-placeholder';
      placeholder.innerHTML = `
        <svg class="ui-icon" style="width: 38px; height: 38px; color: #475569;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <polyline points="16 18 22 12 16 6"></polyline>
          <polyline points="8 6 2 12 8 18"></polyline>
        </svg>
        <span class="placeholder-title">Mesa de Montagem Vazia</span>
        <span class="placeholder-desc">Arraste os blocos da paleta à esquerda para montar seu algoritmo</span>
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
        labelHtml = labelHtml.replace(ph, `<input type="text" class="block-input-text" data-field="${fieldKey}" value="${currentVal}" />`);
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

    // Delete button
    const deleteBtn = el.querySelector('.block-delete-btn');
    deleteBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      parentArray.splice(index, 1);
      this.renderWorkspace();
      this.updateCodePreview();
    });

    // Drag events for workspace reordering
    el.addEventListener('dragstart', (e) => {
      e.stopPropagation();
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
            this.updateCodePreview();
          }
        });

        if (block.children && block.children.length > 0) {
          block.children.forEach((childBlock, childIdx) => {
            const childEl = this.createWorkspaceBlockElement(childBlock, block.children, childIdx);
            innerSlot.appendChild(childEl);
          });
        }
      }
    }

    return el;
  }

  // Transpile blocks to pure Lua code
  transpileToLua() {
    return this.transpileBlockList(this.blocksInWorkspace);
  }

  transpileBlockList(list, indent = '') {
    let code = '';
    for (const b of list) {
      if (b.toLua) {
        const line = b.toLua(b, this);
        if (line) {
          const indentedLine = line.split('\n').map(l => `${indent}${l}`).join('\n');
          code += `${indentedLine}\n`;
        }
      }
    }
    return code;
  }

  // Syntax highlighter for live Code Kit side-by-side view
  highlightLuaSyntax(code) {
    if (!code || code.trim() === '') {
      return `
        <div class="codekit-code-line">
          <span class="codekit-line-num">1</span>
          <span class="codekit-line-code"><span class="lua-comment">-- Arraste blocos para a mesa</span></span>
        </div>
      `;
    }

    const lines = code.trim().split('\n');
    return lines.map((line, idx) => {
      let escaped = line
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      // Comments
      if (escaped.trim().startsWith('--')) {
        escaped = `<span class="lua-comment">${escaped}</span>`;
      } else {
        // Strings
        escaped = escaped.replace(/(["'])(.*?)\1/g, '<span class="lua-str">$1$2$1</span>');
        // Keywords
        escaped = escaped.replace(/\b(local|if|then|else|elseif|end|for|do|in|while|repeat|until|function|return|and|or|not|true|false|nil|se|entao|senao|fim|para|faca|funcao)\b/g, '<span class="lua-kw">$1</span>');
        // Numbers
        escaped = escaped.replace(/\b(\d+(\.\d+)?)\b/g, '<span class="lua-num">$1</span>');
        // Functions
        escaped = escaped.replace(/\b([a-zA-Z_]\w*)\s*(?=\()/g, '<span class="lua-fn">$1</span>');
      }

      return `
        <div class="codekit-code-line">
          <span class="codekit-line-num">${idx + 1}</span>
          <span class="codekit-line-code">${escaped}</span>
        </div>
      `;
    }).join('');
  }

  updateCodePreview() {
    const luaCode = this.transpileToLua();
    if (this.codeOutputEl) {
      this.codeOutputEl.value = luaCode;
    }
    if (!this.syntaxDisplayEl) {
      this.syntaxDisplayEl = document.getElementById('codekit-syntax-display');
    }
    if (this.syntaxDisplayEl) {
      this.syntaxDisplayEl.innerHTML = this.highlightLuaSyntax(luaCode);
    }
    if (this.onCodeChange) {
      this.onCodeChange(luaCode);
    }
  }

  clearWorkspace() {
    this.blocksInWorkspace = [];
    this.renderWorkspace();
    this.updateCodePreview();
  }
}

export default ScratchBlockEngine;
