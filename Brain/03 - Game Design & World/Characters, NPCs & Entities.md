# 👥 Characters, NPCs & Entities

#entities #characters #npc #player #sprites

> **Pasta de Origem**: [`Geralt/`](file:///Volumes/SSD%20FN501%20PRO/KidsLean/Geralt/) & [`src/engine/AssetLoader.js`](file:///Volumes/SSD%20FN501%20PRO/KidsLean/src/engine/AssetLoader.js)

---

## 🎭 Entidades do Mundo

| ID | Nome | Categoria | Tipo | Colisor Padrão | Função |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **`character-geralt`** | Geralt (Player Spawn) | Characters | `player` | `20, 46, 24, 16` | Ponto de spawn e avatar controlado pelo jogador com 16 sprites de animação. |
| **`character-npc-villager`** | NPC Villager | Characters | `npc` | `20, 46, 24, 16` | Aldeão pacífico para conversas, missões e comércio. |
| **`character-enemy-guard`** | Enemy Guard | Characters | `enemy` | `20, 46, 24, 16` | Guarda sentinela / oponente para áreas restritas e desafios de combate. |

---

## 🔮 Extensibilidade de Novos Personagens
Para adicionar novos monstros ou NPCs ao motor:
1. Adicione a pasta com as sprites direcionais (`Idle/` e `Running/`).
2. Registre a entidade no `AssetLoader.overworldTiles` com `isCharacter: true` e `characterType: 'npc' | 'enemy'`.
3. O editor automaticamente adicionará o badge `NPC` ou `ENEMY` no catálogo e disponibilizará o controle de escala e gizmos de colisão.

---

## 🔗 Links Relacionados
* [[Player Entity & 8-Way Movement]]
* [[Character Scale & Entity Manager]]
* [[Lua Island Educational Gameplay (Blockly & Lua)]]
