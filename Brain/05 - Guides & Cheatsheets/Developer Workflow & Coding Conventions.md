# 🛠️ Developer Workflow & Coding Conventions

#dev #conventions #standards #clean-code

---

## 🏛️ Padrões Arquiteturais

1. **Vanilla JS & ES Modules**:
   - Todo o código do motor reside em `src/` e é estruturado em classes ES6 modulares (`export class X`).
   - Evitar dependências externas de bundler para permitir execução imediata sem build step.

2. **Gerenciamento de Estado**:
   - Estado do mundo reside unicamente no `TileMap`.
   - Modificações disparam `onMapChange()`, propagando atualizações para o `UndoRedoManager` e o auto-save debounced.

3. **Convenções de UI e Estilo**:
   - Ícones SVG padronizados em escala 24x24 sem emojis em elementos estáticos de UI.
   - Design System com Glassmorphism, paleta tailormade HSL e fontes Outfit / JetBrains Mono / Cinzel.

---

## 📂 Estrutura de Diretórios do Projeto

```
KidsLean/
├── Brain/                         # 🧠 Second Brain para Obsidian
│   ├── 00 - Dashboard/            # Hub MOC e Status do Projeto
│   ├── 01 - Core Engine/          # Documentação Técnica do Motor 2D
│   ├── 02 - World Editor/         # Ferramentas do Editor de Mundos
│   ├── 03 - Game Design & World/  # Lore, Biomas e Desafios Lua
│   ├── 04 - Architecture & MMO/   # Arquitetura e Roadmap Multiplayer
│   └── 05 - Guides & Cheatsheets/ # Atalhos e Guias de Desenvolvimento
├── Geralt/                        # Spritesheets e Rotações do Geralt
├── RPG-overworld-tileset/         # Sprites de Terreno, Flora, Água e Estruturas
├── src/
│   ├── engine/                    # Subsistemas de Renderização, Câmera, Minimapa e Física
│   ├── editor/                    # Controladores de Ferramentas e Gizmos
│   └── main.js                    # Entrypoint e Coordenador
├── index.html                     # Viewport e Interface do Editor
├── styles.css                     # Sistema de Design Dark Fantasy
├── package.json                   # Scripts de Execução
├── start.command                  # Inicializador rápido com dois cliques
└── start.sh                       # Script de Inicialização Localhost
```

---

## 🔗 Links Relacionados
* [[00 - Hub & Map of Content (MOC)]]
* [[Game Loop & Canvas Coordinator]]
* [[Local Server & Deployment Quickstart]]
