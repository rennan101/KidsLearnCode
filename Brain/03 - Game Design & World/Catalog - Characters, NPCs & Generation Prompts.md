# 🐾 Catálogo Oficial de Personagens Jogáveis e NPCs (Design & Prompts de Geração)

> **Documento de Especificação de Heróis, Moradores da Ilha e Prompts de Geração de Spritesheets**  
> **Diretriz Visual:** *Personagens antropomórficos adoráveis no estilo estético de **Animal Crossing: New Horizons** (proporções fofas 'chibi', olhos expressivos, vestimentas charmosas), renderizados em **Perspectiva 3/4 Top-Down (ângulo de visão elevado estilo Sea of Stars)**. Acabamento em **Vector Art 2.5D com sombreamento suave, oclusão de ambiente e iluminação 3D / Clay Render** (NÃO é pixel art).*

---

## 📋 Sumário do Catálogo

1. [🎨 Guia de Estrutura dos 4 Spritesheets por Personagem (Grade 4x8)](#1-🎨-guia-de-estrutura-dos-4-spritesheets-por-personagem-grade-4x8)
2. [🐺 Personagens Jogáveis — 4 Classes x 2 Gêneros = 8 Heróis](#2-🐺-personagens-jogáveis--4-classes-x-2-gêneros--8-heróis)
   * [2.1. Lobo — Caçador / Caçadora](#21-lobo--caçador--caçadora)
     * [🐺 Lobo Masculino (`char_wolf_hunter_m` - Ragnar)](#-lobo-masculino-char_wolf_hunter_m---ragnar)
     * [🐺 Lobo Feminino (`char_wolf_hunter_f` - Lyra)](#-lobo-feminino-char_wolf_hunter_f---lyra)
   * [2.2. Morcego — Vampiro / Vampira](#22-morcego--vampiro--vampira)
     * [🦇 Morcego Masculino (`char_bat_vampire_m` - Vlad)](#-morcego-masculino-char_bat_vampire_m---vlad)
     * [🦇 Morcego Feminino (`char_bat_vampire_f` - Carmilla)](#-morcego-feminino-char_bat_vampire_f---carmilla)
   * [2.3. Águia — Arqueiro / Arqueira](#23-águia--arqueiro--arqueira)
     * [🦅 Águia Masculino (`char_eagle_archer_m` - Zephyr)](#-águia-masculino-char_eagle_archer_m---zephyr)
     * [🦅 Águia Feminina (`char_eagle_archer_f` - Astra)](#-águia-feminina-char_eagle_archer_f---astra)
   * [2.4. Gato — Bruxo / Bruxa](#24-gato--bruxo--bruxa)
     * [🐱 Gato Masculino (`char_cat_mage_m` - Merlin)](#-gato-masculino-char_cat_mage_m---merlin)
     * [🐱 Gato Feminino (`char_cat_witch_f` - Luna)](#-gato-feminino-char_cat_witch_f---luna)
3. [🏝️ NPCs Principais da Ilha Lua](#3-🏝️-npcs-principais-da-ilha-lua)
   * [3.1. Tubarão — O Surfista (`npc_shark_surfer` - Kai)](#31-tubarão--o-surfista-npc_shark_surfer---kai)
   * [3.2. Jacaré — O Atravessador (`npc_alligator_ferryman` - Barnabé)](#32-jacaré--o-atravessador-npc_alligator_ferryman---barnabé)
   * [3.3. Macaco — O Mestre Construtor (`npc_monkey_builder` - Bambu)](#33-macaco--o-mestre-construtor-npc_monkey_builder---bambu)
   * [3.4. Camaleão — O Ilusionista Mágico (`npc_chameleon_magician` - Cromos)](#34-camaleão--o-ilusionista-mágico-npc_chameleon_magician---cromos)
   * [3.5. Coruja — O Professor Ancião (`npc_owl_professor` - Dr. Arquimedes)](#35-coruja--o-professor-ancião-npc_owl_professor---dr-arquimedes)
4. [🏰 NPCs Complementares da Vila Medieval](#4-🏰-npcs-complementares-da-vila-medieval)
   * [4.1. Touro — O Ferreiro Forjador (`npc_bull_blacksmith` - Brutus)](#41-touro--o-ferreiro-forjador-npc_bull_blacksmith---brutus)
   * [4.2. Coelho — A Herbalista e Fazendeira (`npc_rabbit_farmer` - Flora)](#42-coelho--a-herbalista-e-fazendeira-npc_rabbit_farmer---flora)
   * [4.3. Tartaruga — O Guardião Ancestral (`npc_turtle_elder` - Mestre Casco)](#43-tartaruga--o-guardião-ancestral-npc_turtle_elder---mestre-casco)
   * [4.4. Pinguim — O Pescador Polar (`npc_penguin_angler` - Pingo)](#44-pinguim--o-pescador-polar-npc_penguin_angler---pingo)
5. [📊 Tabela Comparativa de Habilidades Únicas](#5-📊-tabela-comparativa-de-habilidades-únicas)

---

## 1. 🎨 Guia de Estrutura dos 4 Spritesheets por Personagem (Grade 4x8)

Para garantir máxima fidelidade de animação, recorte transparente perfeito e organização nos motores 2D, cada personagem possui **4 prompts dedicados de spritesheets separados**.

Cada spritesheet segue uma **grade estrita de 4 linhas horizontais x 8 frames por linha (32 frames no total)** cobrindo com clareza as 4 direções cardinais do jogo:

### 🎭 Estrutura Padrão da Grade (4 Linhas x 8 Frames = 32 Frames)
* **Linha 1 (Row 1 - 8 frames):** Direção **Sul / Frente** (`Facing South / Front view`).
* **Linha 2 (Row 2 - 8 frames):** Direção **Norte / Costas** (`Facing North / Back view`).
* **Linha 3 (Row 3 - 8 frames):** Direção **Esquerda / Oeste** (`Facing West / Left side view`).
* **Linha 4 (Row 4 - 8 frames):** Direção **Direita / Leste** (`Facing East / Right side view`).

### 📦 Os 4 Tipos de Spritesheets por Personagem:
1. **🚶 Spritesheet de Caminhada (`Walk`):** Ciclo completo e fluido de passos com balanceio natural dos braços e cauda/orelhas em 8 frames por direção.
2. **🧘 Spritesheet Parado / Respiração (`Idle`):** Animação suave de respiração relaxada, leve oscilação corporal e piscar de olhos em 8 frames por direção.
3. **🔨 Spritesheet de Fabricação / Ação (`Craft`):** Personagem em pé movimentando alegremente as patinhas/mãos para cima e para baixo em frente ao peito no estilo clássico de crafting do *Animal Crossing*, sem segurar objetos fixos.
4. **🐉 Spritesheet Montado no Dragão (`Mounted Pose / Dragon Riding`):** Postura firme e dinâmica do herói cavalgando no dorso do dragão, com as perninhas abertas no arreio, segurando as rédeas e oscilando no ritmo do voo/trote do dragão em 8 frames por direção.

* **Fundo:** **Branco 100% puro e sólido (`#FFFFFF`) sem linhas de grade desenhadas, sem caixas, sem divisórias e sem molduras**.
* **Estilo Artístico Imutável:** *Animal Crossing: New Horizons aesthetic, Sea of Stars 3/4 high top-down perspective, clean 2.5D vector art, smooth clay render with soft ambient lighting*.

---

## 2. 🐺 Personagens Jogáveis — 4 Classes x 2 Gêneros = 8 Heróis

---

### 2.1. Lobo — Caçador / Caçadora
* **Arquétipo:** O Rastreador Destemido da Floresta.
* **Personalidade:** Leal, corajoso, enérgico e com instinto aguçado para aventuras ao ar livre.
* **Habilidade Única — `Faro Selvagem`:** Revela pegadas brilhantes no chão que apontam na direção de ovos de dragão ocultos e recursos raros a até 15 tiles de distância.

---

#### 🐺 Lobo Masculino (`char_wolf_hunter_m` - Ragnar)
* **Visual:** Pelagem cinza-chumbo com focinho creme fofo, orelhas pontudas atentas, olhos dourados calorosos, túnica de caçador de couro macio verde-floresta com fivela de bronze e pequena pena presa na touca.

##### 1. Prompt de Caminhada (`Walk` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic wolf boy hunter walking cycle, Animal Crossing New Horizons art style, Sea of Stars 3/4 high top-down perspective, charcoal-gray and cream fur, amber eyes, forest-green leather tunic with bronze buckle and tiny feather hat, neatly arranged in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames walking South facing front, Row 2: 8 frames walking North facing back, Row 3: 8 frames walking West facing left, Row 4: 8 frames walking East facing right), solid pure plain white background without any grid lines or boxes, clean 2.5D vector art, smooth 3D clay lighting
```

##### 2. Prompt de Parado / Respiração (`Idle` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic wolf boy hunter idle breathing animation, Animal Crossing New Horizons art style, Sea of Stars 3/4 high top-down perspective, charcoal-gray and cream fur, amber eyes, forest-green leather tunic with bronze buckle and tiny feather hat, neatly organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames idle breathing South facing front, Row 2: 8 frames idle North facing back, Row 3: 8 frames idle West facing left, Row 4: 8 frames idle East facing right), solid pure plain white background without any grid lines or boxes, clean 2.5D vector art, smooth 3D clay lighting
```

##### 3. Prompt de Fabricação / Crafting (`Craft` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic wolf boy hunter crafting animation, Animal Crossing New Horizons art style, Sea of Stars 3/4 high top-down perspective, charcoal-gray and cream fur, forest-green leather tunic, standing crafting animation happily moving arms up and down in front of chest without holding items, neatly organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames crafting South facing front, Row 2: 8 frames crafting North facing back, Row 3: 8 frames crafting West facing left, Row 4: 8 frames crafting East facing right), solid pure plain white background without any grid lines or boxes, clean 2.5D vector art, smooth 3D clay lighting
```

##### 4. Prompt de Montado no Dragão (`Mounted / Riding` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic wolf boy hunter riding dragon mount pose, Animal Crossing New Horizons art style, Sea of Stars 3/4 high top-down perspective, charcoal-gray fur, forest-green tunic, character seated in riding saddle pose holding reins with natural riding bobbing motion, neatly organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames riding South facing front, Row 2: 8 frames riding North facing back, Row 3: 8 frames riding West facing left, Row 4: 8 frames riding East facing right), solid pure plain white background without any grid lines or boxes, clean 2.5D vector art, smooth 3D clay lighting
```

---

#### 🐺 Lobo Feminino (`char_wolf_hunter_f` - Lyra)
* **Visual:** Pelagem branca-ártica com detalhes prateados, olhos azul-gelo curiosos e expressivos, lenço vermelho no pescoço sobre capa curta de batedora verde-oliva e botas de camurça com pelos fofos.

##### 1. Prompt de Caminhada (`Walk` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic arctic wolf girl ranger walking cycle, Animal Crossing New Horizons art style, Sea of Stars 3/4 high top-down perspective, soft white and silver fur, bright cyan eyes, red neck scarf over olive-green scout capelet and fur boots, neatly organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames walking South facing front, Row 2: 8 frames walking North facing back, Row 3: 8 frames walking West facing left, Row 4: 8 frames walking East facing right), solid pure plain white background without any grid lines or boxes, clean 2.5D vector illustration, smooth 3D clay lighting
```

##### 2. Prompt de Parado / Respiração (`Idle` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic arctic wolf girl ranger idle breathing animation, Animal Crossing New Horizons art style, Sea of Stars 3/4 high top-down perspective, soft white and silver fur, bright cyan eyes, red neck scarf, olive-green capelet, neatly organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames idle breathing South facing front, Row 2: 8 frames idle North facing back, Row 3: 8 frames idle West facing left, Row 4: 8 frames idle East facing right), solid pure plain white background without any grid lines or boxes, clean 2.5D vector illustration, smooth 3D clay lighting
```

##### 3. Prompt de Fabricação / Crafting (`Craft` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic arctic wolf girl ranger crafting animation, Animal Crossing New Horizons art style, Sea of Stars 3/4 high top-down perspective, soft white fur, red neck scarf, olive-green capelet, standing crafting animation cheerfully moving arms up and down in front of chest without items, neatly organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames crafting South facing front, Row 2: 8 frames crafting North facing back, Row 3: 8 frames crafting West facing left, Row 4: 8 frames crafting East facing right), solid pure plain white background without any grid lines or boxes, clean 2.5D vector art
```

##### 4. Prompt de Montado no Dragão (`Mounted / Riding` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic arctic wolf girl ranger riding dragon mount pose, Animal Crossing New Horizons art style, Sea of Stars 3/4 high top-down perspective, white fur, red neck scarf, olive-green capelet, seated saddle riding pose holding reins with smooth flight bobbing motion, neatly organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames riding South facing front, Row 2: 8 frames riding North facing back, Row 3: 8 frames riding West facing left, Row 4: 8 frames riding East facing right), solid pure plain white background without any grid lines or boxes, clean 2.5D vector art
```

---

### 2.2. Morcego — Vampiro / Vampira
* **Arquétipo:** O Aristocrata Noturno e Alquimista.
* **Personalidade:** Culto, misterioso, refinado, amante da noite, de livros arcanos e de poções doces.
* **Habilidade Única — `Eco Noturno`:** Permite enxergar com clareza dentro de cavernas, concede **+5 Ações Noturnas exclusivas** durante a noite (após às 17h de Brasília, quando outros descansam) e +15% de velocidade de ataque noturno ao dragão companheiro.

---

#### 🦇 Morcego Masculino (`char_bat_vampire_m` - Vlad)
* **Visual:** Pelagem roxo-escura aveludada, orelhas grandes triangulares com interior rosa suave, dentinhos pontudos adoráveis ao sorrir, colete bordô com botões dourados e mini-capa preta de seda.

##### 1. Prompt de Caminhada (`Walk` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic fruit bat boy vampire walking cycle, Animal Crossing New Horizons aesthetic, Sea of Stars 3/4 high top-down viewpoint, dark plum-purple fur, big bat ears with pink inner, tiny fang smile, burgundy gentleman vest with gold buttons and black mini-cape, organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames walking South facing front, Row 2: 8 frames walking North facing back, Row 3: 8 frames walking West facing left, Row 4: 8 frames walking East facing right), solid pure white background without any grid lines or boxes, clean vector art, soft 3D shading
```

##### 2. Prompt de Parado / Respiração (`Idle` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic fruit bat boy vampire idle breathing animation, Animal Crossing New Horizons aesthetic, Sea of Stars 3/4 high top-down viewpoint, dark plum-purple fur, big bat ears, burgundy gentleman vest and black mini-cape, organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames idle breathing South facing front, Row 2: 8 frames idle North facing back, Row 3: 8 frames idle West facing left, Row 4: 8 frames idle East facing right), solid pure white background without any grid lines or boxes, clean vector art, soft 3D clay lighting
```

##### 3. Prompt de Fabricação / Crafting (`Craft` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic fruit bat boy vampire crafting animation, Animal Crossing New Horizons aesthetic, Sea of Stars 3/4 top-down perspective, plum-purple fur, burgundy vest, standing crafting animation moving arms up and down in front of chest without holding objects, neatly arranged in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames crafting South facing front, Row 2: 8 frames crafting North facing back, Row 3: 8 frames crafting West facing left, Row 4: 8 frames crafting East facing right), solid pure plain white background without any grid lines, clean vector art
```

##### 4. Prompt de Montado no Dragão (`Mounted / Riding` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic fruit bat boy vampire riding dragon mount pose, Animal Crossing New Horizons aesthetic, Sea of Stars 3/4 top-down viewpoint, plum-purple fur, burgundy vest, black mini-cape flowing gently, seated saddle riding pose holding reins with smooth riding bobbing, neatly organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames riding South facing front, Row 2: 8 frames riding North facing back, Row 3: 8 frames riding West facing left, Row 4: 8 frames riding East facing right), solid pure white background without grid lines, clean vector illustration
```

---

#### 🦇 Morcego Feminino (`char_bat_vampire_f` - Carmilla)
* **Visual:** Pelagem lilás suave com penugem no peito, asas membranosas charmosas nos bracinhos, vestido vitoriano preto e lilás com gola rendada branca e presilha de morcego de safira.

##### 1. Prompt de Caminhada (`Walk` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic bat girl vampire noble walking cycle, Animal Crossing New Horizons style, Sea of Stars 3/4 high top-down perspective, pastel lilac fur with white chest fluff, gothic-lolita black and purple medieval dress with white lace collar, organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames walking South facing front, Row 2: 8 frames walking North facing back, Row 3: 8 frames walking West facing left, Row 4: 8 frames walking East facing right), solid plain white background without any grid lines or boxes, clean vector art, smooth 3D lighting
```

##### 2. Prompt de Parado / Respiração (`Idle` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic bat girl vampire noble idle breathing animation, Animal Crossing New Horizons style, Sea of Stars 3/4 high top-down perspective, pastel lilac fur, gothic black and purple medieval dress with white lace collar, organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames idle breathing South facing front, Row 2: 8 frames idle North facing back, Row 3: 8 frames idle West facing left, Row 4: 8 frames idle East facing right), solid plain white background without any grid lines, clean 2.5D vector art
```

##### 3. Prompt de Fabricação / Crafting (`Craft` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic bat girl vampire noble crafting animation, Animal Crossing New Horizons style, Sea of Stars 3/4 top-down perspective, pastel lilac fur, black and purple dress, standing crafting animation happily moving arms up and down in front of chest without items, neatly organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames crafting South facing front, Row 2: 8 frames crafting North facing back, Row 3: 8 frames crafting West facing left, Row 4: 8 frames crafting East facing right), solid plain white background without grid lines, clean vector art
```

##### 4. Prompt de Montado no Dragão (`Mounted / Riding` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic bat girl vampire noble riding dragon mount pose, Animal Crossing New Horizons style, Sea of Stars 3/4 top-down perspective, pastel lilac fur, black and purple dress, seated saddle riding pose holding dragon reins with elegant bobbing motion, neatly organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames riding South facing front, Row 2: 8 frames riding North facing back, Row 3: 8 frames riding West facing left, Row 4: 8 frames riding East facing right), solid plain white background without grid lines, clean vector art
```

---

### 2.3. Águia — Arqueiro / Arqueira
* **Arquétipo:** O Sentinela Alado dos Cumes.
* **Personalidade:** Focado, observador, disciplinado, bem-humorado e apaixonado pela brisa das montanhas.
* **Habilidade Única — `Mira Perfeita`:** Aumenta a velocidade de coleta com a Vara de Pescar e Machado em 30%, além de recarregar a *Esquiva Tática (Tecla 4)* do dragão 1 segundo mais rápido.

---

#### 🦅 Águia Masculino (`char_eagle_archer_m` - Zephyr)
* **Visual:** Penas marrons com cabeça branca de águia-careca majestosa e fofa, bico dourado pequeno e amigável, gibão de arqueiro azul-celeste com protetor de ombro de couro e aljava miniatura nas costas.

##### 1. Prompt de Caminhada (`Walk` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic eagle boy archer walking cycle, Animal Crossing New Horizons art style, Sea of Stars 3/4 high top-down viewpoint, brown feathers, fluffy white head plumage, yellow beak, sky-blue archer tunic with leather bracers, organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames walking South facing front, Row 2: 8 frames walking North facing back, Row 3: 8 frames walking West facing left, Row 4: 8 frames walking East facing right), solid pure white background without any grid lines or boxes, clean 2.5D vector illustration, smooth 3D clay lighting
```

##### 2. Prompt de Parado / Respiração (`Idle` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic eagle boy archer idle breathing animation, Animal Crossing New Horizons art style, Sea of Stars 3/4 high top-down viewpoint, brown body feathers, fluffy white head plumage, yellow beak, sky-blue archer tunic, organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames idle breathing South facing front, Row 2: 8 frames idle North facing back, Row 3: 8 frames idle West facing left, Row 4: 8 frames idle East facing right), solid pure white background without grid lines, clean vector art
```

##### 3. Prompt de Fabricação / Crafting (`Craft` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic eagle boy archer crafting animation, Animal Crossing New Horizons art style, Sea of Stars 3/4 top-down angle, fluffy white head plumage, sky-blue tunic, standing crafting animation moving arms up and down in front of chest without items, neatly organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames crafting South facing front, Row 2: 8 frames crafting North facing back, Row 3: 8 frames crafting West facing left, Row 4: 8 frames crafting East facing right), solid pure white background without grid lines, clean 2.5D vector art
```

##### 4. Prompt de Montado no Dragão (`Mounted / Riding` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic eagle boy archer riding dragon mount pose, Animal Crossing New Horizons art style, Sea of Stars 3/4 high top-down perspective, white head plumage, sky-blue archer tunic, seated in dragon saddle pose holding reins with smooth flight bobbing motion, organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames riding South facing front, Row 2: 8 frames riding North facing back, Row 3: 8 frames riding West facing left, Row 4: 8 frames riding East facing right), solid pure white background without grid lines, clean vector illustration
```

---

#### 🦅 Águia Feminina (`char_eagle_archer_f` - Astra)
* **Visual:** Penas de falcão dourado e creme, penugem estilosa como franja, olhos amendoados dourados, túnica de batedora em tons de turquesa e dourado com broche de asa de pássaro no peito.

##### 1. Prompt de Caminhada (`Walk` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic golden falcon girl marksman walking cycle, Animal Crossing New Horizons aesthetic, Sea of Stars 3/4 high top-down angle, golden-tan feathers, stylish feather crest, teal and gold trimmed archer tunic with feather brooch, arranged in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames walking South facing front, Row 2: 8 frames walking North facing back, Row 3: 8 frames walking West facing left, Row 4: 8 frames walking East facing right), solid plain white background without any grid lines or boxes, clean 2.5D vector art, soft 3D clay lighting
```

##### 2. Prompt de Parado / Respiração (`Idle` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic golden falcon girl marksman idle breathing animation, Animal Crossing New Horizons aesthetic, Sea of Stars 3/4 top-down perspective, golden-tan feathers, teal and gold archer tunic, organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames idle breathing South facing front, Row 2: 8 frames idle North facing back, Row 3: 8 frames idle West facing left, Row 4: 8 frames idle East facing right), solid plain white background without grid lines, clean vector art
```

##### 3. Prompt de Fabricação / Crafting (`Craft` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic golden falcon girl marksman crafting animation, Animal Crossing New Horizons aesthetic, Sea of Stars 3/4 top-down viewpoint, golden feathers, teal tunic, standing crafting animation cheerfully moving arms up and down without holding objects, neatly arranged in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames crafting South facing front, Row 2: 8 frames crafting North facing back, Row 3: 8 frames crafting West facing left, Row 4: 8 frames crafting East facing right), solid plain white background without grid lines, clean vector art
```

##### 4. Prompt de Montado no Dragão (`Mounted / Riding` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic golden falcon girl marksman riding dragon mount pose, Animal Crossing New Horizons aesthetic, Sea of Stars 3/4 high top-down viewpoint, golden feathers, teal tunic, seated saddle riding pose holding dragon reins with smooth aerial bobbing motion, neatly organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames riding South facing front, Row 2: 8 frames riding North facing back, Row 3: 8 frames riding West facing left, Row 4: 8 frames riding East facing right), solid plain white background without grid lines, clean 2.5D vector art
```

---

### 2.4. Gato — Bruxo / Bruxa
* **Arquétipo:** O Conjurador Místico e Estudioso de Lua.
* **Personalidade:** Curioso, brincalhão, místico, engenhoso e fascinado por resolver quebra-cabeças lógicos.
* **Habilidade Única — `Afinidade Arcana`:** Concede +10% de ganho de XP para os dragões domesticados e desbloqueia dicas automáticas nos desafios de programação Blockly.

---

#### 🐱 Gato Masculino (`char_cat_mage_m` - Merlin)
* **Visual:** Pelagem de gato preto aveludado com patinhas brancas ("meias"), cauda longa ondulante com ponta dourada, túnica de feiticeiro azul-noite estrelada e pequeno chapéu pontudo tortinho com lua crescente.

##### 1. Prompt de Caminhada (`Walk` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic black cat boy wizard walking cycle, Animal Crossing New Horizons aesthetic, Sea of Stars 3/4 high top-down perspective, sleek black fur with white paw socks, emerald green eyes, midnight-blue star-patterned robe and crooked pointed wizard hat with crescent moon, arranged in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames walking South facing front, Row 2: 8 frames walking North facing back, Row 3: 8 frames walking West facing left, Row 4: 8 frames walking East facing right), solid pure white background without any grid lines or boxes, clean 2.5D vector art, smooth 3D clay lighting
```

##### 2. Prompt de Parado / Respiração (`Idle` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic black cat boy wizard idle breathing animation, Animal Crossing New Horizons aesthetic, Sea of Stars 3/4 top-down perspective, sleek black fur with white paws, emerald eyes, midnight-blue robe and crooked pointed wizard hat, arranged in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames idle breathing South facing front, Row 2: 8 frames idle North facing back, Row 3: 8 frames idle West facing left, Row 4: 8 frames idle East facing right), solid pure white background without any grid lines, clean vector art
```

##### 3. Prompt de Fabricação / Crafting (`Craft` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic black cat boy wizard crafting animation, Animal Crossing New Horizons aesthetic, Sea of Stars 3/4 top-down viewpoint, black fur, midnight-blue robe and wizard hat, standing crafting animation moving paws up and down in front of chest without items, neatly organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames crafting South facing front, Row 2: 8 frames crafting North facing back, Row 3: 8 frames crafting West facing left, Row 4: 8 frames crafting East facing right), solid pure white background without grid lines, clean vector art
```

##### 4. Prompt de Montado no Dragão (`Mounted / Riding` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic black cat boy wizard riding dragon mount pose, Animal Crossing New Horizons aesthetic, Sea of Stars 3/4 high top-down perspective, black fur, midnight-blue robe, wizard hat, seated saddle riding pose holding dragon reins with cute tail curl and bobbing motion, organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames riding South facing front, Row 2: 8 frames riding North facing back, Row 3: 8 frames riding West facing left, Row 4: 8 frames riding East facing right), solid pure white background without grid lines, clean 2.5D vector illustration
```

---

#### 🐱 Gato Feminino (`char_cat_witch_f` - Luna)
* **Visual:** Pelagem tricolor (calico) fofa (laranja, preto e branco), grandes olhos verdes brilhantes, vestido de bruxinha roxo e abóbora com avental branco rendado e bolsinha mágica pendurada na cintura.

##### 1. Prompt de Caminhada (`Walk` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic calico cat girl witch walking cycle, Animal Crossing New Horizons art style, Sea of Stars 3/4 high top-down viewpoint, fluffy spotted calico fur, sparkling emerald eyes, purple and orange apprentice witch dress with white apron, organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames walking South facing front, Row 2: 8 frames walking North facing back, Row 3: 8 frames walking West facing left, Row 4: 8 frames walking East facing right), solid plain white background without any grid lines or boxes, clean 2.5D vector illustration, smooth 3D clay lighting
```

##### 2. Prompt de Parado / Respiração (`Idle` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic calico cat girl witch idle breathing animation, Animal Crossing New Horizons art style, Sea of Stars 3/4 high top-down perspective, fluffy calico fur, sparkling emerald eyes, purple and orange witch dress with white apron, organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames idle breathing South facing front, Row 2: 8 frames idle North facing back, Row 3: 8 frames idle West facing left, Row 4: 8 frames idle East facing right), solid plain white background without any grid lines, clean vector art
```

##### 3. Prompt de Fabricação / Crafting (`Craft` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic calico cat girl witch crafting animation, Animal Crossing New Horizons art style, Sea of Stars 3/4 top-down angle, calico fur, purple witch dress with white apron, standing crafting animation moving paws up and down cheerfully in front of chest without items, neatly arranged in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames crafting South facing front, Row 2: 8 frames crafting North facing back, Row 3: 8 frames crafting West facing left, Row 4: 8 frames crafting East facing right), solid plain white background without grid lines, clean 2.5D vector art
```

##### 4. Prompt de Montado no Dragão (`Mounted / Riding` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic calico cat girl witch riding dragon mount pose, Animal Crossing New Horizons art style, Sea of Stars 3/4 high top-down viewpoint, fluffy calico fur, purple dress with apron, seated in dragon saddle pose holding reins with cheerful riding bobbing motion, organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames riding South facing front, Row 2: 8 frames riding North facing back, Row 3: 8 frames riding West facing left, Row 4: 8 frames riding East facing right), solid plain white background without grid lines, clean vector illustration
```

---

## 3. 🏝️ NPCs Principais da Ilha Lua

---

### 3.1. Tubarão — O Surfista (`npc_shark_surfer` - Kai)
* **Visual:** Tubarão-branco fofo, pele azul-clara e branca, focinho arredondado amigável, colete tropical aberto de hibisco e colar de conchas trançado.

##### 1. Prompt de Caminhada (`Walk` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic great white shark surfer NPC walking cycle, Animal Crossing New Horizons aesthetic, Sea of Stars 3/4 high top-down camera angle, smooth light-blue and white skin, cute round snout with friendly toothy grin, wearing colorful tropical hibiscus open vest and woven shell necklace, organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames walking South facing front, Row 2: 8 frames walking North facing back, Row 3: 8 frames walking West facing left, Row 4: 8 frames walking East facing right), solid pure white background without any grid lines or boxes, clean vector art, soft 3D lighting
```

##### 2. Prompt de Parado / Respiração (`Idle` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic great white shark surfer NPC idle breathing animation, Animal Crossing New Horizons aesthetic, Sea of Stars 3/4 top-down perspective, light-blue and white skin, friendly toothy grin, tropical open vest and shell necklace, organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames idle breathing South facing front, Row 2: 8 frames idle North facing back, Row 3: 8 frames idle West facing left, Row 4: 8 frames idle East facing right), solid pure white background without grid lines, clean 2.5D vector art
```

##### 3. Prompt de Fabricação / Ação (`Craft / Work` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic shark surfer NPC crafting working animation, Animal Crossing New Horizons aesthetic, Sea of Stars 3/4 top-down angle, light-blue shark, tropical vest, standing working animation enthusiastically moving flippers/arms up and down in front of chest without items, organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames crafting South facing front, Row 2: 8 frames crafting North facing back, Row 3: 8 frames crafting West facing left, Row 4: 8 frames crafting East facing right), solid pure white background without grid lines, clean vector art
```

##### 4. Prompt de Montado no Dragão / Navegação (`Mounted / Riding` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic shark surfer NPC riding water dragon mount pose, Animal Crossing New Horizons aesthetic, Sea of Stars 3/4 top-down viewpoint, light-blue shark, tropical vest, seated saddle riding pose holding reins with rhythmic sea riding bobbing motion, neatly organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames riding South facing front, Row 2: 8 frames riding North facing back, Row 3: 8 frames riding West facing left, Row 4: 8 frames riding East facing right), solid pure white background without grid lines, clean vector art
```

---

### 3.2. Jacaré — O Atravessador (`npc_alligator_ferryman` - Barnabé)
* **Visual:** Escamas verdes musgo texturizadas, olhos amarelos expressivos, chapéu de palha de barqueiro, camisa listrada de marinheiro e macacão jeans de pescador.

##### 1. Prompt de Caminhada (`Walk` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic alligator ferryman NPC walking cycle, Animal Crossing New Horizons art style, Sea of Stars 3/4 high top-down perspective, mossy green scaly texture, friendly wide yellow eyes, wearing straw boatman hat, striped sailor shirt and fisherman overalls, organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames walking South facing front, Row 2: 8 frames walking North facing back, Row 3: 8 frames walking West facing left, Row 4: 8 frames walking East facing right), solid white background without any grid lines, smooth 2.5D vector illustration, soft 3D clay lighting
```

##### 2. Prompt de Parado / Respiração (`Idle` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic alligator ferryman NPC idle breathing animation, Animal Crossing New Horizons art style, Sea of Stars 3/4 top-down perspective, mossy green scales, straw boatman hat, striped shirt and denim overalls, organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames idle breathing South facing front, Row 2: 8 frames idle North facing back, Row 3: 8 frames idle West facing left, Row 4: 8 frames idle East facing right), solid white background without grid lines, clean vector art
```

##### 3. Prompt de Fabricação / Ação (`Craft / Work` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic alligator ferryman NPC crafting working animation, Animal Crossing New Horizons art style, Sea of Stars 3/4 top-down viewpoint, mossy green alligator, straw hat, standing working animation moving arms up and down in front of chest without items, organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames crafting South facing front, Row 2: 8 frames crafting North facing back, Row 3: 8 frames crafting West facing left, Row 4: 8 frames crafting East facing right), solid white background without grid lines, clean vector illustration
```

##### 4. Prompt de Montado no Dragão / Barco (`Mounted / Riding` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic alligator ferryman NPC riding dragon mount pose, Animal Crossing New Horizons art style, Sea of Stars 3/4 top-down angle, green alligator, straw hat, overalls, seated in saddle pose holding reins with steady riding bobbing motion, neatly arranged in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames riding South facing front, Row 2: 8 frames riding North facing back, Row 3: 8 frames riding West facing left, Row 4: 8 frames riding East facing right), solid white background without grid lines, clean vector art
```

---

### 3.3. Macaco — O Mestre Construtor (`npc_monkey_builder` - Bambu)
* **Visual:** Pelagem marrom e pêssego, capacete de construção amarelo com recortes para as orelhas, macacão jeans com bolsos de ferramentas.

##### 1. Prompt de Caminhada (`Walk` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic capuchin monkey carpenter builder NPC walking cycle, Animal Crossing New Horizons style, high 3/4 top-down view like Sea of Stars, fluffy brown fur with peach face, mischievous smile, yellow construction hardhat with ear cutouts and denim tool overalls, organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames walking South facing front, Row 2: 8 frames walking North facing back, Row 3: 8 frames walking West facing left, Row 4: 8 frames walking East facing right), crisp vector art, solid white background without any grid lines, soft 3D clay lighting
```

##### 2. Prompt de Parado / Respiração (`Idle` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic monkey builder NPC idle breathing animation, Animal Crossing New Horizons style, Sea of Stars 3/4 top-down perspective, brown fur, peach face, yellow construction hardhat, denim overalls, organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames idle breathing South facing front, Row 2: 8 frames idle North facing back, Row 3: 8 frames idle West facing left, Row 4: 8 frames idle East facing right), solid pure white background without grid lines, clean vector art
```

##### 3. Prompt de Fabricação / Crafting (`Craft` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic monkey builder NPC crafting building animation, Animal Crossing New Horizons style, Sea of Stars 3/4 top-down viewpoint, monkey carpenter, yellow hardhat, standing hammering crafting animation enthusiastically moving arms up and down without holding objects, neatly arranged in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames crafting South facing front, Row 2: 8 frames crafting North facing back, Row 3: 8 frames crafting West facing left, Row 4: 8 frames crafting East facing right), solid white background without grid lines, clean vector art
```

##### 4. Prompt de Montado no Dragão (`Mounted / Riding` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic monkey builder NPC riding dragon mount pose, Animal Crossing New Horizons style, Sea of Stars 3/4 top-down view, brown fur, yellow hardhat, denim overalls, seated saddle riding pose holding reins with lively flight bobbing, neatly organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames riding South facing front, Row 2: 8 frames riding North facing back, Row 3: 8 frames riding West facing left, Row 4: 8 frames riding East facing right), solid white background without grid lines, clean 2.5D vector illustration
```

---

### 3.4. Camaleão — O Ilusionista Mágico (`npc_chameleon_magician` - Cromos)
* **Visual:** Escamas verdes e iridescentes que mudam de cor, olhos grandes espirais independentes, cauda enrolada, capa roxa de mágico com forro estrelado e mini-cartola.

##### 1. Prompt de Caminhada (`Walk` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic chameleon magician NPC walking cycle, Animal Crossing New Horizons aesthetic, Sea of Stars 3/4 high top-down angle, iridescent green and shifting rainbow scales, big spiral expressive independent eyes, curled tail, purple magician cape with gold starry lining and tiny top hat, organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames walking South facing front, Row 2: 8 frames walking North facing back, Row 3: 8 frames walking West facing left, Row 4: 8 frames walking East facing right), clean vector art, solid white background without any grid lines, smooth 3D lighting
```

##### 2. Prompt de Parado / Respiração (`Idle` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic chameleon magician NPC idle breathing animation, Animal Crossing New Horizons aesthetic, Sea of Stars 3/4 top-down perspective, iridescent green scales, spiral eyes, purple magician cape with star lining and tiny top hat, organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames idle breathing South facing front, Row 2: 8 frames idle North facing back, Row 3: 8 frames idle West facing left, Row 4: 8 frames idle East facing right), solid white background without grid lines, clean 2.5D vector art
```

##### 3. Prompt de Fabricação / Magia (`Craft / Magic` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic chameleon magician NPC enchanting crafting animation, Animal Crossing New Horizons aesthetic, Sea of Stars 3/4 top-down angle, green chameleon, purple starry cape, standing spellcasting crafting animation waving arms rhythmically in front of chest without items, organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames crafting South facing front, Row 2: 8 frames crafting North facing back, Row 3: 8 frames crafting West facing left, Row 4: 8 frames crafting East facing right), solid white background without grid lines, clean vector art
```

##### 4. Prompt de Montado no Dragão (`Mounted / Riding` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic chameleon magician NPC riding dragon mount pose, Animal Crossing New Horizons aesthetic, Sea of Stars 3/4 top-down viewpoint, iridescent scales, purple cape, tiny top hat, seated saddle riding pose holding dragon reins with magical float bobbing motion, organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames riding South facing front, Row 2: 8 frames riding North facing back, Row 3: 8 frames riding West facing left, Row 4: 8 frames riding East facing right), solid white background without grid lines, clean vector illustration
```

---

### 3.5. Coruja — O Professor Ancião (`npc_owl_professor` - Dr. Arquimedes)
* **Visual:** Penas salpicadas de marrom e creme, olhos dourados sábios com óculos redondos de aro dourado, colete de tweed com gravata borboleta e capelo acadêmico.

##### 1. Prompt de Caminhada (`Walk` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic scholarly barn owl professor NPC walking cycle, Animal Crossing New Horizons art style, high 3/4 top-down perspective like Sea of Stars, fluffy speckled brown and cream feathers, wise big golden eyes behind round gold spectacles, brown tweed scholarly vest, bow tie and academic cap, organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames walking South facing front, Row 2: 8 frames walking North facing back, Row 3: 8 frames walking West facing left, Row 4: 8 frames walking East facing right), clean vector art, solid white background without any grid lines, soft 3D clay lighting
```

##### 2. Prompt de Parado / Respiração (`Idle` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic scholarly owl professor NPC idle breathing animation, Animal Crossing New Horizons art style, Sea of Stars 3/4 top-down viewpoint, speckled brown feathers, round gold spectacles, tweed vest, bow tie and academic cap, organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames idle breathing South facing front, Row 2: 8 frames idle North facing back, Row 3: 8 frames idle West facing left, Row 4: 8 frames idle East facing right), solid white background without grid lines, clean vector art
```

##### 3. Prompt de Fabricação / Pesquisa (`Craft / Research` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic scholarly owl professor NPC researching crafting animation, Animal Crossing New Horizons style, Sea of Stars 3/4 top-down perspective, owl professor, tweed vest, academic cap, standing studying animation moving wingtips/arms thoughtfully up and down in front of chest without items, organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames crafting South facing front, Row 2: 8 frames crafting North facing back, Row 3: 8 frames crafting West facing left, Row 4: 8 frames crafting East facing right), solid white background without grid lines, clean 2.5D vector art
```

##### 4. Prompt de Montado no Dragão (`Mounted / Riding` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic scholarly owl professor NPC riding dragon mount pose, Animal Crossing New Horizons art style, Sea of Stars 3/4 high top-down perspective, speckled owl, tweed vest, academic cap, seated saddle riding pose holding reins with dignified aerial bobbing motion, neatly organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames riding South facing front, Row 2: 8 frames riding North facing back, Row 3: 8 frames riding West facing left, Row 4: 8 frames riding East facing right), solid white background without grid lines, clean vector illustration
```

---

## 4. 🏰 NPCs Complementares da Vila Medieval

---

### 4.1. Touro — O Ferreiro Forjador (`npc_bull_blacksmith` - Brutus)
* **Visual:** Pelagem castanho-avermelhada felpuda, chifres curvos com argola de bronze no nariz, avental pesado de ferreiro de couro com manchas de fuligem.

##### 1. Prompt de Caminhada (`Walk` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic highland bull blacksmith NPC walking cycle, Animal Crossing New Horizons aesthetic, Sea of Stars 3/4 high top-down viewpoint, shaggy reddish-brown fur, curved horns with brass nose ring, kind dark eyes, heavy leather blacksmith apron with soot smudges, organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames walking South facing front, Row 2: 8 frames walking North facing back, Row 3: 8 frames walking West facing left, Row 4: 8 frames walking East facing right), clean vector illustration, solid white background without any grid lines, soft 3D clay lighting
```

##### 2. Prompt de Parado / Respiração (`Idle` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic bull blacksmith NPC idle breathing animation, Animal Crossing New Horizons aesthetic, Sea of Stars 3/4 top-down perspective, reddish-brown fur, curved horns, brass nose ring, leather blacksmith apron, organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames idle breathing South facing front, Row 2: 8 frames idle North facing back, Row 3: 8 frames idle West facing left, Row 4: 8 frames idle East facing right), solid white background without grid lines, clean vector art
```

##### 3. Prompt de Fabricação / Forja (`Craft / Forging` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic bull blacksmith NPC forging crafting animation, Animal Crossing New Horizons aesthetic, Sea of Stars 3/4 top-down angle, shaggy bull, leather apron, standing forging crafting animation pumping arms rhythmically up and down in front of chest without items, organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames crafting South facing front, Row 2: 8 frames crafting North facing back, Row 3: 8 frames crafting West facing left, Row 4: 8 frames crafting East facing right), solid white background without grid lines, clean 2.5D vector art
```

##### 4. Prompt de Montado no Dragão (`Mounted / Riding` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic bull blacksmith NPC riding earth dragon mount pose, Animal Crossing New Horizons aesthetic, Sea of Stars 3/4 top-down viewpoint, shaggy bull, curved horns, leather apron, sturdy seated saddle riding pose holding reins with heavy rhythmic bobbing motion, neatly organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames riding South facing front, Row 2: 8 frames riding North facing back, Row 3: 8 frames riding West facing left, Row 4: 8 frames riding East facing right), solid white background without grid lines, clean vector art
```

---

### 4.2. Coelho — A Herbalista e Fazendeira (`npc_rabbit_farmer` - Flora)
* **Visual:** Pelagem creme e rosa-pastel, orelhas longas caídas (lop-eared), vestido de linho floral com avental de jardinagem.

##### 1. Prompt de Caminhada (`Walk` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic lop-eared rabbit girl farmer herbalist NPC walking cycle, Animal Crossing New Horizons style, high 3/4 top-down angle like Sea of Stars, fluffy cream and pastel pink fur, long floppy ears, floral linen dress with gardening apron, organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames walking South facing front, Row 2: 8 frames walking North facing back, Row 3: 8 frames walking West facing left, Row 4: 8 frames walking East facing right), clean vector art, solid white background without any grid lines, soft 3D clay lighting
```

##### 2. Prompt de Parado / Respiração (`Idle` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic lop-eared rabbit girl farmer NPC idle breathing animation, Animal Crossing New Horizons style, Sea of Stars 3/4 top-down perspective, fluffy cream and pink fur, long floppy ears, floral linen dress with gardening apron, organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames idle breathing South facing front, Row 2: 8 frames idle North facing back, Row 3: 8 frames idle West facing left, Row 4: 8 frames idle East facing right), solid white background without grid lines, clean 2.5D vector illustration
```

##### 3. Prompt de Fabricação / Jardinagem (`Craft / Planting` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic rabbit girl farmer NPC gardening crafting animation, Animal Crossing New Horizons style, Sea of Stars 3/4 top-down angle, cream rabbit, floppy ears, floral dress with apron, standing crafting animation happily moving paws up and down in front of chest without items, organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames crafting South facing front, Row 2: 8 frames crafting North facing back, Row 3: 8 frames crafting West facing left, Row 4: 8 frames crafting East facing right), solid white background without grid lines, clean vector art
```

##### 4. Prompt de Montado no Dragão (`Mounted / Riding` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic rabbit girl farmer NPC riding nature dragon mount pose, Animal Crossing New Horizons style, Sea of Stars 3/4 high top-down viewpoint, cream fur, floppy ears, floral dress, seated in saddle pose holding reins with gentle cheerful riding bobbing, neatly organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames riding South facing front, Row 2: 8 frames riding North facing back, Row 3: 8 frames riding West facing left, Row 4: 8 frames riding East facing right), solid white background without grid lines, clean vector illustration
```

---

### 4.3. Tartaruga — O Guardião Ancestral (`npc_turtle_elder` - Mestre Casco)
* **Visual:** Casco antigo musgoso com padrões rúnicos entalhados, rosto enrugado sábio e amigável com longa barba branca esvoaçante e túnica de eremita.

##### 1. Prompt de Caminhada (`Walk` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic ancient sea turtle elder NPC walking cycle, Animal Crossing New Horizons art style, Sea of Stars 3/4 high top-down perspective, wrinkled friendly sage face with long white wispy beard, mossy carved ancient shell with glowing runic patterns and sage robe, organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames walking South facing front, Row 2: 8 frames walking North facing back, Row 3: 8 frames walking West facing left, Row 4: 8 frames walking East facing right), smooth 2.5D vector illustration, solid white background without any grid lines, soft 3D clay lighting
```

##### 2. Prompt de Parado / Respiração (`Idle` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic ancient turtle elder NPC idle breathing animation, Animal Crossing New Horizons art style, Sea of Stars 3/4 top-down viewpoint, wrinkled sage face, long white beard, mossy carved shell with runic patterns, organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames idle breathing South facing front, Row 2: 8 frames idle North facing back, Row 3: 8 frames idle West facing left, Row 4: 8 frames idle East facing right), solid white background without grid lines, clean vector art
```

##### 3. Prompt de Fabricação / Meditação (`Craft / Chanting` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic turtle elder NPC meditating crafting animation, Animal Crossing New Horizons art style, Sea of Stars 3/4 top-down angle, ancient turtle, mossy shell, long white beard, standing mystical crafting animation slowly raising and lowering flippers/hands in front of chest without items, organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames crafting South facing front, Row 2: 8 frames crafting North facing back, Row 3: 8 frames crafting West facing left, Row 4: 8 frames crafting East facing right), solid white background without grid lines, clean vector art
```

##### 4. Prompt de Montado no Dragão (`Mounted / Riding` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic ancient turtle elder NPC riding dragon mount pose, Animal Crossing New Horizons art style, Sea of Stars 3/4 high top-down perspective, ancient turtle, mossy shell, white beard, serene seated saddle riding pose holding reins with slow majestic bobbing motion, organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames riding South facing front, Row 2: 8 frames riding North facing back, Row 3: 8 frames riding West facing left, Row 4: 8 frames riding East facing right), solid white background without grid lines, clean vector illustration
```

---

### 4.4. Pinguim — O Pescador Polar (`npc_penguin_angler` - Pingo)
* **Visual:** Pinguim-imperador gordinho preto, branco e amarelo, gorro de lã tricotado com pompom fofo e capa impermeável amarela aconchegante.

##### 1. Prompt de Caminhada (`Walk` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic emperor penguin angler NPC walking cycle, Animal Crossing New Horizons aesthetic, high 3/4 top-down camera view like Sea of Stars, chubby black, white and yellow penguin body, bright curious eyes, wearing hand-knitted pom-pom winter beanie and cozy yellow raincoat, organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames walking South facing front, Row 2: 8 frames walking North facing back, Row 3: 8 frames walking West facing left, Row 4: 8 frames walking East facing right), clean vector art, solid white background without any grid lines, soft 3D clay lighting
```

##### 2. Prompt de Parado / Respiração (`Idle` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic emperor penguin angler NPC idle breathing animation, Animal Crossing New Horizons aesthetic, Sea of Stars 3/4 top-down perspective, chubby penguin body, pom-pom winter beanie and yellow raincoat, organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames idle breathing South facing front, Row 2: 8 frames idle North facing back, Row 3: 8 frames idle West facing left, Row 4: 8 frames idle East facing right), solid pure white background without grid lines, clean 2.5D vector art
```

##### 3. Prompt de Fabricação / Pesca (`Craft / Working` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic penguin angler NPC crafting working animation, Animal Crossing New Horizons aesthetic, Sea of Stars 3/4 top-down viewpoint, chubby penguin, yellow raincoat and pom-pom beanie, standing working animation waddling flippers up and down cheerfully in front of chest without items, organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames crafting South facing front, Row 2: 8 frames crafting North facing back, Row 3: 8 frames crafting West facing left, Row 4: 8 frames crafting East facing right), solid white background without grid lines, clean vector art
```

##### 4. Prompt de Montado no Dragão (`Mounted / Riding` - 4 Direções x 8 Frames):
```text
2D game character spritesheet of cute anthropomorphic penguin angler NPC riding ice dragon mount pose, Animal Crossing New Horizons aesthetic, Sea of Stars 3/4 high top-down viewpoint, chubby penguin, pom-pom beanie, yellow raincoat, seated saddle riding pose holding reins with cute buoyant riding bobbing motion, organized in exactly 4 horizontal rows of 8 animation frames each (Row 1: 8 frames riding South facing front, Row 2: 8 frames riding North facing back, Row 3: 8 frames riding West facing left, Row 4: 8 frames riding East facing right), solid white background without grid lines, clean vector illustration
```

---

## 5. 📊 Tabela Comparativa de Habilidades Únicas (Heróis Jogáveis)

| ID | Classe | Gênero | Nome do Herói | Habilidade Passiva | Efeito no Gameplay |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `char_wolf_hunter_m` | **Lobo Caçador** | ♂️ | *Ragnar* | **Faro Selvagem** | Revela trilha de pegadas para ovos de dragão e itens a 15 tiles. |
| `char_wolf_hunter_f` | **Lobo Caçadora** | ♀️ | *Lyra* | **Faro Selvagem** | Revela trilha de pegadas para ovos de dragão e itens a 15 tiles. |
| `char_bat_vampire_m` | **Morcego Vampiro** | ♂️ | *Vlad* | **Eco Noturno** | **+5 Ações Noturnas** (após 17h), visão no escuro e +15% vel. de ataque noturna ao dragão. |
| `char_bat_vampire_f` | **Morcego Vampira** | ♀️ | *Carmilla* | **Eco Noturno** | **+5 Ações Noturnas** (após 17h), visão no escuro e +15% vel. de ataque noturna ao dragão. |
| `char_eagle_archer_m` | **Águia Arqueiro** | ♂️ | *Zephyr* | **Mira Perfeita** | +30% velocidade de coleta com ferramentas e -1s no cooldown da Esquiva (Tecla 4). |
| `char_eagle_archer_f` | **Águia Arqueira** | ♀️ | *Astra* | **Mira Perfeita** | +30% velocidade de coleta com ferramentas e -1s no cooldown da Esquiva (Tecla 4). |
| `char_cat_mage_m` | **Gato Bruxo** | ♂️ | *Merlin* | **Afinidade Arcana** | +10% de ganho de XP aos dragões e pistas automáticas nos quebra-cabeças Lua. |
| `char_cat_witch_f` | **Gato Bruxa** | ♀️ | *Luna* | **Afinidade Arcana** | +10% de ganho de XP aos dragões e pistas automáticas nos quebra-cabeças Lua. |

---

## 🔗 Links Relacionados
* [[00 - High Concept & Game Vision]]
* [[Player Entity & 4-Way Movement]]
* [[Day Night Cycle & Action Points System]]
* [[Mount & Modular Character Layering System]]
