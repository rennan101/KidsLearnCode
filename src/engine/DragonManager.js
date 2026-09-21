/**
 * Dragon Manager - Sprint 5 Complete System
 * Catálogo dos 10 Dragões Oficiais, Bolsa B, Pet Follow AI,
 * Combate Automático com Esquiva Tática (Tecla 1), Field Moves e Ninhos de Ovos.
 */

export const DRAGON_CATALOG = [
  {
    id: 'dragon_fly_zephyr',
    name: 'Zephyra, o Dragão dos Ventos',
    category: 'fly',
    element: 'Ar / Vento',
    color: '#38bdf8',
    secondaryColor: '#fef08a',
    icon: 'Ar',
    fieldMove: 'Voo Livre sobre Penhascos e Rios',
    mountSpeedMultiplier: 1.8,
    socketOffset: { x: 0, y: -18 },
    dodgeAbility: 'Rajada de Vento (Empurrão + 0.8s Invulnerável)',
    desc: 'Dragão alado ágil de escamas celestes e asas emplumadas. Permite voar sobre a água.'
  },
  {
    id: 'dragon_fly_storm',
    name: 'Volt, o Dragão do Trovão',
    category: 'fly',
    element: 'Elétrico',
    color: '#818cf8',
    secondaryColor: '#22d3ee',
    icon: 'Trovão',
    fieldMove: 'Iluminação por Faíscas e Voo Elétrico',
    mountSpeedMultiplier: 1.9,
    socketOffset: { x: 0, y: -18 },
    dodgeAbility: 'Salto Relâmpago (Atordoa atacante por 0.5s)',
    desc: 'Escamas roxo-índigo com chifrinhos de raio azul. Pisca em velocidade impressionante.'
  },
  {
    id: 'dragon_fly_solar',
    name: 'Sol, o Dragão da Aurora',
    category: 'fly',
    element: 'Luz Solar',
    color: '#fbbf24',
    secondaryColor: '#f97316',
    icon: 'Solar',
    fieldMove: 'Acelera Cultivos e Clima Solar',
    mountSpeedMultiplier: 1.75,
    socketOffset: { x: 0, y: -18 },
    dodgeAbility: 'Clarão Solar (Cega atacantes)',
    desc: 'Crista em leque como raios solares e escamas degradê amarelo e laranja.'
  },
  {
    id: 'dragon_land_boulder',
    name: 'Terran, o Dragão de Rocha',
    category: 'land',
    element: 'Terra / Rocha',
    color: '#78716c',
    secondaryColor: '#84cc16',
    icon: 'Rocha',
    fieldMove: 'Quebra de Rochas e Mineração Rápida',
    mountSpeedMultiplier: 1.45,
    socketOffset: { x: 0, y: -14 },
    dodgeAbility: 'Carapaça Blindada (Absorve 100% dano e reflete 30%)',
    desc: 'Dragão robusto com carapaça de pedra polida e placas de musgo verde no dorso.'
  },
  {
    id: 'dragon_land_magma',
    name: 'Ignis, o Dragão de Lava',
    category: 'land',
    element: 'Fogo Vulcânico',
    color: '#ef4444',
    secondaryColor: '#f97316',
    icon: 'Fogo',
    fieldMove: 'Derrete Gelo e Acende Tochas Noturnas',
    mountSpeedMultiplier: 1.6,
    socketOffset: { x: 0, y: -15 },
    dodgeAbility: 'Explosão de Cinzas (Nuvem de fumaça e brasas)',
    desc: 'Obsidiana escura com barriga cor de brasa incandescente e rastro de calor.'
  },
  {
    id: 'dragon_land_forest',
    name: 'Sylva, a Guardiã da Floresta',
    category: 'land',
    element: 'Natureza',
    color: '#10b981',
    secondaryColor: '#f472b6',
    icon: 'Flora',
    fieldMove: 'Germina Flores e Aumenta Colheita',
    mountSpeedMultiplier: 1.5,
    socketOffset: { x: 0, y: -14 },
    dodgeAbility: 'Salto Silvestre (Toco ilusório de madeira)',
    desc: 'Escamas verde-menta com chifrinhos de galho floridos e cauda de samambaia.'
  },
  {
    id: 'dragon_water_coral',
    name: 'Coralis, a Serpente dos Recifes',
    category: 'water',
    element: 'Água Marinha',
    color: '#06b6d4',
    secondaryColor: '#f43f5e',
    icon: 'Oceano',
    fieldMove: 'Navegação em Águas Profundas e Pesca',
    mountSpeedMultiplier: 1.7,
    socketOffset: { x: 0, y: -12 },
    dodgeAbility: 'Mergulho Profundo (Submerge e surge nas costas)',
    desc: 'Corpo serpentino azul-turquesa com barbatanas de coral rosa-pastel.'
  },
  {
    id: 'dragon_water_frost',
    name: 'Glacius, o Dragão dos Icebergs',
    category: 'water',
    element: 'Gelo Glacial',
    color: '#bae6fd',
    secondaryColor: '#38bdf8',
    icon: 'Gelo',
    fieldMove: 'Congela a Água Criando Pontes de Gelo',
    mountSpeedMultiplier: 1.65,
    socketOffset: { x: 0, y: -14 },
    dodgeAbility: 'Escudo Glacial (Barreira de espinhos de gelo)',
    desc: 'Escamas brancas como neve com espinhos de cristal de gelo translúcidos.'
  },
  {
    id: 'dragon_water_abyss',
    name: 'Nox, o Dragão Abissal',
    category: 'water',
    element: 'Sombra Abissal',
    color: '#312e81',
    secondaryColor: '#06b6d4',
    icon: 'Abismo',
    fieldMove: 'Visão Noturna no Fundo do Mar e Baús Ocultos',
    mountSpeedMultiplier: 1.6,
    socketOffset: { x: 0, y: -14 },
    dodgeAbility: 'Pulso de Névoa Abissal (Tinta bioluminescente)',
    desc: 'Azul-marinho escuro com pintas neon ciano brilhantes e lanterninha luminescente.'
  },
  {
    id: 'dragon_mythic_lua',
    name: 'Astra, o Dragão Guardião da Lua',
    category: 'mythic',
    element: 'Arcano / Estelar',
    color: '#e0e7ff',
    secondaryColor: '#fbbf24',
    icon: 'Lua',
    fieldMove: 'Voo Supremo, Travessia Terrestre e Aquática',
    mountSpeedMultiplier: 2.1,
    socketOffset: { x: 0, y: -20 },
    dodgeAbility: 'Dobra Temporal Lua (Tempo desacelera 50% por 1.5s)',
    desc: 'O dragão sagrado da Ilha Lua. Escamas prateadas, chifres de lua crescente e runas amarelas.'
  }
];

