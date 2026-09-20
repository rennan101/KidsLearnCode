# 🖌️ Brush, Fill & Multi-Tile Placement

#editor #tools #algorithms #floodfill

> **Arquivo Fonte**: [`src/editor/EditorController.js`](file:///Volumes/SSD%20FN501%20PRO/KidsLean/src/editor/EditorController.js)

---

## 🛠️ Ferramentas Disponíveis no Editor

| Ferramenta | Ícone | Função |
| :--- | :---: | :--- |
| **Select** | 🔍 | Inspeciona a célula clicada e abre o decompositor de camadas vertical. |
| **Brush** | 🖌️ | Pinta o asset selecionado com preview translúcido e rotação ativa. |
| **Fill** | 🪣 | Balde de preenchimento flood-fill para preencher grandes áreas contíguas. |
| **Spawn** | 🌟 | Define o ponto de spawn inicial do Geralt e centraliza a bússola. |
| **Collider** | 📐 | Ativa os manipuladores interativos (gizmos) para arrastar e redimensionar caixas de colisão. |
| **Eraser** | 🧹 | Apaga o tile da camada ativa (ou todas as camadas com o Botão Direito). |
| **Pick** | 🧪 | Conta-gotas: copia o asset e a rotação clicados diretamente do mapa. |
| **Rotate** | 🔄 | Gira o pincel ativo em +90° no sentido horário (Atalho: `R`). |

---

## 🌊 Algoritmo de Flood Fill Otimizado
O balde de tinta utiliza busca em profundidade com fila (`Array.pop()`) e conjunto de visitados (`Set`), limitado a 2.000 células por clique para evitar congelamento de thread:

```javascript
floodFill(startX, startY, layerName, newTileId) {
  const targetTile = this.tileMap.getTile(layerName, startX, startY);
  const targetId = targetTile ? targetTile.tileId : null;
  if (targetId === newTileId) return;

  const queue = [[startX, startY]];
  const visited = new Set();
  const maxFill = 2000;
  let filled = 0;

  while (queue.length > 0 && filled < maxFill) {
    const [x, y] = queue.pop();
    const key = `${x},${y}`;
    if (visited.has(key)) continue;
    visited.add(key);

    const current = this.tileMap.getTile(layerName, x, y);
    const curId = current ? current.tileId : null;

    if (curId === targetId) {
      this.tileMap.setTile(layerName, x, y, newTileId);
      filled++;

      queue.push([x + 1, y]);
      queue.push([x - 1, y]);
      queue.push([x, y + 1]);
      queue.push([x, y - 1]);
    }
  }
}
```

---

## 🔗 Links Relacionados
* [[Asset Rotation Pipeline (0°, 90°, 180°, 270°)]]
* [[TileMap & Sparse Grid Engine]]
* [[Undo-Redo History Manager (50 States)]]
