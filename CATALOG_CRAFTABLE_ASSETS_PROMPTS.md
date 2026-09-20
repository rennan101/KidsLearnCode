# 🎨 Catálogo de Objetos, Tiles, Ferramentas e Prompts de Geração (Craftables & Unlocks)

> **Documento de Especificação de Assets Criáveis / Desbloqueáveis**  
> **Estilo Visual Padrão:** *2D Top-Down / 3/4 Perspective RPG Pixel Art, medieval fantasy lúdico, cores vibrantes, alto contraste, contornos nítidos, fundo transparente (PNG), alinhamento em grid modular (64x64px ou múltiplos).*

---

## 📋 Sumário de Categorias

1. [🛠️ Categoria 1: Ferramentas do Jogador (`tool_*`)](#1-🛠️-categoria-1-ferramentas-do-jogador-tool_)
2. [🧱 Categoria 2: Padrões de Chão e Pisos (`tile_ground_*`)](#2-🧱-categoria-2-padrões-de-chão-e-pisos-tile_ground_)
3. [🪑 Categoria 3: Workbench — Mobília e Habitação (`prop_furniture_*`)](#3-🪑-categoria-3-workbench--mobília-e-habitação-prop_furniture_)
4. [🌉 Categoria 4: Workbench — Estruturas e Conexões (`struct_*`)](#4-🌉-categoria-4-workbench--estruturas-e-conexões-struct_)
5. [🌱 Categoria 5: Sementes, Flora e Recursos Naturais (`seed_*` / `nature_*`)](#5-🌱-categoria-5-sementes-flora-e-recursos-naturais-seed_--nature_)
6. [🔥 Categoria 6: Padrões Animados e Efeitos (`tile_animated_*`)](#6-🔥-categoria-6-padrões-animados-e-efeitos-tile_animated_)
7. [🥚 Categoria 7: Ovos e Itens de Dragões (`dragon_item_*`)](#7-🥚-categoria-7-ovos-e-itens-de-dragões-dragon_item_)

---

## 1. 🛠️ Categoria 1: Ferramentas do Jogador (`tool_*`)

| ID | Nome do Item | Dimensões | Descrição | Prompt de Geração de Imagem |
| :--- | :--- | :---: | :--- | :--- |
| `tool_shovel_iron` | **Pá de Ferro Rústica** | 64x64 px | Usada para cavar buracos no chão, desenterrar ovos de dragão e preparar solo. | `2D top-down RPG inventory icon, rustic iron shovel with wooden handle, sharp metallic spade head, medieval fantasy tool, clean pixel art style, vibrant colors, crisp outline, isolated on transparent background, 64x64 px` |
| `tool_axe_woodcutter` | **Machado de Lenhador** | 64x64 px | Usado para cortar árvores, recolher madeira e abrir caminhos na floresta. | `2D top-down RPG inventory icon, medieval woodcutter axe, forged steel blade with leather-wrapped wooden handle, clean stylized pixel art, high contrast, vibrant fantasy, isolated on transparent background, 64x64 px` |
| `tool_fishing_rod` | **Vara de Pescar de Bambu** | 64x64 px | Usada para pescar peixes em rios, lagos e no mar da ilha. | `2D top-down RPG inventory icon, flexible bamboo fishing rod with bobber and fine silk line, medieval cute fishing gear, colorful pixel art style, crisp edges, isolated on transparent background, 64x64 px` |
| `tool_pickaxe_miner` | **Picareta de Mineração** | 64x64 px | Usada para quebrar pedras grandes, abrir fendas em penhascos e coletar minérios. | `2D top-down RPG inventory icon, sturdy dwarven miner pickaxe, heavy iron dual-pick head with polished wooden grip, stylized pixel art, sharp details, isolated on transparent background, 64x64 px` |
| `tool_watering_can` | **Regador de Cobre** | 64x64 px | Usado para regar canteiros de sementes e acelerar o crescimento de mudas. | `2D top-down RPG inventory icon, vintage copper watering can with small droplets spout, cute cozy medieval farm tool, vibrant pixel art, crisp outline, isolated on transparent background, 64x64 px` |
| `tool_bug_net` | **Rede de Captura** | 64x64 px | Usada para capturar insetos mágicos e pequenos animais na ilha. | `2D top-down RPG inventory icon, woven mesh bug net with slender light-wood frame, Animal Crossing inspired medieval style, colorful pixel art, isolated on transparent background, 64x64 px` |

---

## 2. 🧱 Categoria 2: Padrões de Chão e Pisos (`tile_ground_*`)

| ID | Nome do Tile | Dimensões | Descrição | Prompt de Geração de Imagem |
| :--- | :--- | :---: | :--- | :--- |
| `tile_ground_cobblestone` | **Caminho de Paralelepípedo** | 64x64 px (Seamless) | Pavimento rústico de pedras cinzentas encaixadas com pequenos tufos de musgo. | `2D top-down RPG seamless floor tile, rustic medieval cobblestone path, gray stones with tiny green moss patches in crevices, seamless repeating texture, clean pixel art, vibrant lighting, top-down view, 64x64 px` |
| `tile_ground_dirt_track` | **Trilha de Terra Batida** | 64x64 px (Seamless) | Terra avermelhada/dourada com pequenas pedrinhas, ideal para estradas rurais. | `2D top-down RPG seamless terrain tile, packed dirt trail with subtle gravel pebbles, warm brown earth tones, seamless tiling, cozy medieval fantasy, crisp pixel art, top-down view, 64x64 px` |
| `tile_ground_wood_planks` | **Tabuado de Madeira Rústica** | 64x64 px (Seamless) | Piso de tábuas de carvalho encaixadas com pregos de ferro, para vilas e decks. | `2D top-down RPG seamless floor tile, horizontal wooden oak planks with rustic iron nails, warm amber wood texture, seamless repeating, clean pixel art style, top-down view, 64x64 px` |
| `tile_ground_flower_grass` | **Grama Florida Silvestre** | 64x64 px (Seamless) | Grama verde vibrante pontilhada com pequenas flores amarelas, azuis e vermelhas. | `2D top-down RPG seamless ground tile, lush vibrant green grass with scattered cute tiny blue, yellow and red wild flowers, seamless pattern, whimsical cozy fantasy pixel art, top-down view, 64x64 px` |
| `tile_ground_sand_beach` | **Areia Dourada de Praia** | 64x64 px (Seamless) | Areia fina dourada com pequenos detalhes de conchas para margens e praias. | `2D top-down RPG seamless terrain tile, warm golden beach sand with subtle tiny sea shells and wind ripples, seamless repeating, bright cozy pixel art, top-down view, 64x64 px` |
| `tile_ground_stone_mosaic` | **Mosaico Real de Pedra** | 64x64 px (Seamless) | Ladrilhos nobres geométricos em tons de azul e pedra polida para praças e castelos. | `2D top-down RPG seamless decorative floor tile, royal medieval stone mosaic with geometric pattern, blue slate and polished marble, seamless repeating, elegant fantasy pixel art, top-down view, 64x64 px` |

---

## 3. 🪑 Categoria 3: Workbench — Mobília e Habitação (`prop_furniture_*`)

| ID | Nome do Prop | Dimensões | Descrição | Prompt de Geração de Imagem |
| :--- | :--- | :---: | :--- | :--- |
| `prop_chair_wood` | **Cadeira de Madeira Rústica** | 64x64 px | Cadeira simples de carvalho com encosto reto e almofada vermelha. | `2D top-down 3/4 perspective RPG prop, cozy rustic wooden dining chair with soft red cushion, warm oak wood, clean pixel art, vibrant colors, crisp outline, isolated on transparent background, 64x64 px` |
| `prop_table_crafting` | **Mesa de Trabalho / Estudos** | 64x64 px | Mesa de madeira maciça com pergaminho aberto e vela acesa em cima. | `2D top-down 3/4 perspective RPG prop, sturdy wooden crafting desk with open parchment map, ink bottle and burning candle, medieval fantasy study, clean pixel art, isolated on transparent background, 64x64 px` |
| `prop_bed_straw` | **Cama Rústica de Palha e Peles** | 64x128 px (1x2) | Cama de aventureiro inicial feita com estrado de madeira, palha macia e pele de urso. | `2D top-down 3/4 perspective RPG prop, medieval adventurer straw bed with cozy fur blanket and linen pillow, rustic wooden frame, clean stylized pixel art, isolated on transparent background, 64x128 px` |
| `prop_bed_canopy` | **Cama Real com Dossel** | 128x128 px (2x2) | Cama nobre espaçosa com quatro colunas de madeira entalhada e cortinas de veludo azul. | `2D top-down 3/4 perspective RPG prop, royal medieval four-poster canopy bed with rich blue velvet curtains and gold trims, detailed pixel art, isolated on transparent background, 128x128 px` |
| `prop_tent_adventurer` | **Tenda de Acampamento** | 128x128 px (2x2) | Tenda de lona crua reforçada com cordas, estacas e entrada com cortina aberta. | `2D top-down 3/4 perspective RPG building prop, medieval adventurer canvas tent with wooden support poles and entrance flap, cozy campsite style, crisp pixel art, isolated on transparent background, 128x128 px` |
| `prop_house_cottage` | **Casa Pequena de Enxaimel** | 256x256 px (4x4) | Casa medieval aconchegante com paredes brancas de estuque, vigas de madeira e telhado de telhas vermelhas. | `2D top-down 3/4 perspective RPG building sprite, cozy medieval half-timbered cottage with red clay tile roof, stone chimney, wooden door and flower window boxes, high quality pixel art, isolated on transparent background, 256x256 px` |

---

## 4. 🌉 Categoria 4: Workbench — Estruturas e Conexões (`struct_*`)

| ID | Nome da Estrutura | Dimensões | Descrição | Prompt de Geração de Imagem |
| :--- | :--- | :---: | :--- | :--- |
| `struct_bridge_wood_horiz` | **Ponte de Madeira (Horizontal)** | 128x64 px (2x1) | Ponte de tábuas de madeira com corrimão de corda e estacas para cruzar rios. | `2D top-down 3/4 perspective RPG structure, horizontal wooden plank bridge over water, rope railings and sturdy log pilings, medieval fantasy style, crisp pixel art, isolated on transparent background, 128x64 px` |
| `struct_bridge_wood_vert` | **Ponte de Madeira (Vertical)** | 64x128 px (1x2) | Versão vertical da ponte de madeira para transposição norte-sul de rios. | `2D top-down 3/4 perspective RPG structure, vertical wooden plank footbridge with rope side-railings, clean fantasy pixel art, isolated on transparent background, 64x128 px` |
| `struct_ramp_stone` | **Rampa de Pedra / Acesso** | 64x128 px (1x2) | Rampa de subida em pedra talhada para conectar desníveis e colinas. | `2D top-down 3/4 perspective RPG tile, gentle stone ramp incline connecting terrain elevations, carved stone steps with smooth path, medieval pixel art, isolated on transparent background, 64x128 px` |
| `struct_stairs_wood` | **Escada de Madeira Nobre** | 64x64 px | Lance de escada de madeira para transição suave de andares e terraços. | `2D top-down 3/4 perspective RPG tile, modular wooden stairs leading upwards, oak steps with side balustrades, clean pixel art style, isolated on transparent background, 64x64 px` |
| `struct_fence_wood_segment` | **Cerca de Madeira Rústica** | 64x64 px | Segmento modular de cerca de ripas de madeira com postes para delimitar quintais. | `2D top-down RPG modular fence sprite, rustic wooden post and rail fence segment, cozy medieval homestead barrier, clean pixel art, isolated on transparent background, 64x64 px` |
| `struct_fence_wood_gate` | **Portão de Cerca de Madeira** | 64x64 px | Portão articulado de madeira com trinco de ferro para cercados. | `2D top-down 3/4 RPG prop, swinging wooden garden gate with iron latch and hinges, cute medieval farm style, pixel art, isolated on transparent background, 64x64 px` |
| `struct_lantern_post` | **Poste de Iluminação Medieval** | 64x128 px (1x2) | Poste de ferro batido com candeeiro de vidro e chama dourada acesa. | `2D top-down 3/4 perspective RPG prop, wrought iron street lamp post with glowing warm yellow lantern, medieval village lighting, crisp pixel art, isolated on transparent background, 64x128 px` |
| `struct_water_well` | **Poço de Pedra da Vila** | 128x128 px (2x2) | Poço circular de pedra com telhado cônico de madeira, corda e balde. | `2D top-down 3/4 perspective RPG prop, round cobblestone water well with small wooden tiled roof, crank wheel and hanging bucket, medieval village prop, detailed pixel art, isolated on transparent background, 128x128 px` |

---

## 5. 🌱 Categoria 5: Sementes, Flora e Recursos Naturais (`seed_*` / `nature_*`)

| ID | Nome do Item / Prop | Dimensões | Descrição | Prompt de Geração de Imagem |
| :--- | :--- | :---: | :--- | :--- |
| `seed_oak_sapling` | **Semente de Carvalho Antigo** | 64x64 px (Icon) | Broto verdejante com semente de bolota para plantar árvores de carvalho. | `2D top-down RPG inventory icon, oak tree acorn seed sprouting tiny bright green leaves, agricultural item, cozy pixel art, vibrant fantasy colors, isolated on transparent background, 64x64 px` |
| `nature_oak_tree` | **Árvore de Carvalho (Adulta)** | 128x192 px (2x3) | Árvore exuberante de copa redonda com folhas verdes densas e tronco robusto. | `2D top-down 3/4 perspective RPG nature sprite, majestic leafy oak tree with lush foliage canopy and sturdy wooden trunk, vibrant green tones, high quality pixel art, isolated on transparent background, 128x192 px` |
| `seed_pine_cone` | **Semente de Pinheiro Nórdico** | 64x64 px (Icon) | Pinha dourada com broto resinoso para florestamento de pinheiros. | `2D top-down RPG inventory icon, golden pinecone seed with fresh pine needle sprout, nature item, clean pixel art, isolated on transparent background, 64x64 px` |
| `nature_pine_tree` | **Pinheiro Nórdico (Adulto)** | 128x192 px (2x3) | Pinheiro alto com camadas triangulares de folhagem verde-esmeralda escura. | `2D top-down 3/4 perspective RPG nature sprite, tall nordic pine evergreen tree with layered needle branches, deep emerald green foliage, clean pixel art, isolated on transparent background, 128x192 px` |
| `seed_berry_bush` | **Sementes de Arbusto Frutífero** | 64x64 px (Icon) | Pacote de sementes mágicas para cultivo de arbustos de frutas vermelhas. | `2D top-down RPG inventory icon, burlap seed packet with red berry illustration on label, farming item, colorful pixel art, isolated on transparent background, 64x64 px` |
| `nature_berry_bush` | **Arbusto com Frutas Vermelhas** | 64x64 px | Arbusto denso carregado de frutas silvestres brilhantes prontas para colheita. | `2D top-down 3/4 perspective RPG nature sprite, lush green bush dotted with glowing ripe red berries, harvestable plant, clean pixel art, isolated on transparent background, 64x64 px` |
| `nature_rock_boulder` | **Formação de Rocha Mineral** | 64x64 px | Rocha cinzenta sólida com veios brilhantes de minério de ferro/cristal. | `2D top-down 3/4 perspective RPG nature sprite, cracked gray stone boulder with sparkling metallic ore veins, harvestable rock, detailed pixel art, isolated on transparent background, 64x64 px` |
| `seed_wheat_packet` | **Saco de Sementes de Trigo** | 64x64 px (Icon) | Pacote de juta com sementes de trigo para agricultura e ração de dragão. | `2D top-down RPG inventory icon, rustic burlap pouch tied with twine containing golden wheat seeds, farming asset, crisp pixel art, isolated on transparent background, 64x64 px` |

---

## 6. 🔥 Categoria 6: Padrões Animados e Efeitos (`tile_animated_*`)

| ID | Nome do Tile Animado | Dimensões | Descrição | Prompt de Geração de Imagem |
| :--- | :--- | :---: | :--- | :--- |
| `tile_animated_water_flow` | **Ladrilho de Água Cristalina (8 Frames)** | 64x64 px (SpriteSheet) | Água azul-turquesa com ondulações e reflexos de espuma cíclica perfeita. | `2D top-down RPG animated sprite sheet, 8-frame seamless loop of crystal clear turquoise river water with gentle foaming ripples, top-down view, vibrant cartoon pixel art style, sprite sheet 512x64 px` |
| `tile_animated_lava_bubble` | **Ladrilho de Lava Vulcânica (8 Frames)** | 64x64 px (SpriteSheet) | Magma incandescente com bolhas de calor, crosta de pedra escura e brilho amarelo/laranja. | `2D top-down RPG animated sprite sheet, 8-frame seamless loop of bubbling molten volcanic lava, glowing orange and yellow core with dark cooled basalt crust, vibrant fantasy pixel art, 512x64 px` |
| `tile_animated_waterfall` | **Queda d'Água / Cachoeira (8 Frames)** | 64x128 px (SpriteSheet) | Fluxo vertical de cachoeira com névoa e espuma na base do impacto. | `2D top-down 3/4 perspective RPG animated sprite sheet, 8-frame looping vertical waterfall cascade with white splash foam at base, vibrant fantasy pixel art, sprite sheet 512x128 px` |
| `prop_animated_campfire` | **Fogueira de Acampamento (6 Frames)** | 64x64 px (SpriteSheet) | Pedras em círculo com lenha estalando e chamas dançantes luminosas. | `2D top-down 3/4 perspective RPG animated prop sprite sheet, 6-frame loop of crackling cozy campfire with dancing warm orange flames and glowing embers inside stone ring, pixel art, 384x64 px` |

---

## 7. 🥚 Categoria 7: Ovos e Itens de Dragões (`dragon_item_*`)

| ID | Nome do Item | Dimensões | Descrição | Prompt de Geração de Imagem |
| :--- | :--- | :---: | :--- | :--- |
| `dragon_egg_wind` | **Ovo de Dragão Voador** | 64x64 px | Casca azul-celeste com espirais de vento douradas, emite leve brilho aerodinâmico. | `2D top-down RPG inventory icon, mythical wind dragon egg, sky-blue porcelain shell with glowing golden spiral feather patterns, gentle mist aura, cute fantasy pixel art, isolated on transparent background, 64x64 px` |
| `dragon_egg_earth` | **Ovo de Dragão Terrestre** | 64x64 px | Casca de rocha vulcânica escura com rachaduras brilhantes de magma verde-esmeralda. | `2D top-down RPG inventory icon, heavy earth dragon egg, dark rocky textured shell with glowing emerald crystal fissures, solid medieval fantasy artifact, stylized pixel art, isolated on transparent background, 64x64 px` |
| `dragon_egg_tide` | **Ovo de Dragão Aquático** | 64x64 px | Casca perolada azul-marinho com padrão de escamas de peixe e gotas brilhantes. | `2D top-down RPG inventory icon, ocean tide dragon egg, iridescent pearl-blue shell with shimmering aquatic scales and water drop reflections, vibrant fantasy pixel art, isolated on transparent background, 64x64 px` |
| `prop_dragon_incubator` | **Ninho Incubador de Dragão** | 128x128 px (2x2) | Ninho acolhedor de galhos mágicos e brasas quentes para aquecer ovos de dragão. | `2D top-down 3/4 perspective RPG prop, enchanted dragon incubator nest made of woven enchanted branches, soft glowing warm coals and golden hay, cozy fantasy pixel art, isolated on transparent background, 128x128 px` |
| `dragon_whistle_call` | **Apito de Chamado de Dragão** | 64x64 px | Apito entalhado em osso de dragão antigo usado para invocar o companheiro ativo. | `2D top-down RPG inventory icon, ancient carved dragon bone whistle with silver engraving and red tassel cord, magical accessory, crisp pixel art, isolated on transparent background, 64x64 px` |

---

## 🛠️ Padrão Técnico para Implementação dos Assets

```json
{
  "id": "tool_shovel_iron",
  "name": "Pá de Ferro Rústica",
  "category": "tools",
  "dimensions": { "width": 64, "height": 64, "gridW": 1, "gridH": 1 },
  "layer": "inventory",
  "unlockRequirement": { "questId": "quest_02_data_types", "luaConcept": "variables_and_items" },
  "texturePath": "assets/tools/tool_shovel_iron.png"
}
```