export class DragonManager {
  constructor() {
    this.dragonCatalog = DRAGON_CATALOG;

    // Player Bag B (Party up to 6 dragons)
    this.dragonParty = [
      {
        ...this.dragonCatalog[0], // Zephyra
        level: 5,
        xp: 120,
        maxXp: 300,
        hp: 120,
        maxHp: 120,
        energy: 100,
        maxEnergy: 100,
        bond: 85,
        status: 'ready'
      },
      {
        ...this.dragonCatalog[3], // Terran
        level: 4,
        xp: 80,
        maxXp: 250,
        hp: 150,
        maxHp: 150,
        energy: 90,
        maxEnergy: 100,
        bond: 70,
        status: 'ready'
      }
    ];

    // Active state: companion (follows player) or mount (player rides)
    this.activeDragonId = 'dragon_fly_zephyr';
    this.mode = 'follow'; // 'follow', 'mounted', 'none'
    
    // Pet Follow Position and Physics
    this.x = 320;
    this.y = 320;
    this.targetX = 320;
    this.targetY = 320;
    this.direction = 'south';
    this.floatTimer = 0;
    this.state = 'idle'; // 'idle', 'follow', 'mounted', 'combat', 'dodge', 'field_move'

    // Flight Altitude System (Q: Descend/Land, E: Ascend/Fly higher)
    this.flightAltitude = 0; // Current altitude in pixels (0 to 120)
    this.targetFlightAltitude = 0; // Target altitude
    this.maxFlightAltitude = 120; // Max flight height

    // Tactical Dodge (Tecla 1)
    this.isDodging = false;
    this.dodgeDuration = 0.8;
    this.dodgeTimer = 0;
    this.dodgeCooldown = 3.0; // 3 seconds
    this.dodgeCooldownTimer = 0;

    // Combat Entities & Particle Systems
    this.combatParticles = [];
    this.damageNumbers = [];
    this.combatCooldown = 0;

    // Training Targets in World
    this.trainingTargets = [
      {
        id: 'target_dummy_1',
        name: 'Espantalho de Treino',
        x: 480,
        y: 320,
        hp: 200,
        maxHp: 200,
        level: 3,
        attackTimer: 0,
        isAggro: false,
        hitTimer: 0
      },
      {
        id: 'target_shadow_slime',
        name: 'Gosma Sombria Selvagem',
        x: 640,
        y: 420,
        hp: 140,
        maxHp: 140,
        level: 4,
        attackTimer: 0,
        isAggro: false,
        hitTimer: 0
      }
    ];

    // Wild Dragon Nests in the World
    this.wildNests = [
      {
        id: 'nest_solar',
        name: 'Ninho Solar dos Penhascos',
        x: 200,
        y: 180,
        eggType: 'dragon_fly_solar',
        eggName: 'Ovo Solar da Aurora',
        eggIcon: 'solar',
        warmthProgress: 0, // 0 to 100%
        hatched: false
      },
      {
        id: 'nest_magma',
        name: 'Ninho Vulcânico de Obsidiana',
        x: 520,
        y: 600,
        eggType: 'dragon_land_magma',
        eggName: 'Ovo de Magma Ardente',
        eggIcon: 'magma',
        warmthProgress: 0,
        hatched: false
      },
      {
        id: 'nest_frost',
        name: 'Ninho Glacial dos Recifes',
        x: 120,
        y: 500,
        eggType: 'dragon_water_frost',
        eggName: 'Ovo Glacial dos Icebergs',
        eggIcon: 'frost',
        warmthProgress: 0,
        hatched: false
      }
    ];
  }

