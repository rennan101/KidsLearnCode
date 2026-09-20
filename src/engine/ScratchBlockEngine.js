/**
 * ScratchBlockEngine - KidsLearnCode
 * Engine de Blocos Visuais de Quebra-Cabeça (Drag & Drop estilo Scratch / Blockly).
 * Gerencia a paleta de blocos, o workspace com encaixe magnético, aninhamento e
 * a transpilação bidirecional instantânea para código Lua puro.
 */

export const BLOCK_CATEGORIES = {
  variables: { id: 'variables', name: 'Materiais', color: '#f59e0b', darkColor: '#d97706' },
  actions: { id: 'actions', name: 'Ações de Criação', color: '#3b82f6', darkColor: '#2563eb' },
  conditions: { id: 'conditions', name: 'Se / Senão', color: '#10b981', darkColor: '#059669' },
  loops: { id: 'loops', name: 'Repetir (Loops)', color: '#8b5cf6', darkColor: '#7c3aed' },
  functions: { id: 'functions', name: 'Minhas Regras', color: '#ec4899', darkColor: '#db2777' }
};

export class ScratchBlockEngine {
  constructor(options = {}) {
    this.workspaceEl = options.workspaceEl || null;
    this.paletteEl = options.paletteEl || null;
    this.codeOutputEl = options.codeOutputEl || null;
    this.blocksInWorkspace = []; // Array of top-level block objects or nested trees
    this.draggedBlockTemplate = null;
    this.draggedWorkspaceBlockId = null;
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
        label: 'Material = [VAL]',
        defaultValues: { VAL: 'carvalho' },
        options: { VAL: ['carvalho', 'pinheiro', 'madeira_macica', 'ferro_puro', 'veio_mineral', 'terra_dourada'] },
        toLua: (b) => `local material = "${b.values.VAL || 'carvalho'}"`
      },
      {
        id: 'var_custom',
        category: 'variables',
        type: 'statement',
        label: 'Definir [NAME] = [VAL]',
        defaultValues: { NAME: 'item', VAL: '10' },
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
        label: 'Criar Móvel: [ITEM]',
        defaultValues: { ITEM: 'prop_chair_wood' },
        options: { ITEM: ['prop_chair_wood', 'prop_table_crafting', 'prop_bed_straw', 'prop_bed_canopy', 'prop_tent_adventurer', 'prop_house_cottage'] },
        toLua: (b) => `fabricar_movel("${b.values.ITEM || 'prop_chair_wood'}", material)`
      },
      {
        id: 'act_fabricar_mesa',
        category: 'actions',
        type: 'statement',
        label: 'Montar Mesa com [PERNAS] Pernas',
        defaultValues: { PERNAS: '4' },
        toLua: (b) => `fabricar_mesa(tampo, ${b.values.PERNAS || 4})`
      },
      {
        id: 'act_forjar_ferramenta',
        category: 'actions',
        type: 'statement',
        label: 'Forjar Ferramenta: [TOOL]',
        defaultValues: { TOOL: 'tool_shovel_iron' },
        options: { TOOL: ['tool_shovel_iron', 'tool_axe_woodcutter', 'tool_pickaxe_miner', 'tool_watering_can', 'tool_fishing_rod', 'tool_bug_net'] },
        toLua: (b) => `forjar_ferramenta("${b.values.TOOL || 'tool_shovel_iron'}", material)`
      },
      {
        id: 'act_materializar_rocha',
        category: 'actions',
        type: 'statement',
        label: 'Criar Rocha Mineral: [ROCHA]',
        defaultValues: { ROCHA: 'nature_rock_boulder' },
        toLua: (b) => `materializar_rocha("${b.values.ROCHA || 'nature_rock_boulder'}", tipo_rocha)`
      },
      {
        id: 'act_plantar_arbusto',
        category: 'actions',
        type: 'statement',
        label: 'Plantar na Ilha: [ARBUSTO]',
        defaultValues: { ARBUSTO: 'nature_berry_bush' },
        options: { ARBUSTO: ['nature_berry_bush', 'nature_oak_tree', 'nature_pine_tree'] },
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
        id: 'act_montar_portao',
        category: 'actions',
        type: 'statement',
        label: 'Montar Portão de Madeira',
        defaultValues: {},
        toLua: () => `montar_portao("struct_fence_wood_gate")`
      },
      {
        id: 'act_assentar_piso',
        category: 'actions',
        type: 'statement',
        label: 'Assentar Piso: [PISO]',
        defaultValues: { PISO: 'tile_ground_dirt_track' },
        options: { PISO: ['tile_ground_dirt_track', 'tile_ground_cobblestone', 'tile_ground_wood_planks', 'tile_ground_flower_grass', 'tile_ground_sand_beach', 'tile_ground_stone_mosaic'] },
        toLua: (b) => `assentar_piso("${b.values.PISO || 'tile_ground_dirt_track'}", solo)`
      },
      {
        id: 'act_acender_poste',
        category: 'actions',
        type: 'statement',
        label: 'Acender Poste de Luz',
        defaultValues: {},
        toLua: () => `acender_poste("struct_lantern_post")`
      },
      {
        id: 'act_canalizar',
        category: 'actions',
        type: 'statement',
        label: 'Canalizar Poder [VAL]',
        defaultValues: { VAL: 'energia_astral' },
        toLua: (b) => `canalizar(${b.values.VAL || 'energia_astral'})`
      },
      {
        id: 'act_tecer_ninho',
        category: 'actions',
        type: 'statement',
        label: 'Tecer Ninho de Dragão',
        defaultValues: {},
        toLua: () => `tecer_ninho_aquecido("prop_dragon_incubator")`
      },
      {
        id: 'act_entalhar_apito',
        category: 'actions',
        type: 'statement',
        label: 'Entalhar Apito (Tom [FREQ])',
        defaultValues: { FREQ: 'frequencia' },
        toLua: (b) => `entalhar_apito("dragon_whistle_call", ${b.values.FREQ || '440'})`
      },

