# 🔄 Game Loop & Canvas Coordinator

#engine #architecture #canvas #performance

> **Arquivo Fonte**: [`src/main.js`](file:///Volumes/SSD%20FN501%20PRO/KidsLean/src/main.js)  
> **Classe Principal**: `RPGApplication`

---

## 🎯 Visão Geral
A classe `RPGApplication` é o maestro central do motor. Ela gerencia o ciclo de vida do jogo, coordena a troca de modos (**Play Mode** vs **World Editor**), orquestra o loop de renderização a 60 FPS com delta-time estável e gerencia a persistência contínua.

```mermaid
sequenceDiagram
    autonumber
    actor User as Jogador / Editor
    participant Main as RPGApplication
    participant Player as Player (Geralt)
    participant Editor as EditorController
    participant Camera as Camera 2D
    participant TileMap as TileMap Engine
    participant Minimap as Minimap HUD
    participant Canvas as HTML5 Canvas 2D

    Main->>Main: init() -> Preload Assets & Load Saved Map
    loop requestAnimationFrame (gameLoop)
        Main->>TileMap: update(deltaTime) (Water frames)
        alt Mode == 'play'
            Main->>Player: update(deltaTime, tileMap, assetLoader)
            Main->>Camera: follow(player.x, player.y, 0.1)
        else Mode == 'edit'
            Main->>Editor: update(deltaTime) (WASD camera pan)
        end
        Main->>Main: render()
        Main->>Canvas: Clear & Apply Camera Matrix (scale, translate)
        loop Para cada camada em layerOrder
            Main->>TileMap: renderLayer(layerName)
            opt layerName == 'characters'
                Main->>Player: render(showColliders)
            end
        end
        opt Mode == 'edit'
            Main->>Editor: renderEditorOverlay()
        end
        Main->>Minimap: render(isEditor)
    end
```

---

## ⏱️ Controle de Delta-Time e FPS
O loop calcula `deltaTime` limitado a 100ms para evitar saltos quânticos de física quando o usuário troca de aba:

```javascript
gameLoop(currentTime) {
  const deltaTime = Math.min(currentTime - this.lastTime, 100);
  this.lastTime = currentTime;

  // Contador de FPS
  this.frameCount++;
  this.fpsTimer += deltaTime;
  if (this.fpsTimer >= 1000) {
    document.getElementById('status-fps').innerText = this.frameCount;
    this.frameCount = 0;
    this.fpsTimer = 0;
  }
  ...
}
```

---

## 🔀 Alternância de Modos (Play vs Edit)

| Propriedade | Play Mode | World Editor Mode |
| :--- | :--- | :--- |
| **Foco de Controle** | Movimentação do Geralt (WASD) | Pan livre da Câmera (WASD / Pan do Mouse) |
| **Câmera** | Rastreamento elástico contínuo | Navegação livre desvinculada |
| **Drawer de Assets** | Oculto / Recolhido | Expandido com redimensionamento por mouse |
| **Colisores Invisíveis** | Totalmente transparentes | Marcados com listras e tag `BARRIER` |
| **Overlays** | Apenas HUD mínimo e Minimap | Grade infinita, Ghost preview e Gizmos |

---

## 🔗 Links Relacionados
* [[TileMap & Sparse Grid Engine]]
* [[Camera & Infinite Viewport]]
* [[Layer Hierarchy & Dynamic Stacking]]
* [[State Persistence & Auto-Save Protocol]]
