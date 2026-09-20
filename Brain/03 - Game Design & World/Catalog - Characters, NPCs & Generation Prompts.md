# 🐾 Catálogo Oficial de Personagens Jogáveis e NPCs (Design & Prompts)

> **Documento de Especificação de Heróis, Moradores da Ilha e Prompts de Geração de Arte**  
> **Diretriz Visual:** *Personagens antropomórficos adoráveis no estilo estético de **Animal Crossing: New Horizons** (proporções fofas 'chibi', olhos expressivos, vestimentas charmosas), renderizados em **Perspectiva 3/4 Top-Down (ângulo de visão elevado estilo Sea of Stars)**. Acabamento em **Vector Art 2.5D com sombreamento suave, oclusão de ambiente e iluminação 3D / Clay Render** (NÃO é pixel art).*

---

## 📋 Sumário do Catálogo

1. [🎨 Guia de Estrutura do Spritesheet (Grade 3x8)](#1-🎨-guia-de-estrutura-do-spritesheet-grade-3x8)
2. [🐺 Personagens Jogáveis — 4 Classes x 2 Gêneros = 8 Heróis](#2-🐺-personagens-jogáveis--4-classes-x-2-gêneros--8-heróis)
   * [2.1. Lobo — Caçador / Caçadora](#21-lobo--caçador--caçadora)
   * [2.2. Morcego — Vampiro / Vampira](#22-morcego--vampiro--vampira)
   * [2.3. Águia — Arqueiro / Arqueira](#23-águia--arqueiro--arqueira)
   * [2.4. Gato — Bruxo / Bruxa](#24-gato--bruxo--bruxa)
3. [🏝️ NPCs Principais da Ilha Lua](#3-🏝️-npcs-principais-da-ilha-lua)
   * [3.1. Tubarão — O Surfista](#31-tubarão--o-surfista-npc_shark_surfer)
   * [3.2. Jacaré — O Atravessador](#32-jacaré--o-atravessador-npc_alligator_ferryman)
   * [3.3. Macaco — O Mestre Construtor](#33-macaco--o-mestre-construtor-npc_monkey_builder)
   * [3.4. Camaleão — O Ilusionista Mágico](#34-camaleão--o-ilusionista-mágico-npc_chameleon_magician)
   * [3.5. Coruja — O Professor Ancião](#35-coruja--o-professor-ancião-npc_owl_professor)
4. [🏰 NPCs Complementares da Vila Medieval](#4-🏰-npcs-complementares-da-vila-medieval)
   * [4.1. Touro — O Ferreiro Forjador](#41-touro--o-ferreiro-forjador-npc_bull_blacksmith)
   * [4.2. Coelho — A Herbalista e Fazendeira](#42-coelho--a-herbalista-e-fazendeira-npc_rabbit_farmer)
   * [4.3. Tartaruga — O Guardião Ancestral](#43-tartaruga--o-guardião-ancestral-npc_turtle_elder)
   * [4.4. Pinguim — O Pescador Polar](#44-pinguim--o-pescador-polar-npc_penguin_angler)
5. [📊 Tabela Comparativa de Habilidades Únicas](#5-📊-tabela-comparativa-de-habilidades-únicas)

---

## 1. 🎨 Guia de Estrutura do Spritesheet (Grade 3x8)

Para garantir máxima organização visual e facilidade de corte manual/transparência, todo spritesheet de personagem jogável segue uma **grade estrita de 3 linhas com 8 frames por linha (24 frames no total)** em **fundo branco sólido e limpo (sem grades desenhadas, sem caixas, sem divisórias)**:

### 🎭 Estrutura Padrão do Spritesheet Oficial (3 Linhas x 8 Frames)
* **Formato do Spritesheet:** Exatamente **3 linhas horizontais de 8 frames (24 frames no total)** organizadas em grade contínua.
* **Fundo:** **Branco 100% puro e sólido (`#FFFFFF`) sem linhas de grade, sem caixas, sem bordas, sem molduras**.
* **Linhas de Animação:**
  1. **Linha 1 (8 frames):** `Idle` (respiração suave e postura relaxada).
  2. **Linha 2 (8 frames):** `Walk` (ciclo completo de caminhada em 8 frames).
  3. **Linha 3 (8 frames):** `Craft` (personagem em pé alegre, movimentando os braços para cima e para baixo em frente ao peito sem segurar objetos — estilo Animal Crossing).
* **Movimentação:** 4 Direções cardinais (Sul/Frente, Leste/Direita, Norte/Costas, Oeste/Esquerda). *(A mecânica de corrida a pé foi removida, substituída pela velocidade das montarias de dragões).*
* **Corte e Transparência:** Tratamento manual e recorte realizado diretamente pelo criador/desenvolvedor.** (Voadores, Terrestres e Aquáticos).

* **Prompt Base Style Tag para Spritesheets:**  
  `2D game character spritesheet, Animal Crossing New Horizons art style, Sea of Stars 3/4 high top-down perspective, neatly organized in exactly 3 horizontal rows of 8 animation frames each (Row 1: 8 frames idle breathing cycle, Row 2: 8 frames walking cycle, Row 3: 8 frames standing crafting animation happily moving arms up and down without holding objects), solid pure plain white background without any grid lines or borders, clean 2.5D vector art, smooth 3D clay lighting`

---

## 2. 🐺 Personagens Jogáveis — 4 Classes x 2 Gêneros = 8 Heróis

Cada jogador pode escolher livremente seu avatar inicial. Cada classe possui **1 Habilidade Passiva Única**.

---

### 2.1. Lobo — Caçador / Caçadora
* **Arquétipo:** O Rastreador Destemido da Floresta.
* **Personalidade:** Leal, corajoso, enérgico e com instinto aguçado para aventuras ao ar livre.
* **Habilidade Única — `Faro Selvagem`:** Revela pegadas brilhantes no chão que apontam na direção de ovos de dragão ocultos e recursos raros a até 15 tiles de distância.

#### 🐺 Lobo Masculino (`char_wolf_hunter_m`)
* **Visual:** Pelagem cinza-chumbo com focinho creme fofo, orelhas pontudas atentas, olhos dourados calorosos, túnica de caçador de couro macio verde-floresta com fivela de bronze e pequena pena presa na touca.
* **Prompt de Geração do Spritesheet (3x8):**
  > `2D game character spritesheet of cute anthropomorphic wolf boy hunter, Animal Crossing New Horizons art style, Sea of Stars 3/4 high top-down perspective, charcoal-gray and cream fur, amber eyes, forest-green leather tunic with bronze buckle and tiny feather hat, neatly arranged in exactly 3 horizontal rows of 8 frames each (Row 1: 8 frames idle breathing, Row 2: 8 frames walking cycle, Row 3: 8 frames standing crafting animation moving arms up and down without items), solid pure white background without any grid lines or boxes, clean vector art, soft 3D clay lighting`

#### 🐺 Lobo Feminino (`char_wolf_hunter_f`)
* **Visual:** Pelagem branca-ártica com detalhes prateados, olhos azul-gelo curiosos e expressivos, lenço vermelho no pescoço sobre capa curta de batedora verde-oliva e botas de camurça com pelos fofos.
* **Prompt de Geração do Spritesheet (3x8):**
  > `2D game character spritesheet of cute anthropomorphic arctic wolf girl ranger, Animal Crossing New Horizons art style, Sea of Stars 3/4 top-down perspective, soft white and silver fur, bright cyan eyes, red neck scarf over olive-green scout capelet and fur boots, arranged in exactly 3 horizontal rows of 8 frames each (Row 1: 8 frames idle, Row 2: 8 frames walking cycle, Row 3: 8 frames standing crafting moving arms up and down without items), solid plain white background, no grid lines, clean 2.5D vector illustration, smooth 3D clay lighting`

---

### 2.2. Morcego — Vampiro / Vampira
* **Arquétipo:** O Aristocrata Noturno e Alquimista.
* **Personalidade:** Culto, misterioso, refinado, amante da noite, de livros arcanos e de poções doces.
* **Habilidade Única — `Eco Noturno`:** Permite enxergar com clareza dentro de cavernas, concede **+5 Ações Noturnas exclusivas** durante a noite (após às 17h de Brasília, quando outros descansam) e +15% de velocidade de ataque noturno ao dragão companheiro.

#### 🦇 Morcego Masculino (`char_bat_vampire_m`)
* **Visual:** Pelagem roxo-escura aveludada, orelhas grandes triangulares com interior rosa suave, dentinhos pontudos adoráveis ao sorrir, colete bordô com botões dourados e mini-capa preta de seda.
* **Prompt de Geração do Spritesheet (3x8):**
  > `2D game character spritesheet of cute anthropomorphic fruit bat boy vampire, Animal Crossing New Horizons aesthetic, Sea of Stars 3/4 top-down viewpoint, dark plum-purple fur, big bat ears, tiny fang smile, burgundy gentleman vest with gold buttons and black mini-cape, arranged in 3 horizontal rows of 8 frames each (Row 1: 8 frames idle, Row 2: 8 frames walk cycle, Row 3: 8 frames standing crafting animation moving arms up and down without items), solid pure white background, no grid lines, clean vector art, soft 3D shading`

#### 🦇 Morcego Feminino (`char_bat_vampire_f`)
* **Visual:** Pelagem lilás suave com penugem no peito, asas membranosas charmosas nos bracinhos, vestido vitoriano preto e lilás com gola rendada branca e presilha de morcego de safira.
* **Prompt de Geração do Spritesheet (3x8):**
  > `2D game character spritesheet of cute anthropomorphic bat girl vampire noble, Animal Crossing New Horizons style, Sea of Stars 3/4 top-down perspective, pastel lilac fur with white chest fluff, gothic-lolita black and purple medieval dress with white lace collar, organized in 3 horizontal rows of 8 frames each (Row 1: 8 frames idle, Row 2: 8 frames walking, Row 3: 8 frames standing crafting moving arms without objects), solid plain white background, no grid lines, clean vector art`

---

### 2.3. Águia — Arqueiro / Arqueira
* **Arquétipo:** O Sentinela Alado dos Cumes.
* **Personalidade:** Focado, observador, disciplinado, bem-humorado e apaixonado pela brisa das montanhas.
* **Habilidade Única — `Mira Perfeita`:** Aumenta a velocidade de coleta com a Vara de Pescar e Machado em 30%, além de recarregar a *Esquiva Tática (Tecla 1)* do dragão 1 segundo mais rápido.

#### 🦅 Águia Masculino (`char_eagle_archer_m`)
* **Visual:** Penas marrons com cabeça branca de águia-careca majestosa e fofa, bico dourado pequeno e amigável, gibão de arqueiro azul-celeste com protetor de ombro de couro e aljava miniatura nas costas.
* **Prompt de Geração do Spritesheet (3x8):**
  > `2D game character spritesheet of cute anthropomorphic eagle boy archer, Animal Crossing New Horizons art style, Sea of Stars 3/4 top-down viewpoint, brown feathers, fluffy white head plumage, yellow beak, sky-blue archer tunic with leather bracers, organized in 3 horizontal rows of 8 frames each (Row 1: 8 frames idle, Row 2: 8 frames walking cycle, Row 3: 8 frames standing crafting animation moving arms up and down without holding items), solid pure white background, no grid lines, clean 2.5D vector illustration`

#### 🦅 Águia Feminina (`char_eagle_archer_f`)
* **Visual:** Penas de falcão dourado e creme, penugem estilosa como franja, olhos amendoados dourados, túnica de batedora em tons de turquesa e dourado com broche de asa de pássaro no peito.
* **Prompt de Geração do Spritesheet (3x8):**
  > `2D game character spritesheet of cute anthropomorphic golden falcon girl marksman, Animal Crossing New Horizons aesthetic, Sea of Stars 3/4 top-down angle, golden-tan feathers, stylish crest, teal and gold trimmed archer tunic with feather brooch, arranged in 3 horizontal rows of 8 frames each (Row 1: 8 frames idle, Row 2: 8 frames walk, Row 3: 8 frames standing crafting moving arms without items), solid plain white background, no grid lines, clean vector art`

---

### 2.4. Gato — Bruxo / Bruxa
* **Arquétipo:** O Conjurador Místico e Estudioso de Lua.
* **Personalidade:** Curioso, brincalhão, místico, engenhoso e fascinado por resolver quebra-cabeças lógicos.
* **Habilidade Única — `Afinidade Arcana`:** Concede +10% de ganho de XP para os dragões domesticados e desbloqueia dicas automáticas nos desafios de programação Blockly.

#### 🐱 Gato Masculino (`char_cat_mage_m`)
* **Visual:** Pelagem de gato preto aveludado com patinhas brancas ("meias"), cauda longa ondulante com ponta dourada, túnica de feiticeiro azul-noite estrelada e pequeno chapéu pontudo tortinho com lua crescente.
* **Prompt de Geração do Spritesheet (3x8):**
  > `2D game character spritesheet of cute anthropomorphic black cat boy wizard, Animal Crossing New Horizons aesthetic, Sea of Stars 3/4 top-down perspective, sleek black fur with white paw socks, emerald green eyes, midnight-blue star-patterned robe and crooked pointed wizard hat with crescent moon, arranged in 3 horizontal rows of 8 frames each (Row 1: 8 frames idle, Row 2: 8 frames walk, Row 3: 8 frames standing crafting moving arms without items), solid pure white background, no grid lines, clean vector art`

#### 🐱 Gato Feminino (`char_cat_witch_f`)
* **Visual:** Pelagem tricolor (calico) fofa (laranja, preto e branco), grandes olhos verdes brilhantes, vestido de bruxinha roxo e abóbora com avental branco rendado e bolsinha mágica pendurada na cintura.
* **Prompt de Geração do Spritesheet (3x8):**
  > `2D game character spritesheet of cute anthropomorphic calico cat girl witch, Animal Crossing New Horizons art style, Sea of Stars 3/4 top-down viewpoint, fluffy spotted calico fur, sparkling emerald eyes, purple and orange apprentice witch dress with white apron, organized in 3 horizontal rows of 8 frames each (Row 1: 8 frames idle, Row 2: 8 frames walking, Row 3: 8 frames standing crafting moving arms without items), solid plain white background, no grid lines, clean 2.5D vector illustration`

---

## 3. 🏝️ NPCs Principais da Ilha Lua

Os NPCs são os moradores fixos da ilha que introduzem mecânicas de gameplay, comércio, viagens e a trilha de aprendizado de programação em Lua.

---

### 3.1. Tubarão — O Surfista (`npc_shark_surfer`)
* **Nome / Alcunha:** *Kai, o Tubarão das Ondas*
* **Papel:** Instrutor de navegação, pesca costeira e mestre dos Dragões Aquáticos.
* **Personalidade:** Descontraído, alto-astral, usa gírias de praia medievais ("Irado, meu nobre!"), apaixonado pelas marés e por aventuras no mar.
* **Prompt de Geração:**
  > `Cute anthropomorphic great white shark surfer NPC character portrait and sprite, Animal Crossing New Horizons aesthetic, Sea of Stars high 3/4 top-down camera angle, smooth light-blue and white skin, cute round snout with friendly toothy grin, wearing a colorful tropical hibiscus patterned open vest and woven shell necklace, clean vector art with soft 3D lighting, solid white background, no grid lines`

---

### 3.2. Jacaré — O Atravessador (`npc_alligator_ferryman`)
* **Nome / Alcunha:** *Barnabé, o Barqueiro dos Pântanos*
* **Papel:** Operador de balsas, pontes e travessias fluviais entre ilhotas.
* **Prompt de Geração:**
  > `Cute anthropomorphic alligator ferryman NPC character, Animal Crossing New Horizons art style, Sea of Stars 3/4 top-down perspective, mossy green scaly texture, friendly wide yellow eyes, wearing a straw boatman hat, striped sailor shirt and rolled-up fisherman overalls holding an oar, smooth 2.5D vector illustration, solid white background, no grid lines`

---

### 3.3. Macaco — O Mestre Construtor (`npc_monkey_builder`)
* **Nome / Alcunha:** *Bambu, o Engenheiro da Bancada*
* **Papel:** Guardião do *Workbench* (Bancada de Trabalho) e Mestre de Obras.
* **Prompt de Geração:**
  > `Cute anthropomorphic brown capuchin monkey carpenter builder NPC, Animal Crossing New Horizons style, high 3/4 top-down view like Sea of Stars, fluffy brown fur with peach face, mischievous wide smile, wearing a yellow construction hardhat with cute ear cutouts, denim tool overalls with wooden ruler and tiny hammer in belt, crisp vector art, solid white background, no grid lines`

---

### 3.4. Camaleão — O Ilusionista Mágico (`npc_chameleon_magician`)
* **Nome / Alcunha:** *Cromos, o Tecelão de Cores*
* **Papel:** Mestre das tinturas, ilusões visuais e customização estética de tiles e dragões.
* **Prompt de Geração:**
  > `Cute anthropomorphic chameleon magician NPC character, Animal Crossing New Horizons aesthetic, Sea of Stars 3/4 top-down angle, iridescent green and rainbow shifting scales, big spiral expressive independent eyes, curled tail, wearing a purple magician cape with gold starry lining and a tiny top hat, clean vector art, solid white background, no grid lines`

---

### 3.5. Coruja — O Professor Ancião (`npc_owl_professor`)
* **Nome / Alcunha:** *Dr. Arquimedes, o Mestre de Lua*
* **Papel:** Mentor principal da Trilha Educativa de Programação (Blockly ➔ Lua).
* **Prompt de Geração:**
  > `Cute anthropomorphic scholarly barn owl professor NPC, Animal Crossing New Horizons art style, high 3/4 top-down perspective like Sea of Stars, fluffy speckled brown and cream feathers, wise big golden eyes behind round gold-rimmed spectacles, wearing a brown tweed scholarly vest, bow tie and tiny mortarboard academic cap, holding a rolled parchment scroll, clean vector art, solid white background, no grid lines`

---

## 4. 🏰 NPCs Complementares da Vila Medieval

---

### 4.1. Touro — O Ferreiro Forjador (`npc_bull_blacksmith`)
* **Nome / Alcunha:** *Brutus, o Mestre da Bigorna*
* **Papel:** Ferreiro da vila e artesão de equipamentos.
* **Prompt de Geração:**
  > `Cute anthropomorphic highland bull blacksmith NPC, Animal Crossing New Horizons aesthetic, Sea of Stars 3/4 top-down viewpoint, shaggy reddish-brown fur, curved horns with brass ring on nose, kind dark eyes, wearing a heavy leather blacksmith apron with soot smudges, clean vector illustration, solid white background, no grid lines`

---

### 4.2. Coelho — A Herbalista e Fazendeira (`npc_rabbit_farmer`)
* **Nome / Alcunha:** *Flora, a Cultivadora de Brotos*
* **Papel:** Mestre da agricultura, botânica e criação de ninhos.
* **Prompt de Geração:**
  > `Cute anthropomorphic lop-eared rabbit girl farmer herbalist NPC, Animal Crossing New Horizons style, high 3/4 top-down angle like Sea of Stars, fluffy cream and pastel pink fur, long floppy ears, wearing a floral linen dress with gardening apron holding a small watering can and flower basket, clean vector art, solid white background, no grid lines`

---

### 4.3. Tartaruga — O Guardião Ancestral (`npc_turtle_elder`)
* **Nome / Alcunha:** *Mestre Casco, o Guardião da Ilha*
* **Papel:** Guardião das lendas milenares e dos santuários da ilha.
* **Prompt de Geração:**
  > `Cute anthropomorphic ancient sea turtle elder NPC, Animal Crossing New Horizons art style, Sea of Stars 3/4 top-down perspective, wrinkled friendly sage face with long white wispy beard, mossy carved ancient shell with glowing runic patterns, leaning on a gnarly wooden walking staff, smooth 2.5D vector illustration, solid white background, no grid lines`

---

### 4.4. Pinguim — O Pescador Polar (`npc_penguin_angler`)
* **Nome / Alcunha:** *Pingo, o Navegador dos Icebergs*
* **Papel:** Especialista em biomas aquáticos gelados e pesca marinha profunda.
* **Prompt de Geração:**
  > `Cute anthropomorphic emperor penguin angler NPC, Animal Crossing New Horizons aesthetic, high 3/4 top-down camera view like Sea of Stars, chubby black, white and yellow penguin body, bright curious eyes, wearing a hand-knitted pom-pom winter beanie and a cozy yellow raincoat holding a bamboo fishing rod, clean vector art, solid white background, no grid lines`

---

## 5. 📊 Tabela Comparativa de Habilidades Únicas (Heróis Jogáveis)

| ID | Classe | Gênero | Nome do Herói | Habilidade Passiva | Efeito no Gameplay |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `char_wolf_hunter_m` | **Lobo Caçador** | ♂️ | *Ragnar* | **Faro Selvagem** | Revela trilha de pegadas para ovos de dragão e itens a 15 tiles. |
| `char_wolf_hunter_f` | **Lobo Caçadora** | ♀️ | *Lyra* | **Faro Selvagem** | Revela trilha de pegadas para ovos de dragão e itens a 15 tiles. |
| `char_bat_vampire_m` | **Morcego Vampiro** | ♂️ | *Vlad* | **Eco Noturno** | **+5 Ações Noturnas** (após 17h), visão no escuro e +15% vel. de ataque noturna ao dragão. |
| `char_bat_vampire_f` | **Morcego Vampira** | ♀️ | *Carmilla* | **Eco Noturno** | **+5 Ações Noturnas** (após 17h), visão no escuro e +15% vel. de ataque noturna ao dragão. |
| `char_eagle_archer_m` | **Águia Arqueiro** | ♂️ | *Zephyr* | **Mira Perfeita** | +30% velocidade de coleta com ferramentas e -1s no cooldown da Esquiva (Tecla 1). |
| `char_eagle_archer_f` | **Águia Arqueira** | ♀️ | *Astra* | **Mira Perfeita** | +30% velocidade de coleta com ferramentas e -1s no cooldown da Esquiva (Tecla 1). |
| `char_cat_mage_m` | **Gato Bruxo** | ♂️ | *Merlin* | **Afinidade Arcana** | +10% de ganho de XP aos dragões e pistas automáticas nos quebra-cabeças Lua. |
| `char_cat_witch_f` | **Gato Bruxa** | ♀️ | *Luna* | **Afinidade Arcana** | +10% de ganho de XP aos dragões e pistas automáticas nos quebra-cabeças Lua. |

---

## 🔗 Links Relacionados
* [[00 - High Concept & Game Vision]]
* [[Player Entity & 4-Way Movement]]
* [[Day Night Cycle & Action Points System]]
* [[Mount & Modular Character Layering System]]