      // 3. Condicionais
      {
        id: 'cond_if_simple',
        category: 'conditions',
        type: 'container',
        label: 'Se [COND] Então:',
        defaultValues: { COND: 'ferro >= 5' },
        children: [],
        toLua: (b, engine) => {
          const inner = engine.transpileBlockList(b.children || [], '  ');
          return `se ${b.values.COND || 'true'} entao\n${inner || '  -- acao aqui\n'}fim`;
        }
      },
      {
        id: 'cond_if_else',
        category: 'conditions',
        type: 'container_else',
        label: 'Se [COND] Então: ... Senão:',
        defaultValues: { COND: 'palha >= 5' },
        children: [],
        elseChildren: [],
        toLua: (b, engine) => {
          const innerThen = engine.transpileBlockList(b.children || [], '  ');
          const innerElse = engine.transpileBlockList(b.elseChildren || [], '  ');
          return `se ${b.values.COND || 'true'} entao\n${innerThen || '  -- acao se verdadeiro\n'}senao\n${innerElse || '  -- acao senao\n'}fim`;
        }
      },

      // 4. Loops & Repetição
      {
        id: 'loop_for',
        category: 'loops',
        type: 'container',
        label: 'Repetir [COUNT] Vezes:',
        defaultValues: { COUNT: '4' },
        children: [],
        toLua: (b, engine) => {
          const inner = engine.transpileBlockList(b.children || [], '  ');
          return `para i = 1, ${b.values.COUNT || 4} faca\n${inner || '  avancar()\n'}fim`;
        }
      },

