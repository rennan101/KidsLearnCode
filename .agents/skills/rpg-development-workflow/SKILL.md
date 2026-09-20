---
name: rpg-development-workflow
description: >-
  Standardized workflow and architectural guidelines for developing, expanding,
  and maintaining the 2D RPG Engine, World Editor, and future Web MMO infrastructure.
---

# 2D RPG Game & World Editor Workflow

This skill defines the technical processes, asset specifications, and multiplayer roadmap for the RPG project.

---

## 1. Asset & Grid Architecture

- **Base Unit Tile**: $64 \times 64$ pixels (`TILE_SIZE = 64`).
- **Grid Auto-Fitting Rule**:
  - Every sprite, regardless of its original raw PNG dimensions (e.g. $65 \times 64$, $191 \times 191$, $257 \times 256$, $514 \times 64$), is snapped and scaled to integer multiples of $64\text{px}$ ($\text{gridW} = \text{round}(\text{width} / 64)$, $\text{gridH} = \text{round}(\text{height} / 64)$).
- **Footprints Overview**:
  - $1 \times 1$ ($64 \times 64$): Grass details, Crops, Mushrooms, Rocks, Berry Bushes, Water frames, Signs, Crates.
  - $2 \times 1$ ($128 \times 64$): Dirt road straight edges.
  - $2 \times 2$ ($128 \times 128$): Dirt road curves and crossings.
  - $2 \times 3$ ($128 \times 192$): Pine Tree (`tree-1`), Oak Tree (`tree-2`).
  - $3 \times 3$ ($192 \times 192$): Large grass & dirt patches.
  - $3 \times 5$ ($192 \times 320$): Dirt road path joints.
  - $4 \times 4$ ($256 \times 256$): Cottage House (`house-1`).
  - $5 \times 4$ ($320 \times 256$): Town House (`house-2`).
  - $8 \times 1$ ($512 \times 64$): Broad road strip (`dirt-path-24`).

---

## 2. Collision System (AABB Physics)

- **Tile Colliders Format**:
  - Each asset has an editable bounding box: `{ enabled: boolean, x: number, y: number, w: number, h: number }`.
  - Coordinates ($X, Y, W, H$) are defined in local pixels relative to the tile footprint.
- **Physics Resolution**:
  - Player feet box: $24 \times 16\text{px}$ (`Player.js`).
  - Axis-independent collision testing ($X$ then $Y$) allows smooth sliding along diagonal walls, buildings, and tree bases.
  - **Editable with Mouse & Inputs**:
    - Select **Edit Collider** tool or click any tile in the drawer.
    - Drag the red collider box or its corner resize handles directly on the canvas with the mouse.
    - Edit precise numeric values ($X, Y, W, H$) in the bottom drawer panel.
    - Custom collider configurations automatically persist in `localStorage`.

---

## 3. UI and Iconography Rules

- **Strictly No Emojis**: All buttons, toolbar icons, notifications, and navigation items MUST use inline SVG icons (`viewBox="0 0 24 24"`).
- **Resizable Asset Drawer**: The left edge of the drawer has an `ew-resize` handle to expand or shrink the palette width seamlessly.
- **Colliders Overlay Button**: Toggle collision wireframes on/off in the top header.
