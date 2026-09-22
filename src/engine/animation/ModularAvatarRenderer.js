/**
 * ModularAvatarRenderer.js - KidsLearnCode
 * Renderizador Vetorial 2D por Cutout / Paper-Doll para Personagens Customizáveis.
 * 
 * Implementação fiel às proporções e alinhamento visual de samples.svg,
 * Face Components.svg e Hairs.svg para o corpo inteiro.
 */

import { SkeletonRig } from './SkeletonRig.js';
import { DEFAULT_AVATAR_CONFIG } from './AvatarConfig.js';
import {
  SVG_NOSES,
  SVG_MOUTHS,
  SVG_EYES,
  SVG_CHEEKS,
  SVG_HAIRS
} from './SvgAssetCatalog.js';

export class ModularAvatarRenderer {
  constructor() {
    this.rig = new SkeletonRig();
    this.pathCache = new Map();
  }

  getPath2D(d) {
    if (!this.pathCache.has(d)) {
      this.pathCache.set(d, new Path2D(d));
    }
    return this.pathCache.get(d);
  }

  /**
   * Renderiza o avatar completo no contexto 2D alvo.
   * @param {CanvasRenderingContext2D} ctx - Contexto Canvas onde desenhar
   * @param {number} x - Posição X no mundo
   * @param {number} y - Posição Y no mundo
   * @param {string} direction - 'south' | 'north' | 'east' | 'west'
   * @param {string} state - 'idle' | 'walk' | 'riding' | 'craft' | 'celebrate'
   * @param {number} time - Tempo decorrido em segundos
   * @param {Object} config - Configuração do avatar
   * @param {number} scale - Escala global do avatar (padrão 0.22 para in-game, ~0.72 para preview)
   */
  render(ctx, x, y, direction = 'south', state = 'idle', time = 0, config = DEFAULT_AVATAR_CONFIG, scale = 0.22) {
    const isWest = direction === 'west';
    const effectiveDir = isWest ? 'east' : direction;
    const pose = this.rig.evaluate(state, direction, time);

    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));

    // Se for 'west', espelha horizontalmente em torno do centro do sprite (32 * scale / 0.22)
    if (isWest) {
      ctx.translate(32 * (scale / 0.22), 0);
      ctx.scale(-1, 1);
      ctx.translate(-32 * (scale / 0.22), 0);
    }

    if (scale !== 1.0) {
      ctx.scale(scale, scale);
    }

    // Ponto de ancoragem central da cabeça e corpo no espaço SVG (~140x260px)
    const centerX = 140;
    const headCenterY = 95;

    // Sombra elíptica no chão (exceto se montado)
    if (state !== 'riding') {
      this.drawShadow(ctx, centerX, 260, pose.shadow.scale);
    }

    if (effectiveDir === 'north') {
      this.renderNorth(ctx, pose, config, centerX, headCenterY);
    } else if (effectiveDir === 'east') {
      this.renderEast(ctx, pose, config, centerX, headCenterY);
    } else {
      this.renderSouth(ctx, pose, config, centerX, headCenterY);
    }

    ctx.restore();
  }

  /* ========================================================================= */
  /*  RENDERIZAÇÃO: VISTA FRONTAL (SOUTH)                                      */
  /* ========================================================================= */
  renderSouth(ctx, pose, cfg, cx, cy) {
    const skin = cfg.skinTone || '#ffd0a8';
    const skinShadow = cfg.skinShadow || '#e0ae82';

    const headX = cx + (pose.head.x * 2.5);
    const headY = cy + (pose.head.y * 2.5) + (pose.head.bobY * 2.5);
    const torsoY = headY + 82;

    // 1. Cabelo Traseiro / Longo (atrás de tudo)
    this.drawHairBack(ctx, headX, headY, cfg, 'south');

    // 2. Pernas e Pés
    this.drawLegs(ctx, cx, torsoY + 75, pose, cfg, 'south');

    // 3. Tronco e Roupas (Corpo Chibi de samples.svg)
    this.drawTorso(ctx, cx, torsoY, pose.root.rot, cfg, 'south');

    // 4. Braços e Mãos (NA FRENTE DO TRONCO - NUNCA ATRÁS DO CABELO!)
    this.drawArms(ctx, cx, torsoY + 22, pose, cfg, 'south');

    // 5. Cabeça e Rosto
    ctx.save();
    ctx.translate(headX, headY);
    ctx.rotate(pose.head.rot);

    // Formato oficial da Cabeça Chibi (samples.svg)
    this.drawHeadBase(ctx, skin, skinShadow, 'south');

    // Feições faciais (Face Components.svg alinhadas exatamente a samples.svg)
    this.drawFaceFeatures(ctx, cfg, 'south');

    // Cabelo Frontal (Hairs.svg encaixado perfeitamente no topo e laterais)
    this.drawHairFront(ctx, cfg, 'south');

    // Óculos
    if (cfg.glassesStyle && cfg.glassesStyle !== 'none') {
      this.drawGlasses(ctx, cfg, 'south');
    }

    // Chapéus
    if (cfg.hatStyle && cfg.hatStyle !== 'none') {
      this.drawHat(ctx, cfg, 'south');
    }

    ctx.restore();
  }

  /* ========================================================================= */
  /*  RENDERIZAÇÃO: VISTA TRASEIRA (NORTH)                                     */
  /* ========================================================================= */
  renderNorth(ctx, pose, cfg, cx, cy) {
    const skin = cfg.skinTone || '#ffd0a8';
    const skinShadow = cfg.skinShadow || '#e0ae82';

    const headX = cx + (pose.head.x * 2.5);
    const headY = cy + (pose.head.y * 2.5) + (pose.head.bobY * 2.5);
    const torsoY = headY + 82;

    this.drawLegs(ctx, cx, torsoY + 75, pose, cfg, 'north');
    this.drawTorso(ctx, cx, torsoY, pose.root.rot, cfg, 'north');
    this.drawArms(ctx, cx, torsoY + 22, pose, cfg, 'north');

    ctx.save();
    ctx.translate(headX, headY);
    ctx.rotate(pose.head.rot);

    this.drawHeadBase(ctx, skin, skinShadow, 'north');
    this.drawHairBack(ctx, 0, 0, cfg, 'north');
    this.drawHairFront(ctx, cfg, 'north');

    if (cfg.hatStyle && cfg.hatStyle !== 'none') {
      this.drawHat(ctx, cfg, 'north');
    }

    ctx.restore();
  }

  /* ========================================================================= */
  /*  RENDERIZAÇÃO: VISTA LATERAL (EAST / PERFIL)                              */
  /* ========================================================================= */
  renderEast(ctx, pose, cfg, cx, cy) {
    const skin = cfg.skinTone || '#ffd0a8';
    const skinShadow = cfg.skinShadow || '#e0ae82';

    const headX = cx + (pose.head.x * 2.5);
    const headY = cy + (pose.head.y * 2.5) + (pose.head.bobY * 2.5);
    const torsoY = headY + 82;

    this.drawHairBack(ctx, headX, headY, cfg, 'east');
    this.drawLegs(ctx, cx, torsoY + 75, pose, cfg, 'east');
    this.drawTorso(ctx, cx, torsoY, pose.root.rot, cfg, 'east');
    this.drawArms(ctx, cx, torsoY + 22, pose, cfg, 'east');

    ctx.save();
    ctx.translate(headX, headY);
    ctx.rotate(pose.head.rot);

    this.drawHeadBase(ctx, skin, skinShadow, 'east');
    this.drawFaceFeatures(ctx, cfg, 'east');
    this.drawHairFront(ctx, cfg, 'east');

    if (cfg.glassesStyle && cfg.glassesStyle !== 'none') {
      this.drawGlasses(ctx, cfg, 'east');
    }

    if (cfg.hatStyle && cfg.hatStyle !== 'none') {
      this.drawHat(ctx, cfg, 'east');
    }

    ctx.restore();
  }

  /* ========================================================================= */
  /*  COMPONENTES ANATÔMICOS OFICIAIS (samples.svg)                           */
  /* ========================================================================= */

  drawShadow(ctx, x, y, scale = 1.0) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.ellipse(x, y, 65 * scale, 22 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawHeadBase(ctx, skin, skinShadow, dir) {
    ctx.save();

    ctx.fillStyle = skin;
    ctx.strokeStyle = skinShadow;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';

    if (dir === 'south' || dir === 'north') {
      // Orelha Esquerda (samples.svg: cx=1324 cy=144 rx=22 ry=19)
      ctx.beginPath();
      ctx.ellipse(-84, 18, 22, 19, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Orelha Direita (samples.svg: cx=1493 cy=144 rx=22 ry=19)
      ctx.beginPath();
      ctx.ellipse(85, 18, 22, 19, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Formato Oficial da Cabeça Chibi (samples.svg: d="M1408 43C1377 43 1325.5 54.2...")
      const headD = 'M0 -83.5C-31 -83.5 -82.5 -72.3 -82.5 -1.5C-82.39 -1.5 -82.28 -1.5 -82.18 -1.5C-84.02 9.556 -84.59 20.525 -83.31 30C-80.11 53.6 -49.64 71.5 -34.81 77.5C-29.97 79.5 -16.11 83.5 0.69 83.5C17.49 83.5 31.36 79.5 36.19 77.5C51.03 71.5 81.49 53.6 84.69 30C85.99 20.446 85.39 9.382 83.5 -1.758C83.37 -72.327 31.96 -83.5 1 -83.5H0Z';
      const headPath = this.getPath2D(headD);
      ctx.fill(headPath);
      ctx.stroke(headPath);

    } else {
      // Perfil da cabeça
      ctx.beginPath();
      ctx.moveTo(-60, -75);
      ctx.bezierCurveTo(40, -85, 80, -30, 80, 15);
      ctx.bezierCurveTo(80, 55, 20, 78, -20, 78);
      ctx.bezierCurveTo(-70, 78, -80, 40, -80, -10);
      ctx.bezierCurveTo(-80, -50, -70, -70, -60, -75);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Orelha lateral
      ctx.beginPath();
      ctx.ellipse(-30, 18, 22, 19, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  drawFaceFeatures(ctx, cfg, dir) {
    if (dir === 'north') return;

    ctx.save();

    if (dir === 'south') {
      // 1. Bochechas / Blush (samples.svg: cx=1349.5 & 1469.5 cy=160.5)
      this.drawCheekItem(ctx, -58.5, 34, cfg.cheeksShape, 'left');
      this.drawCheekItem(ctx, 61.5, 34, cfg.cheeksShape, 'right');

      // 2. Olhos (samples.svg: cx=1372.5 & 1448.5 cy=130.5)
      this.drawEyeItem(ctx, -38, 4, cfg.eyeShape, cfg.eyeColor, 'left');
      this.drawEyeItem(ctx, 40, 4, cfg.eyeShape, cfg.eyeColor, 'right');

      // 3. Nariz (samples.svg: cx=1411 cy=143)
      this.drawNoseItem(ctx, 2.5, 16.5, cfg.noseShape);

      // 4. Boca (samples.svg: y=164 - 175)
      this.drawMouthItem(ctx, 0.5, 42, cfg.mouthShape);

    } else {
      // Perfil lateral
      this.drawCheekItem(ctx, 45, 34, cfg.cheeksShape, 'right');
      this.drawEyeItem(ctx, 38, 4, cfg.eyeShape, cfg.eyeColor, 'right');
      this.drawNoseItem(ctx, 75, 16.5, cfg.noseShape, 'east');
      this.drawMouthItem(ctx, 55, 42, cfg.mouthShape, 'east');
    }

    ctx.restore();
  }

  drawNoseItem(ctx, x, y, noseShape, dir = 'south') {
    ctx.save();
    ctx.translate(x, y);

    const noseDef = SVG_NOSES.find(n => n.id === noseShape) || SVG_NOSES[0];
    ctx.fillStyle = noseDef.color || '#FF7E36';
    ctx.strokeStyle = '#D96522';
    ctx.lineWidth = 1.2;

    if (noseDef.type === 'circle') {
      ctx.beginPath();
      ctx.arc(0, 0, noseDef.r || 7, 0, Math.PI * 2);
      ctx.fill();
    } else if (noseDef.type === 'ellipse') {
      ctx.beginPath();
      ctx.ellipse(0, 0, noseDef.rx || 9, noseDef.ry || 5.5, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (noseDef.type === 'rect') {
      ctx.beginPath();
      ctx.roundRect(-8.5, -4, 17, 8, 2);
      ctx.fill();
    } else {
      // Triângulo clássico ACNH de Face Components.svg
      const path = this.getPath2D(noseDef.d);
      ctx.save();
      ctx.translate(-noseDef.cx, -noseDef.cy);
      ctx.fill(path);
      ctx.restore();
    }

    ctx.restore();
  }

  drawMouthItem(ctx, x, y, mouthShape, dir = 'south') {
    ctx.save();
    ctx.translate(x, y);

    const mouthDef = SVG_MOUTHS.find(m => m.id === mouthShape) || SVG_MOUTHS[0];

    if (dir === 'east') {
      ctx.strokeStyle = '#8C501D';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-5, 0);
      ctx.lineTo(8, 0);
      ctx.stroke();
      ctx.restore();
      return;
    }

    if (mouthDef.type === 'fill') {
      ctx.fillStyle = mouthDef.color || '#8C501D';
      ctx.beginPath();
      ctx.ellipse(0, 0, mouthDef.rx || 6.5, mouthDef.ry || 7.5, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.save();
      ctx.translate(-mouthDef.cx, -mouthDef.cy);

      if (mouthDef.type === 'fill_stroke') {
        const path = this.getPath2D(mouthDef.d);
        ctx.fillStyle = mouthDef.fillColor || '#FFFFFF';
        ctx.strokeStyle = mouthDef.strokeColor || '#8C501D';
        ctx.lineWidth = mouthDef.strokeWidth || 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.fill(path);
        ctx.stroke(path);
      } else if (mouthDef.type === 'tooth') {
        const path = this.getPath2D(mouthDef.d);
        ctx.strokeStyle = mouthDef.color || '#8C501D';
        ctx.lineWidth = mouthDef.strokeWidth || 3;
        ctx.lineCap = 'round';
        ctx.stroke(path);

        const toothPath = this.getPath2D(mouthDef.toothD);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill(toothPath);
        ctx.stroke(toothPath);
      } else {
        const path = this.getPath2D(mouthDef.d);
        ctx.strokeStyle = mouthDef.color || '#8C501D';
        ctx.lineWidth = mouthDef.strokeWidth || 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke(path);
      }
      ctx.restore();
    }

    ctx.restore();
  }

  drawEyeItem(ctx, x, y, eyeShape, irisColor, side = 'right') {
    ctx.save();
    ctx.translate(x, y);

    const isLeft = side === 'left';
    if (isLeft) {
      ctx.scale(-1, 1);
    }

    const eyeDef = SVG_EYES.find(e => e.id === eyeShape) || SVG_EYES[0];

    if (eyeDef.type === 'cheerful_crescent') {
      // Arco fechado sorrindo
      ctx.strokeStyle = '#8C501D';
      ctx.lineWidth = 4.0;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(0, 0, 16, Math.PI * 1.12, Math.PI * 1.88);
      ctx.stroke();
    } else if (eyeDef.type === 'round_button') {
      // Botão redondo
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = irisColor || '#8C501D';
      ctx.beginPath();
      ctx.arc(2, 0, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(2, 0, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(-3, -5, 4.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Olho Oficial de samples.svg (ellipse rx=14.5 ry=19.5 com sparkles)
      ctx.fillStyle = irisColor || '#8C501D';
      ctx.beginPath();
      ctx.ellipse(0, 0, 14.5, 19.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pupila escura
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.ellipse(1.5, 1.0, 9.0, 13.0, 0, 0, Math.PI * 2);
      ctx.fill();

      // Brilho Grande Superior (samples.svg: circle r=5.5)
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(-4, -8, 5.5, 0, Math.PI * 2);
      ctx.fill();

      // Brilho Pequeno Inferior (samples.svg: ellipse rx=2.5 ry=3)
      ctx.beginPath();
      ctx.ellipse(6, 7.5, 2.5, 3.0, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cílios superiores delicados (samples.svg)
      ctx.strokeStyle = '#8C501D';
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-15.5, -16.5);
      ctx.quadraticCurveTo(-7, -21.5, 5.5, -21.5);
      ctx.stroke();

      if (eyeDef.type === 'cat_lashes' || eyeDef.type === 'almond_lash') {
        ctx.beginPath();
        ctx.moveTo(10, -18);
        ctx.lineTo(16, -24);
        ctx.moveTo(6, -20);
        ctx.lineTo(11, -27);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  drawCheekItem(ctx, x, y, cheekShape, side = 'right') {
    if (cheekShape === 'none') return;

    ctx.save();
    ctx.translate(x, y);

    const cheekDef = SVG_CHEEKS.find(c => c.id === cheekShape) || SVG_CHEEKS[0];

    if (cheekDef.type === 'freckles') {
      ctx.fillStyle = cheekDef.color || '#8C501D';
      [-8, 0, 8].forEach((fx, i) => {
        ctx.beginPath();
        ctx.arc(fx, (i % 2) * 5, 2.2, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (cheekDef.type === 'whiskers') {
      ctx.strokeStyle = cheekDef.color || '#8C501D';
      ctx.lineWidth = 2.5;
      const s = side === 'left' ? -1 : 1;
      ctx.beginPath();
      ctx.moveTo(0, -4);
      ctx.lineTo(s * 20, -8);
      ctx.moveTo(0, 6);
      ctx.lineTo(s * 20, 10);
      ctx.stroke();
    } else {
      // Blush Oficial de samples.svg (rx=12.5 ry=10.5)
      ctx.fillStyle = cheekDef.color || 'rgba(255, 186, 165, 0.75)';
      ctx.beginPath();
      ctx.ellipse(0, 0, cheekDef.rx || 12.5, cheekDef.ry || 10.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  drawHairFront(ctx, cfg, dir) {
    const hairDef = SVG_HAIRS.find(h => h.id === cfg.hairStyle) || SVG_HAIRS[0];
    const color = cfg.hairColor || '#3d2314';
    const shadow = cfg.hairShadow || '#241208';

    ctx.save();

    ctx.fillStyle = color;
    ctx.strokeStyle = shadow;
    ctx.lineWidth = 2.2;
    ctx.lineJoin = 'round';

    // Alinhamento perfeito com o topo da cabeça em samples.svg: cx alinhado com 0, topY alinhado com -83.5
    ctx.translate(-hairDef.cx, -hairDef.topY - 83.5);

    if (Array.isArray(hairDef.frontPaths)) {
      for (const d of hairDef.frontPaths) {
        const path = this.getPath2D(d);
        ctx.fill(path);
        ctx.stroke(path);
      }
    }

    ctx.restore();
  }

  drawHairBack(ctx, x, y, cfg, dir) {
    const color = cfg.hairColor || '#3d2314';
    const shadow = cfg.hairShadow || '#241208';

    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color;
    ctx.strokeStyle = shadow;
    ctx.lineWidth = 2.2;

    if (cfg.hairStyle === 'hair_long_straight') {
      ctx.beginPath();
      ctx.roundRect(-80, -20, 160, 180, 18);
      ctx.fill();
      ctx.stroke();
    } else if (cfg.hairStyle === 'hair_twin_buns') {
      [-78, 78].forEach(bx => {
        ctx.beginPath();
        ctx.arc(bx, -55, 26, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    }

    ctx.restore();
  }

  /* ========================================================================= */
  /*  CORPO INTEIRO & BRAÇOS NA FRENTE DO TRONCO (samples.svg)                 */
  /* ========================================================================= */

  drawTorso(ctx, x, y, rot, cfg, dir) {
    const primary = cfg.topColorPrimary || '#19c8b9';
    const secondary = cfg.topColorSecondary || '#ffffff';
    const bottomColor = cfg.bottomColor || '#2563eb';

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);

    // 1. Camisa / Tronco Oficial de samples.svg
    ctx.fillStyle = primary;
    ctx.strokeStyle = '#0f8e83';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(-55, -2);
    ctx.lineTo(55, -2);
    ctx.lineTo(44, 60);
    ctx.lineTo(-44, 60);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Listras decorativas
    if (cfg.topStyle === 'shirt_striped_teal' && dir !== 'north') {
      ctx.fillStyle = secondary;
      [12, 28, 44].forEach(sy => {
        ctx.fillRect(-45, sy, 90, 7);
      });
    }

    // 2. Shorts / Calça (Pelve)
    ctx.fillStyle = bottomColor;
    ctx.strokeStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.moveTo(-45, 60);
    ctx.lineTo(45, 60);
    ctx.lineTo(40, 85);
    ctx.lineTo(-40, 85);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  drawArms(ctx, x, y, pose, cfg, dir) {
    const skin = cfg.skinTone || '#ffd0a8';
    const skinShadow = cfg.skinShadow || '#e0ae82';
    const primary = cfg.topColorPrimary || '#19c8b9';

    ctx.save();
    ctx.translate(x, y);

    // Braço Esquerdo (Ombro x=-55)
    ctx.save();
    ctx.translate(-55, 0);
    ctx.rotate(pose.arm_l.rot);

    // Manga
    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.arc(0, 8, 16, 0, Math.PI * 2);
    ctx.fill();

    // Braço & Mãozinha Esférica
    ctx.fillStyle = skin;
    ctx.strokeStyle = skinShadow;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.rect(-10, 10, 20, 32);
    ctx.arc(0, 42, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Braço Direito (Ombro x=+55)
    ctx.save();
    ctx.translate(55, 0);
    ctx.rotate(pose.arm_r.rot);

    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.arc(0, 8, 16, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = skin;
    ctx.strokeStyle = skinShadow;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.rect(-10, 10, 20, 32);
    ctx.arc(0, 42, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  drawLegs(ctx, x, y, pose, cfg, dir) {
    const skin = cfg.skinTone || '#ffd0a8';
    const shoeColor = cfg.shoesColor || '#ea580c';
    const shoeTrim = cfg.shoesTrim || '#ffffff';

    ctx.save();
    ctx.translate(x, y);

    // Perna Esquerda
    ctx.save();
    ctx.translate(-22, 0);
    ctx.rotate(pose.hip_l.rot + pose.leg_l.rot);

    ctx.fillStyle = skin;
    ctx.fillRect(-10, 0, 20, 35);

    // Sapato 3D
    ctx.fillStyle = shoeColor;
    ctx.strokeStyle = '#9a3412';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.roundRect(-14, 30, 28, 22, 8);
    ctx.fill();
    ctx.stroke();

    // Sola Branca
    ctx.fillStyle = shoeTrim;
    ctx.fillRect(-14, 46, 28, 6);
    ctx.restore();

    // Perna Direita
    ctx.save();
    ctx.translate(22, 0);
    ctx.rotate(pose.hip_r.rot + pose.leg_r.rot);

    ctx.fillStyle = skin;
    ctx.fillRect(-10, 0, 20, 35);

    ctx.fillStyle = shoeColor;
    ctx.strokeStyle = '#9a3412';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.roundRect(-14, 30, 28, 22, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = shoeTrim;
    ctx.fillRect(-14, 46, 28, 6);
    ctx.restore();

    ctx.restore();
  }

  drawGlasses(ctx, cfg, dir) {
    if (dir === 'north') return;

    ctx.save();
    ctx.strokeStyle = cfg.glassesColor || '#5c3c26';
    ctx.lineWidth = 3.5;

    if (cfg.glassesStyle === 'sunglasses_cool') {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      [-38, 40].forEach(gx => {
        ctx.beginPath();
        ctx.roundRect(gx - 20, -14, 40, 34, 8);
        ctx.fill();
        ctx.stroke();
      });
      ctx.beginPath();
      ctx.moveTo(-18, 0);
      ctx.lineTo(20, 0);
      ctx.stroke();
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      [-38, 40].forEach(gx => {
        ctx.beginPath();
        ctx.arc(gx, 4, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
      ctx.beginPath();
      ctx.moveTo(-16, 4);
      ctx.lineTo(18, 4);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawHat(ctx, cfg, dir) {
    ctx.save();

    if (cfg.hatStyle === 'straw_hat') {
      ctx.fillStyle = '#fde68a';
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 3.0;

      // Aba larga
      ctx.beginPath();
      ctx.ellipse(0, -65, 110, 32, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Copa
      ctx.beginPath();
      ctx.arc(0, -90, 52, Math.PI * 1.0, Math.PI * 2.0);
      ctx.fill();
      ctx.stroke();

      // Fita vermelha
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 9.0;
      ctx.beginPath();
      ctx.arc(0, -72, 51, Math.PI * 1.05, Math.PI * 1.95);
      ctx.stroke();

    } else if (cfg.hatStyle === 'witch_hat') {
      ctx.fillStyle = '#4c1d95';
      ctx.strokeStyle = '#2e1065';
      ctx.lineWidth = 3.0;

      ctx.beginPath();
      ctx.ellipse(0, -70, 105, 30, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-55, -75);
      ctx.quadraticCurveTo(0, -150, 35, -180);
      ctx.quadraticCurveTo(45, -130, 55, -75);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

    } else if (cfg.hatStyle === 'cat_ears_band') {
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 4.0;
      ctx.beginPath();
      ctx.arc(0, -60, 72, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();

      [-48, 48].forEach(ox => {
        ctx.fillStyle = cfg.hairColor || '#3d2314';
        ctx.beginPath();
        ctx.moveTo(ox - 22, -70);
        ctx.lineTo(ox, -125);
        ctx.lineTo(ox + 22, -70);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.moveTo(ox - 12, -75);
        ctx.lineTo(ox, -110);
        ctx.lineTo(ox + 12, -75);
        ctx.closePath();
        ctx.fill();
      });
    }

    ctx.restore();
  }

  getAvatarThumbnail(config, size = 64) {
    const offCanvas = document.createElement('canvas');
    offCanvas.width = size;
    offCanvas.height = size;
    const offCtx = offCanvas.getContext('2d');
    const scale = size / 280;
    this.render(offCtx, 0, 0, 'south', 'idle', 0, config || DEFAULT_AVATAR_CONFIG, scale);
    return offCanvas.toDataURL('image/png');
  }
}