      // 5. Funções
      {
        id: 'func_define',
        category: 'functions',
        type: 'container',
        label: 'Criar Regra: [NAME]([PARAM])',
        defaultValues: { NAME: 'construir_casa', PARAM: 'estilo' },
        children: [],
        toLua: (b, engine) => {
          const inner = engine.transpileBlockList(b.children || [], '  ');
          return `funcao ${b.values.NAME || 'minha_funcao'}(${b.values.PARAM || ''})\n${inner || '  -- corpo da regra\n'}fim`;
        }
      },
      {
        id: 'func_call',
        category: 'functions',
        type: 'statement',
        label: 'Usar Regra [NAME]([ARG])',
        defaultValues: { NAME: 'construir_casa', ARG: '"enxaimel"' },
        toLua: (b) => `${b.values.NAME || 'minha_funcao'}(${b.values.ARG || ''})`
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

  setCodeOutputContainer(el) {
    this.codeOutputEl = el;
    this.updateCodePreview();
  }

  setFilterCategory(catId) {
    this.activeCategory = catId;
    this.renderPalette();
  }

  // Load custom specific blocks for an NPC lesson
  loadLessonBlocks(customBlockDefs = null, starterLua = null) {
    if (customBlockDefs && customBlockDefs.length > 0) {
      this.availableBlocks = [...customBlockDefs];
    } else {
      this.initDefaultBlockCatalog();
    }

    this.blocksInWorkspace = [];
    if (starterLua) {
      this.parseStarterLuaToBlocks(starterLua);
    }

    this.renderPalette();
    this.renderWorkspace();
    this.updateCodePreview();
  }

  parseStarterLuaToBlocks(luaCode) {
    const lines = (luaCode || '').split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('--'));
    this.blocksInWorkspace = [];

    lines.forEach((line) => {
      // Find matching template
      const block = this.createBlockFromLuaLine(line);
      if (block) {
        this.blocksInWorkspace.push(block);
      }
    });
  }