  getParty() {
    return this.dragonParty;
  }

  getActiveDragon() {
    return this.dragonParty.find(d => d.id === this.activeDragonId) || this.dragonParty[0] || null;
  }

  setActiveDragon(dragonId) {
    const dragon = this.dragonParty.find(d => d.id === dragonId);
    if (dragon) {
      this.activeDragonId = dragon.id;
      return { success: true, dragon };
    }
    return { success: false, reason: 'Dragão não encontrado na Bag B!' };
  }

  setMode(mode) {
    if (['follow', 'mounted', 'none'].includes(mode)) {
      this.mode = mode;
      return true;
    }
    return false;
  }

  isMounted() {
    return this.mode === 'mounted';
  }

  isFollowing() {
    return this.mode === 'follow';
  }

  canActiveDragonFly() {
    const active = this.getActiveDragon();
    return !!(active && (active.category === 'fly' || active.category === 'mythic' || active.canFly));
  }

  ascendFlight(amount = 25) {
    if (!this.canActiveDragonFly() || this.mode !== 'mounted') return false;
    this.targetFlightAltitude = Math.min(this.maxFlightAltitude, this.targetFlightAltitude + amount);
    return true;
  }

  descendFlight(amount = 25) {
    if (!this.canActiveDragonFly() || this.mode !== 'mounted') return false;
    this.targetFlightAltitude = Math.max(0, this.targetFlightAltitude - amount);
    return true;
  }

  toggleMount() {
    const active = this.getActiveDragon();
    if (!active) return { success: false, reason: 'Nenhum dragão ativo selecionado!' };

    if (this.mode === 'mounted') {
      this.mode = 'follow';
      this.targetFlightAltitude = 0;
      this.flightAltitude = 0;
      return { success: true, mounted: false, dragon: active };
    } else {
      this.mode = 'mounted';
      return { success: true, mounted: true, dragon: active };
    }
  }

  // Tactical Dodge Trigger (Key 1)
  triggerTacticalDodge() {
    if (this.dodgeCooldownTimer > 0) {
      return { 
        success: false, 
        reason: `Esquiva em recarga! (${this.dodgeCooldownTimer.toFixed(1)}s)` 
      };
    }

    const dragon = this.getActiveDragon();
    if (!dragon) return { success: false, reason: 'Nenhum dragão ativo!' };

    this.isDodging = true;
    this.dodgeTimer = this.dodgeDuration;
    this.dodgeCooldownTimer = this.dodgeCooldown;

    // Spawn elemental dodge explosion particles
    this.spawnDodgeParticles(this.x, this.y, dragon);

    return {
      success: true,
      abilityName: dragon.dodgeAbility,
      dragon
    };
  }

