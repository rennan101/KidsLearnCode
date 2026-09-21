import { DRAGON_CATALOG } from './DragonManager.js';
import { PLAYABLE_HEROES, VILLAGE_NPCS } from './CharacterRegistry.js';

export function generateDragonSVG(dragon) {
  const body = dragon.color || '#38bdf8';
  const accent = dragon.secondaryColor || '#fef08a';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><ellipse cx="32" cy="54" rx="20" ry="7" fill="rgba(0,0,0,0.22)"/><ellipse cx="14" cy="28" rx="10" ry="6" fill="${accent}" transform="rotate(-25 14 28)"/><ellipse cx="50" cy="28" rx="10" ry="6" fill="${accent}" transform="rotate(25 50 28)"/><ellipse cx="32" cy="36" rx="18" ry="15" fill="${body}"/><ellipse cx="32" cy="38" rx="11" ry="10" fill="${accent}"/><circle cx="32" cy="22" r="14" fill="${body}"/><polygon points="24,14 20,4 28,12" fill="${accent}"/><polygon points="40,14 44,4 36,12" fill="${accent}"/><circle cx="27" cy="21" r="3.2" fill="#1e293b"/><circle cx="37" cy="21" r="3.2" fill="#1e293b"/><circle cx="26" cy="20" r="1.2" fill="#ffffff"/><circle cx="36" cy="20" r="1.2" fill="#ffffff"/><circle cx="23" cy="25" r="2.5" fill="rgba(244,114,182,0.6)"/><circle cx="41" cy="25" r="2.5" fill="rgba(244,114,182,0.6)"/></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

export function generateNestSVG(eggColor = '#fbbf24', twigColor = '#854d0e') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><ellipse cx="32" cy="54" rx="26" ry="9" fill="rgba(0,0,0,0.25)"/><ellipse cx="32" cy="44" rx="24" ry="13" fill="${twigColor}" stroke="#5c3c26" stroke-width="2"/><ellipse cx="32" cy="42" rx="18" ry="8" fill="#a16207"/><ellipse cx="32" cy="35" rx="9" ry="12" fill="${eggColor}" stroke="#ffffff" stroke-width="1.5"/><ellipse cx="30" cy="31" rx="3" ry="5" fill="rgba(255,255,255,0.4)"/><path d="M 12 42 Q 32 50 52 42" stroke="#713f12" stroke-width="2" fill="none"/><path d="M 16 38 Q 32 46 48 38" stroke="#451a03" stroke-width="1.5" fill="none"/></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

export function generateIncubatorSVG() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><ellipse cx="32" cy="56" rx="22" ry="7" fill="rgba(0,0,0,0.28)"/><rect x="14" y="42" width="36" height="16" rx="8" fill="#334155" stroke="#0f172a" stroke-width="2"/><circle cx="32" cy="50" r="4" fill="#38bdf8"/><path d="M 18 42 C 18 20, 46 20, 46 42 Z" fill="rgba(56, 189, 248, 0.35)" stroke="#38bdf8" stroke-width="2"/><ellipse cx="32" cy="34" rx="7" ry="10" fill="#fbbf24" stroke="#ffffff" stroke-width="1.5"/><circle cx="32" cy="18" r="4" fill="#f59e0b" stroke="#ffffff" stroke-width="1"/></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

export function generateEggSVG(color = '#fbbf24', spotColor = '#f97316') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><ellipse cx="32" cy="52" rx="14" ry="5" fill="rgba(0,0,0,0.22)"/><ellipse cx="32" cy="34" rx="14" ry="19" fill="${color}" stroke="#78350f" stroke-width="1.8"/><ellipse cx="36" cy="30" rx="4" ry="5" fill="${spotColor}" opacity="0.85"/><ellipse cx="28" cy="40" rx="3" ry="4" fill="${spotColor}" opacity="0.85"/><ellipse cx="28" cy="26" rx="2" ry="4" fill="rgba(255,255,255,0.6)"/></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

export function generateDummySVG() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><ellipse cx="32" cy="56" rx="16" ry="6" fill="rgba(0,0,0,0.25)"/><rect x="30" y="24" width="4" height="32" fill="#78350f"/><rect x="18" y="28" width="28" height="4" fill="#78350f"/><ellipse cx="32" cy="36" rx="12" ry="14" fill="#ca8a04" stroke="#854d0e" stroke-width="1.5"/><circle cx="32" cy="18" r="9" fill="#eab308" stroke="#854d0e" stroke-width="1.5"/><line x1="28" y1="16" x2="30" y2="18" stroke="#713f12" stroke-width="1.5"/><line x1="36" y1="16" x2="34" y2="18" stroke="#713f12" stroke-width="1.5"/></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

// Asset manifest and loader for Geralt and complete RPG Tileset with all 170+ assets
export class AssetLoader {
  constructor() {
    this.images = new Map();
    this.loaded = false;

    // Overworld individual tile assets with footprint dimensions and custom collider boxes
    this.overworldTiles = [
      {
            "id": "water-animated",
            "name": "Animated Water",
            "category": "Water",
            "layer": "ground",
            "isAnimated": true,
            "gridW": 1,
            "gridH": 1,
            "collider": {
                  "enabled": true,
                  "x": 0,
                  "y": 0,
                  "w": 64,
                  "h": 64
            },
            "frames": [
                  "RPG-overworld-tileset/water animation/sprite_001.png",
                  "RPG-overworld-tileset/water animation/sprite_002.png",
                  "RPG-overworld-tileset/water animation/sprite_003.png",
                  "RPG-overworld-tileset/water animation/sprite_004.png",
                  "RPG-overworld-tileset/water animation/sprite_005.png",
                  "RPG-overworld-tileset/water animation/sprite_006.png",
                  "RPG-overworld-tileset/water animation/sprite_007.png",
                  "RPG-overworld-tileset/water animation/sprite_008.png"
            ]
      },
      {
            "id": "bush-blue",
            "name": "Bush Blue",
            "category": "Nature",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/bush-blue.png",
            "collider": {
                  "enabled": true,
                  "x": 8,
                  "y": 12,
                  "w": 48,
                  "h": 48
            }
      },
      {
            "id": "bush-red",
            "name": "Bush Red",
            "category": "Nature",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/bush-red.png",
            "collider": {
                  "enabled": true,
                  "x": 8,
                  "y": 12,
                  "w": 48,
                  "h": 48
            }
      },
      {
            "id": "bush-white",
            "name": "Bush White",
            "category": "Nature",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/bush-white.png",
            "collider": {
                  "enabled": true,
                  "x": 8,
                  "y": 12,
                  "w": 48,
                  "h": 48
            }
      },
      {
            "id": "bush",
            "name": "Bush",
            "category": "Nature",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/bush.png",
            "collider": {
                  "enabled": true,
                  "x": 8,
                  "y": 12,
                  "w": 48,
                  "h": 48
            }
      },
      {
            "id": "cabbage",
            "name": "Cabbage",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/cabbage.png"
      },
      {
            "id": "corn",
            "name": "Corn",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/corn.png"
      },
      {
            "id": "crate",
            "name": "Crate",
            "category": "Structures",
            "layer": "solid",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/crate.png",
            "collider": {
                  "enabled": true,
                  "x": 8,
                  "y": 8,
                  "w": 48,
                  "h": 48
            }
      },
      {
            "id": "flower-blue",
            "name": "Flower Blue",
            "category": "Nature",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/flower-blue.png"
      },
      {
            "id": "flower-red",
            "name": "Flower Red",
            "category": "Nature",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/flower-red.png"
      },
      {
            "id": "flower-small-1",
            "name": "Flower Small 1",
            "category": "Nature",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/flower-small_1.png"
      },
      {
            "id": "flower-small-2",
            "name": "Flower Small 2",
            "category": "Nature",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/flower-small_2.png"
      },
      {
            "id": "flower-white",
            "name": "Flower White",
            "category": "Nature",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/flower-white.png"
      },
      {
            "id": "haybale",
            "name": "Haybale",
            "category": "Structures",
            "layer": "solid",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/haybale.png",
            "collider": {
                  "enabled": true,
                  "x": 8,
                  "y": 12,
                  "w": 48,
                  "h": 44
            }
      },
      {
            "id": "house-1",
            "name": "House 1",
            "category": "Structures",
            "layer": "solid",
            "gridW": 4,
            "gridH": 4,
            "src": "RPG-overworld-tileset/house_1.png",
            "collider": {
                  "enabled": true,
                  "x": 10,
                  "y": 80,
                  "w": 236,
                  "h": 166
            }
      },
      {
            "id": "house-2",
            "name": "House 2",
            "category": "Structures",
            "layer": "solid",
            "gridW": 5,
            "gridH": 4,
            "src": "RPG-overworld-tileset/house_2.png",
            "collider": {
                  "enabled": true,
                  "x": 10,
                  "y": 80,
                  "w": 300,
                  "h": 166
            }
      },
      {
            "id": "mushroom-1",
            "name": "Mushroom 1",
            "category": "Nature",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/mushroom_1.png"
      },
      {
            "id": "mushroom-2",
            "name": "Mushroom 2",
            "category": "Nature",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/mushroom_2.png"
      },
      {
            "id": "mushroom-3",
            "name": "Mushroom 3",
            "category": "Nature",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/mushroom_3.png"
      },
      {
            "id": "pumpkin",
            "name": "Pumpkin",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/pumpkin.png"
      },
      {
            "id": "ramp-east",
            "name": "Ramp East",
            "category": "Structures",
            "layer": "ground",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/ramp_east.png"
      },
      {
            "id": "ramp-north",
            "name": "Ramp North",
            "category": "Structures",
            "layer": "ground",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/ramp_north.png"
      },
      {
            "id": "ramp-south",
            "name": "Ramp South",
            "category": "Structures",
            "layer": "ground",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/ramp_south.png"
      },
      {
            "id": "rock-1",
            "name": "Rock 1",
            "category": "Nature",
            "layer": "solid",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/rock_1.png",
            "collider": {
                  "enabled": true,
                  "x": 6,
                  "y": 10,
                  "w": 52,
                  "h": 48
            }
      },
      {
            "id": "rock-2",
            "name": "Rock 2",
            "category": "Nature",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/rock_2.png",
            "collider": {
                  "enabled": true,
                  "x": 10,
                  "y": 14,
                  "w": 44,
                  "h": 40
            }
      },
      {
            "id": "seedbag-cabbage",
            "name": "Seedbag Cabbage",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/seedbag-cabbage.png"
      },
      {
            "id": "seedbag-corn",
            "name": "Seedbag Corn",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/seedbag-corn.png"
      },
      {
            "id": "seedbag-pumpkin",
            "name": "Seedbag Pumpkin",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/seedbag-pumpkin.png"
      },
      {
            "id": "seedbag-tomato",
            "name": "Seedbag Tomato",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/seedbag-tomato.png"
      },
      {
            "id": "seedbag-turnip",
            "name": "Seedbag Turnip",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/seedbag-turnip.png"
      },
      {
            "id": "seedbag-wheat",
            "name": "Seedbag Wheat",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/seedbag-wheat.png"
      },
      {
            "id": "sign",
            "name": "Sign",
            "category": "Structures",
            "layer": "solid",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sign.png",
            "collider": {
                  "enabled": true,
                  "x": 16,
                  "y": 24,
                  "w": 32,
                  "h": 36
            }
      },
      {
            "id": "001-10",
            "name": "Dirt Path Detail 10 (2x2)",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 2,
            "gridH": 2,
            "src": "RPG-overworld-tileset/sprite_001-10.png"
      },
      {
            "id": "001-11",
            "name": "Dirt Path Detail 11 (2x2)",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 2,
            "gridH": 2,
            "src": "RPG-overworld-tileset/sprite_001-11.png"
      },
      {
            "id": "001-12",
            "name": "Dirt Path Detail 12 (2x2)",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 2,
            "gridH": 2,
            "src": "RPG-overworld-tileset/sprite_001-12.png"
      },
      {
            "id": "001-13",
            "name": "Dirt Path Detail 13 (2x2)",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 2,
            "gridH": 2,
            "src": "RPG-overworld-tileset/sprite_001-13.png"
      },
      {
            "id": "001-14",
            "name": "Dirt Path Detail 14 (2x2)",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 2,
            "gridH": 2,
            "src": "RPG-overworld-tileset/sprite_001-14.png"
      },
      {
            "id": "001-15",
            "name": "Dirt Path Detail 15 (2x2)",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 2,
            "gridH": 2,
            "src": "RPG-overworld-tileset/sprite_001-15.png"
      },
      {
            "id": "001-16",
            "name": "Dirt Path Detail 16 (2x1)",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 2,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_001-16.png"
      },
      {
            "id": "001-17",
            "name": "Dirt Path Detail 17 (2x1)",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 2,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_001-17.png"
      },
      {
            "id": "001-18",
            "name": "Dirt Path Detail 18",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_001-18.png"
      },
      {
            "id": "001-19",
            "name": "Dirt Path Detail 19",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_001-19.png"
      },
      {
            "id": "001-2",
            "name": "Dirt Path Detail 2 (3x3)",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 3,
            "gridH": 3,
            "src": "RPG-overworld-tileset/sprite_001-2.png"
      },
      {
            "id": "001-20",
            "name": "Dirt Path Detail 20",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_001-20.png"
      },
      {
            "id": "001-21",
            "name": "Dirt Path Detail 21",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_001-21.png"
      },
      {
            "id": "001-22",
            "name": "Dirt Path Detail 22",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_001-22.png"
      },
      {
            "id": "001-23",
            "name": "Dirt Path Detail 23",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_001-23.png"
      },
      {
            "id": "001-24",
            "name": "Dirt Path Detail 24",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_001-24.png"
      },
      {
            "id": "001-27",
            "name": "Dirt Path Detail 27 (8x1)",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 8,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_001-27.png"
      },
      {
            "id": "001-3",
            "name": "Dirt Path Detail 3 (3x3)",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 3,
            "gridH": 3,
            "src": "RPG-overworld-tileset/sprite_001-3.png"
      },
      {
            "id": "001-4",
            "name": "Dirt Path Detail 4 (3x3)",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 3,
            "gridH": 3,
            "src": "RPG-overworld-tileset/sprite_001-4.png"
      },
      {
            "id": "001-5",
            "name": "Dirt Path Detail 5",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_001-5.png"
      },
      {
            "id": "001-6",
            "name": "Dirt Path Detail 6 (3x3)",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 3,
            "gridH": 3,
            "src": "RPG-overworld-tileset/sprite_001-6.png"
      },
      {
            "id": "001-7",
            "name": "Dirt Path Detail 7 (3x3)",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 3,
            "gridH": 3,
            "src": "RPG-overworld-tileset/sprite_001-7.png"
      },
      {
            "id": "001-8",
            "name": "Dirt Path Detail 8 (3x5)",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 3,
            "gridH": 5,
            "src": "RPG-overworld-tileset/sprite_001-8.png"
      },
      {
            "id": "001-9",
            "name": "Dirt Path Detail 9 (2x2)",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 2,
            "gridH": 2,
            "src": "RPG-overworld-tileset/sprite_001-9.png"
      },
      {
            "id": "grass",
            "name": "Grass Ground (3x3)",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 3,
            "gridH": 3,
            "src": "RPG-overworld-tileset/sprite_001.png"
      },
      {
            "id": "dirt-center-001",
            "name": "Dirt Center 001",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_DirtCenter_001.png"
      },
      {
            "id": "dirt-center-002",
            "name": "Dirt Center 002",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_DirtCenter_002.png"
      },
      {
            "id": "dirt-center-003",
            "name": "Dirt Center 003",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_DirtCenter_003.png"
      },
      {
            "id": "dirt-center-004",
            "name": "Dirt Center 004",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_DirtCenter_004.png"
      },
      {
            "id": "dirt-center-005",
            "name": "Dirt Center 005",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_DirtCenter_005.png"
      },
      {
            "id": "dirt-center-006",
            "name": "Dirt Center 006",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_DirtCenter_006.png"
      },
      {
            "id": "dirt-center-007",
            "name": "Dirt Center 007",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_DirtCenter_007.png"
      },
      {
            "id": "dirt-center-008",
            "name": "Dirt Center 008",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_DirtCenter_008.png"
      },
      {
            "id": "dirt-center-009",
            "name": "Dirt Center 009",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_DirtCenter_009.png"
      },
      {
            "id": "dirt-center-010",
            "name": "Dirt Center 010",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_DirtCenter_010.png"
      },
      {
            "id": "dirt-center-011",
            "name": "Dirt Center 011",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_DirtCenter_011.png"
      },
      {
            "id": "dirt-center-012",
            "name": "Dirt Center 012",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_DirtCenter_012.png"
      },
      {
            "id": "dirt-center-013",
            "name": "Dirt Center 013",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_DirtCenter_013.png"
      },
      {
            "id": "dirt-center-014",
            "name": "Dirt Center 014",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_DirtCenter_014.png"
      },
      {
            "id": "dirt-center-015",
            "name": "Dirt Center 015",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_DirtCenter_015.png"
      },
      {
            "id": "dirt-center-016",
            "name": "Dirt Center 016",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_DirtCenter_016.png"
      },
      {
            "id": "dirt-corner-001",
            "name": "Dirt Corner 001",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_DirtCorner_001.png"
      },
      {
            "id": "dirt-corner-002",
            "name": "Dirt Corner 002",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_DirtCorner_002.png"
      },
      {
            "id": "dirt-corner-003",
            "name": "Dirt Corner 003",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_DirtCorner_003.png"
      },
      {
            "id": "dirt-corner-004",
            "name": "Dirt Corner 004",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_DirtCorner_004.png"
      },
      {
            "id": "dirt-corner-005",
            "name": "Dirt Corner 005",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_DirtCorner_005.png"
      },
      {
            "id": "dirt-corner-006",
            "name": "Dirt Corner 006",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_DirtCorner_006.png"
      },
      {
            "id": "dirt-corner-007",
            "name": "Dirt Corner 007",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_DirtCorner_007.png"
      },
      {
            "id": "dirt-corner-008",
            "name": "Dirt Corner 008",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_DirtCorner_008.png"
      },
      {
            "id": "dirt-corner-009",
            "name": "Dirt Corner 009",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_DirtCorner_009.png"
      },
      {
            "id": "dirt-corner-010",
            "name": "Dirt Corner 010",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_DirtCorner_010.png"
      },
      {
            "id": "dirt-corner-011",
            "name": "Dirt Corner 011",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_DirtCorner_011.png"
      },
      {
            "id": "dirt-corner-012",
            "name": "Dirt Corner 012",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_DirtCorner_012.png"
      },
      {
            "id": "dirt-corner-013",
            "name": "Dirt Corner 013",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_DirtCorner_013.png"
      },
      {
            "id": "dirt-corner-014",
            "name": "Dirt Corner 014",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_DirtCorner_014.png"
      },
      {
            "id": "dirt-corner-015",
            "name": "Dirt Corner 015",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_DirtCorner_015.png"
      },
      {
            "id": "dirt-corner-016",
            "name": "Dirt Corner 016",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_DirtCorner_016.png"
      },
      {
            "id": "dirt-edge-001",
            "name": "Dirt Edge 001",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_DirtEdge_001.png"
      },
      {
            "id": "dirt-edge-002",
            "name": "Dirt Edge 002",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_DirtEdge_002.png"
      },
      {
            "id": "dirt-edge-004",
            "name": "Dirt Edge 004",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_DirtEdge_004.png"
      },
      {
            "id": "dirt-edge-005",
            "name": "Dirt Edge 005",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_DirtEdge_005.png"
      },
      {
            "id": "dirt-edge-006",
            "name": "Dirt Edge 006",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_DirtEdge_006.png"
      },
      {
            "id": "dirt-edge-007",
            "name": "Dirt Edge 007",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_DirtEdge_007.png"
      },
      {
            "id": "dirt-edge-008",
            "name": "Dirt Edge 008",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_DirtEdge_008.png"
      },
      {
            "id": "dirt-edge-009",
            "name": "Dirt Edge 009",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_DirtEdge_009.png"
      },
      {
            "id": "dirt-edge-010",
            "name": "Dirt Edge 010",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_DirtEdge_010.png"
      },
      {
            "id": "grass-corner-001",
            "name": "Grass Corner 001",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_GrassCorner_001.png"
      },
      {
            "id": "grass-corner-002",
            "name": "Grass Corner 002",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_GrassCorner_002.png"
      },
      {
            "id": "grass-corner-003",
            "name": "Grass Corner 003",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_GrassCorner_003.png"
      },
      {
            "id": "grass-corner-004",
            "name": "Grass Corner 004",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_GrassCorner_004.png"
      },
      {
            "id": "grass-corner-005",
            "name": "Grass Corner 005",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_GrassCorner_005.png"
      },
      {
            "id": "grass-corner-006",
            "name": "Grass Corner 006",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_GrassCorner_006.png"
      },
      {
            "id": "grass-corner-007",
            "name": "Grass Corner 007",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_GrassCorner_007.png"
      },
      {
            "id": "grass-corner-008",
            "name": "Grass Corner 008",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_GrassCorner_008.png"
      },
      {
            "id": "grass-corner-009",
            "name": "Grass Corner 009",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_GrassCorner_009.png"
      },
      {
            "id": "grass-corner-010",
            "name": "Grass Corner 010",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_GrassCorner_010.png"
      },
      {
            "id": "grass-corner-011",
            "name": "Grass Corner 011",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_GrassCorner_011.png"
      },
      {
            "id": "grass-corner-012",
            "name": "Grass Corner 012",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_GrassCorner_012.png"
      },
      {
            "id": "grass-corner-013",
            "name": "Grass Corner 013",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_GrassCorner_013.png"
      },
      {
            "id": "grass-corner-014",
            "name": "Grass Corner 014",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_GrassCorner_014.png"
      },
      {
            "id": "grass-corner-015",
            "name": "Grass Corner 015",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_GrassCorner_015.png"
      },
      {
            "id": "grass-corner-016",
            "name": "Grass Corner 016",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_GrassCorner_016.png"
      },
      {
            "id": "grass-ground-001",
            "name": "Grass Ground 001",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_GrassGround_001.png"
      },
      {
            "id": "grass-ground-002",
            "name": "Grass Ground 002",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_GrassGround_002.png"
      },
      {
            "id": "grass-ground-003",
            "name": "Grass Ground 003",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_GrassGround_003.png"
      },
      {
            "id": "grass-ground-004",
            "name": "Grass Ground 004",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_GrassGround_004.png"
      },
      {
            "id": "grass-ground-005",
            "name": "Grass Ground 005",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_GrassGround_005.png"
      },
      {
            "id": "grass-ground-006",
            "name": "Grass Ground 006",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_GrassGround_006.png"
      },
      {
            "id": "grass-ground-007",
            "name": "Grass Ground 007",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_GrassGround_007.png"
      },
      {
            "id": "grass-ground-008",
            "name": "Grass Ground 008",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_GrassGround_008.png"
      },
      {
            "id": "grass-ground-009",
            "name": "Grass Ground 009",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_GrassGround_009.png"
      },
      {
            "id": "grass-ground-010",
            "name": "Grass Ground 010",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_GrassGround_010.png"
      },
      {
            "id": "grass-ground-011",
            "name": "Grass Ground 011",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_GrassGround_011.png"
      },
      {
            "id": "grass-ground-012",
            "name": "Grass Ground 012",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_GrassGround_012.png"
      },
      {
            "id": "grass-ground-013",
            "name": "Grass Ground 013",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_GrassGround_013.png"
      },
      {
            "id": "grass-ground-014",
            "name": "Grass Ground 014",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_GrassGround_014.png"
      },
      {
            "id": "grass-ground-015",
            "name": "Grass Ground 015",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_GrassGround_015.png"
      },
      {
            "id": "grass-ground-016",
            "name": "Grass Ground 016",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_GrassGround_016.png"
      },
      {
            "id": "grass-001",
            "name": "Grass 001",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_Grass_001.png"
      },
      {
            "id": "grass-002",
            "name": "Grass 002",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_Grass_002.png"
      },
      {
            "id": "grass-003",
            "name": "Grass 003",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_Grass_003.png"
      },
      {
            "id": "grass-004",
            "name": "Grass 004",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_Grass_004.png"
      },
      {
            "id": "grass-005",
            "name": "Grass 005",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_Grass_005.png"
      },
      {
            "id": "grass-006",
            "name": "Grass 006",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_Grass_006.png"
      },
      {
            "id": "grass-007",
            "name": "Grass 007",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_Grass_007.png"
      },
      {
            "id": "grass-008",
            "name": "Grass 008",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_Grass_008.png"
      },
      {
            "id": "grass-009",
            "name": "Grass 009",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_Grass_009.png"
      },
      {
            "id": "grass-010",
            "name": "Grass 010",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_Grass_010.png"
      },
      {
            "id": "grass-011",
            "name": "Grass 011",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_Grass_011.png"
      },
      {
            "id": "grass-012",
            "name": "Grass 012",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_Grass_012.png"
      },
      {
            "id": "grass-013",
            "name": "Grass 013",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_Grass_013.png"
      },
      {
            "id": "grass-014",
            "name": "Grass 014",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_Grass_014.png"
      },
      {
            "id": "grass-015",
            "name": "Grass 015",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_Grass_015.png"
      },
      {
            "id": "grass-016",
            "name": "Grass 016",
            "category": "Terrain",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_Grass_016.png"
      },
      {
            "id": "high-grass-corner-001",
            "name": "High Grass Corner 001",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_HighGrassCorner_001.png"
      },
      {
            "id": "high-grass-corner-002",
            "name": "High Grass Corner 002",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_HighGrassCorner_002.png"
      },
      {
            "id": "high-grass-corner-003",
            "name": "High Grass Corner 003",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_HighGrassCorner_003.png"
      },
      {
            "id": "high-grass-corner-004",
            "name": "High Grass Corner 004",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_HighGrassCorner_004.png"
      },
      {
            "id": "high-grass-corner-005",
            "name": "High Grass Corner 005",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_HighGrassCorner_005.png"
      },
      {
            "id": "high-grass-corner-006",
            "name": "High Grass Corner 006",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_HighGrassCorner_006.png"
      },
      {
            "id": "high-grass-corner-007",
            "name": "High Grass Corner 007",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_HighGrassCorner_007.png"
      },
      {
            "id": "high-grass-corner-008",
            "name": "High Grass Corner 008",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_HighGrassCorner_008.png"
      },
      {
            "id": "high-grass-corner-009",
            "name": "High Grass Corner 009",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_HighGrassCorner_009.png"
      },
      {
            "id": "high-grass-corner-010",
            "name": "High Grass Corner 010",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_HighGrassCorner_010.png"
      },
      {
            "id": "high-grass-corner-011",
            "name": "High Grass Corner 011",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_HighGrassCorner_011.png"
      },
      {
            "id": "high-grass-corner-012",
            "name": "High Grass Corner 012",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_HighGrassCorner_012.png"
      },
      {
            "id": "high-grass-corner-013",
            "name": "High Grass Corner 013",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_HighGrassCorner_013.png"
      },
      {
            "id": "high-grass-corner-014",
            "name": "High Grass Corner 014",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_HighGrassCorner_014.png"
      },
      {
            "id": "high-grass-corner-015",
            "name": "High Grass Corner 015",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_HighGrassCorner_015.png"
      },
      {
            "id": "high-grass-corner-016",
            "name": "High Grass Corner 016",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprite_HighGrassCorner_016.png"
      },
      {
            "id": "sprout",
            "name": "Sprout",
            "category": "Nature",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/sprout.png"
      },
      {
            "id": "stairs-east",
            "name": "Stairs East",
            "category": "Structures",
            "layer": "ground",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/stairs_east.png"
      },
      {
            "id": "stairs-north",
            "name": "Stairs North",
            "category": "Structures",
            "layer": "ground",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/stairs_north.png"
      },
      {
            "id": "stairs-south",
            "name": "Stairs South",
            "category": "Structures",
            "layer": "ground",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/stairs_south.png"
      },
      {
            "id": "stump",
            "name": "Stump",
            "category": "Nature",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/stump.png",
            "collider": {
                  "enabled": true,
                  "x": 12,
                  "y": 16,
                  "w": 40,
                  "h": 40
            }
      },
      {
            "id": "tall-grass",
            "name": "Tall Grass",
            "category": "Nature",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/tallGrass.png"
      },
      {
            "id": "tomato",
            "name": "Tomato",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/tomato.png"
      },
      {
            "id": "tree-1",
            "name": "Tree 1",
            "category": "Nature",
            "layer": "solid",
            "gridW": 2,
            "gridH": 3,
            "src": "RPG-overworld-tileset/tree_1.png",
            "collider": {
                  "enabled": true,
                  "x": 40,
                  "y": 130,
                  "w": 48,
                  "h": 50
            }
      },
      {
            "id": "tree-2",
            "name": "Tree 2",
            "category": "Nature",
            "layer": "solid",
            "gridW": 2,
            "gridH": 3,
            "src": "RPG-overworld-tileset/tree_2.png",
            "collider": {
                  "enabled": true,
                  "x": 40,
                  "y": 130,
                  "w": 48,
                  "h": 50
            }
      },
      {
            "id": "turnip",
            "name": "Turnip",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/turnip.png"
      },
      {
            "id": "wheat",
            "name": "Wheat",
            "category": "Farming",
            "layer": "decor",
            "gridW": 1,
            "gridH": 1,
            "src": "RPG-overworld-tileset/wheat.png"
      },
      {
            "id": "invisible-collider",
            "name": "Invisible Wall (1x1 Full)",
            "category": "Colliders",
            "layer": "colliders",
            "isInvisibleAsset": true,
            "gridW": 1,
            "gridH": 1,
            "collider": {
                  "enabled": true,
                  "x": 0,
                  "y": 0,
                  "w": 64,
                  "h": 64
            }
      },
      {
            "id": "invisible-collider-top",
            "name": "Borda Superior (Top Edge)",
            "category": "Colliders",
            "layer": "colliders",
            "isInvisibleAsset": true,
            "gridW": 1,
            "gridH": 1,
            "collider": {
                  "enabled": true,
                  "x": 0,
                  "y": 0,
                  "w": 64,
                  "h": 20
            }
      },
      {
            "id": "invisible-collider-bottom",
            "name": "Borda Inferior (Bottom Edge)",
            "category": "Colliders",
            "layer": "colliders",
            "isInvisibleAsset": true,
            "gridW": 1,
            "gridH": 1,
            "collider": {
                  "enabled": true,
                  "x": 0,
                  "y": 44,
                  "w": 64,
                  "h": 20
            }
      },
      {
            "id": "invisible-collider-left",
            "name": "Borda Esquerda (Left Edge)",
            "category": "Colliders",
            "layer": "colliders",
            "isInvisibleAsset": true,
            "gridW": 1,
            "gridH": 1,
            "collider": {
                  "enabled": true,
                  "x": 0,
                  "y": 0,
                  "w": 20,
                  "h": 64
            }
      },
      {
            "id": "invisible-collider-right",
            "name": "Borda Direita (Right Edge)",
            "category": "Colliders",
            "layer": "colliders",
            "isInvisibleAsset": true,
            "gridW": 1,
            "gridH": 1,
            "collider": {
                  "enabled": true,
                  "x": 44,
                  "y": 0,
                  "w": 20,
                  "h": 64
            }
      },
      {
            "id": "invisible-collider-corner-tl",
            "name": "Canto L Superior Esquerdo (Top-Left L)",
            "category": "Colliders",
            "layer": "colliders",
            "isInvisibleAsset": true,
            "gridW": 1,
            "gridH": 1,
            "collider": {
                  "enabled": true,
                  "x": 0,
                  "y": 0,
                  "w": 64,
                  "h": 20,
                  "boxes": [
                    { "x": 0, "y": 0, "w": 64, "h": 20 },
                    { "x": 0, "y": 20, "w": 20, "h": 44 }
                  ]
            }
      },
      {
            "id": "invisible-collider-corner-tr",
            "name": "Canto L Superior Direito (Top-Right L)",
            "category": "Colliders",
            "layer": "colliders",
            "isInvisibleAsset": true,
            "gridW": 1,
            "gridH": 1,
            "collider": {
                  "enabled": true,
                  "x": 0,
                  "y": 0,
                  "w": 64,
                  "h": 20,
                  "boxes": [
                    { "x": 0, "y": 0, "w": 64, "h": 20 },
                    { "x": 44, "y": 20, "w": 20, "h": 44 }
                  ]
            }
      },
      {
            "id": "invisible-collider-corner-bl",
            "name": "Canto L Inferior Esquerdo (Bottom-Left L)",
            "category": "Colliders",
            "layer": "colliders",
            "isInvisibleAsset": true,
            "gridW": 1,
            "gridH": 1,
            "collider": {
                  "enabled": true,
                  "x": 0,
                  "y": 44,
                  "w": 64,
                  "h": 20,
                  "boxes": [
                    { "x": 0, "y": 44, "w": 64, "h": 20 },
                    { "x": 0, "y": 0, "w": 20, "h": 44 }
                  ]
            }
      },
      {
            "id": "invisible-collider-corner-br",
            "name": "Canto L Inferior Direito (Bottom-Right L)",
            "category": "Colliders",
            "layer": "colliders",
            "isInvisibleAsset": true,
            "gridW": 1,
            "gridH": 1,
            "collider": {
                  "enabled": true,
                  "x": 0,
                  "y": 44,
                  "w": 64,
                  "h": 20,
                  "boxes": [
                    { "x": 0, "y": 44, "w": 64, "h": 20 },
                    { "x": 44, "y": 0, "w": 20, "h": 44 }
                  ]
            }
      },
      {
            "id": "invisible-collider-2x2",
            "name": "Invisible Barrier (2x2)",
            "category": "Colliders",
            "layer": "colliders",
            "isInvisibleAsset": true,
            "gridW": 2,
            "gridH": 2,
            "collider": {
                  "enabled": true,
                  "x": 0,
                  "y": 0,
                  "w": 128,
                  "h": 128
            }
      },
      {
            "id": "character-geralt",
            "name": "Spawn do Jogador (Geralt)",
            "category": "Characters",
            "layer": "characters",
            "isCharacter": true,
            "characterType": "player",
            "scale": 1,
            "gridW": 1,
            "gridH": 1,
            "src": "Geralt/Idle/rotations/south.png",
            "collider": {
                  "enabled": true,
                  "x": 20,
                  "y": 46,
                  "w": 24,
                  "h": 16
            }
      },
      {
            "id": "char_wolf_hunter_m",
            "name": "Lobo Caçador (Ragnar)",
            "category": "Characters",
            "layer": "characters",
            "isCharacter": true,
            "characterType": "hero",
            "scale": 1,
            "gridW": 1,
            "gridH": 1,
            "src": "assets/characters/char_wolf_hunter_m/frames/wolf_hunter_r0_c0.png",
            "collider": {
                  "enabled": true,
                  "x": 18,
                  "y": 44,
                  "w": 28,
                  "h": 18
            }
      },
      {
            "id": "char_wolf_hunter_f",
            "name": "Lobo Caçadora (Lyra)",
            "category": "Characters",
            "layer": "characters",
            "isCharacter": true,
            "characterType": "hero",
            "scale": 1,
            "gridW": 1,
            "gridH": 1,
            "src": "assets/characters/char_wolf_hunter_f/frames/wolf_hunter_r0_c0.png",
            "collider": {
                  "enabled": true,
                  "x": 18,
                  "y": 44,
                  "w": 28,
                  "h": 18
            }
      },
      {
            "id": "char_bat_vampire_m",
            "name": "Morcego Vampiro (Vlad)",
            "category": "Characters",
            "layer": "characters",
            "isCharacter": true,
            "characterType": "hero",
            "scale": 1,
            "gridW": 1,
            "gridH": 1,
            "src": "assets/characters/char_bat_vampire_m/frames/wolf_hunter_r0_c0.png",
            "collider": {
                  "enabled": true,
                  "x": 18,
                  "y": 44,
                  "w": 28,
                  "h": 18
            }
      },
      {
            "id": "char_bat_vampire_f",
            "name": "Morcego Vampira (Carmilla)",
            "category": "Characters",
            "layer": "characters",
            "isCharacter": true,
            "characterType": "hero",
            "scale": 1,
            "gridW": 1,
            "gridH": 1,
            "src": "assets/characters/char_bat_vampire_f/frames/wolf_hunter_r0_c0.png",
            "collider": {
                  "enabled": true,
                  "x": 18,
                  "y": 44,
                  "w": 28,
                  "h": 18
            }
      },
      {
            "id": "char_eagle_archer_m",
            "name": "Águia Arqueiro (Zephyr)",
            "category": "Characters",
            "layer": "characters",
            "isCharacter": true,
            "characterType": "hero",
            "scale": 1,
            "gridW": 1,
            "gridH": 1,
            "src": "assets/characters/char_eagle_archer_m/frames/wolf_hunter_r0_c0.png",
            "collider": {
                  "enabled": true,
                  "x": 18,
                  "y": 44,
                  "w": 28,
                  "h": 18
            }
      },
      {
            "id": "char_eagle_archer_f",
            "name": "Águia Arqueira (Astra)",
            "category": "Characters",
            "layer": "characters",
            "isCharacter": true,
            "characterType": "hero",
            "scale": 1,
            "gridW": 1,
            "gridH": 1,
            "src": "assets/characters/char_eagle_archer_f/frames/wolf_hunter_r0_c0.png",
            "collider": {
                  "enabled": true,
                  "x": 18,
                  "y": 44,
                  "w": 28,
                  "h": 18
            }
      },
      {
            "id": "char_cat_mage_m",
            "name": "Gato Bruxo (Merlin)",
            "category": "Characters",
            "layer": "characters",
            "isCharacter": true,
            "characterType": "hero",
            "scale": 1,
            "gridW": 1,
            "gridH": 1,
            "src": "assets/characters/char_cat_mage_m/frames/wolf_hunter_r0_c0.png",
            "collider": {
                  "enabled": true,
                  "x": 18,
                  "y": 44,
                  "w": 28,
                  "h": 18
            }
      },
      {
            "id": "char_cat_witch_f",
            "name": "Gato Bruxa (Luna)",
            "category": "Characters",
            "layer": "characters",
            "isCharacter": true,
            "characterType": "hero",
            "scale": 1,
            "gridW": 1,
            "gridH": 1,
            "src": "assets/characters/char_cat_witch_f/frames/wolf_hunter_r0_c0.png",
            "collider": {
                  "enabled": true,
                  "x": 18,
                  "y": 44,
                  "w": 28,
                  "h": 18
            }
      },
      {
            "id": "npc_shark_surfer",
            "name": "Kai, o Tubarão das Ondas",
            "category": "Characters",
            "layer": "characters",
            "isCharacter": true,
            "characterType": "npc",
            "role": "Navegação, Pesca e Dragões Aquáticos",
            "scale": 1,
            "gridW": 1,
            "gridH": 1,
            "src": "assets/characters/char_wolf_hunter_m/frames/wolf_hunter_r0_c0.png",
            "collider": {
                  "enabled": true,
                  "x": 18,
                  "y": 44,
                  "w": 28,
                  "h": 18
            }
      },
      {
            "id": "npc_alligator_ferryman",
            "name": "Barnabé, o Barqueiro",
            "category": "Characters",
            "layer": "characters",
            "isCharacter": true,
            "characterType": "npc",
            "role": "Travessias, Balsas e Pontes",
            "scale": 1,
            "gridW": 1,
            "gridH": 1,
            "src": "assets/characters/char_wolf_hunter_f/frames/wolf_hunter_r0_c0.png",
            "collider": {
                  "enabled": true,
                  "x": 18,
                  "y": 44,
                  "w": 28,
                  "h": 18
            }
      },
      {
            "id": "npc_monkey_builder",
            "name": "Bambu, o Engenheiro",
            "category": "Characters",
            "layer": "characters",
            "isCharacter": true,
            "characterType": "npc",
            "role": "Workbench, Mobília e Casas",
            "scale": 1,
            "gridW": 1,
            "gridH": 1,
            "src": "assets/characters/char_eagle_archer_m/frames/wolf_hunter_r0_c0.png",
            "collider": {
                  "enabled": true,
                  "x": 18,
                  "y": 44,
                  "w": 28,
                  "h": 18
            }
      },
      {
            "id": "npc_chameleon_magician",
            "name": "Cromos, o Tecelão de Cores",
            "category": "Characters",
            "layer": "characters",
            "isCharacter": true,
            "characterType": "npc",
            "role": "Tinturas, Ilusões e Customização",
            "scale": 1,
            "gridW": 1,
            "gridH": 1,
            "src": "assets/characters/char_cat_witch_f/frames/wolf_hunter_r0_c0.png",
            "collider": {
                  "enabled": true,
                  "x": 18,
                  "y": 44,
                  "w": 28,
                  "h": 18
            }
      },
      {
            "id": "npc_owl_professor",
            "name": "Dr. Arquimedes",
            "category": "Characters",
            "layer": "characters",
            "isCharacter": true,
            "characterType": "npc",
            "role": "Mentor de Programação Blockly e Lua",
            "scale": 1,
            "gridW": 1,
            "gridH": 1,
            "src": "assets/characters/char_cat_mage_m/frames/wolf_hunter_r0_c0.png",
            "collider": {
                  "enabled": true,
                  "x": 18,
                  "y": 44,
                  "w": 28,
                  "h": 18
            }
      },
      {
            "id": "npc_bull_blacksmith",
            "name": "Brutus da Bigorna",
            "category": "Characters",
            "layer": "characters",
            "isCharacter": true,
            "characterType": "npc",
            "role": "Ferreiro, Ferramentas e Armaduras",
            "scale": 1,
            "gridW": 1,
            "gridH": 1,
            "src": "assets/characters/char_bat_vampire_m/frames/wolf_hunter_r0_c0.png",
            "collider": {
                  "enabled": true,
                  "x": 18,
                  "y": 44,
                  "w": 28,
                  "h": 18
            }
      },
      {
            "id": "npc_rabbit_farmer",
            "name": "Flora dos Brotos",
            "category": "Characters",
            "layer": "characters",
            "isCharacter": true,
            "characterType": "npc",
            "role": "Herbalista, Sementes e Ninhos",
            "scale": 1,
            "gridW": 1,
            "gridH": 1,
            "src": "assets/characters/char_eagle_archer_f/frames/wolf_hunter_r0_c0.png",
            "collider": {
                  "enabled": true,
                  "x": 18,
                  "y": 44,
                  "w": 28,
                  "h": 18
            }
      },
      {
            "id": "npc_turtle_elder",
            "name": "Mestre Casco",
            "category": "Characters",
            "layer": "characters",
            "isCharacter": true,
            "characterType": "npc",
            "role": "Guardião Ancestral e Dragão Mítico",
            "scale": 1,
            "gridW": 1,
            "gridH": 1,
            "src": "assets/characters/char_bat_vampire_f/frames/wolf_hunter_r0_c0.png",
            "collider": {
                  "enabled": true,
                  "x": 18,
                  "y": 44,
                  "w": 28,
                  "h": 18
            }
      },
      {
            "id": "npc_penguin_angler",
            "name": "Pingo dos Icebergs",
            "category": "Characters",
            "layer": "characters",
            "isCharacter": true,
            "characterType": "npc",
            "role": "Pesca Polar e Biomas Glaciais",
            "scale": 1,
            "gridW": 1,
            "gridH": 1,
            "src": "assets/characters/char_wolf_hunter_f/frames/wolf_hunter_r0_c0.png",
            "collider": {
                  "enabled": true,
                  "x": 18,
                  "y": 44,
                  "w": 28,
                  "h": 18
            }
      },
      {
            "id": "character-enemy-guard",
            "name": "Guarda Sentinela",
            "category": "Characters",
            "layer": "characters",
            "isCharacter": true,
            "characterType": "enemy",
            "scale": 1,
            "gridW": 1,
            "gridH": 1,
            "src": "Geralt/Idle/rotations/north.png",
            "collider": {
                  "enabled": true,
                  "x": 20,
                  "y": 46,
                  "w": 24,
                  "h": 16
            }
      }
    ];

    // Register 10 Dragons in Overworld Tiles (Category: 'Dragons')
    for (const dragon of DRAGON_CATALOG) {
      this.overworldTiles.push({
        id: dragon.id,
        name: dragon.name,
        category: 'Dragons',
        layer: 'characters',
        isCharacter: true,
        isDragon: true,
        characterType: 'dragon',
        dragonData: dragon,
        src: generateDragonSVG(dragon),
        gridW: 1,
        gridH: 1,
        collider: {
          enabled: true,
          x: 16,
          y: 36,
          w: 32,
          h: 22
        }
      });
    }

    // Register Dragon Nests, Incubator & Eggs in Overworld Tiles (Category: 'Dragons')
    const dragonNests = [
      { id: 'struct_dragon_nest_solar', name: 'Ninho Solar da Aurora', eggType: 'dragon_fly_solar', eggName: 'Ovo Solar da Aurora', eggIcon: 'solar', color: '#fbbf24', twig: '#854d0e' },
      { id: 'struct_dragon_nest_magma', name: 'Ninho Vulcânico de Obsidiana', eggType: 'dragon_land_magma', eggName: 'Ovo de Magma Ardente', eggIcon: 'magma', color: '#ef4444', twig: '#451a03' },
      { id: 'struct_dragon_nest_frost', name: 'Ninho Glacial dos Recifes', eggType: 'dragon_water_frost', eggName: 'Ovo Glacial dos Icebergs', eggIcon: 'frost', color: '#38bdf8', twig: '#0284c7' },
      { id: 'struct_dragon_nest_forest', name: 'Ninho Silvestre de Musgo', eggType: 'dragon_land_forest', eggName: 'Ovo da Floresta', eggIcon: 'flora', color: '#10b981', twig: '#15803d' },
      { id: 'struct_dragon_nest_generic', name: 'Ninho de Gravetos Rústico', eggType: 'dragon_fly_zephyr', eggName: 'Ovo dos Ventos', eggIcon: 'zephyr', color: '#fef08a', twig: '#78350f' }
    ];

    for (const nest of dragonNests) {
      this.overworldTiles.push({
        id: nest.id,
        name: nest.name,
        category: 'Dragons',
        layer: 'decor',
        isNest: true,
        eggType: nest.eggType,
        eggName: nest.eggName,
        eggIcon: nest.eggIcon,
        src: generateNestSVG(nest.color, nest.twig),
        gridW: 1,
        gridH: 1,
        collider: {
          enabled: true,
          x: 12,
          y: 36,
          w: 40,
          h: 22
        }
      });
    }

    // Incubadora Térmica de Ovos
    this.overworldTiles.push({
      id: 'struct_egg_incubator',
      name: 'Incubadora Térmica de Ovos',
      category: 'Dragons',
      layer: 'decor',
      isIncubator: true,
      src: generateIncubatorSVG(),
      gridW: 1,
      gridH: 1,
      collider: {
        enabled: true,
        x: 14,
        y: 38,
        w: 36,
        h: 22
      }
    });

    // Ovos Avulsos de Dragão
    const dragonEggs = [
      { id: 'item_dragon_egg_solar', name: 'Ovo Solar da Aurora', eggType: 'dragon_fly_solar', color: '#fbbf24', spot: '#f97316' },
      { id: 'item_dragon_egg_magma', name: 'Ovo de Magma Ardente', eggType: 'dragon_land_magma', color: '#ef4444', spot: '#7f1d1d' },
      { id: 'item_dragon_egg_frost', name: 'Ovo Glacial dos Icebergs', eggType: 'dragon_water_frost', color: '#38bdf8', spot: '#0284c7' },
      { id: 'item_dragon_egg_lunar', name: 'Ovo Mítico da Lua', eggType: 'dragon_mythic_lua', color: '#e0e7ff', spot: '#fbbf24' }
    ];

    for (const egg of dragonEggs) {
      this.overworldTiles.push({
        id: egg.id,
        name: egg.name,
        category: 'Dragons',
        layer: 'decor',
        isEgg: true,
        eggType: egg.eggType,
        src: generateEggSVG(egg.color, egg.spot),
        gridW: 1,
        gridH: 1,
        collider: {
          enabled: true,
          x: 20,
          y: 38,
          w: 24,
          h: 18
        }
      });
    }

    // Register Playable Heroes in Overworld Tiles (Category: 'Characters')
    if (Array.isArray(PLAYABLE_HEROES)) {
      for (const hero of PLAYABLE_HEROES) {
        this.overworldTiles.push({
          id: hero.id,
          name: hero.name,
          category: 'Characters',
          layer: 'characters',
          isCharacter: true,
          characterType: 'hero',
          heroData: hero,
          src: `assets/characters/${hero.id}/frames/wolf_hunter_r0_c0.png`,
          gridW: 1,
          gridH: 1,
          collider: {
            enabled: true,
            x: 18,
            y: 44,
            w: 28,
            h: 18
          }
        });
      }
    }

    // Register Training Targets in Overworld Tiles (Category: 'Characters')
    this.overworldTiles.push({
      id: 'training_dummy_straw',
      name: 'Espantalho de Treino',
      category: 'Characters',
      layer: 'characters',
      isCharacter: true,
      characterType: 'enemy',
      src: generateDummySVG(),
      gridW: 1,
      gridH: 1,
      collider: {
        enabled: true,
        x: 18,
        y: 40,
        w: 28,
        h: 20
      }
    });

    // Load custom colliders, scales & depth offsets from localStorage if user modified them
    this.COLLIDER_STORAGE_KEY = 'kidslean_rpg_custom_colliders_v1';
    this.SCALE_STORAGE_KEY = 'kidslean_rpg_custom_scales_v1';
    this.DEPTH_STORAGE_KEY = 'kidslean_rpg_custom_depth_offsets_v1';
    this.loadCustomColliders();
    this.loadCustomScales();
    this.loadCustomDepthOffsets();

    // Geralt Sprite rotations
    this.directions = [
      'south',
      'south-east',
      'east',
      'north-east',
      'north',
      'north-west',
      'west',
      'south-west'
    ];
  }

  async syncWithStorage(storageManager) {
    if (!storageManager) return;
    this.storageManager = storageManager;

    const [depths, scales, colliders] = await Promise.all([
      storageManager.loadAssetOverrides('depth'),
      storageManager.loadAssetOverrides('scale'),
      storageManager.loadAssetOverrides('collider')
    ]);

    if (depths) {
      for (const tile of this.overworldTiles) {
        if (depths[tile.id] !== undefined) tile.depthOffset = depths[tile.id];
      }
    }

    if (scales) {
      for (const tile of this.overworldTiles) {
        if (scales[tile.id] !== undefined) tile.scale = scales[tile.id];
      }
    }

    if (colliders) {
      for (const tile of this.overworldTiles) {
        if (colliders[tile.id]) tile.collider = colliders[tile.id];
      }
    }
  }

  loadCustomDepthOffsets() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      const saved = localStorage.getItem(this.DEPTH_STORAGE_KEY);
      if (saved) {
        const customDepths = JSON.parse(saved);
        for (const tile of this.overworldTiles) {
          if (customDepths[tile.id] !== undefined) {
            tile.depthOffset = customDepths[tile.id];
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load custom depth offsets:', e);
    }
  }

  saveCustomDepthOffsets() {
    try {
      const customDepths = {};
      for (const tile of this.overworldTiles) {
        if (tile.depthOffset !== undefined) {
          customDepths[tile.id] = tile.depthOffset;
        }
      }
      if (this.storageManager) {
        this.storageManager.saveAssetOverrides('depth', customDepths);
      }
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(this.DEPTH_STORAGE_KEY, JSON.stringify(customDepths));
      }
    } catch (e) {
      console.warn('Failed to save custom depth offsets:', e);
    }
  }

  setTileDepthOffset(tileId, depthOffset) {
    const tile = this.getTileMetadata(tileId);
    if (tile) {
      tile.depthOffset = Math.max(0, Math.min(1.0, depthOffset));
      this.saveCustomDepthOffsets();
    }
  }

  loadCustomScales() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      const saved = localStorage.getItem(this.SCALE_STORAGE_KEY);
      if (saved) {
        const customScales = JSON.parse(saved);
        for (const tile of this.overworldTiles) {
          if (customScales[tile.id] !== undefined) {
            tile.scale = customScales[tile.id];
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load custom scales:', e);
    }
  }

  saveCustomScales() {
    try {
      const customScales = {};
      for (const tile of this.overworldTiles) {
        if (tile.scale !== undefined) {
          customScales[tile.id] = tile.scale;
        }
      }
      if (this.storageManager) {
        this.storageManager.saveAssetOverrides('scale', customScales);
      }
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(this.SCALE_STORAGE_KEY, JSON.stringify(customScales));
      }
    } catch (e) {
      console.warn('Failed to save custom scales:', e);
    }
  }

  setCharacterScale(tileId, scale) {
    const tile = this.getTileMetadata(tileId);
    if (tile) {
      tile.scale = Math.max(0.2, Math.min(5.0, scale));
      this.saveCustomScales();
    }
  }

  loadCustomColliders() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      const saved = localStorage.getItem(this.COLLIDER_STORAGE_KEY);
      if (saved) {
        const customColliders = JSON.parse(saved);
        for (const tile of this.overworldTiles) {
          if (customColliders[tile.id]) {
            tile.collider = customColliders[tile.id];
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load custom colliders:', e);
    }
  }

  saveCustomColliders() {
    try {
      const customColliders = {};
      for (const tile of this.overworldTiles) {
        if (tile.collider) {
          customColliders[tile.id] = tile.collider;
        }
      }
      if (this.storageManager) {
        this.storageManager.saveAssetOverrides('collider', customColliders);
      }
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(this.COLLIDER_STORAGE_KEY, JSON.stringify(customColliders));
      }
    } catch (e) {
      console.warn('Failed to save custom colliders:', e);
    }
  }

  setTileCollider(tileId, collider) {
    const tile = this.getTileMetadata(tileId);
    if (tile) {
      tile.collider = collider;
      this.saveCustomColliders();
    }
  }

  generateInvisibleColliderPreview(tile = {}) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // 1. Dark blueprint background representing the grid cell
    ctx.fillStyle = '#090c12';
    ctx.fillRect(0, 0, 64, 64);

    // Subtle cell border
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, 63, 63);

    // Subtle inner grid guide (dashed cross at center)
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.5)';
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(32, 0); ctx.lineTo(32, 64);
    ctx.moveTo(0, 32); ctx.lineTo(64, 32);
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. Render exact collision boxes as on the map
    const col = tile?.collider;
    const gridW = tile?.gridW || 1;
    const gridH = tile?.gridH || 1;
    const totalW = gridW * 64;
    const totalH = gridH * 64;
    const scale = 64 / Math.max(totalW, totalH);

    const boxesToRender = (col && Array.isArray(col.boxes) && col.boxes.length > 0)
      ? col.boxes
      : [{ x: col?.x || 0, y: col?.y || 0, w: col?.w || totalW, h: col?.h || totalH }];

    for (const b of boxesToRender) {
      const bx = (b.x || 0) * scale;
      const by = (b.y || 0) * scale;
      const bw = (b.w || totalW) * scale;
      const bh = (b.h || totalH) * scale;

      // Semi-transparent red fill
      ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.fillRect(bx, by, bw, bh);

      // Red border
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bx + 0.5, by + 0.5, Math.max(1, bw - 1), Math.max(1, bh - 1));

      // Diagonal stripes inside the collision box (identical to map rendering)
      ctx.save();
      ctx.beginPath();
      ctx.rect(bx, by, bw, bh);
      ctx.clip();

      ctx.strokeStyle = 'rgba(239, 68, 68, 0.65)';
      ctx.lineWidth = 2;
      for (let offset = -bh; offset < bw + bh; offset += 8) {
        ctx.beginPath();
        ctx.moveTo(bx + Math.max(0, offset), by + Math.max(0, -offset));
        ctx.lineTo(bx + Math.min(bw, offset + bh), by + Math.min(bh, bh - (offset + bh - bw)));
        ctx.stroke();
      }
      ctx.restore();
    }

    // 3. Identification label for the barrier type
    let tag = '';
    const id = tile?.id || '';
    if (id.includes('top')) tag = 'TOP';
    else if (id.includes('bottom')) tag = 'BOT';
    else if (id.includes('left')) tag = 'LEFT';
    else if (id.includes('right')) tag = 'RIGHT';
    else if (id.includes('corner-tl')) tag = 'L-TL';
    else if (id.includes('corner-tr')) tag = 'L-TR';
    else if (id.includes('corner-bl')) tag = 'L-BL';
    else if (id.includes('corner-br')) tag = 'L-BR';
    else if (id.includes('2x2')) tag = '2x2';
    else tag = 'FULL';

    // Badge background pill
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1;
    const tagW = Math.max(26, tag.length * 7 + 8);
    const tagH = 14;
    const tagX = 32 - tagW / 2;
    const tagY = 32 - tagH / 2;
    ctx.fillRect(tagX, tagY, tagW, tagH);
    ctx.strokeRect(tagX, tagY, tagW, tagH);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tag, 32, 32);

    return canvas.toDataURL();
  }

  async scanFolderForAssets() {
    const discoveredPaths = new Set();

    // 1. Try fetching assets-manifest.json
    try {
      const response = await fetch(`assets-manifest.json?t=${Date.now()}`);
      if (response.ok) {
        const list = await response.json();
        if (Array.isArray(list)) {
          list.forEach((p) => {
            if (p.toLowerCase().endsWith('.png')) {
              const fullPath = p.startsWith('RPG-overworld-tileset/') ? p : `RPG-overworld-tileset/${p}`;
              discoveredPaths.add(fullPath);
            }
          });
        }
      }
    } catch (e) {
      // Ignore
    }

    // 2. Try fetching directory listing if served by web server
    try {
      const response = await fetch(`RPG-overworld-tileset/?t=${Date.now()}`);
      if (response.ok) {
        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const links = Array.from(doc.querySelectorAll('a'))
          .map((a) => a.getAttribute('href'))
          .filter((href) => href && href.toLowerCase().endsWith('.png') && !href.startsWith('.'));

        for (const link of links) {
          const cleanName = decodeURIComponent(link.split('/').pop());
          discoveredPaths.add(`RPG-overworld-tileset/${cleanName}`);
        }
      }
    } catch (e) {
      // Ignore
    }

    return Array.from(discoveredPaths);
  }

  async refreshAssets(onProgress = () => {}) {
    const filePaths = await this.scanFolderForAssets();
    let newlyAddedCount = 0;

    const promises = filePaths.map((path) => {
      if (path.includes('spritesheet-full.png')) return Promise.resolve(null);

      const existing = this.overworldTiles.find(
        (t) => t.src === path || (t.frames && t.frames.includes(path))
      );

      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          this.images.set(path, img);

          if (!existing) {
            // Auto-register new asset dynamically
            const fileName = path.split('/').pop().replace(/\.png$/i, '');
            const id = fileName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            
            // Derive clean title
            const name = fileName
              .replace(/[-_]+/g, ' ')
              .replace(/\b\w/g, (c) => c.toUpperCase());

            // Determine category
            let category = 'Terrain';
            const lower = fileName.toLowerCase();
            if (lower.includes('water')) category = 'Water';
            else if (lower.includes('tree') || lower.includes('bush') || lower.includes('flower') || lower.includes('mushroom') || lower.includes('rock') || lower.includes('nature') || lower.includes('plant')) category = 'Nature';
            else if (lower.includes('house') || lower.includes('crate') || lower.includes('barrel') || lower.includes('ladder') || lower.includes('bridge') || lower.includes('wall') || lower.includes('structure') || lower.includes('fence')) category = 'Structures';
            else if (lower.includes('corn') || lower.includes('cabbage') || lower.includes('pumpkin') || lower.includes('seedbag') || lower.includes('tomato') || lower.includes('turnip') || lower.includes('wheat') || lower.includes('haybale') || lower.includes('farm')) category = 'Farming';
            else if (lower.includes('geralt') || lower.includes('player') || lower.includes('npc') || lower.includes('character')) category = 'Characters';

            // Calculate grid dimension cleanly based on image resolution (64px grid)
            const gridW = Math.max(1, Math.round(img.width / 64));
            const gridH = Math.max(1, Math.round(img.height / 64));

            const newTileMeta = {
              id: id || `tile-${Date.now()}-${Math.floor(Math.random()*1000)}`,
              name,
              category,
              layer: (category === 'Terrain' || category === 'Water') ? 'ground' : (category === 'Structures' ? 'solid' : 'decor'),
              gridW,
              gridH,
              src: path,
              collider: {
                enabled: (category === 'Structures'),
                x: 0,
                y: 0,
                w: gridW * 64,
                h: gridH * 64
              }
            };

            this.overworldTiles.push(newTileMeta);
            newlyAddedCount++;
          }

          resolve(img);
        };

        img.onerror = () => resolve(null);
        img.src = `${path}?t=${Date.now()}`;
      });
    });

    await Promise.all(promises);
    this.loadCustomColliders();
    return newlyAddedCount;
  }

  async loadAll(onProgress = () => {}) {
    const urlsToLoad = [];

    for (const tile of this.overworldTiles) {
      if (tile.isInvisibleAsset && !tile.src) {
        tile.src = this.generateInvisibleColliderPreview(tile);
      }
    }

    // Preload Playable Hero Characters (Portraits & 4-Way Animated Frames)
    const heroIds = [
      'char_wolf_hunter_m', 'char_wolf_hunter_f',
      'char_bat_vampire_m', 'char_bat_vampire_f',
      'char_eagle_archer_m', 'char_eagle_archer_f',
      'char_cat_mage_m', 'char_cat_witch_f'
    ];

    for (const hId of heroIds) {
      urlsToLoad.push(`assets/characters/${hId}/portrait.jpg`);
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 8; c++) {
          urlsToLoad.push(`assets/characters/${hId}/frames/wolf_hunter_r${r}_c${c}.png`);
        }
      }
    }

    // Legacy Geralt Fallback Sprites
    if (this.directions) {
      for (const dir of this.directions) {
        urlsToLoad.push(`Geralt/Idle/rotations/${dir}.png`);
        urlsToLoad.push(`Geralt/running/rotations/${dir}.png`);
      }
    }

    // Tiles
    for (const tile of this.overworldTiles) {
      if (tile.isAnimated && tile.frames) {
        for (const frame of tile.frames) {
          urlsToLoad.push(frame);
        }
      } else if (tile.src && !tile.src.startsWith('data:')) {
        urlsToLoad.push(tile.src);
      }
    }

    let loadedCount = 0;
    const total = Math.max(1, urlsToLoad.length);

    const promises = urlsToLoad.map((url) => {
      return new Promise((resolve) => {
        if (this.images.has(url)) {
          loadedCount++;
          onProgress(loadedCount / total);
          return resolve(this.images.get(url));
        }

        const img = new Image();
        let settled = false;

        const finish = (result) => {
          if (settled) return;
          settled = true;
          loadedCount++;
          onProgress(loadedCount / total);
          resolve(result);
        };

        // 400ms timeout safety per image so loader never gets stuck
        const timer = setTimeout(() => {
          finish(null);
        }, 400);

        img.onload = () => {
          clearTimeout(timer);
          this.images.set(url, img);
          finish(img);
        };

        img.onerror = () => {
          clearTimeout(timer);
          finish(null);
        };

        img.src = url;
      });
    });

    await Promise.all(promises);
    this.loaded = true;
  }

  getImage(path) {
    if (!path) return null;
    let img = this.images.get(path);
    if (!img && path.startsWith('data:image/')) {
      img = new Image();
      img.src = path;
      this.images.set(path, img);
    }
    return img;
  }

  getTileMetadata(tileId) {
    return this.overworldTiles.find((t) => t.id === tileId);
  }
}
