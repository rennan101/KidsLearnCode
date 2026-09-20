# 🚀 Milestones & Sprint Roadmap (7 Sprints)

#roadmap #sprints #scrum #planning #milestones

> **Estratégia de Desenvolvimento:** As **primeiras 3 Sprints** são 100% dedicadas à geração e processamento de todos os assets visuais, animações, dragões e tilesets. As **Sprints 4 a 7** implementam o motor de jogo, ciclograma dia/noite com barra de ações, dragões, trilha educativa Lua e multiplayer em tempo real.

---

## 📅 Visão Geral das 7 Sprints

```mermaid
flowchart TD
    subgraph FASE_ARTE["🎨 FASE 1: GERAÇÃO DE ARTE & SPRITESHEETS"]
        S1["Sprint 1: Heróis (8 Variações) & 9 NPCs da Vila"]
        S2["Sprint 2: Dragões (10 Espécies), Ovos & Ladrilhos Animados"]
        S3["Sprint 3: Ferramentas, Pisos Seamless, Props & Workbench"]
    end

    subgraph FASE_ENGINE["⚙️ FASE 2: MOTOR, GAMEPLAY & PEDAGOGIA LUA"]
        S4["Sprint 4: Ciclo Dia/Noite (Brasília), Barra de Ações (5-10 AP) & Sockets"]
        S5["Sprint 5: Dragões Gameplay (Bolsa B, Combate Auto + Esquiva 1, Field Moves)"]
        S6["Sprint 6: Trilha Educativa Blockly ➔ Lua & Desafios de Operações"]
        S7["Sprint 7: Servidor Multiplayer WebSockets & Chat Animal Crossing"]
    end

    S1 --> S2 --> S3 --> S4 --> S5 --> S6 --> S7
```

---

## 🎯 Detalhamento dos Sprints

### 🎨 Sprint 1 — Arte & Sprites: Heróis, NPCs & Animações
* [ ] Gerar Spritesheets dos 8 Heróis Jogáveis (Lobo, Morcego, Águia, Gato - Masc/Fem).
* [ ] Poses e animações: `Idle`, `Walk 8-way`, `Run [Shift] 8-way`, `Craft 8-way` e `Mount Riding 8-way`.
* [ ] Gerar ilustrações e sprites dos 9 NPCs Moradores da Vila Medieval.

### 🐉 Sprint 2 — Arte & Sprites: Dragões, Ovos & Ladrilhos Animados
* [ ] Gerar Spritesheets dos Dragões Voadores (Ventos, Tempestade, Solar) com área de sela.
* [ ] Gerar Spritesheets dos Dragões Terrestres (Rocha, Magma, Floresta) com área de sela.
* [ ] Gerar Spritesheets dos Dragões Aquáticos (Marés, Glacial, Abissal) com área de sela.
* [ ] Gerar Spritesheet do Dragão Mítico da Ilha Lua.
* [ ] Gerar Ícones de Ovos de Dragão, Ninho Incubador e Apito de Chamado.
* [ ] Gerar Spritesheets em Loop Animado (Água Cristalina 8f, Lava 8f, Cachoeira 8f, Fogueira 6f).

### 🛠️ Sprint 3 — Arte & Sprites: Ferramentas, Tilesets & Workbench
* [ ] Gerar Ícones das Ferramentas (Pá, Machado, Vara de Pesca, Picareta, Regador, Rede).
* [ ] Gerar Tilesets de Terreno Seamless (Paralelepípedo, Terra, Madeira, Grama Florida, Areia, Mosaico).
* [ ] Gerar Props de Mobília, Tendas, Casas de Enxaimel, Pontes, Rampas, Escadas, Cercados e Poço.
* [ ] Gerar Assets de Sementes, Árvores Adultas e Rochas Minerais.

### ☀️🌙 Sprint 4 — Core Engine: Ciclo Dia/Noite, Barra de Ações & Sockets
* [ ] Sistema de Ciclo Dia/Noite sincronizado com Horário de Brasília (Dia: 06h às 17h / Noite: 17h01 às 05h59).
* [ ] Sistema de Barra de Pontos de Ação (5 APs iniciais, evoluindo até 10 APs) que bloqueia ações ao zerar.
* [ ] Mecânica Exclusiva do Morcego Vampiro: Ganha +5 Ações Noturnas exclusivas para craft no escuro.
* [ ] Tela de Seleção dos 8 Heróis com ativação das Habilidades Passivas.
* [ ] Motor de Sockets de Montaria no Canvas 2D (`MountSocketManager`).
* [ ] UI de Diálogos estilo Animal Crossing (balões orgânicos creme, badges e som Animalese).

### 🐲 Sprint 5 — Dragões: Bolsa B, Combate & Field Moves
* [ ] Bolsa de Dragões (Atalho `B`) para invocação e montaria rápida.
* [ ] Pet Follow AI (máquina de estados do dragão seguindo o herói suavemente).
* [ ] Sistema de Combate Automático com barras de HP flutuantes e Esquiva Tática (Tecla `1`).
* [ ] Field Moves de Interação no Cenário (Quebrar pedras, criar gelo na água, apagar fogo, germinar grama).
* [ ] Ninhos de Ovos na Natureza e Sistema de Eclosão (Liberar na Natureza vs Adotar e Treinar).

### 🎓 Sprint 6 — Trilha Educativa: Blockly ➔ Lua & Workbench
* [ ] Integrar Google Blockly como Modal HUD de Programação.
* [ ] Transpilador Blockly para Código Lua Limpo com visualização de código.
* [ ] Roteiro Pedagógico Lua: Desafios obrigatórios para Forjar Ferramentas, Desenterrar Ovos, Chocar e Ativar Field Moves.
* [ ] Sistema de Missões Assíncronas Individuais com NPCs Mentores.
* [ ] Sistema de Ferramentas Ativas e Bancada de Trabalho Workbench.

### 🌐 Sprint 7 — Multiplayer: WebSockets, Sincronização & Chat Animal Crossing
* [ ] Servidor Node.js + WebSockets de baixa latência para a Ilha Compartilhada.
* [ ] Sincronização em Tempo Real de Jogadores, Montarias e Dragões Ativos.
* [ ] Sistema de Chat com Balões de Fala Empilháveis (Max 2 Níveis + Auto-Fade de 5s).
* [ ] Persistência de Progresso Individual e Estado no Banco de Dados.

---

## 🔗 Links Relacionados
* [[Day Night Cycle & Action Points System]]
* [[Mount & Modular Character Layering System]]
* [[Lua Missions Script & Interactive Field Moves]]
* [[Dialogue & Animal Crossing Speech Bubble System]]
