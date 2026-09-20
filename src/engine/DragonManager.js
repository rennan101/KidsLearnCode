// Dragon Manager: Species, Mount Sockets, Field Moves, and Party (Bag B)

export class DragonManager {
  constructor() {
    this.dragonCatalog = [
      {
        id: 'dragon_pyro_drake',
        name: 'Ignis, o Dragão das Brasas',
        species: 'Fogo / Alado',
        icon: '🔥',
        fieldMove: 'Derreter Obstáculos / Iluminação Noturna',
        mountSpeedMultiplier: 1.8,
        socketOffset: { x: 0, y: -16 }
      },
      {
        id: 'dragon_aqua_serpent',
        name: 'Aqualis, o Dragão das Marés',
        species: 'Água / Nadador',
        icon: '🌊',
        fieldMove: 'Surf Aquático / Navegação Fluvial',
        mountSpeedMultiplier: 1.6,
        socketOffset: { x: 0, y: -12 }
      },
      {
        id: 'dragon_gale_wyvern',
        name: 'Zephyra, a Serpe dos Ventos',
        species: 'Vento / Voador Alto',
        icon: '🌪️',
        fieldMove: 'Voo Livre sobre Penhascos e Florestas',
        mountSpeedMultiplier: 2.2,
        socketOffset: { x: 0, y: -20 }
      },
      {
        id: 'dragon_terra_golem',
        name: 'Terran, o Dragão de Rocha',
        species: 'Terra / Terrestre Pesado',
        icon: '⛰️',
        fieldMove: 'Quebra de Rochas e Desbloqueio de Cavernas',
        mountSpeedMultiplier: 1.4,
        socketOffset: { x: 0, y: -14 }
      }
    ];

    // Player Bag B (Dragon Party, up to 3 dragons)
    this.dragonParty = [
      {
        ...this.dragonCatalog[0],
        level: 5,
        bond: 80,
        energy: 100
      }
    ];

    this.activeMount = null;
  }

  getParty() {
    return this.dragonParty;
  }

  mountDragon(dragonId) {
    const dragon = this.dragonParty.find(d => d.id === dragonId);
    if (dragon) {
      this.activeMount = dragon;
      return { success: true, dragon };
    }
    return { success: false, reason: 'Dragão não encontrado na Bag B!' };
  }

  dismountDragon() {
    if (this.activeMount) {
      const prev = this.activeMount;
      this.activeMount = null;
      return { success: true, previousMount: prev };
    }
    return { success: false };
  }

  isMounted() {
    return this.activeMount !== null;
  }

  getActiveMount() {
    return this.activeMount;
  }
}
