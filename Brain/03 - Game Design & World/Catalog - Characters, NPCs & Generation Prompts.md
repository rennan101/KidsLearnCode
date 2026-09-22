# 🐾 Catálogo Oficial de Personagens Jogáveis e NPCs (Design Frontal Reto & Prompts 1x8)

> **Documento de Especificação de Heróis, Moradores da Ilha e Prompts de Geração de Spritesheets**  
> **Diretriz Visual:** *Personagens antropomórficos adoráveis no estilo estético de **Animal Crossing: New Horizons** (proporções fofas 'chibi', olhos expressivos, vestimentas charmosas). Acabamento em **Vector Art 2.5D com sombreamento suave, oclusão de ambiente e iluminação 3D / Clay Render**.*
> **Enquadramento Cardinal Reto (Straight-On Front/Back/Side):**
> * **Sul (South / Frente):** Visão frontal reta e centralizada olhando diretamente para a câmera (NÃO em ângulo 3/4), caminhando em linha reta para a frente.
> * **Norte (North / Costas):** Visão traseira reta centralizada de costas para a câmera, caminhando em linha reta para longe.
> * **Leste (East / Lateral):** Perfil lateral direto virado para a direita. *(Espelhe horizontalmente para obter o Oeste/Esquerda)*.
> **Design Bilateralmente Simétrico (Seamless Flip):** *Acessórios, roupas e fechos centralizados para permitir espelhamento perfeito.*
> **Fundo:** *Branco 100% puro e sólido (`#FFFFFF`) sem linhas, sem caixas e sem sombras no chão.*

---

## 📋 Sumário do Catálogo

