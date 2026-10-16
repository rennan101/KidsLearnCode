# ⚔️ Player Entity & 4-Way Movement

#engine #player #movement #animation #entity #4way

> **Arquivo Fonte**: [`src/engine/Player.js`](file:///Volumes/SSD%20FN501%20PRO/KidsLearnCode/src/engine/Player.js)  
> **Conceito:** O jogador se movimenta nas **4 direções cardeais** (Sul/Frente, Leste/Direita, Norte/Costas, Oeste/Esquerda), otimizando a fidelidade dos spritesheets e mantendo a jogabilidade limpa e precisa no grid.

---

## 🎯 Máquina de Estados e Movimento 4-Way

O herói se movimenta a uma velocidade base de **200 px/s** (ou **320 px/s** com sprint/Shift), alternando entre 4 linhas de animação:

```mermaid
flowchart TD
    subgraph DIRS["🧭 4 Direções Cardeais"]
        S["South (Frente / Linha 0)"]
        E["East (Direita / Linha 1)"]
        N["North (Costas / Linha 2)"]
        W["West (Esquerda / Linha 3)"]
    end

    subgraph ACTIONS["🎭 Estados de Animação"]
        IDLE["Idle: Respiração sutil (Cols 0-1)"]
        WALK["Walk: Passo firme (Cols 2-4)"]
        RUN["Run [Shift]: Corrida veloz (Cols 5-6)"]
        CRAFT["Craft: Montagem na bancada/conjuração (Col 7)"]
        MOUNT["Mount Riding: Sentado no Socket do Dragão"]
    end

    DIRS --- ACTIONS
```

---

## 🏃 Controles e Velocidades

| Ação | Teclas | Velocidade | Estado de Animação |
| :--- | :--- | :---: | :--- |
| **Parado** | Nenhuma tecla | 0 px/s | `idle` |
| **Caminhar** | `W`, `A`, `S`, `D` / Setas | 200 px/s | `walk` |
| **Correr (Sprint)** | `Shift` + `W, A, S, D` | 320 px/s (+60%) | `run` |
| **Fabricar** | Interação na Bancada (Workbench) | 0 px/s | `craft` |
| **Montar** | Tecla `B` próximo ao Dragão | Vel. do Dragão | `mount_riding` |

---

## 🔗 Links Relacionados
* [[Mount & Modular Character Layering System]]
* [[Catalog - Characters, NPCs & Generation Prompts]]
* [[Collision Detection & AABB Math]]
