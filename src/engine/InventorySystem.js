/**
 * InventorySystem - Sistema Unificado de Mochila com Sessões (Bag A, Ferramentas, Ovos e Dragões)
 */

export class InventorySystem {
  constructor() {
    // Session 1: Items & Resources
    this.items = [
      { id: 'wood', name: 'Madeira Maciça', icon: '🪵', count: 24, category: 'resource', desc: 'Madeira nobre colhida dos pinheiros e carvalhos da ilha.' },
      { id: 'stone', name: 'Pedra Polida', icon: '🪨', count: 18, category: 'resource', desc: 'Pedras resistentes para construção e forja.' },
      { id: 'iron_ore', name: 'Minério de Ferro', icon: '⛏️', count: 12, category: 'resource', desc: 'Ferro puro para ferramentas e armaduras.' },
      { id: 'gold_coin', name: 'Moedas de Ouro', icon: '🪙', count: 150, category: 'currency', desc: 'A moeda oficial de comércio na Ilha Lua.' },
      { id: 'pumpkin_seed', name: 'Semente de Abóbora', icon: '🎃', count: 5, category: 'seed', desc: 'Sementes prontas para plantio na terra arada.' },
      { id: 'sea_bass', name: 'Robalo Prateado', icon: '🐟', count: 3, category: 'fish', desc: 'Peixe fresco pescado nos recifes de corais.' },
      { id: 'magic_flower', name: 'Flor Astral', icon: '🌸', count: 8, category: 'nature', desc: 'Flor medicinal rara que floresce sob a luz da lua.' }
    ];

    // Session 2: Tools (Durability & Equipped Status)
    this.tools = [
      { id: 'tool_axe', name: 'Machado de Ferro', icon: '🪓', type: 'axe', durability: 100, maxDurability: 100, power: 1.5, desc: 'Corta árvores e troncos para coletar madeira.' },
      { id: 'tool_pickaxe', name: 'Picareta Mágica', icon: '⛏️', type: 'pickaxe', durability: 95, maxDurability: 100, power: 2.0, desc: 'Quebra rochas e extrai minérios de ferro e ouro.' },
      { id: 'tool_rod', name: 'Vara de Pesca de Bambu', icon: '🎣', type: 'rod', durability: 100, maxDurability: 100, power: 1.2, desc: 'Pesca peixes raros e tesouros nas águas da ilha.' },
      { id: 'tool_watering_can', name: 'Regador Real', icon: '🪴', type: 'watering', durability: 100, maxDurability: 100, power: 1.0, desc: 'Rega canteiros e acelera o crescimento de plantações.' }
    ];

    this.equippedToolId = 'tool_pickaxe';

    // Session 3: Dragon Eggs & Incubators
    this.eggs = [
      { id: 'egg_solar_01', name: 'Ovo Solar da Aurora', icon: '🥚☀️', speciesId: 'dragon_fly_solar', warmth: 60, maxWarmth: 100, desc: 'Ovo quente e radiante. Pronto para incubação com carinho.' },
      { id: 'egg_frost_01', name: 'Ovo Glacial dos Icebergs', icon: '🥚❄️', speciesId: 'dragon_water_frost', warmth: 30, maxWarmth: 100, desc: 'Ovo cristalino que emite vapor gelado suave.' }
    ];

    this.listeners = [];
  }

  getItems() {
    return this.items;
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
      this.items.push({
        id: itemId,
        name: metadata.name || itemId,
        icon: metadata.icon || '📦',
        count,
        category: metadata.category || 'misc',
        desc: metadata.desc || 'Item coletado na ilha.'
      });
    }
    this.notify();
    return true;
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