  createBlockFromLuaLine(line) {
    // 1. local name = "val" or num
    const varMatch = line.match(/^local\s+([a-zA-Z_]\w*)\s*=\s*(.*)$/);
    if (varMatch) {
      const name = varMatch[1];
      let val = varMatch[2].replace(/^["']|["']$/g, '');
      const tmpl = this.availableBlocks.find(b => b.id === 'var_material' || b.id === 'var_custom');
      return this.instantiateBlock(tmpl || this.availableBlocks[0], { NAME: name, VAL: val });
    }

    // 2. Loop for
    const forMatch = line.match(/^para\s+i\s*=\s*1\s*,\s*(\d+)\s+faca$/);
    if (forMatch) {
      const tmpl = this.availableBlocks.find(b => b.category === 'loops');
      return this.instantiateBlock(tmpl, { COUNT: forMatch[1] });
    }

    // 3. Condition se
    const ifMatch = line.match(/^se\s+(.+)\s+entao$/);
    if (ifMatch) {
      const tmpl = this.availableBlocks.find(b => b.category === 'conditions');
      return this.instantiateBlock(tmpl, { COND: ifMatch[1] });
    }

    // 4. Function call or declaration
    const funcMatch = line.match(/^funcao\s+([a-zA-Z_]\w*)\s*\((.*?)\)$/);
    if (funcMatch) {
      const tmpl = this.availableBlocks.find(b => b.id === 'func_define');
      return this.instantiateBlock(tmpl, { NAME: funcMatch[1], PARAM: funcMatch[2] });
    }

    const actionMatch = line.match(/^([a-zA-Z_]\w*)\s*\((.*?)\)$/);
    if (actionMatch) {
      const actName = actionMatch[1];
      const args = actionMatch[2];
      const tmpl = this.availableBlocks.find(b => b.id.includes(actName) || b.label.includes(actName)) || this.availableBlocks[2];
      return this.instantiateBlock(tmpl, { ITEM: args.replace(/^["']|["']$/g, '') });
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
      empty.className = 'scratch-empty-palette';
      empty.innerText = 'Nenhum bloco nesta categoria.';
      this.paletteEl.appendChild(empty);
      return;
    }

    blocksToShow.forEach((tmpl) => {
      const cat = BLOCK_CATEGORIES[tmpl.category] || BLOCK_CATEGORIES.actions;
      const card = document.createElement('div');
      card.className = `scratch-puzzle-block palette-item block-${tmpl.category}`;
      card.style.setProperty('--block-color', cat.color);
      card.style.setProperty('--block-dark', cat.darkColor);
      card.setAttribute('draggable', 'true');

      // Top puzzle tab & bottom puzzle notch
      card.innerHTML = `
        <div class="puzzle-tab"></div>
        <div class="block-content">
          <span class="block-category-dot"></span>
          <span class="block-label-text">${tmpl.label.replace(/\[([A-Z_]+)\]/g, '●')}</span>
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

      // Click to add directly to bottom of workspace
      card.addEventListener('click', () => {
        const newBlock = this.instantiateBlock(tmpl);
        this.blocksInWorkspace.push(newBlock);
        this.renderWorkspace();
        this.updateCodePreview();
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
        // Add new block from palette
        const newBlock = this.instantiateBlock(this.draggedBlockTemplate);
        this.blocksInWorkspace.push(newBlock);
        this.renderWorkspace();
        this.updateCodePreview();
      }
    });
  }

  // Render the Workspace (Middle Dropzone Column)
  renderWorkspace() {
    if (!this.workspaceEl) return;
    this.workspaceEl.innerHTML = '';

    if (this.blocksInWorkspace.length === 0) {
      const placeholder = document.createElement('div');
      placeholder.className = 'scratch-workspace-placeholder';
      placeholder.innerHTML = `
        <svg class="ui-icon" style="width: 32px; height: 32px; color: #475569;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
        <span>Arraste peças de quebra-cabeça da paleta aqui para construir seu algoritmo</span>
      `;
      this.workspaceEl.appendChild(placeholder);
      return;
    }

    const container = document.createElement('div');
    container.className = 'scratch-block-tree';

    this.blocksInWorkspace.forEach((block, index) => {
      const blockEl = this.createWorkspaceBlockElement(block, this.blocksInWorkspace, index);
      container.appendChild(blockEl);
    });

    this.workspaceEl.appendChild(container);
  }

  createWorkspaceBlockElement(block, parentArray, index) {
    const cat = BLOCK_CATEGORIES[block.category] || BLOCK_CATEGORIES.actions;
    const el = document.createElement('div');
    el.className = `scratch-puzzle-block workspace-block block-${block.category} ${block.type}`;
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

    // Outer puzzle structure
    if (block.type === 'container') {
      el.innerHTML = `
        <div class="puzzle-tab"></div>
        <div class="block-header">
          <span class="block-category-dot"></span>
          <div class="block-label-content">${labelHtml}</div>
          <button class="block-delete-btn" title="Remover Peça">✕</button>
        </div>
        <div class="block-container-body drop-slot-inner"></div>
        <div class="block-container-footer">
          <span>fim</span>
        </div>
        <div class="puzzle-notch"></div>
      `;
    } else {
      el.innerHTML = `
        <div class="puzzle-tab"></div>
        <div class="block-content">
          <span class="block-category-dot"></span>
          <div class="block-label-content">${labelHtml}</div>
          <button class="block-delete-btn" title="Remover Peça">✕</button>
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
      // Prevent drag initiation when typing in input
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
      this.draggedWorkspaceBlockId = block.instanceId;
      this.draggedBlockTemplate = null;
      e.dataTransfer.setData('text/plain', block.instanceId);
      el.classList.add('is-dragging');
    });

    el.addEventListener('dragend', () => {
      el.classList.remove('is-dragging');
      this.draggedWorkspaceBlockId = null;
    });

    // Render nested children inside container slots if any
    if (block.type === 'container') {
      const innerSlot = el.querySelector('.drop-slot-inner');
      if (innerSlot) {
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

  // Generate clean, formatted Lua code from the block puzzle hierarchy
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

  updateCodePreview() {
    const luaCode = this.transpileToLua();
    if (this.codeOutputEl) {
      this.codeOutputEl.value = luaCode;
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
