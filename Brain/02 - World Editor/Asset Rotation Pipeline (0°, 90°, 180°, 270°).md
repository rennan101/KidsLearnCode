# 🔄 Asset Rotation Pipeline (0°, 90°, 180°, 270°)

#editor #rotation #matrix #math #rendering

> **Arquivos Fonte**: [`src/editor/EditorController.js`](file:///Volumes/SSD%20FN501%20PRO/KidsLean/src/editor/EditorController.js) & [`src/engine/TileMap.js`](file:///Volumes/SSD%20FN501%20PRO/KidsLean/src/engine/TileMap.js)

---

## 🎯 Visão Geral
O sistema de rotação permite girar qualquer asset em 4 orientações cardeais: `0°`, `90°`, `180°` e `270°`. A rotação afeta três subsistemas interdependentes:
1. **Dimensões do Footprint Ocupado no Grid**.
2. **Transformação do Canvas 2D (`ctx.rotate`)**.
3. **Mapeamento de Física e Caixas de Colisão AABB**.

---

## 📐 Inversão de Grid para Objetos Retangulares
Quando um objeto retangular (ex: *Dirt Road 8x1* ou *Pine Tree 2x3*) é rotacionado em 90° ou 270°, suas dimensões de ocupação no grid são invertidas:

```javascript
const baseW = tileMeta.gridW || 1;
const baseH = tileMeta.gridH || 1;
const isRotated90or270 = (rotation === 90 || rotation === 270);
const gridW = isRotated90or270 ? baseH : baseW;
const gridH = isRotated90or270 ? baseW : baseH;
```

---

## 🎨 Renderização Centralizada com Pivot
Para que a rotação ocorra no centro visual exato da pegada no grid:

```javascript
ctx.save();
ctx.translate(destX + occW / 2, destY + occH / 2);
ctx.rotate((rotation * Math.PI) / 180);
ctx.drawImage(img, -rawW / 2, -rawH / 2, rawW, rawH);
ctx.restore();
```

---

## ⌨️ Atalhos de Rotação
* Tecla **`R`**: Gira o pincel ativo em +90°.
* Botão **Girar no Inspetor de Célula**: Gira apenas o tile específico selecionado naquela camada do mapa.

---

## 🔗 Links Relacionados
* [[Brush, Fill & Multi-Tile Placement]]
* [[Collision Detection & AABB Math]]
* [[Interactive Collider Box Gizmos]]
