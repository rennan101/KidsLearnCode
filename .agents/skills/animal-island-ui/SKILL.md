---
name: animal-island-ui
description: >
  Standardized guidelines, design tokens, and component specifications for Animal Island UI
  (Animal Crossing: New Horizons inspired design system) featuring warm earth tones, mint-teal accents,
  large pill shapes, 3D game button depth, swallowtail ribbons, and cozy parchment aesthetics.
  Use whenever styling or redesigning UI components in Play Mode, modals, HUDs, or dialogs.
---

# Animal Island UI Skill & Design System

The `animal-island-ui` design system is inspired by the cozy, hand-drawn island aesthetic of *Animal Crossing: New Horizons*.

## 1. Design Tokens & CSS Variables

```css
:root {
  /* Fonts */
  --animal-font: 'Nunito', 'Outfit', 'Noto Sans SC', sans-serif;
  --animal-font-title: 'Cinzel', 'Nunito', serif;
  --animal-font-mono: 'JetBrains Mono', monospace;

  /* Primary Mint-Teal Colors */
  --animal-primary: #19c8b9;
  --animal-primary-hover: #3dd4c6;
  --animal-primary-active: #11a89b;
  --animal-primary-bg: #e6f9f6;
  --animal-primary-dark: #0f8e83;

  /* Accent Colors */
  --animal-accent-gold: #f59e0b;
  --animal-accent-orange: #ea580c;
  --animal-accent-wood: #7a583e;
  --animal-accent-leaf: #34d399;

  /* Text (Earth-Brown & Warm Neutral - Never Pure Black) */
  --animal-text: #794f27;
  --animal-text-body: #725d42;
  --animal-text-secondary: #9f927d;
  --animal-text-muted: #8a7b66;
  --animal-text-disabled: #c4b89e;
  --animal-text-white: #ffffff;

  /* Backgrounds (Warm Parchment & Cream) */
  --animal-bg: #f8f8f0;
  --animal-bg-card: #fdfbf7;
  --animal-bg-content: #f7f3df;
  --animal-bg-dark: #1e293b;
  --animal-bg-dark-card: #141f33;
  --animal-bg-overlay: rgba(30, 20, 10, 0.65);

  /* Borders */
  --animal-border: #c4b89e;
  --animal-border-hover: #a89878;
  --animal-border-wood: #7a583e;
  --animal-border-mint: #3dd4c6;

  /* Radius */
  --animal-radius-sm: 12px;
  --animal-radius-md: 18px;
  --animal-radius-lg: 24px;
  --animal-radius-pill: 50px;
  --animal-radius-circle: 50%;

  /* 3D Shadows & Elevations */
  --animal-shadow-btn-primary: 0 4px 0 0 #0f8e83, 0 6px 12px rgba(17, 168, 155, 0.35);
  --animal-shadow-btn-wood: 0 4px 0 0 #5c3c26, 0 6px 12px rgba(92, 60, 38, 0.35);
  --animal-shadow-card: 0 12px 32px rgba(80, 55, 30, 0.15), 0 2px 6px rgba(80, 55, 30, 0.08);
  --animal-shadow-floating: 0 20px 40px rgba(0, 0, 0, 0.45);

  /* Custom Animal Crossing Cursors */
  --animal-cursor-default: url("data:image/svg+xml,...") 3 3;
  --animal-cursor-pointer: url("data:image/svg+xml,...") 10 2;
  --animal-cursor-grab: url("data:image/svg+xml,...") 14 14;
  --animal-cursor-grabbing: url("data:image/svg+xml,...") 14 14;

  /* Motion & Easing */
  --animal-ease: cubic-bezier(0.4, 0, 0.2, 1);
  --animal-duration: 0.2s;
}
```

## 2. Core Visual Principles & Hard Rules

1. **Warm Palette**: Earth-brown text (`#794f27` / `#725d42`) on warm parchment (`#f8f8f0` / `#fdfbf7`) with mint-teal (`#19c8b9`) and gold accents. Never pure black text (`#000000`).
2. **Generous Radii**: 12px minimum for containers, 18–24px for cards, and **50px pill shapes** for buttons, input bars, and badges.
3. **Tactile 3D Depth**: Primary interactive buttons feature a 4px solid base shadow (`0 4px 0 0 [dark-tone]`) that compresses on `:active` (`transform: translateY(3px); box-shadow: 0 1px 0 0 [dark-tone]`).
4. **Custom Game Cursors**: Animal Crossing style gloved hand pointer (`--animal-cursor-pointer`), arrow pointer (`--animal-cursor-default`), and grab hands (`--animal-cursor-grab / grabbing`).
5. **Ribbons & Badges**: Distinctive swallowtail header ribbons and curved pill badges with contrasting borders.
6. **Clean SVG Icons**: Strict adherence to `GEMINI.md` — 100% inline `<svg>` icons, 0 emojis across all UI components.
7. **No Background Blur**: Fast, crisp, high-contrast modal backdrops (`rgba(20, 15, 10, 0.7)`).

## 3. UI Component Guide for KidsLearnCode Play Mode

- **Top Navigation & Hero HUD**: Floating pill card with leaf badge, level/XP progress, Bells/Gold counter, and quick action buttons.
- **Backpack & Storage Modal**: 20 circular pockets on cream parchment with mint header and tactile detail drawer.
- **Crafting & DIY Workbench**: Leaf-stamped card with recipe grid and quick assembly actions.
- **NPC Floating Dialogue Balloons**: Curved speech bubbles with triangular tail anchored directly above NPCs with smooth zoom.
- **Code Kit Challenge Studio**: 3-column mint/slate card with puzzle blocks and real-time Lua code viewer.
- **In-Game Chat Bar**: Cozy pill input bar (`#19c8b9` / `#fdfbf7`) with send button.
- **Mini-Map Frame**: Smooth rounded circular/pill frame with compass points and island status.
- **Custom Cursors**: Cozy gloved hand pointer on all interactive controls and rounded arrow pointer on canvas/body.
