/**
 * InventorySystem - Sistema de Bolsa e Bolsos estilo Animal Crossing (20 Slots)
 * Totalmente livre de emojis, utilizando metadados de ícones vetoriais SVG e controle de bolsos.
 */

export class InventorySystem {
  constructor() {
    this.maxSlots = 20;

    // Sessão 1: Itens e Recursos da Bolsa (ACNH 20 Pockets)
    this.items = [
      { id: 'wood', name: 'Madeira Maciça', iconKey: 'wood', count: 24, category: 'resource', desc: 'Madeira nobre colhida dos pinheiros e carvalhos da ilha.' },
      { id: 'stone', name: 'Pedra Polida', iconKey: 'stone', count: 18, category: 'resource', desc: 'Pedras resistentes para construção e forja.' },
      { id: 'iron_ore', name: 'Minério de Ferro', iconKey: 'iron_ore', count: 12, category: 'resource', desc: 'Ferro puro para ferramentas e armaduras.' },
      { id: 'gold_coin', name: 'Moedas da Ilha', iconKey: 'coin', count: 150, category: 'currency', desc: 'A moeda oficial (Bells) de comércio na Ilha Lua.' },
      { id: 'pumpkin_seed', name: 'Semente de Abóbora', iconKey: 'seed', count: 5, category: 'seed', desc: 'Sementes prontas para plantio na terra arada.' },
      { id: 'sea_bass', name: 'Robalo Prateado', iconKey: 'fish', count: 3, category: 'fish', desc: 'Peixe fresco pescado nos recifes de corais.' },
      { id: 'magic_flower', name: 'Flor Astral', iconKey: 'flower', count: 8, category: 'nature', desc: 'Flor medicinal rara que floresce sob a luz da lua.' }
    ];

    // Sessão 2: Ferramentas (Durabilidade & Equipadas)
    this.tools = [
      { id: 'tool_axe', name: 'Machado de Ferro', iconKey: 'tool_axe', type: 'axe', durability: 100, maxDurability: 100, power: 1.5, desc: 'Corta árvores e troncos para coletar madeira.' },
      { id: 'tool_pickaxe', name: 'Picareta Mágica', iconKey: 'tool_pickaxe', type: 'pickaxe', durability: 95, maxDurability: 100, power: 2.0, desc: 'Quebra rochas e extrai minérios de ferro e ouro.' },
      { id: 'tool_rod', name: 'Vara de Bambu', iconKey: 'tool_rod', type: 'rod', durability: 100, maxDurability: 100, power: 1.2, desc: 'Pesca peixes raros e tesouros nas águas da ilha.' },
      { id: 'tool_watering_can', name: 'Regador de Cobre', iconKey: 'tool_watering_can', type: 'watering', durability: 100, maxDurability: 100, power: 1.0, desc: 'Rega canteiros e acelera o crescimento de plantações.' }
    ];

    this.equippedToolId = 'tool_pickaxe';

    // Sessão 3: Ovos de Dragão & Incubação
    this.eggs = [
      { id: 'egg_solar_01', name: 'Ovo Solar da Aurora', iconKey: 'egg_solar', speciesId: 'dragon_fly_solar', warmth: 60, maxWarmth: 100, desc: 'Ovo quente e radiante. Pronto para incubação com carinho.' },
      { id: 'egg_frost_01', name: 'Ovo Glacial dos Icebergs', iconKey: 'egg_frost', speciesId: 'dragon_water_frost', warmth: 30, maxWarmth: 100, desc: 'Ovo cristalino que emite vapor gelado suave.' }
    ];

    this.listeners = [];
  }

  getItems() {
    return this.items;
  }

  getPocketSlots(totalSlots = 20) {
    const slots = [];
    for (let i = 0; i < totalSlots; i++) {
      slots.push(this.items[i] || null);
    }
    return slots;
  }

  getTools() {
    return this.tools;
  }

  getEggs() {
    return this.eggs;
  }

  getEquippedTool() {
    return this.tools.find(t => t.id === this.equippedToolId) || this.tools[0] || null;
  }

  equipTool(toolId) {
    const found = this.tools.find(t => t.id === toolId);
    if (found) {
      this.equippedToolId = toolId;
      this.notify();
      return { success: true, tool: found };
    }
    return { success: false, reason: 'Ferramenta não encontrada.' };
  }