  spawnDodgeParticles(x, y, dragon) {
    for (let i = 0; i < 18; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 120;
      this.combatParticles.push({
        x: x + 24,
        y: y + 24,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: i % 2 === 0 ? dragon.color : dragon.secondaryColor,
        size: 4 + Math.random() * 6,
        life: 0,
        maxLife: 0.6 + Math.random() * 0.3,
        alpha: 1.0,
        type: 'dodge'
      });
    }
  }

  // Interactive Field Moves
  triggerFieldMove(tileMap, playerX, playerY) {
    const dragon = this.getActiveDragon();
    if (!dragon) return { success: false, reason: 'Nenhum dragão ativo na Mochila.' };

    const tileSize = tileMap?.tileSize || 64;
    const centerTileX = Math.floor((playerX + 32) / tileSize);
    const centerTileY = Math.floor((playerY + 32) / tileSize);

    let effectDesc = '';

    if (dragon.category === 'land') {
      // Earth / Magma: Clear boulders and harvest stone
      effectDesc = `${dragon.name} usou Quebra de Rochas! Caminhos liberados ao redor.`;
      for (let i = 0; i < 20; i++) {
        this.combatParticles.push({
          x: playerX + 32 + (Math.random() - 0.5) * 64,
          y: playerY + 32 + (Math.random() - 0.5) * 64,
          vx: (Math.random() - 0.5) * 80,
          vy: -40 - Math.random() * 60,
          color: '#a8a29e',
          size: 5 + Math.random() * 4,
          life: 0,
          maxLife: 0.8,
          alpha: 1.0,
          type: 'rock'
        });
      }
    } else if (dragon.category === 'water') {
      // Water / Frost: Freeze water or surfing
      effectDesc = `${dragon.name} usou Congelamento de Marés! Superfície cristalizada em gelo seguro.`;
      for (let i = 0; i < 25; i++) {
        this.combatParticles.push({
          x: playerX + 32 + (Math.random() - 0.5) * 80,
          y: playerY + 32 + (Math.random() - 0.5) * 80,
          vx: (Math.random() - 0.5) * 40,
          vy: (Math.random() - 0.5) * 40,
          color: '#7dd3fc',
          size: 4 + Math.random() * 5,
          life: 0,
          maxLife: 1.0,
          alpha: 1.0,
          type: 'frost'
        });
      }
    } else if (dragon.category === 'fly') {
      // Fly: Wind burst
      effectDesc = `${dragon.name} usou Corrente Térmica! Salto no ar com visão ampliada.`;
      for (let i = 0; i < 20; i++) {
        this.combatParticles.push({
          x: playerX + 32 + (Math.random() - 0.5) * 50,
          y: playerY + 32 + (Math.random() - 0.5) * 50,
          vx: (Math.random() - 0.5) * 100,
          vy: -60 - Math.random() * 80,
          color: '#e0f2fe',
          size: 3 + Math.random() * 4,
          life: 0,
          maxLife: 0.7,
          alpha: 1.0,
          type: 'wind'
        });
      }
    } else {
      // Mythic
      effectDesc = `${dragon.name} invocou a Bênção Astral da Ilha Lua!`;
    }

    return {
      success: true,
      message: effectDesc,
      dragon
    };
  }

  // Dragon Egg Nest Interaction (Warmth & Hatching)
  interactWithNest(nestId) {
    const nest = this.wildNests.find(n => n.id === nestId);
    if (!nest) return { success: false, reason: 'Ninho não encontrado.' };

    if (nest.hatched) {
      return { success: false, reason: 'Este ninho já foi chocado!' };
    }

    nest.warmthProgress = Math.min(100, nest.warmthProgress + 34);

    if (nest.warmthProgress >= 100) {
      nest.hatched = true;
      const speciesData = this.dragonCatalog.find(d => d.id === nest.eggType) || this.dragonCatalog[0];
      return {
        success: true,
        hatched: true,
        speciesData,
        message: `O ${nest.eggName} chocou! Um adorável ${speciesData.name} nasceu!`
      };
    }

    return {
      success: true,
      hatched: false,
      progress: nest.warmthProgress,
      message: `Você aqueceu o ${nest.eggName}! Incubação: ${nest.warmthProgress}%`
    };
  }