1. [🎨 Guia de Estrutura Modular (3 Direções x 1 Linha de 8 Frames)](#1-🎨-guia-de-estrutura-modular-3-direções-x-1-linha-de-8-frames)
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

## 1. 🎨 Guia de Estrutura Modular (3 Direções x 1 Linha de 8 Frames)

Para garantir máxima fidelidade no Google AI Studio (Imagen 3 / Gemini):
* Cada prompt gera **exatamente 1 única linha horizontal de 8 frames (1x8)** em formato Widescreen (`16:9`).
* **Design Simétrico Bilateral:** Roupas, fivelas, bolsas e cabelos são centralizados.
* **Apenas 3 Prompts por Ação:**
  1. **Sul (South / Frente):** Visão frontal reta e direta olhando para a frente. Na montaria: tronco ereto, rédeas à frente, pernas abertas para ambos os lados contornando o dorso.
  2. **Norte (North / Costas):** Visão traseira reta de costas para a câmera. Na montaria: visto de costas, pernas abertas nas laterais, tronco firme.
  3. **Leste / Lateral (East / Side View):** Perfil lateral direto virado para a direita. Na montaria: tronco inclinado para a frente segurando rédeas, **apenas a perna direita (próxima) visível flexionada**, perna esquerda oculta pelo dragão. *(Espelhe horizontalmente para obter Oeste)*.
* **Fundo:** Fundo sólido branco puro (`#FFFFFF`) sem molduras, sem grades e sem sombras no chão.

---

## 2. 🐺 Personagens Jogáveis — 4 Classes x 2 Gêneros = 8 Heróis

---

### 2.1. Lobo — Caçador / Caçadora
* **Arquétipo:** O Rastreador Destemido da Floresta.
* **Habilidade Única — `Faro Selvagem`:** Revela pegadas brilhantes no chão apontando para ovos de dragão e minérios raros a até 15 tiles.

---

#### 🐺 Lobo Masculino (`char_wolf_hunter_m` - Ragnar)
* **Visual Simétrico:** Pelagem cinza-chumbo com focinho creme simétrico, orelhas pontudas eretas, túnica de caçador de couro verde-floresta com cinto e fivela de bronze centralizada no peito.

##### 1. Caminhada (`Walk` - 1 Linha x 8 Frames):
* **South (Frente Direta):**
  ```text
  2D sprite strip of cute chibi wolf boy hunter walking straight forward towards camera, Animal Crossing New Horizons style, perfectly centered straight front view, symmetrical design, charcoal-gray and cream fur, amber eyes, forest-green leather tunic with centered bronze belt buckle, facing SOUTH, single horizontal row of EXACTLY 8 sequential animation frames of forward walking cycle, solid plain white background #FFFFFF, clean vector art, soft 3D clay lighting, no floor shadows, no pixel art
  ```
* **North (Costas Retas):**
  ```text
  2D sprite strip of cute chibi wolf boy hunter walking straight away from camera, Animal Crossing New Horizons style, perfectly centered straight back view, symmetrical design, charcoal-gray fur, forest-green tunic, facing NORTH, single horizontal row of EXACTLY 8 sequential animation frames of walking away cycle, solid plain white background #FFFFFF, clean vector art, soft 3D clay lighting, no floor shadows, no pixel art
  ```
* **East / Side (Lateral Direita - Espelhável para Oeste):**
  ```text
  2D sprite strip of cute chibi wolf boy hunter walking sideways, Animal Crossing New Horizons style, straight side profile view, symmetrical design, charcoal-gray fur, forest-green tunic, facing EAST (flippable for WEST), single horizontal row of EXACTLY 8 sequential animation frames of side walking cycle, solid plain white background #FFFFFF, clean vector art, soft 3D clay lighting, no floor shadows, no pixel art
  ```

##### 2. Parado / Respiração (`Idle` - 1 Linha x 8 Frames):
* **South (Frente Direta):**
  ```text
  2D sprite strip of cute chibi wolf boy hunter idle breathing, Animal Crossing style, straight front view facing camera, symmetrical design, charcoal-gray fur, green tunic, facing SOUTH, single horizontal row of EXACTLY 8 frames gentle breathing cycle, solid plain white background #FFFFFF, clean vector art, soft 3D clay lighting
  ```
* **North (Costas Retas):**
  ```text
  2D sprite strip of cute chibi wolf boy hunter idle breathing, Animal Crossing style, straight back view facing away, symmetrical design, charcoal-gray fur, green tunic, facing NORTH, single horizontal row of EXACTLY 8 frames gentle breathing cycle, solid plain white background #FFFFFF, clean vector art, soft 3D clay lighting
  ```
* **East / Side (Lateral Direita):**
  ```text
  2D sprite strip of cute chibi wolf boy hunter idle breathing, Animal Crossing style, straight side profile view, symmetrical design, charcoal-gray fur, green tunic, facing EAST (flippable for WEST), single horizontal row of EXACTLY 8 frames gentle side breathing cycle, solid plain white background #FFFFFF, clean vector art
  ```

##### 3. Fabricação / Crafting (`Craft` - 1 Linha x 8 Frames):
* **South (Frente Direta):**
  ```text
  2D sprite strip of cute chibi wolf boy hunter crafting, Animal Crossing style, straight front view, symmetrical design, charcoal-gray fur, green tunic, facing SOUTH, standing happily moving arms symmetrically up and down in front of chest without items, single horizontal row of EXACTLY 8 crafting frames, solid plain white background #FFFFFF, clean vector art
  ```
* **North (Costas Retas):**
  ```text
  2D sprite strip of cute chibi wolf boy hunter crafting, Animal Crossing style, straight back view, symmetrical design, charcoal-gray fur, green tunic, facing NORTH, standing moving arms up and down in front of chest without items, single horizontal row of EXACTLY 8 crafting frames, solid plain white background #FFFFFF, clean vector art
  ```
* **East / Side (Lateral Direita):**
  ```text
  2D sprite strip of cute chibi wolf boy hunter crafting, Animal Crossing style, straight side profile view, symmetrical design, charcoal-gray fur, green tunic, facing EAST (flippable for WEST), standing moving arms up and down in front of chest without items, single horizontal row of EXACTLY 8 side crafting frames, solid plain white background #FFFFFF, clean vector art
  ```

##### 4. Montado no Dragão (`Mounted` - 1 Linha x 8 Frames):
* **South (Frente Direta):**
  ```text
  2D sprite strip of cute chibi wolf boy hunter in dragon riding saddle pose (without mount), Animal Crossing style, straight front view facing camera, symmetrical design, charcoal-gray fur, green tunic, facing SOUTH, seated with both legs spread wide outwards straddling the saddle and hands holding reins at chest, single horizontal row of EXACTLY 8 riding bobbing frames, solid plain white background #FFFFFF, clean vector art
  ```
* **North (Costas Retas):**
  ```text
  2D sprite strip of cute chibi wolf boy hunter in dragon riding saddle pose (without mount), Animal Crossing style, straight back view facing away, symmetrical design, charcoal-gray fur, green tunic, facing NORTH, seated with legs spread outwards around saddle holding reins, single horizontal row of EXACTLY 8 riding bobbing frames, solid plain white background #FFFFFF, clean vector art
  ```
* **East / Side (Lateral Direita - Espelhável para Oeste):**
  ```text
  2D sprite strip of cute chibi wolf boy hunter in dragon riding saddle pose (without mount), Animal Crossing style, straight side profile view, symmetrical design, charcoal-gray fur, green tunic, facing EAST (flippable for WEST), seated leaning 10 degrees forward holding reins, ONLY near right leg visible bent down over saddle while far left leg is occluded, single horizontal row of EXACTLY 8 riding bobbing frames, solid plain white background #FFFFFF, clean vector art
  ```

---

#### 🐺 Lobo Feminino (`char_wolf_hunter_f` - Lyra)
* **Visual Simétrico:** Pelagem branca-ártica e prateada, olhos ciano brilhantes, lenço vermelho simétrico no peito, capa curta verde-oliva com fecho centralizado e botas de camurça felpudas iguais em ambas as pernas.

##### 1. Caminhada (`Walk` - 1 Linha x 8 Frames):
* **South (Frente Direta):**
  ```text
  2D sprite strip of cute chibi arctic wolf girl ranger walking straight forward towards camera, Animal Crossing style, perfectly centered straight front view, symmetrical design, white and silver fur, cyan eyes, symmetrical red neck scarf, olive-green scout capelet, facing SOUTH, single horizontal row of EXACTLY 8 walking frames, solid plain white background #FFFFFF, clean vector art, soft 3D clay lighting, no pixel art
  ```
* **North (Costas Retas):**
  ```text
  2D sprite strip of cute chibi arctic wolf girl ranger walking straight away from camera, Animal Crossing style, straight back view, symmetrical design, white fur, olive capelet, facing NORTH, single horizontal row of EXACTLY 8 walking away frames, solid plain white background #FFFFFF, clean vector art
  ```
* **East / Side (Lateral):**
  ```text
  2D sprite strip of cute chibi arctic wolf girl ranger walking sideways, Animal Crossing style, straight side profile view, symmetrical design, white fur, red scarf, olive capelet, facing EAST (flippable for WEST), single horizontal row of EXACTLY 8 side walking frames, solid plain white background #FFFFFF, clean vector art
  ```

##### 2. Parado / Respiração (`Idle` - 1 Linha x 8 Frames):
* **South (Frente Direta):** `2D sprite strip of cute chibi arctic wolf girl ranger idle breathing, Animal Crossing style, straight front view facing camera, symmetrical design, white fur, cyan eyes, red scarf, olive capelet, facing SOUTH, single row of EXACTLY 8 idle frames, solid white background #FFFFFF`
* **North (Costas Retas):** `2D sprite strip of cute chibi arctic wolf girl ranger idle breathing, Animal Crossing style, straight back view, symmetrical design, white fur, olive capelet, facing NORTH, single row of EXACTLY 8 idle frames, solid white background #FFFFFF`
* **East / Side (Lateral):** `2D sprite strip of cute chibi arctic wolf girl ranger idle breathing, Animal Crossing style, straight side profile view, symmetrical design, white fur, red scarf, olive capelet, facing EAST (flippable for WEST), single row of EXACTLY 8 side idle frames, solid white background #FFFFFF`

##### 3. Fabricação / Crafting (`Craft` - 1 Linha x 8 Frames):
* **South (Frente Direta):** `2D sprite strip of cute chibi arctic wolf girl ranger crafting, Animal Crossing style, straight front view, symmetrical design, white fur, red scarf, olive capelet, facing SOUTH, standing moving arms up and down in front of chest without items, single row of EXACTLY 8 crafting frames, solid white background #FFFFFF`
* **North (Costas Retas):** `2D sprite strip of cute chibi arctic wolf girl ranger crafting, Animal Crossing style, straight back view, symmetrical design, white fur, olive capelet, facing NORTH, standing moving arms up and down without items, single row of EXACTLY 8 crafting frames, solid white background #FFFFFF`
* **East / Side (Lateral):** `2D sprite strip of cute chibi arctic wolf girl ranger crafting, Animal Crossing style, straight side profile view, symmetrical design, white fur, red scarf, olive capelet, facing EAST (flippable for WEST), standing moving arms up and down without items, single row of EXACTLY 8 side crafting frames, solid white background #FFFFFF`

##### 4. Montado no Dragão (`Mounted` - 1 Linha x 8 Frames):
* **South (Frente Direta):** `2D sprite strip of cute chibi arctic wolf girl ranger in dragon riding saddle pose (without mount), Animal Crossing style, straight front view, symmetrical design, white fur, red scarf, facing SOUTH, seated with both legs spread outwards around saddle holding reins at chest, single row of EXACTLY 8 riding frames, solid white background #FFFFFF`
* **North (Costas Retas):** `2D sprite strip of cute chibi arctic wolf girl ranger in dragon riding saddle pose (without mount), Animal Crossing style, straight back view, symmetrical design, white fur, red scarf, facing NORTH, back view seated straddling saddle holding reins, single row of EXACTLY 8 riding frames, solid white background #FFFFFF`
* **East / Side (Lateral):** `2D sprite strip of cute chibi arctic wolf girl ranger in dragon riding saddle pose (without mount), Animal Crossing style, straight side profile view, symmetrical design, white fur, red scarf, facing EAST (flippable for WEST), seated leaning forward holding reins, ONLY near leg visible bent down over saddle while far leg is occluded, single row of EXACTLY 8 riding frames, solid white background #FFFFFF`

---

### 2.2. Morcego — Vampiro / Vampira
* **Arquétipo:** O Aristocrata Noturno e Alquimista.
* **Habilidade Única — `Eco Noturno`:** +5 Ações Noturnas exclusivas (após 17h) e visão no escuro em cavernas.

---

#### 🦇 Morcego Masculino (`char_bat_vampire_m` - Vlad)
* **Visual Simétrico:** Pelagem ameixa-escura, orelhas triangulares simétricas com interior rosa, colete bordô abotoado ao centro com botões dourados simétricos e mini-capa preta centralizada nas costas.

* **Walk (South / North / East):**
  * **South (Frente Direta):** `2D sprite strip of cute chibi fruit bat boy vampire walking straight forward towards camera, Animal Crossing style, perfectly centered straight front view, symmetrical design, plum-purple fur, big bat ears, burgundy vest with centered gold buttons and symmetrical black mini-cape, facing SOUTH, single row of EXACTLY 8 walking frames, solid white background #FFFFFF, clean vector art, soft 3D clay lighting, no pixel art`
  * **North (Costas Retas):** `2D sprite strip of cute chibi fruit bat boy vampire walking straight away from camera, Animal Crossing style, straight back view, symmetrical design, plum-purple fur, black mini-cape, facing NORTH, single row of EXACTLY 8 walking frames, solid white background #FFFFFF`
  * **East / Side (Lateral):** `2D sprite strip of cute chibi fruit bat boy vampire walking sideways, Animal Crossing style, straight side profile view, symmetrical design, plum-purple fur, burgundy vest and mini-cape, facing EAST (flippable for WEST), single row of EXACTLY 8 side walking frames, solid white background #FFFFFF`
* **Idle (South / North / East):**
  * `2D sprite strip of cute chibi fruit bat boy vampire idle breathing, Animal Crossing style, [straight front view facing SOUTH / straight back view facing NORTH / straight side profile facing EAST (flippable for WEST)], symmetrical design, plum-purple fur, burgundy vest, single row of EXACTLY 8 idle frames, solid white background #FFFFFF`
* **Craft (South / North / East):**
  * `2D sprite strip of cute chibi fruit bat boy vampire crafting, Animal Crossing style, [straight front view facing SOUTH / straight back view facing NORTH / straight side profile facing EAST (flippable for WEST)], symmetrical design, plum-purple fur, burgundy vest, standing moving arms up and down in front of chest without items, single row of EXACTLY 8 crafting frames, solid white background #FFFFFF`
* **Mounted (Dragon Riding):**
  * **South (Frente Direta):** `2D sprite strip of cute chibi fruit bat boy vampire in dragon riding pose (without mount), Animal Crossing style, straight front view, symmetrical design, plum-purple fur, burgundy vest, facing SOUTH, seated with both legs spread wide straddling saddle holding reins, single row of EXACTLY 8 riding frames, solid white background #FFFFFF`
  * **North (Costas Retas):** `2D sprite strip of cute chibi fruit bat boy vampire in dragon riding pose (without mount), Animal Crossing style, straight back view, symmetrical design, plum-purple fur, black mini-cape, facing NORTH, back view seated straddling saddle holding reins, single row of EXACTLY 8 riding frames, solid white background #FFFFFF`
  * **East / Side (Lateral):** `2D sprite strip of cute chibi fruit bat boy vampire in dragon riding pose (without mount), Animal Crossing style, straight side profile view, symmetrical design, plum-purple fur, burgundy vest, facing EAST (flippable for WEST), seated leaning forward holding reins, ONLY near leg visible bent over saddle, far leg hidden, single row of EXACTLY 8 riding frames, solid white background #FFFFFF`

---

#### 🦇 Morcego Feminino (`char_bat_vampire_f` - Carmilla)
* **Visual Simétrico:** Pelagem lilás suave, vestido gótico medieval preto e roxo com gola rendada branca centralizada e saia simétrica rodada.

* **Walk (South / North / East):**
  * `2D sprite strip of cute chibi bat girl vampire noble walking, Animal Crossing style, [perfectly centered straight front view facing SOUTH / straight back view facing NORTH / straight side profile facing EAST (flippable for WEST)], symmetrical design, pastel lilac fur, gothic black and purple medieval dress with centered white lace collar, single row of EXACTLY 8 walking frames, solid white background #FFFFFF, clean vector art, soft 3D clay lighting, no pixel art`
* **Idle (South / North / East):**
  * `2D sprite strip of cute chibi bat girl vampire noble idle breathing, Animal Crossing style, [straight front view facing SOUTH / straight back view facing NORTH / straight side profile facing EAST (flippable for WEST)], symmetrical design, pastel lilac fur, black and purple dress, single row of EXACTLY 8 idle frames, solid white background #FFFFFF`
* **Craft (South / North / East):**
  * `2D sprite strip of cute chibi bat girl vampire noble crafting, Animal Crossing style, [straight front view facing SOUTH / straight back view facing NORTH / straight side profile facing EAST (flippable for WEST)], symmetrical design, pastel lilac fur, dress with lace collar, standing moving arms up and down without items, single row of EXACTLY 8 crafting frames, solid white background #FFFFFF`
* **Mounted (Dragon Riding):**
  * **South (Frente Direta):** `2D sprite strip of cute chibi bat girl vampire in dragon riding pose (without mount), Animal Crossing style, straight front view, symmetrical design, pastel lilac fur, black and purple dress, facing SOUTH, seated with skirt draped and legs spread straddling saddle holding reins, single row of EXACTLY 8 riding frames, solid white background #FFFFFF`
  * **North (Costas Retas):** `2D sprite strip of cute chibi bat girl vampire in dragon riding pose (without mount), Animal Crossing style, straight back view, symmetrical design, pastel lilac fur, facing NORTH, back view seated straddling saddle holding reins, single row of EXACTLY 8 riding frames, solid white background #FFFFFF`
  * **East / Side (Lateral):** `2D sprite strip of cute chibi bat girl vampire in dragon riding pose (without mount), Animal Crossing style, straight side profile view, symmetrical design, pastel lilac fur, facing EAST (flippable for WEST), seated holding reins, ONLY near leg visible bent over saddle, far leg hidden, single row of EXACTLY 8 riding frames, solid white background #FFFFFF`

---

### 2.3. Águia — Arqueiro / Arqueira
* **Arquétipo:** O Sentinela Alado dos Cumes.
* **Habilidade Única — `Mira Perfeita`:** +30% de velocidade de coleta com ferramentas e -1s no cooldown da Esquiva.

---

#### 🦅 Águia Masculino (`char_eagle_archer_m` - Zephyr)
* **Visual Simétrico:** Penas marrons, cabeça de águia branca simétrica com penugem fofa, bico dourado, gibão azul-celeste com braçadeiras de couro iguais em ambos os braços e aljava centralizada nas costas.

* **Walk (South / North / East):**
  * `2D sprite strip of cute chibi eagle boy archer walking, Animal Crossing style, [perfectly centered straight front view facing SOUTH / straight back view facing NORTH / straight side profile facing EAST (flippable for WEST)], symmetrical design, brown body feathers, fluffy white head plumage, yellow beak, sky-blue tunic with matching leather bracers, single row of EXACTLY 8 walking frames, solid white background #FFFFFF, clean vector art, soft 3D clay lighting, no pixel art`
* **Idle (South / North / East):**
  * `2D sprite strip of cute chibi eagle boy archer idle breathing, Animal Crossing style, [straight front view facing SOUTH / straight back view facing NORTH / straight side profile facing EAST (flippable for WEST)], symmetrical design, white head plumage, sky-blue tunic, single row of EXACTLY 8 idle frames, solid white background #FFFFFF`
* **Craft (South / North / East):**
  * `2D sprite strip of cute chibi eagle boy archer crafting, Animal Crossing style, [straight front view facing SOUTH / straight back view facing NORTH / straight side profile facing EAST (flippable for WEST)], symmetrical design, sky-blue tunic, moving arms up and down in front of chest without items, single row of EXACTLY 8 crafting frames, solid white background #FFFFFF`
* **Mounted (Dragon Riding):**
  * **South (Frente Direta):** `2D sprite strip of cute chibi eagle boy archer in dragon riding pose (without mount), Animal Crossing style, straight front view, symmetrical design, white head plumage, sky-blue tunic, facing SOUTH, seated with both legs spread wide straddling saddle holding reins, single row of EXACTLY 8 riding frames, solid white background #FFFFFF`
  * **North (Costas Retas):** `2D sprite strip of cute chibi eagle boy archer in dragon riding pose (without mount), Animal Crossing style, straight back view, symmetrical design, white head plumage, facing NORTH, back view seated straddling saddle holding reins, single row of EXACTLY 8 riding frames, solid white background #FFFFFF`
  * **East / Side (Lateral):** `2D sprite strip of cute chibi eagle boy archer in dragon riding pose (without mount), Animal Crossing style, straight side profile view, symmetrical design, sky-blue tunic, facing EAST (flippable for WEST), seated leaning forward holding reins, ONLY near leg visible bent over saddle, far leg hidden, single row of EXACTLY 8 riding frames, solid white background #FFFFFF`

---

#### 🦅 Águia Feminina (`char_eagle_archer_f` - Astra)
* **Visual Simétrico:** Penas douradas e creme de falcão, crista de penas centralizada, túnica turquesa e dourada com broche simétrico de asas no centro do peito.

* **Walk (South / North / East):**
  * `2D sprite strip of cute chibi golden falcon girl marksman walking, Animal Crossing style, [perfectly centered straight front view facing SOUTH / straight back view facing NORTH / straight side profile facing EAST (flippable for WEST)], symmetrical design, golden-tan feathers, centered feather crest, teal and gold tunic with centered wing brooch, single row of EXACTLY 8 walking frames, solid white background #FFFFFF, clean vector art, soft 3D clay lighting, no pixel art`
* **Idle (South / North / East):**
  * `2D sprite strip of cute chibi golden falcon girl marksman idle breathing, Animal Crossing style, [straight front view facing SOUTH / straight back view facing NORTH / straight side profile facing EAST (flippable for WEST)], symmetrical design, golden feathers, teal tunic, single row of EXACTLY 8 idle frames, solid white background #FFFFFF`
* **Craft (South / North / East):**
  * `2D sprite strip of cute chibi golden falcon girl marksman crafting, Animal Crossing style, [straight front view facing SOUTH / straight back view facing NORTH / straight side profile facing EAST (flippable for WEST)], symmetrical design, golden feathers, teal tunic, standing moving arms up and down without items, single row of EXACTLY 8 crafting frames, solid white background #FFFFFF`
* **Mounted (Dragon Riding):**
  * **South (Frente Direta):** `2D sprite strip of cute chibi golden falcon girl marksman in dragon riding pose (without mount), Animal Crossing style, straight front view, symmetrical design, golden feathers, teal tunic, facing SOUTH, seated with both legs spread wide straddling saddle holding reins, single row of EXACTLY 8 riding frames, solid white background #FFFFFF`
  * **North (Costas Retas):** `2D sprite strip of cute chibi golden falcon girl marksman in dragon riding pose (without mount), Animal Crossing style, straight back view, symmetrical design, golden feathers, facing NORTH, back view seated straddling saddle holding reins, single row of EXACTLY 8 riding frames, solid white background #FFFFFF`
  * **East / Side (Lateral):** `2D sprite strip of cute chibi golden falcon girl marksman in dragon riding pose (without mount), Animal Crossing style, straight side profile view, symmetrical design, teal tunic, facing EAST (flippable for WEST), seated leaning forward holding reins, ONLY near leg visible bent over saddle, far leg hidden, single row of EXACTLY 8 riding frames, solid white background #FFFFFF`

---

### 2.4. Gato — Bruxo / Bruxa
* **Arquétipo:** O Conjurador Místico e Estudioso de Lua.
* **Habilidade Única — `Afinidade Arcana`:** +10% de ganho de XP aos dragões e dicas nos quebra-cabeças Lua.

---

#### 🐱 Gato Masculino (`char_cat_mage_m` - Merlin)
* **Visual Simétrico:** Pelagem preta com patinhas brancas simétricas ("meias"), túnica azul-noite estrelada com estampa rúnica central e chapéu cônico pontudo com lua crescente frontal centralizada.

* **Walk (South / North / East):**
  * `2D sprite strip of cute chibi black cat boy wizard walking, Animal Crossing style, [perfectly centered straight front view facing SOUTH / straight back view facing NORTH / straight side profile facing EAST (flippable for WEST)], symmetrical design, sleek black fur with white paws, emerald eyes, midnight-blue starry robe and centered pointed wizard hat, single row of EXACTLY 8 walking frames, solid white background #FFFFFF, clean vector art, soft 3D clay lighting, no pixel art`
* **Idle (South / North / East):**
  * `2D sprite strip of cute chibi black cat boy wizard idle breathing, Animal Crossing style, [straight front view facing SOUTH / straight back view facing NORTH / straight side profile facing EAST (flippable for WEST)], symmetrical design, black fur, midnight-blue robe and wizard hat, single row of EXACTLY 8 idle frames, solid white background #FFFFFF`
* **Craft (South / North / East):**
  * `2D sprite strip of cute chibi black cat boy wizard crafting, Animal Crossing style, [straight front view facing SOUTH / straight back view facing NORTH / straight side profile facing EAST (flippable for WEST)], symmetrical design, black fur, wizard robe, moving paws up and down in front of chest without items, single row of EXACTLY 8 crafting frames, solid white background #FFFFFF`
* **Mounted (Dragon Riding):**
  * **South (Frente Direta):** `2D sprite strip of cute chibi black cat boy wizard in dragon riding pose (without mount), Animal Crossing style, straight front view, symmetrical design, black fur, wizard robe and hat, facing SOUTH, seated with both legs spread straddling saddle holding reins, single row of EXACTLY 8 riding frames, solid white background #FFFFFF`
  * **North (Costas Retas):** `2D sprite strip of cute chibi black cat boy wizard in dragon riding pose (without mount), Animal Crossing style, straight back view, symmetrical design, black fur, pointed hat, facing NORTH, back view seated straddling saddle holding reins, single row of EXACTLY 8 riding frames, solid white background #FFFFFF`
  * **East / Side (Lateral):** `2D sprite strip of cute chibi black cat boy wizard in dragon riding pose (without mount), Animal Crossing style, straight side profile view, symmetrical design, wizard robe, facing EAST (flippable for WEST), seated leaning forward holding reins, ONLY near leg visible bent over saddle, far leg hidden, single row of EXACTLY 8 riding frames, solid white background #FFFFFF`

---

#### 🐱 Gato Feminino (`char_cat_witch_f` - Luna)
* **Visual Simétrico:** Pelagem calico com manchas simétricas em ambas as orelhas e bochechas, vestido de bruxinha roxo e abóbora com avental branco rendado centralizado.

* **Walk (South / North / East):**
  * `2D sprite strip of cute chibi calico cat girl witch walking, Animal Crossing style, [perfectly centered straight front view facing SOUTH / straight back view facing NORTH / straight side profile facing EAST (flippable for WEST)], symmetrical design, fluffy spotted calico fur, emerald eyes, purple and orange witch dress with centered white apron, single row of EXACTLY 8 walking frames, solid white background #FFFFFF, clean vector art, soft 3D clay lighting, no pixel art`
* **Idle (South / North / East):**
  * `2D sprite strip of cute chibi calico cat girl witch idle breathing, Animal Crossing style, [straight front view facing SOUTH / straight back view facing NORTH / straight side profile facing EAST (flippable for WEST)], symmetrical design, calico fur, witch dress with apron, single row of EXACTLY 8 idle frames, solid white background #FFFFFF`
* **Craft (South / North / East):**
  * `2D sprite strip of cute chibi calico cat girl witch crafting, Animal Crossing style, [straight front view facing SOUTH / straight back view facing NORTH / straight side profile facing EAST (flippable for WEST)], symmetrical design, calico fur, witch dress, moving paws up and down in front of chest without items, single row of EXACTLY 8 crafting frames, solid white background #FFFFFF`
* **Mounted (Dragon Riding):**
  * **South (Frente Direta):** `2D sprite strip of cute chibi calico cat girl witch in dragon riding pose (without mount), Animal Crossing style, straight front view, symmetrical design, calico fur, purple dress with apron, facing SOUTH, seated with both legs spread wide straddling saddle holding reins, single row of EXACTLY 8 riding frames, solid white background #FFFFFF`
  * **North (Costas Retas):** `2D sprite strip of cute chibi calico cat girl witch in dragon riding pose (without mount), Animal Crossing style, straight back view, symmetrical design, calico fur, facing NORTH, back view seated straddling saddle holding reins, single row of EXACTLY 8 riding frames, solid white background #FFFFFF`
  * **East / Side (Lateral):** `2D sprite strip of cute chibi calico cat girl witch in dragon riding pose (without mount), Animal Crossing style, straight side profile view, symmetrical design, purple dress, facing EAST (flippable for WEST), seated leaning forward holding reins, ONLY near leg visible bent over saddle, far leg hidden, single row of EXACTLY 8 riding frames, solid white background #FFFFFF`

---

# 🏝️ 3. NPCs Principais da Ilha Lua (5 Moradores)

---

### 3.1. Tubarão — O Surfista (`npc_shark_surfer` - Kai)
* **Visual Simétrico:** Tubarão-branco fofo, pele azul-clara e branca, colete tropical aberto com padrão floral simétrico e colar de conchas centralizado.

* **Walk (South / North / East):**
  * `2D sprite strip of cute chibi great white shark surfer NPC walking, Animal Crossing style, [perfectly centered straight front view facing SOUTH / straight back view facing NORTH / straight side profile facing EAST (flippable for WEST)], symmetrical design, light-blue and white skin, friendly toothy grin, open tropical vest and centered shell necklace, single row of EXACTLY 8 walking frames, solid white background #FFFFFF, clean vector art, soft 3D clay lighting, no pixel art`
* **Idle (South / North / East):**
  * `2D sprite strip of cute chibi shark surfer NPC idle breathing, Animal Crossing style, [straight front view facing SOUTH / straight back view facing NORTH / straight side profile facing EAST (flippable for WEST)], symmetrical design, light-blue skin, tropical vest, single row of EXACTLY 8 idle frames, solid white background #FFFFFF`
* **Craft (South / North / East):**
  * `2D sprite strip of cute chibi shark surfer NPC working crafting, Animal Crossing style, [straight front view facing SOUTH / straight back view facing NORTH / straight side profile facing EAST (flippable for WEST)], symmetrical design, tropical vest, moving flippers up and down in front of chest without items, single row of EXACTLY 8 crafting frames, solid white background #FFFFFF`
* **Mounted (Dragon Riding):**
  * **South (Frente Direta):** `2D sprite strip of cute chibi shark surfer in dragon riding pose (without mount), Animal Crossing style, straight front view, symmetrical design, light-blue skin, tropical vest, facing SOUTH, seated with legs spread wide straddling saddle holding reins, single row of EXACTLY 8 riding frames, solid white background #FFFFFF`
  * **North (Costas Retas):** `2D sprite strip of cute chibi shark surfer in dragon riding pose (without mount), Animal Crossing style, straight back view, symmetrical design, light-blue skin, facing NORTH, back view seated straddling saddle holding reins with dorsal fin, single row of EXACTLY 8 frames, solid white background #FFFFFF`
  * **East / Side (Lateral):** `2D sprite strip of cute chibi shark surfer in dragon riding pose (without mount), Animal Crossing style, straight side profile view, symmetrical design, tropical vest, facing EAST (flippable for WEST), seated holding reins, ONLY near leg/flipper visible bent over saddle, far side hidden, single row of EXACTLY 8 frames, solid white background #FFFFFF`

---

### 3.2. Jacaré — O Atravessador (`npc_alligator_ferryman` - Barnabé)
* **Visual Simétrico:** Escamas verdes musgo, chapéu de palha de barqueiro centralizado, camisa listrada de marinheiro e macacão jeans com alças simétricas.

* **Walk (South / North / East):**
  * `2D sprite strip of cute chibi alligator ferryman NPC walking, Animal Crossing style, [perfectly centered straight front view facing SOUTH / straight back view facing NORTH / straight side profile facing EAST (flippable for WEST)], symmetrical design, mossy green scales, centered straw boatman hat, striped sailor shirt and denim overalls, single row of EXACTLY 8 walking frames, solid white background #FFFFFF, clean vector art, soft 3D clay lighting, no pixel art`
* **Idle (South / North / East):**
  * `2D sprite strip of cute chibi alligator ferryman NPC idle breathing, Animal Crossing style, [straight front view facing SOUTH / straight back view facing NORTH / straight side profile facing EAST (flippable for WEST)], symmetrical design, mossy green scales, straw hat, overalls, single row of EXACTLY 8 idle frames, solid white background #FFFFFF`
* **Craft (South / North / East):**
  * `2D sprite strip of cute chibi alligator ferryman NPC crafting, Animal Crossing style, [straight front view facing SOUTH / straight back view facing NORTH / straight side profile facing EAST (flippable for WEST)], symmetrical design, straw hat, overalls, moving arms up and down in front of chest without items, single row of EXACTLY 8 crafting frames, solid white background #FFFFFF`
* **Mounted (Dragon Riding):**
  * **South (Frente Direta):** `2D sprite strip of cute chibi alligator ferryman in dragon riding pose (without mount), Animal Crossing style, straight front view, symmetrical design, green scales, straw hat, overalls, facing SOUTH, seated with legs spread wide straddling saddle holding reins, single row of EXACTLY 8 riding frames, solid white background #FFFFFF`
  * **North (Costas Retas):** `2D sprite strip of cute chibi alligator ferryman in dragon riding pose (without mount), Animal Crossing style, straight back view, symmetrical design, facing NORTH, back view seated straddling saddle holding reins, single row of EXACTLY 8 frames, solid white background #FFFFFF`
  * **East / Side (Lateral):** `2D sprite strip of cute chibi alligator ferryman in dragon riding pose (without mount), Animal Crossing style, straight side profile view, symmetrical design, straw hat, overalls, facing EAST (flippable for WEST), seated holding reins, ONLY near leg visible bent over saddle, far leg hidden, single row of EXACTLY 8 frames, solid white background #FFFFFF`

---

### 3.3. Macaco — O Mestre Construtor (`npc_monkey_builder` - Bambu)
* **Visual Simétrico:** Pelagem marrom e pêssego, capacete amarelo com recortes para as duas orelhas e macacão jeans com bolsos frontais centralizados.

* **Walk (South / North / East):**
  * `2D sprite strip of cute chibi monkey carpenter builder NPC walking, Animal Crossing style, [perfectly centered straight front view facing SOUTH / straight back view facing NORTH / straight side profile facing EAST (flippable for WEST)], symmetrical design, brown fur, peach face, yellow construction hardhat with ear cutouts and denim tool overalls, single row of EXACTLY 8 walking frames, solid white background #FFFFFF, clean vector art, soft 3D clay lighting, no pixel art`
* **Idle (South / North / East):**
  * `2D sprite strip of cute chibi monkey builder NPC idle breathing, Animal Crossing style, [straight front view facing SOUTH / straight back view facing NORTH / straight side profile facing EAST (flippable for WEST)], symmetrical design, brown fur, yellow hardhat, denim overalls, single row of EXACTLY 8 idle frames, solid white background #FFFFFF`
* **Craft (South / North / East):**
  * `2D sprite strip of cute chibi monkey builder NPC crafting, Animal Crossing style, [straight front view facing SOUTH / straight back view facing NORTH / straight side profile facing EAST (flippable for WEST)], symmetrical design, yellow hardhat, denim overalls, moving arms up and down enthusiastically without items, single row of EXACTLY 8 crafting frames, solid white background #FFFFFF`
* **Mounted (Dragon Riding):**
  * **South (Frente Direta):** `2D sprite strip of cute chibi monkey builder in dragon riding pose (without mount), Animal Crossing style, straight front view, symmetrical design, brown fur, yellow hardhat, denim overalls, facing SOUTH, seated with legs spread wide straddling saddle holding reins, single row of EXACTLY 8 riding frames, solid white background #FFFFFF`
  * **North (Costas Retas):** `2D sprite strip of cute chibi monkey builder in dragon riding pose (without mount), Animal Crossing style, straight back view, symmetrical design, yellow hardhat, facing NORTH, back view seated straddling saddle holding reins with tail, single row of EXACTLY 8 frames, solid white background #FFFFFF`
  * **East / Side (Lateral):** `2D sprite strip of cute chibi monkey builder in dragon riding pose (without mount), Animal Crossing style, straight side profile view, symmetrical design, yellow hardhat, overalls, facing EAST (flippable for WEST), seated holding reins, ONLY near leg visible bent over saddle, far leg hidden, single row of EXACTLY 8 frames, solid white background #FFFFFF`

---

### 3.4. Camaleão — O Ilusionista Mágico (`npc_chameleon_magician` - Cromos)
* **Visual Simétrico:** Escamas verdes iridescentes, cauda espiral, capa roxa com forro de estrelas e mini-cartola centralizada na cabeça.

* **Walk (South / North / East):**
  * `2D sprite strip of cute chibi chameleon magician NPC walking, Animal Crossing style, [perfectly centered straight front view facing SOUTH / straight back view facing NORTH / straight side profile facing EAST (flippable for WEST)], symmetrical design, iridescent green scales, spiral eyes, purple magician cape with gold star lining and centered tiny top hat, single row of EXACTLY 8 walking frames, solid white background #FFFFFF, clean vector art, soft 3D clay lighting, no pixel art`
* **Idle (South / North / East):**
  * `2D sprite strip of cute chibi chameleon magician NPC idle breathing, Animal Crossing style, [straight front view facing SOUTH / straight back view facing NORTH / straight side profile facing EAST (flippable for WEST)], symmetrical design, iridescent scales, purple starry cape, tiny top hat, single row of EXACTLY 8 idle frames, solid white background #FFFFFF`
* **Craft (South / North / East):**
  * `2D sprite strip of cute chibi chameleon magician NPC spellcasting crafting, Animal Crossing style, [straight front view facing SOUTH / straight back view facing NORTH / straight side profile facing EAST (flippable for WEST)], symmetrical design, purple starry cape, moving arms rhythmically in front of chest without items, single row of EXACTLY 8 crafting frames, solid white background #FFFFFF`
* **Mounted (Dragon Riding):**
  * **South (Frente Direta):** `2D sprite strip of cute chibi chameleon magician in dragon riding pose (without mount), Animal Crossing style, straight front view, symmetrical design, iridescent scales, purple cape, top hat, facing SOUTH, seated with legs spread wide straddling saddle holding reins, single row of EXACTLY 8 riding frames, solid white background #FFFFFF`
  * **North (Costas Retas):** `2D sprite strip of cute chibi chameleon magician in dragon riding pose (without mount), Animal Crossing style, straight back view, symmetrical design, purple cape, facing NORTH, back view seated straddling saddle holding reins with cape, single row of EXACTLY 8 frames, solid white background #FFFFFF`
  * **East / Side (Lateral):** `2D sprite strip of cute chibi chameleon magician in dragon riding pose (without mount), Animal Crossing style, straight side profile view, symmetrical design, purple cape, top hat, facing EAST (flippable for WEST), seated holding reins, ONLY near leg visible bent over saddle, far leg hidden, single row of EXACTLY 8 frames, solid white background #FFFFFF`

---

### 3.5. Coruja — O Professor Ancião (`npc_owl_professor` - Dr. Arquimedes)
* **Visual Simétrico:** Penas salpicadas de marrom e creme, óculos redondos dourados simétricos, colete de tweed com gravata borboleta centralizada e capelo acadêmico reto.

* **Walk (South / North / East):**
  * `2D sprite strip of cute chibi scholarly barn owl professor NPC walking, Animal Crossing style, [perfectly centered straight front view facing SOUTH / straight back view facing NORTH / straight side profile facing EAST (flippable for WEST)], symmetrical design, speckled brown and cream feathers, gold spectacles, brown tweed vest, centered bow tie and academic cap, single row of EXACTLY 8 walking frames, solid white background #FFFFFF, clean vector art, soft 3D clay lighting, no pixel art`
* **Idle (South / North / East):**
  * `2D sprite strip of cute chibi owl professor NPC idle breathing, Animal Crossing style, [straight front view facing SOUTH / straight back view facing NORTH / straight side profile facing EAST (flippable for WEST)], symmetrical design, speckled brown feathers, gold spectacles, tweed vest, academic cap, single row of EXACTLY 8 idle frames, solid white background #FFFFFF`
* **Craft (South / North / East):**
  * `2D sprite strip of cute chibi owl professor NPC researching crafting, Animal Crossing style, [straight front view facing SOUTH / straight back view facing NORTH / straight side profile facing EAST (flippable for WEST)], symmetrical design, tweed vest, academic cap, moving wingtips thoughtfully in front of chest without items, single row of EXACTLY 8 crafting frames, solid white background #FFFFFF`
* **Mounted (Dragon Riding):**
  * **South (Frente Direta):** `2D sprite strip of cute chibi owl professor in dragon riding pose (without mount), Animal Crossing style, straight front view, symmetrical design, speckled owl, tweed vest, academic cap, facing SOUTH, seated with legs spread wide straddling saddle holding reins, single row of EXACTLY 8 riding frames, solid white background #FFFFFF`
  * **North (Costas Retas):** `2D sprite strip of cute chibi owl professor in dragon riding pose (without mount), Animal Crossing style, straight back view, symmetrical design, academic cap, facing NORTH, back view seated straddling saddle holding reins, single row of EXACTLY 8 frames, solid white background #FFFFFF`
  * **East / Side (Lateral):** `2D sprite strip of cute chibi owl professor in dragon riding pose (without mount), Animal Crossing style, straight side profile view, symmetrical design, tweed vest, cap, facing EAST (flippable for WEST), seated holding reins, ONLY near leg visible bent over saddle, far leg hidden, single row of EXACTLY 8 frames, solid white background #FFFFFF`

---

# 🏰 4. NPCs Complementares da Vila Medieval (4 Moradores)

---

### 4.1. Touro — O Ferreiro Forjador (`npc_bull_blacksmith` - Brutus)
* **Visual Simétrico:** Pelagem castanho-avermelhada, chifres curvos simétricos, argola de bronze centralizada no nariz e avental de ferreiro de couro com alças simétricas.

* **Walk (South / North / East):**
  * `2D sprite strip of cute chibi highland bull blacksmith NPC walking, Animal Crossing style, [perfectly centered straight front view facing SOUTH / straight back view facing NORTH / straight side profile facing EAST (flippable for WEST)], symmetrical design, shaggy reddish-brown fur, curved horns, centered brass nose ring, leather blacksmith apron, single row of EXACTLY 8 walking frames, solid white background #FFFFFF, clean vector art, soft 3D clay lighting, no pixel art`
* **Idle (South / North / East):**
  * `2D sprite strip of cute chibi bull blacksmith NPC idle breathing, Animal Crossing style, [straight front view facing SOUTH / straight back view facing NORTH / straight side profile facing EAST (flippable for WEST)], symmetrical design, reddish-brown fur, curved horns, leather apron, single row of EXACTLY 8 idle frames, solid white background #FFFFFF`
* **Craft (South / North / East):**
  * `2D sprite strip of cute chibi bull blacksmith NPC forging crafting, Animal Crossing style, [straight front view facing SOUTH / straight back view facing NORTH / straight side profile facing EAST (flippable for WEST)], symmetrical design, leather apron, pumping arms rhythmically in front of chest without items, single row of EXACTLY 8 crafting frames, solid white background #FFFFFF`
* **Mounted (Dragon Riding):**
  * **South (Frente Direta):** `2D sprite strip of cute chibi bull blacksmith in dragon riding pose (without mount), Animal Crossing style, straight front view, symmetrical design, shaggy bull, curved horns, leather apron, facing SOUTH, sturdy seated with legs spread wide straddling saddle holding reins, single row of EXACTLY 8 riding frames, solid white background #FFFFFF`
  * **North (Costas Retas):** `2D sprite strip of cute chibi bull blacksmith in dragon riding pose (without mount), Animal Crossing style, straight back view, symmetrical design, shaggy bull, facing NORTH, back view sturdy seated straddling saddle holding reins, single row of EXACTLY 8 frames, solid white background #FFFFFF`
  * **East / Side (Lateral):** `2D sprite strip of cute chibi bull blacksmith in dragon riding pose (without mount), Animal Crossing style, straight side profile view, symmetrical design, leather apron, facing EAST (flippable for WEST), seated holding reins, ONLY near leg visible bent over saddle, far leg hidden, single row of EXACTLY 8 frames, solid white background #FFFFFF`

---

### 4.2. Coelho — A Herbalista e Fazendeira (`npc_rabbit_farmer` - Flora)
* **Visual Simétrico:** Pelagem creme e rosa-pastel, orelhas longas caídas simétricas (lop-eared), vestido de linho floral com avental de jardinagem com laço central.

* **Walk (South / North / East):**
  * `2D sprite strip of cute chibi lop-eared rabbit girl farmer NPC walking, Animal Crossing style, [perfectly centered straight front view facing SOUTH / straight back view facing NORTH / straight side profile facing EAST (flippable for WEST)], symmetrical design, fluffy cream and pastel pink fur, long floppy ears, floral linen dress with gardening apron, single row of EXACTLY 8 walking frames, solid white background #FFFFFF, clean vector art, soft 3D clay lighting, no pixel art`
* **Idle (South / North / East):**
  * `2D sprite strip of cute chibi rabbit girl farmer NPC idle breathing, Animal Crossing style, [straight front view facing SOUTH / straight back view facing NORTH / straight side profile facing EAST (flippable for WEST)], symmetrical design, cream and pink fur, floppy ears, floral dress with apron, single row of EXACTLY 8 idle frames, solid white background #FFFFFF`
* **Craft (South / North / East):**
  * `2D sprite strip of cute chibi rabbit girl farmer NPC gardening crafting, Animal Crossing style, [straight front view facing SOUTH / straight back view facing NORTH / straight side profile facing EAST (flippable for WEST)], symmetrical design, floppy ears, floral dress with apron, moving paws happily in front of chest without items, single row of EXACTLY 8 crafting frames, solid white background #FFFFFF`
* **Mounted (Dragon Riding):**
  * **South (Frente Direta):** `2D sprite strip of cute chibi rabbit girl farmer in dragon riding pose (without mount), Animal Crossing style, straight front view, symmetrical design, cream fur, floppy ears, floral dress, facing SOUTH, seated with legs spread wide straddling saddle holding reins, single row of EXACTLY 8 riding frames, solid white background #FFFFFF`
  * **North (Costas Retas):** `2D sprite strip of cute chibi rabbit girl farmer in dragon riding pose (without mount), Animal Crossing style, straight back view, symmetrical design, floppy ears, facing NORTH, back view seated straddling saddle holding reins, single row of EXACTLY 8 frames, solid white background #FFFFFF`
  * **East / Side (Lateral):** `2D sprite strip of cute chibi rabbit girl farmer in dragon riding pose (without mount), Animal Crossing style, straight side profile view, symmetrical design, floral dress, facing EAST (flippable for WEST), seated holding reins, ONLY near leg visible bent over saddle, far leg hidden, single row of EXACTLY 8 frames, solid white background #FFFFFF`

---

### 4.3. Tartaruga — O Guardião Ancestral (`npc_turtle_elder` - Mestre Casco)
* **Visual Simétrico:** Casco antigo musgoso com inscrições rúnicas simétricas, longa barba branca esvoaçante centralizada e túnica rúnica de eremita.

* **Walk (South / North / East):**
  * `2D sprite strip of cute chibi ancient sea turtle elder NPC walking, Animal Crossing style, [perfectly centered straight front view facing SOUTH / straight back view facing NORTH / straight side profile facing EAST (flippable for WEST)], symmetrical design, wrinkled sage face, centered long white beard, mossy carved shell with glowing runes and sage robe, single row of EXACTLY 8 walking frames, solid white background #FFFFFF, clean vector art, soft 3D clay lighting, no pixel art`
* **Idle (South / North / East):**
  * `2D sprite strip of cute chibi ancient turtle elder NPC idle breathing, Animal Crossing style, [straight front view facing SOUTH / straight back view facing NORTH / straight side profile facing EAST (flippable for WEST)], symmetrical design, wrinkled sage face, long white beard, mossy runic shell, single row of EXACTLY 8 idle frames, solid white background #FFFFFF`
* **Craft (South / North / East):**
  * `2D sprite strip of cute chibi ancient turtle elder NPC meditating crafting, Animal Crossing style, [straight front view facing SOUTH / straight back view facing NORTH / straight side profile facing EAST (flippable for WEST)], symmetrical design, mossy shell, white beard, slowly raising and lowering flippers in front of chest without items, single row of EXACTLY 8 crafting frames, solid white background #FFFFFF`
* **Mounted (Dragon Riding):**
  * **South (Frente Direta):** `2D sprite strip of cute chibi ancient turtle elder in dragon riding pose (without mount), Animal Crossing style, straight front view, symmetrical design, ancient turtle, mossy shell, white beard, facing SOUTH, serene seated with legs spread wide straddling saddle holding reins, single row of EXACTLY 8 riding frames, solid white background #FFFFFF`
  * **North (Costas Retas):** `2D sprite strip of cute chibi ancient turtle elder in dragon riding pose (without mount), Animal Crossing style, straight back view, symmetrical design, mossy shell, facing NORTH, back view serene seated straddling saddle holding reins, single row of EXACTLY 8 frames, solid white background #FFFFFF`
  * **East / Side (Lateral):** `2D sprite strip of cute chibi ancient turtle elder in dragon riding pose (without mount), Animal Crossing style, straight side profile view, symmetrical design, mossy shell, facing EAST (flippable for WEST), seated holding reins, ONLY near flipper/leg visible bent over saddle, far side hidden, single row of EXACTLY 8 frames, solid white background #FFFFFF`

---

### 4.4. Pinguim — O Pescador Polar (`npc_penguin_angler` - Pingo)
* **Visual Simétrico:** Pinguim-imperador gordinho, gorro de lã com pompom centralizado e capa impermeável amarela aconchegante com fechos simétricos.

* **Walk (South / North / East):**
  * `2D sprite strip of cute chibi emperor penguin angler NPC walking, Animal Crossing style, [perfectly centered straight front view facing SOUTH / straight back view facing NORTH / straight side profile facing EAST (flippable for WEST)], symmetrical design, chubby penguin body, centered pom-pom winter beanie and cozy yellow raincoat, single row of EXACTLY 8 walking frames, solid white background #FFFFFF, clean vector art, soft 3D clay lighting, no pixel art`
* **Idle (South / North / East):**
  * `2D sprite strip of cute chibi penguin angler NPC idle breathing, Animal Crossing style, [straight front view facing SOUTH / straight back view facing NORTH / straight side profile facing EAST (flippable for WEST)], symmetrical design, chubby penguin body, pom-pom beanie, yellow raincoat, single row of EXACTLY 8 idle frames, solid white background #FFFFFF`
* **Craft (South / North / East):**
  * `2D sprite strip of cute chibi penguin angler NPC working crafting, Animal Crossing style, [straight front view facing SOUTH / straight back view facing NORTH / straight side profile facing EAST (flippable for WEST)], symmetrical design, yellow raincoat, pom-pom beanie, waddling flippers up and down in front of chest without items, single row of EXACTLY 8 crafting frames, solid white background #FFFFFF`
* **Mounted (Dragon Riding):**
  * **South (Frente Direta):** `2D sprite strip of cute chibi penguin angler in dragon riding pose (without mount), Animal Crossing style, straight front view, symmetrical design, chubby penguin, pom-pom beanie, yellow raincoat, facing SOUTH, seated with chubby legs spread wide straddling saddle holding reins, single row of EXACTLY 8 riding frames, solid white background #FFFFFF`
  * **North (Costas Retas):** `2D sprite strip of cute chibi penguin angler in dragon riding pose (without mount), Animal Crossing style, straight back view, symmetrical design, pom-pom beanie, facing NORTH, back view seated straddling saddle holding reins, single row of EXACTLY 8 frames, solid white background #FFFFFF`
  * **East / Side (Lateral):** `2D sprite strip of cute chibi penguin angler in dragon riding pose (without mount), Animal Crossing style, straight side profile view, symmetrical design, yellow raincoat, facing EAST (flippable for WEST), seated holding reins, ONLY near flipper/foot visible bent over saddle, far side hidden, single row of EXACTLY 8 frames, solid white background #FFFFFF`

---

## 5. 📊 Tabela Comparativa de Habilidades Únicas

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
