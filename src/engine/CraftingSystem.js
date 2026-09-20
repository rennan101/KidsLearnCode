// Crafting System (Workbench interaction, recipes, AP consumption, poof cloud particles)

export class CraftingSystem {
  constructor(dayNightSystem) {
    this.dayNightSystem = dayNightSystem;
    this.unlockedRecipeIds = new Set([
      'prop_chair_wood',
      'tool_shovel_iron',
      'tile_ground_dirt_track',
      'struct_fence_wood_segment'
    ]);

    this.recipes = [
      // 1. Mobílias & Habitação (Bambu)
      {
        id: 'prop_chair_wood',
        assetId: 'prop_chair_wood',
        name: 'Cadeira de Madeira Rústica',
        category: 'furniture',
        apCost: 1,
        materials: [{ item: 'wood_log', count: 3 }],
        description: 'Móvel confortável de carvalho para descansar o avatar.'
      },
      {
        id: 'prop_table_crafting',
        assetId: 'prop_table_crafting',
        name: 'Mesa de Trabalho / Estudos',
        category: 'furniture',
        apCost: 1,
        materials: [{ item: 'wood_log', count: 5 }],
        description: 'Mesa robusta de estudos com espaço para mapas e pergaminhos.'
      },
      {
        id: 'prop_bed_straw',
        assetId: 'prop_bed_straw',
        name: 'Cama Rústica de Palha e Peles',
        category: 'furniture',
        apCost: 1,
        materials: [{ item: 'wood_log', count: 4 }, { item: 'soft_hay', count: 4 }],
        description: 'Cama aconchegante para recuperar energia durante a noite.'
      },
      {
        id: 'prop_bed_canopy',
        assetId: 'prop_bed_canopy',
        name: 'Cama Real com Dossel',
        category: 'furniture',
        apCost: 2,
        materials: [{ item: 'wood_log', count: 8 }, { item: 'leather', count: 4 }],
        description: 'Cama nobre espaçosa com cortinas de veludo e acabamento refinado.'
      },
      {
        id: 'prop_tent_adventurer',
        assetId: 'prop_tent_adventurer',
        name: 'Tenda de Acampamento',
        category: 'furniture',
        apCost: 2,
        materials: [{ item: 'wood_log', count: 6 }, { item: 'leather', count: 6 }],
        description: 'Acampamento móvel para erguer em qualquer bioma da ilha.'
      },
      {
        id: 'prop_house_cottage',
        assetId: 'prop_house_cottage',
        name: 'Casa Pequena de Enxaimel',
        category: 'furniture',
        apCost: 3,
        materials: [{ item: 'wood_log', count: 12 }, { item: 'iron_ore', count: 6 }],
        description: 'Residência medieval completa com telhado de barro e lareira.'
      },

      // 2. Ferramentas (Brutus & Flora & Pingo)
      {
        id: 'tool_shovel_iron',
        assetId: 'tool_shovel_iron',
        name: 'Pá de Ferro Rústica',
        category: 'tools',
        apCost: 1,
        materials: [{ item: 'wood_log', count: 2 }, { item: 'iron_ore', count: 2 }],
        description: 'Cava buracos no chão, desenterra ovos de dragão e prepara solo.'
      },
      {
        id: 'tool_axe_woodcutter',
        assetId: 'tool_axe_woodcutter',
        name: 'Machado de Lenhador',
        category: 'tools',
        apCost: 1,
        materials: [{ item: 'wood_log', count: 2 }, { item: 'iron_ore', count: 3 }],
        description: 'Corta árvores e troncos para coletar madeira nobre.'
      },
      {
        id: 'tool_pickaxe_miner',
        assetId: 'tool_pickaxe_miner',
        name: 'Picareta de Mineração',
        category: 'tools',
        apCost: 1,
        materials: [{ item: 'wood_log', count: 2 }, { item: 'iron_ore', count: 4 }],
        description: 'Quebra rochas sólidas e extrai minérios raros nos penhascos.'
      },
      {
        id: 'tool_watering_can',
        assetId: 'tool_watering_can',
        name: 'Regador de Cobre',
        category: 'tools',
        apCost: 1,
        materials: [{ item: 'iron_ore', count: 3 }],
        description: 'Rega canteiros e acelera o florescimento de mudas.'
      },
      {
        id: 'tool_fishing_rod',
        assetId: 'tool_fishing_rod',
        name: 'Vara de Pescar de Bambu',
        category: 'tools',
        apCost: 1,
        materials: [{ item: 'wood_log', count: 3 }],
        description: 'Pesca peixes raros e itens nas águas da ilha.'
      },
      {
        id: 'tool_bug_net',
        assetId: 'tool_bug_net',
        name: 'Rede de Captura',
        category: 'tools',
        apCost: 1,
        materials: [{ item: 'wood_log', count: 2 }],
        description: 'Captura insetos mágicos e pequenos animais na ilha.'
      },

      // 3. Estruturas & Pontes (Barnabé & Kai)
      {
        id: 'struct_fence_wood_segment',
        assetId: 'struct_fence_wood_segment',
        name: 'Cerca de Madeira Rústica',
        category: 'structures',
        apCost: 1,
        materials: [{ item: 'wood_log', count: 2 }],
        description: 'Delimita áreas, caminhos e protege quintais na vila.'
      },
      {
        id: 'struct_fence_wood_gate',
        assetId: 'struct_fence_wood_gate',
        name: 'Portão de Cerca de Madeira',
        category: 'structures',
        apCost: 1,
        materials: [{ item: 'wood_log', count: 2 }],
        description: 'Portão articulado com trinco para cercados.'
      },
      {
        id: 'struct_bridge_wood_horiz',
        assetId: 'struct_bridge_wood_horiz',
        name: 'Ponte de Madeira (Horizontal)',
        category: 'structures',
        apCost: 2,
        materials: [{ item: 'wood_log', count: 6 }],
        description: 'Permite transposição segura sobre rios de leste a oeste.'
      },
      {
        id: 'struct_bridge_wood_vert',
        assetId: 'struct_bridge_wood_vert',
        name: 'Ponte de Madeira (Vertical)',
        category: 'structures',
        apCost: 2,
        materials: [{ item: 'wood_log', count: 6 }],
        description: 'Conecta margens norte-sul sobre canais e riachos.'
      },
      {
        id: 'struct_lantern_post',
        assetId: 'struct_lantern_post',
        name: 'Poste de Iluminação Medieval',
        category: 'structures',
        apCost: 1,
        materials: [{ item: 'iron_ore', count: 2 }, { item: 'fire_stone', count: 1 }],
        description: 'Poste de ferro com candeeiro luminoso para clarear a noite.'
      },
      {
        id: 'struct_water_well',
        assetId: 'struct_water_well',
        name: 'Poço de Pedra da Vila',
        category: 'structures',
        apCost: 2,
        materials: [{ item: 'iron_ore', count: 4 }, { item: 'wood_log', count: 4 }],
        description: 'Ponto de encontro comunitário com água pura.'
      },
      {
        id: 'struct_stairs_wood',
        assetId: 'struct_stairs_wood',
        name: 'Escada de Madeira Nobre',
        category: 'structures',
        apCost: 1,
        materials: [{ item: 'wood_log', count: 4 }],
        description: 'Conecta andares, varandas e desníveis com degraus firmes.'
      },
      {
        id: 'struct_ramp_stone',
        assetId: 'struct_ramp_stone',
        name: 'Rampa de Pedra / Acesso',
        category: 'structures',
        apCost: 2,
        materials: [{ item: 'iron_ore', count: 6 }],
        description: 'Rampa de subida em pedra talhada para conectar colinas.'
      },

      // 4. Dragões & Ninhos (Mestre Casco)
      {
        id: 'prop_dragon_incubator',
        assetId: 'prop_dragon_incubator',
        name: 'Ninho Incubador de Dragão',
        category: 'dragons',
        apCost: 2,
        materials: [{ item: 'soft_hay', count: 5 }, { item: 'fire_stone', count: 1 }],
        description: 'Estrutura aquecida essencial para chocar ovos de dragão.'
      },
      {
        id: 'dragon_whistle_call',
        assetId: 'dragon_whistle_call',
        name: 'Apito de Chamado de Dragão',
        category: 'dragons',
        apCost: 2,
        materials: [{ item: 'leather', count: 2 }, { item: 'bronze_buckle', count: 2 }],
        description: 'Apito esculpido para invocar seu companheiro dragão.'
      }
    ];

    // Player Inventory
    this.inventory = new Map([
      ['wood_log', 24],
      ['iron_ore', 18],
      ['soft_hay', 16],
      ['fire_stone', 4],
      ['leather', 12],
      ['bronze_buckle', 6]
    ]);
  }