  adoptHatchedDragon(speciesId) {
    const species = this.dragonCatalog.find(d => d.id === speciesId);
    if (!species) return false;

    if (this.dragonParty.length >= 6) {
      return { success: false, reason: 'Mochila de Dragões cheia! (Máximo 6)' };
    }

    const newDragon = {
      ...species,
      level: 1,
      xp: 0,
      maxXp: 100,
      hp: 80,
      maxHp: 80,
      energy: 100,
      maxEnergy: 100,
      bond: 50,
      status: 'ready'
    };

    this.dragonParty.push(newDragon);
    this.setActiveDragon(newDragon.id);

    return { success: true, dragon: newDragon };
  }

  recruitWildDragon(speciesData, level = 1) {
    if (!speciesData) return { success: false, reason: 'Dragão inválido' };
    const species = this.dragonCatalog.find(d => d.id === speciesData.id) || speciesData;

    if (this.dragonParty.length >= 6) {
      return { success: false, reason: 'Sua Bolsa de Dragões está cheia! (Máximo 6)' };
    }

    const lvl = Math.max(1, parseInt(level, 10) || 1);
    const calculatedHp = 80 + (lvl - 1) * 20;

    const newDragon = {
      ...species,
      level: lvl,
      xp: 0,
      maxXp: Math.round(100 * Math.pow(1.3, lvl - 1)),
      hp: calculatedHp,
      maxHp: calculatedHp,
      energy: 100,
      maxEnergy: 100,
      bond: 60,
      status: 'ready'
    };

    this.dragonParty.push(newDragon);
    this.setActiveDragon(newDragon.id);
    return { success: true, dragon: newDragon };
  }

