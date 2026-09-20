// Crafting System (Workbench interaction, recipes, AP consumption, poof cloud particles)

export class CraftingSystem {
  constructor(dayNightSystem) {
    this.dayNightSystem = dayNightSystem;
    this.recipes = [
      {
        id: 'wooden_fence',
        name: 'Cerca de Madeira Rústica',
        category: 'structures',
        apCost: 1,
        materials: [{ item: 'wood_log', count: 2 }],
        icon: '🪵',
        description: 'Delimita áreas e protege plantações na vila.'
      },
      {
        id: 'wooden_chair',
        name: 'Cadeira de Carvalho',
        category: 'furniture',
        apCost: 1,
        materials: [{ item: 'wood_log', count: 3 }],
        icon: '🪑',
        description: 'Móvel confortável para descansar o avatar.'
      },
      {
        id: 'iron_pickaxe',
        name: 'Picareta Forjada',
        category: 'tools',
        apCost: 1,
        materials: [{ item: 'wood_log', count: 2 }, { item: 'iron_ore', count: 3 }],
        icon: '⛏️',
        description: 'Permite minerar pedras e gemas raras nos penhascos.'
      },
      {
        id: 'dragon_nest',
        name: 'Ninho Incubador de Dragão',
        category: 'dragons',
        apCost: 2,
        materials: [{ item: 'soft_hay', count: 5 }, { item: 'fire_stone', count: 1 }],
        icon: '🪺',
        description: 'Estrutura aquecida essencial para chocar ovos de dragão.'
      },
      {
        id: 'dragon_saddle_leather',
        name: 'Sela de Voo Acolchoada',
        category: 'dragons',
        apCost: 2,
        materials: [{ item: 'leather', count: 4 }, { item: 'bronze_buckle', count: 2 }],
        icon: '🏇',
        description: 'Encaixe de montaria seguro para dragões alados e terrestres.'
      }
    ];

    // Player Inventory
    this.inventory = new Map([
      ['wood_log', 10],
      ['iron_ore', 6],
      ['soft_hay', 10],
      ['fire_stone', 2],
      ['leather', 8],
      ['bronze_buckle', 4]
    ]);
  }

  getRecipes() {
    return this.recipes;
  }

  hasMaterials(recipe) {
    for (const req of recipe.materials) {
      const current = this.inventory.get(req.item) || 0;
      if (current < req.count) return false;
    }
    return true;
  }

  craftItem(recipeId, player, onPoofCallback = null) {
    const recipe = this.recipes.find(r => r.id === recipeId);
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
      message: `✨ Você fabricou "${recipe.name}" com sucesso! (-${recipe.apCost} AP)`
    };
  }
}
