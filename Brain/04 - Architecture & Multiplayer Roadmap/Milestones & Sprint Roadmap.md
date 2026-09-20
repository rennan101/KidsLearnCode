# 🚀 Milestones & Sprint Roadmap

#roadmap #sprints #scrum #planning #milestones

---

## 📅 Visão Geral dos Sprints

```mermaid
gantt
    title Roadmap de Desenvolvimento KidsLean RPG / MMO
    dateFormat  YYYY-MM-DD
    section Fase 1: Engine 2D & Editor
    Engine 2D Core, Grid & Câmera           :done,    des1, 2026-08-01, 2026-08-15
    Colisões AABB, Rotação & Camadas        :done,    des2, 2026-08-16, 2026-08-31
    Minimapa Circular, Tático & Auto-Save   :done,    des3, 2026-09-01, 2026-09-16
    section Fase 2: Ilha Lua & Blockly
    Integração Google Blockly               :active,  des4, 2026-09-17, 2026-10-05
    Validador de Desafios Lua               :         des5, 2026-10-06, 2026-10-25
    section Fase 3: Multiplayer MMO
    Servidor Node.js + WebSockets           :         des6, 2026-10-26, 2026-11-15
    Sincronização de Avatares & Chat        :         des7, 2026-11-16, 2026-12-05
    section Fase 4: 3D & Housing
    Transição Three.js & Grid de Móveis     :         des8, 2026-12-06, 2027-01-10
```

---

## 🎯 Detalhamento dos Sprints

### ✅ Sprint 1 & 2: 2D Engine & World Editor (Concluído)
* [x] Loop de 60 FPS com delta time e zoom.
* [x] TileMap esparso infinito com 4 camadas configuráveis.
* [x] Sistema de rotação de 90°/180°/270° com recálculo de colisão.
* [x] Ajuste de escala de personagens e gizmos de colisor.
* [x] Minimapa circular com bússola e mapa tático expandido.
* [x] Persistência automática multi-chave no localStorage.

### 🟡 Sprint 3: Integração Educativa Blockly ➔ Lua (Próximo)
* [ ] Integrar editor visual de blocos Google Blockly como overlay modal.
* [ ] Customizar blocos com a semântica do jogo (`CriarItem`, `Pescar`, `Regar`).
* [ ] Desenvolver o validador de lógica de programação para liberação de itens.

### 🔵 Sprint 4 & 5: Servidor Multiplayer & Comunidade
* [ ] Configurar servidor Node.js + Socket.io com tick rate de 20 Hz.
* [ ] Sincronizar movimentação de múltiplos jogadores e balões de fala/emojis.
* [ ] Gerenciar estado global da ilha (coleta de recursos sincronizada).

---

## 🔗 Links Relacionados
* [[Lua Island Educational Gameplay (Blockly & Lua)]]
* [[Web MMO Client-Server Architecture]]
* [[Multiplayer Synchronization (WebSockets)]]