  // Update Game Loop AI & Combat Logic
  update(deltaTime, player, tileMap) {
    const dt = Math.min(deltaTime / 1000, 0.1);
    this.floatTimer += dt;

    // Cooldown timers
    if (this.dodgeCooldownTimer > 0) {
      this.dodgeCooldownTimer = Math.max(0, this.dodgeCooldownTimer - dt);
    }

    if (this.isDodging) {
      this.dodgeTimer -= dt;
      if (this.dodgeTimer <= 0) {
        this.isDodging = false;
      }
    }

    // Update Flight Altitude System (Q: Descend, E: Ascend)
    const canFly = this.canActiveDragonFly();
    if (this.mode === 'mounted' && canFly) {
      if (player && player.keys) {
        if (player.keys.e || player.keys.KeyE) {
          this.targetFlightAltitude = Math.min(this.maxFlightAltitude, this.targetFlightAltitude + 95 * dt);
        }
        if (player.keys.q || player.keys.KeyQ) {
          this.targetFlightAltitude = Math.max(0, this.targetFlightAltitude - 95 * dt);
        }
      }
      this.flightAltitude += (this.targetFlightAltitude - this.flightAltitude) * Math.min(1.0, 7.0 * dt);
    } else {
      this.targetFlightAltitude = 0;
      this.flightAltitude += (0 - this.flightAltitude) * Math.min(1.0, 10.0 * dt);
    }

    const dragon = this.getActiveDragon();
    if (!dragon || this.mode === 'none') return;

    // 1. Pet Follow AI Logic
    if (this.mode === 'mounted') {
      // Rider is positioned on socket
      this.x = player.x;
      this.y = player.y;
      this.direction = player.direction;
      this.state = 'mounted';
    } else if (this.mode === 'follow') {
      // Follow target anchor point slightly behind player
      let offsetX = -42;
      let offsetY = 12;
      if (player.direction === 'east') { offsetX = -46; offsetY = 6; }
      else if (player.direction === 'west') { offsetX = 46; offsetY = 6; }
      else if (player.direction === 'north') { offsetX = 0; offsetY = 46; }
      else if (player.direction === 'south') { offsetX = 0; offsetY = -42; }

      this.targetX = player.x + offsetX;
      this.targetY = player.y + offsetY;

      // Smooth exponential lerp toward target
      const lerpSpeed = player.isSprinting ? 8.0 : 5.0;
      this.x += (this.targetX - this.x) * Math.min(1.0, lerpSpeed * dt);
      this.y += (this.targetY - this.y) * Math.min(1.0, lerpSpeed * dt);

      const dist = Math.hypot(player.x - this.x, player.y - this.y);
      this.state = dist > 20 ? 'follow' : 'idle';
      this.direction = player.direction;
    }

    // 2. Auto-Combat Logic with Targets
    this.combatCooldown += dt;
    for (const target of this.trainingTargets) {
      const dist = Math.hypot(target.x - (this.x + 24), target.y - (this.y + 24));
      if (dist < 140 && target.hp > 0) {
        this.state = 'combat';
        target.isAggro = true;

        // Companion Auto-Attack every 1.2s
        if (this.combatCooldown >= 1.2) {
          this.combatCooldown = 0;
          const isCrit = Math.random() < 0.25;
          const damage = isCrit ? Math.floor(22 + Math.random() * 8) : Math.floor(12 + Math.random() * 6);
          target.hp = Math.max(0, target.hp - damage);
          target.hitTimer = 0.3;

          // Spawn damage floating number
          this.damageNumbers.push({
            x: target.x + 16,
            y: target.y - 10,
            text: isCrit ? `CRIT! -${damage}` : `-${damage}`,
            color: isCrit ? '#f59e0b' : '#ef4444',
            alpha: 1.0,
            life: 0,
            maxLife: 1.0
          });

          // Spawn elemental attack particles toward target
          this.spawnAttackParticles(this.x + 24, this.y + 24, target.x + 16, target.y + 16, dragon);

          // Gain XP on victory
          if (target.hp <= 0) {
            dragon.xp += 40;
            if (dragon.xp >= dragon.maxXp) {
              dragon.level++;
              dragon.xp -= dragon.maxXp;
              dragon.maxXp = Math.round(dragon.maxXp * 1.4);
              dragon.maxHp += 20;
              dragon.hp = dragon.maxHp;
            }
          }
        }
      }
    }

    // 3. Update Combat Particles
    for (let i = this.combatParticles.length - 1; i >= 0; i--) {
      const p = this.combatParticles[i];
      p.life += dt;
      p.x += (p.vx || 0) * dt;
      p.y += (p.vy || 0) * dt;
      p.alpha = Math.max(0, 1 - (p.life / p.maxLife));
      if (p.life >= p.maxLife) {
        this.combatParticles.splice(i, 1);
      }
    }

    // 4. Update Damage Floating Numbers
    for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
      const d = this.damageNumbers[i];
      d.life += dt;
      d.y -= 25 * dt;
      d.alpha = Math.max(0, 1 - (d.life / d.maxLife));
      if (d.life >= d.maxLife) {
        this.damageNumbers.splice(i, 1);
      }
    }
  }

  spawnAttackParticles(fromX, fromY, toX, toY, dragon) {
    for (let i = 0; i < 8; i++) {
      const angle = Math.atan2(toY - fromY, toX - fromX) + (Math.random() - 0.5) * 0.4;
      const speed = 140 + Math.random() * 80;
      this.combatParticles.push({
        x: fromX,
        y: fromY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: dragon.color,
        size: 4 + Math.random() * 4,
        life: 0,
        maxLife: 0.5,
        alpha: 1.0,
        type: 'attack'
      });
    }
  }

  // Render Companion, Targets, Nests, and Combat UI in World Space
  render(ctx, assetLoader, player = null) {
    const dragon = this.getActiveDragon();
    if (!dragon) return;

    // 1. Render Wild Dragon Nests
    this.renderWildNests(ctx);

    // 2. Render Training Targets
    this.renderTrainingTargets(ctx);

    // 3. Render Active Dragon Companion (if not mounted, or socket underlay)
    if (this.mode !== 'none') {
      this.renderDragonEntity(ctx, dragon, player);
    }

    // 4. Render Combat Particles
    this.renderParticles(ctx);

    // 5. Render Floating Damage Numbers
    this.renderDamageNumbers(ctx);
  }

  renderDragonEntity(ctx, dragon, player = null) {
    ctx.save();

    const isMounted = this.mode === 'mounted';
    const alt = isMounted ? (this.flightAltitude || 0) : 0;
    const bounce = Math.sin(this.floatTimer * (alt > 10 ? 8 : 4)) * (alt > 10 ? 6 : 4);
    const drawX = Math.round(this.x);
    const drawY = Math.round(this.y + bounce - alt);

    // 1. Single Unified Ground Shadow (Always rendered on the terrain floor, expands & softens with altitude)
    ctx.save();
    const shadowScaleX = 20 + (alt * 0.14);
    const shadowScaleY = 8 + (alt * 0.06);
    const shadowAlpha = isMounted 
      ? Math.max(0.12, 0.38 - (alt / 120) * 0.20)
      : 0.28;
    ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
    ctx.beginPath();
    ctx.ellipse(drawX + 24, this.y + 44, shadowScaleX, shadowScaleY, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Invulnerability flashing when dodging
    if (this.isDodging && Math.floor(this.floatTimer * 20) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    // Draw Cute Harmonized Animal Crossing-style Dragon (2.5D Vector Canvas)
    const bodyColor = dragon.color || '#38bdf8';
    const accentColor = dragon.secondaryColor || '#fef08a';

    // 1. Dragon Wings / Fins with dynamic flap frequency in flight
    ctx.fillStyle = accentColor;
    const flapFreq = alt > 10 ? 14 : 8;
    const flapAmp = alt > 10 ? 9 : 6;
    const wingFlap = Math.sin(this.floatTimer * flapFreq) * flapAmp;
    // Left wing
    ctx.beginPath();
    ctx.ellipse(drawX + 8, drawY + 16 + wingFlap, 12, 8, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    // Right wing
    ctx.beginPath();
    ctx.ellipse(drawX + 40, drawY + 16 - wingFlap, 12, 8, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    // 2. Dragon Chubby Body
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(drawX + 24, drawY + 26, 18, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. Belly highlight
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.ellipse(drawX + 24, drawY + 28, 11, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // 4. Head with cute round snout
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(drawX + 24, drawY + 12, 14, 0, Math.PI * 2);
    ctx.fill();

    // 5. Cute Horns / Ears
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.moveTo(drawX + 16, drawY + 4);
    ctx.lineTo(drawX + 12, drawY - 6);
    ctx.lineTo(drawX + 20, drawY + 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(drawX + 32, drawY + 4);
    ctx.lineTo(drawX + 36, drawY - 6);
    ctx.lineTo(drawX + 28, drawY + 2);
    ctx.fill();

    // 6. Big Expressive Eyes
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(drawX + 19, drawY + 11, 3.2, 0, Math.PI * 2);
    ctx.arc(drawX + 29, drawY + 11, 3.2, 0, Math.PI * 2);
    ctx.fill();

    // Eye catchlights (sparkle)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(drawX + 18, drawY + 10, 1.2, 0, Math.PI * 2);
    ctx.arc(drawX + 28, drawY + 10, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Rosy cute cheeks
    ctx.fillStyle = 'rgba(244, 114, 182, 0.6)';
    ctx.beginPath();
    ctx.arc(drawX + 15, drawY + 15, 2.5, 0, Math.PI * 2);
    ctx.arc(drawX + 33, drawY + 15, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // 7. Mini Overhead Companion Badge & Proximity Mount [R] Keycap Balloon
    if (this.mode === 'follow') {
      const dist = player ? Math.hypot(player.x - this.x, player.y - this.y) : 999;
      const isNearby = dist < 120;

      if (isNearby) {
        // Balão compacto com apenas a tecla [R] estilo Zelda/Animal Crossing
        const badgeSize = 22;
        const badgeX = drawX + 24 - badgeSize / 2;
        const badgeY = drawY - 26;

        // Sombra suave do badge
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.roundRect(badgeX - 1, badgeY - 1, badgeSize + 2, badgeSize + 2, 6);
        ctx.fill();

        // Keycap dourado
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeSize, badgeSize, 5);
        ctx.fill();

        // Borda dourada suave
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Letra R centralizada
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('R', badgeX + badgeSize / 2, badgeY + badgeSize / 2 + 0.5);

        // Pontinha triangular sutil abaixo do badge apontando para a cabeça do dragão
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(drawX + 21, badgeY + badgeSize);
        ctx.lineTo(drawX + 24, badgeY + badgeSize + 3);
        ctx.lineTo(drawX + 27, badgeY + badgeSize);
        ctx.fill();
      } else {
        // Badge simples de nível quando longe
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.roundRect(drawX + 4, drawY - 14, 40, 12, 4);
        ctx.fill();

        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 8px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Lv.${dragon.level}`, drawX + 24, drawY - 5);
      }
    } else if (isMounted && this.canActiveDragonFly() && alt > 8) {
      // Altitude Indicator & Controls Prompt (Animal Island UI 3D Pill)
      const hudText = `Altitude: ${Math.round(alt)}m [Q ⬇ / E ⬆]`;
      ctx.font = 'bold 10px "Nunito", sans-serif';
      const tw = ctx.measureText(hudText).width;
      const bw = tw + 18;
      const bh = 18;
      const bx = drawX + 24 - bw / 2;
      const by = drawY - 24;

      // 3D Pill shadow
      ctx.fillStyle = '#0f8e83';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(bx, by + 2, bw, bh, 50);
      else ctx.rect(bx, by + 2, bw, bh);
      ctx.fill();

      // Pill body
      ctx.fillStyle = '#19c8b9';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 50);
      else ctx.rect(bx, by, bw, bh);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(hudText, drawX + 24, by + bh / 2);
    }

    ctx.restore();
  }

  renderWildNests(ctx) {
    for (const nest of this.wildNests) {
      ctx.save();
      // Nest Straw Circle
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.ellipse(nest.x + 32, nest.y + 36, 26, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      if (!nest.hatched) {
        // Egg
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.ellipse(nest.x + 32, nest.y + 26, 12, 16, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Warmth Mini Bar
        if (nest.warmthProgress > 0) {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
          ctx.fillRect(nest.x + 12, nest.y + 44, 40, 6);

          ctx.fillStyle = '#f97316';
          ctx.fillRect(nest.x + 12, nest.y + 44, 40 * (nest.warmthProgress / 100), 6);
        }

        // Floating Title
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 9px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(nest.name, nest.x + 32, nest.y + 6);
      } else {
        // Hatched Empty Shell
        ctx.fillStyle = '#a1a1aa';
        ctx.font = 'italic 8px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('(Chocado)', nest.x + 32, nest.y + 30);
      }

      ctx.restore();
    }
  }

  renderTrainingTargets(ctx) {
    for (const target of this.trainingTargets) {
      if (target.hp <= 0) continue;

      ctx.save();
      const isHit = target.hitTimer > 0;
      target.hitTimer = Math.max(0, (target.hitTimer || 0) - 0.016);

      // Dummy Body
      ctx.fillStyle = isHit ? '#ef4444' : '#64748b';
      ctx.beginPath();
      ctx.arc(target.x + 20, target.y + 20, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.stroke();

      // HP Bar above target
      const barW = 44;
      const barH = 5;
      const hpPct = target.hp / target.maxHp;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.fillRect(target.x - 2, target.y - 12, barW, barH);

      ctx.fillStyle = hpPct > 0.4 ? '#10b981' : '#ef4444';
      ctx.fillRect(target.x - 2, target.y - 12, barW * hpPct, barH);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 8px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Lv.${target.level} ${target.name}`, target.x + 20, target.y - 16);

      ctx.restore();
    }
  }

  renderParticles(ctx) {
    for (const p of this.combatParticles) {
      const alpha = typeof p.alpha === 'number' && !isNaN(p.alpha) ? Math.max(0, Math.min(1, p.alpha)) : 1;
      if (alpha <= 0) continue;
      ctx.save();
      ctx.fillStyle = p.color || '#38bdf8';
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(p.x || 0, p.y || 0, Math.max(1, p.size || 4), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  renderDamageNumbers(ctx) {
    for (const d of this.damageNumbers) {
      const alpha = typeof d.alpha === 'number' && !isNaN(d.alpha) ? Math.max(0, Math.min(1, d.alpha)) : 1;
      if (alpha <= 0) continue;
      ctx.save();
      ctx.fillStyle = d.color || '#ffffff';
      ctx.globalAlpha = alpha;
      ctx.font = 'bold 12px "JetBrains Mono", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(d.text, d.x || 0, d.y || 0);
      ctx.restore();
    }
  }
}