  getRecipes() {
    return this.recipes;
  }

  unlockRecipe(recipeOrAssetId) {
    this.unlockedRecipeIds.add(recipeOrAssetId);
  }

  isRecipeUnlocked(recipeId) {
    return this.unlockedRecipeIds.has(recipeId);
  }

  hasMaterials(recipe) {
    for (const req of recipe.materials) {
      const current = this.inventory.get(req.item) || 0;
      if (current < req.count) return false;
    }
    return true;
  }

  craftItem(recipeId, player, onPoofCallback = null) {
    const recipe = this.recipes.find(r => r.id === recipeId || r.assetId === recipeId);
    if (!recipe) return { success: false, reason: 'Receita não encontrada!' };

    // Check Day/Night & Action Points
    const apCheck = this.dayNightSystem.canPerformAction();
    if (!apCheck.allowed) {
      return { success: false, reason: apCheck.reason };
    }

    if (!this.hasMaterials(recipe)) {
      return { success: false, reason: 'Materiais insuficientes no inventário!' };
    }

    // Deduct AP & Materials
    this.dayNightSystem.consumeAction(recipe.apCost);
    for (const req of recipe.materials) {
      const current = this.inventory.get(req.item) || 0;
      this.inventory.set(req.item, current - req.count);
    }

    // Trigger player standing craft animation (moving arms up and down)
    if (player && player.startCraftAnimation) {
      player.startCraftAnimation(1800);
    }

    if (onPoofCallback) {
      onPoofCallback(player ? { x: player.x, y: player.y } : { x: 0, y: 0 });
    }

    return {
      success: true,
      item: recipe,
      message: `Você fabricou "${recipe.name}" com sucesso! (-${recipe.apCost} AP)`
    };
  }
}

export default CraftingSystem;