  addItem(itemId, count = 1, metadata = {}) {
    let item = this.items.find(i => i.id === itemId);
    if (item) {
      item.count += count;
    } else {
      if (this.items.length >= this.maxSlots) {
        return { success: false, reason: 'Sua bolsa está cheia!' };
      }
      this.items.push({
        id: itemId,
        name: metadata.name || itemId,
        iconKey: metadata.iconKey || this.inferIconKey(itemId),
        count,
        category: metadata.category || 'misc',
        desc: metadata.desc || 'Item fabricado ou coletado na ilha.'
      });
    }
    this.notify();
    return { success: true, item: this.items.find(i => i.id === itemId) };
  }

  inferIconKey(itemId) {
    if (itemId.startsWith('tool_')) return itemId;
    if (itemId.startsWith('prop_chair') || itemId.startsWith('prop_table') || itemId.startsWith('prop_bed') || itemId.startsWith('prop_tent') || itemId.startsWith('prop_house')) return 'furniture';
    if (itemId.startsWith('struct_fence') || itemId.startsWith('struct_bridge') || itemId.startsWith('struct_gate') || itemId.startsWith('struct_lantern') || itemId.startsWith('struct_well')) return 'structure';
    if (itemId.startsWith('tile_ground')) return 'tile';
    if (itemId.startsWith('egg_') || itemId.startsWith('dragon_egg')) return 'egg_solar';
    if (itemId.includes('seed')) return 'seed';
    if (itemId.includes('fish') || itemId.includes('bass')) return 'fish';
    if (itemId.includes('flower')) return 'flower';
    if (itemId.includes('wood')) return 'wood';
    if (itemId.includes('ore') || itemId.includes('iron')) return 'iron_ore';
    if (itemId.includes('stone') || itemId.includes('rock')) return 'stone';
    return 'package';
  }

  removeItem(itemId, count = 1) {
    const idx = this.items.findIndex(i => i.id === itemId);
    if (idx !== -1) {
      const item = this.items[idx];
      if (item.count <= count) {
        this.items.splice(idx, 1);
      } else {
        item.count -= count;
      }
      this.notify();
      return true;
    }
    return false;
  }

  hasItem(itemId, count = 1) {
    const item = this.items.find(i => i.id === itemId);
    return item ? item.count >= count : false;
  }

  warmEgg(eggId, amount = 25) {
    const egg = this.eggs.find(e => e.id === eggId);
    if (!egg) return { success: false, reason: 'Ovo não encontrado.' };

    egg.warmth = Math.min(egg.maxWarmth, egg.warmth + amount);
    this.notify();

    if (egg.warmth >= egg.maxWarmth) {
      return { success: true, hatched: true, egg };
    }
    return { success: true, hatched: false, warmth: egg.warmth };
  }

  removeEgg(eggId) {
    this.eggs = this.eggs.filter(e => e.id !== eggId);
    this.notify();
  }

  addEggFromDragon(dragon) {
    if (!dragon) return null;
    let iconKey = 'egg_solar';
    if (dragon.element?.includes('Gelo') || dragon.element?.includes('Água') || dragon.id?.includes('water') || dragon.id?.includes('frost')) {
      iconKey = 'egg_frost';
    } else if (dragon.element?.includes('Fogo') || dragon.id?.includes('fire') || dragon.id?.includes('ignis')) {
      iconKey = 'egg_solar';
    } else if (dragon.element?.includes('Terra') || dragon.id?.includes('land') || dragon.id?.includes('boulder')) {
      iconKey = 'egg_solar';
    }

    const egg = {
      id: `egg_${dragon.id}_${Date.now()}`,
      name: `Ovo de ${dragon.name.split(',')[0]}`,
      iconKey,
      speciesId: dragon.id,
      dragonLevel: dragon.level || 1,
      warmth: 0,
      maxWarmth: 100,
      desc: `Ovo místico de ${dragon.name}. O dragão descansou após a batalha e retornou à forma de ovo. Aqueça-o no ninho para chocá-lo novamente!`
    };

    this.eggs.push(egg);
    this.notify();
    return egg;
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this));
  }
}

