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
            "layer": "solid",
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
            "layer": "solid",
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
            "layer": "solid",
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
            "layer": "solid",
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
            "layer": "solid",
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
            "layer": "solid",
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
            "layer": "solid",
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
            "layer": "solid",
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
            "layer": "solid",
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
            "layer": "solid",
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
            "name": "Geralt (Player Spawn)",
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
            "id": "character-npc-villager",
            "name": "NPC Villager",
            "category": "Characters",
            "layer": "characters",
            "isCharacter": true,
            "characterType": "npc",
            "scale": 1,
            "gridW": 1,
            "gridH": 1,
            "src": "Geralt/Idle/rotations/south-east.png",
            "collider": {
                  "enabled": true,
                  "x": 20,
                  "y": 46,
                  "w": 24,
                  "h": 16
            }
      },
      {
            "id": "character-enemy-guard",
            "name": "Enemy Guard",
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
      if (typeof window === 'undefined' || !window.localStorage) return;
      const customDepths = {};
      for (const tile of this.overworldTiles) {
        if (tile.depthOffset !== undefined) {
          customDepths[tile.id] = tile.depthOffset;
        }
      }
      localStorage.setItem(this.DEPTH_STORAGE_KEY, JSON.stringify(customDepths));
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
      if (typeof window === 'undefined' || !window.localStorage) return;
      const customScales = {};
      for (const tile of this.overworldTiles) {
        if (tile.scale !== undefined) {
          customScales[tile.id] = tile.scale;
        }
      }
      localStorage.setItem(this.SCALE_STORAGE_KEY, JSON.stringify(customScales));
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
      if (typeof window === 'undefined' || !window.localStorage) return;
      const customColliders = {};
      for (const tile of this.overworldTiles) {
        if (tile.collider) {
          customColliders[tile.id] = tile.collider;
        }
      }
      localStorage.setItem(this.COLLIDER_STORAGE_KEY, JSON.stringify(customColliders));
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

  generateInvisibleColliderPreview(gridW = 1, gridH = 1) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 64, 64);
    grad.addColorStop(0, 'rgba(239, 68, 68, 0.25)');
    grad.addColorStop(1, 'rgba(185, 28, 28, 0.45)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
    ctx.lineWidth = 4;
    for (let i = -64; i < 128; i += 16) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 64, 64);
      ctx.stroke();
    }

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, 62, 62);

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(32, 32, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${gridW}x${gridH}`, 32, 32);

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
    for (const tile of this.overworldTiles) {
      if (tile.isInvisibleAsset && !tile.src) {
        tile.src = this.generateInvisibleColliderPreview(tile.gridW || 1, tile.gridH || 1);
      }
    }

    const urlsToLoad = [];

    // Preload Wolf Hunter Hero frames (8 cols x 4 rows)
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 8; c++) {
        urlsToLoad.push(`assets/characters/char_wolf_hunter_m/frames/wolf_hunter_r${r}_c${c}.png`);
      }
    }
    urlsToLoad.push(`assets/characters/char_wolf_hunter_m/portrait.jpg`);

    // Geralt Legacy Idle & Running (fallback)
    for (const dir of this.directions) {
      urlsToLoad.push(`Geralt/Idle/rotations/${dir}.png`);
      urlsToLoad.push(`Geralt/running/rotations/${dir}.png`);
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
    const total = urlsToLoad.length;

    const promises = urlsToLoad.map((url) => {
      return new Promise((resolve) => {
        if (this.images.has(url)) {
          loadedCount++;
          onProgress(loadedCount / total);
          return resolve(this.images.get(url));
        }

        const img = new Image();
        img.onload = () => {
          this.images.set(url, img);
          loadedCount++;
          onProgress(loadedCount / total);
          resolve(img);
        };
        img.onerror = () => {
          console.warn(`Failed to load image: ${url}`);
          loadedCount++;
          onProgress(loadedCount / total);
          resolve(null);
        };
        img.src = url;
      });
    });

    await Promise.all(promises);
    this.loaded = true;
  }

  getImage(path) {
    return this.images.get(path);
  }

  getTileMetadata(tileId) {
    return this.overworldTiles.find((t) => t.id === tileId);
  }
}
