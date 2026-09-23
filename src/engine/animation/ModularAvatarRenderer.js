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
  SVG_HAIRS,
  SVG_BASE_CHARACTER,
  SVG_TOPS
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
      this.renderNorth(ctx, pose, config, centerX, headCenterY, state);
    } else if (effectiveDir === 'east') {
      this.renderEast(ctx, pose, config, centerX, headCenterY, state);
    } else {
      this.renderSouth(ctx, pose, config, centerX, headCenterY, state);
    }


    ctx.restore();
  }

  /* ========================================================================= */
  /*  RENDERIZAÇÃO: VISTA FRONTAL (SOUTH)                                      */
  /* ========================================================================= */
  renderSouth(ctx, pose, cfg, cx, cy, state) {
    const skin = cfg.skinTone || '#ffd0a8';
    const skinShadow = cfg.skinShadow || '#e0ae82';

    const headX = cx + (pose.head.x * 2.5);
    const headY = cy + (pose.head.y * 2.5) + (pose.head.bobY * 2.5);
    const torsoY = headY + 82;

    // 1. Cabelo Traseiro / Longo (atrás de tudo)
    this.drawHairBack(ctx, headX, headY, cfg, 'south');

    // 2. Pernas e Pés
    this.drawLegs(ctx, cx, torsoY + 75, pose, cfg, 'south');

    // 3. Tronco e Roupas
    this.drawTorso(ctx, cx, torsoY, pose.root.rot, cfg, 'south');

    // 4. Se NÃO estiver comemorando (celebrate), desenha os braços na frente do tronco e atrás da cabeça
    const isCelebrating = state === 'celebrate';
    if (!isCelebrating) {
      this.drawArms(ctx, cx, torsoY + 22, pose, cfg, 'south');
    }

    // 5. Cabeça e Rosto
    ctx.save();
    ctx.translate(headX, headY);
    ctx.rotate(pose.head.rot);

    this.drawHeadBase(ctx, skin, skinShadow, 'south');
    this.drawFaceFeatures(ctx, cfg, 'south');
    this.drawHairFront(ctx, cfg, 'south');

    if (cfg.glassesStyle && cfg.glassesStyle !== 'none') {
      this.drawGlasses(ctx, cfg, 'south');
    }

    ctx.restore();

    // 6. Se estiver comemorando, desenha os braços e mãos na frente de TUDO (acima da cabeça e do cabelo)
    if (isCelebrating) {
      this.drawArms(ctx, cx, torsoY + 22, pose, cfg, 'south');
    }
  }

  /* ========================================================================= */
  /*  RENDERIZAÇÃO: VISTA TRASEIRA (NORTH)                                     */
  /* ========================================================================= */
  renderNorth(ctx, pose, cfg, cx, cy, state) {
    const skin = cfg.skinTone || '#ffd0a8';
    const skinShadow = cfg.skinShadow || '#e0ae82';

    const headX = cx + (pose.head.x * 2.5);
    const headY = cy + (pose.head.y * 2.5) + (pose.head.bobY * 2.5);
    const torsoY = headY + 82;

    // 1. Braços de Costas: ficam ATRÁS do tronco quando em idle/walk, ou erguidos se celebrate
    const isCelebrating = state === 'celebrate';
    if (!isCelebrating) {
      this.drawArms(ctx, cx, torsoY + 22, pose, cfg, 'north');
    }

    // 2. Pernas e Pés
    this.drawLegs(ctx, cx, torsoY + 75, pose, cfg, 'north');

    // 3. Tronco e Roupas (de costas cobre a base dos braços)
    this.drawTorso(ctx, cx, torsoY, pose.root.rot, cfg, 'north');

    // 4. Cabeça e Cabelo Traseiro
    ctx.save();
    ctx.translate(headX, headY);
    ctx.rotate(pose.head.rot);

    this.drawHeadBase(ctx, skin, skinShadow, 'north');
    this.drawHairBackSolid(ctx, 0, 0, cfg, 'north');

    ctx.restore();

    // 5. Se estiver comemorando de costas, os braços erguidos sobem
    if (isCelebrating) {
      this.drawArms(ctx, cx, torsoY + 22, pose, cfg, 'north');
    }
  }

  /* ========================================================================= */
  /*  RENDERIZAÇÃO: VISTA LATERAL (EAST / PERFIL)                              */
  /* ========================================================================= */
  renderEast(ctx, pose, cfg, cx, cy, state) {
    const skin = cfg.skinTone || '#ffd0a8';
    const skinShadow = cfg.skinShadow || '#e0ae82';

    const headX = cx + (pose.head.x * 2.5);
    const headY = cy + (pose.head.y * 2.5) + (pose.head.bobY * 2.5);
    const torsoY = headY + 82;
    const isCelebrating = state === 'celebrate';

    // 1. Cabelo Traseiro
    this.drawHairBack(ctx, headX, headY, cfg, 'south');

    // 2. Pernas e Pés
    this.drawLegs(ctx, cx, torsoY + 75, pose, cfg, 'east');

    // 3. Tronco e Roupas
    this.drawTorso(ctx, cx, torsoY, pose.root.rot, cfg, 'south');

    // 4. Se NÃO estiver comemorando, desenha os braços na frente do tronco
    if (!isCelebrating) {
      this.drawArms(ctx, cx, torsoY + 22, pose, cfg, 'south');
    }

    // 5. Cabeça e Feições
    ctx.save();
    ctx.translate(headX, headY);
    ctx.rotate(pose.head.rot);

    this.drawHeadBase(ctx, skin, skinShadow, 'south');
    this.drawFaceFeatures(ctx, cfg, 'south');
    this.drawHairFront(ctx, cfg, 'south');

    if (cfg.glassesStyle && cfg.glassesStyle !== 'none') {
      this.drawGlasses(ctx, cfg, 'south');
    }

    ctx.restore();

    // 6. Se estiver comemorando, braços na frente de tudo
    if (isCelebrating) {
      this.drawArms(ctx, cx, torsoY + 22, pose, cfg, 'south');
    }
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
      // 1. Pescoço (_07_Pescoco de Base_char_flat.svg)
      ctx.beginPath();
      ctx.roundRect(-24, 70, 48, 36, [0, 0, 8, 8]);
      ctx.fill();
      ctx.stroke();

      // 2. Orelha Esquerda (_01_Orelha_Esquerda de Base_char_flat.svg)
      const earLeftD = 'M -80.5 3 C -103.5 1.84 -111.55 12.19 -111.55 21.39 C -111.55 32.89 -100.05 40.94 -80.5 39.79 Z';
      const earLeftPath = this.getPath2D(earLeftD);
      ctx.fill(earLeftPath);
      ctx.stroke(earLeftPath);

      // 3. Orelha Direita (_02_Orelha_Direita de Base_char_flat.svg)
      const earRightD = 'M 80.5 3 C 103.5 1.84 111.55 12.19 111.55 21.39 C 111.55 32.89 100.05 40.94 80.5 39.79 Z';
      const earRightPath = this.getPath2D(earRightD);
      ctx.fill(earRightPath);
      ctx.stroke(earRightPath);

      // 4. Cabeça Base (_14_Cabeca de Base_char_flat.svg)
      const headD = 'M 0 -80.5 C 52.9 -80.5 89.7 -46 89.7 0 C 89.7 36.8 71.3 73.6 39.1 86.25 C 23 92 -23 92 -39.1 86.25 C -71.3 73.6 -89.7 36.8 -89.7 0 C -89.7 -46 -52.9 -80.5 0 -80.5 Z';
      const headPath = this.getPath2D(headD);
      ctx.fill(headPath);
      ctx.stroke(headPath);

    } else {
      // Perfil da cabeça (east / west)
      ctx.beginPath();
      ctx.roundRect(-16, 70, 36, 36, [0, 0, 8, 8]);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-60, -75);
      ctx.bezierCurveTo(40, -85, 85, -30, 85, 15);
      ctx.bezierCurveTo(85, 55, 20, 85, -20, 85);
      ctx.bezierCurveTo(-70, 85, -85, 40, -85, -10);
      ctx.bezierCurveTo(-85, -50, -70, -70, -60, -75);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Orelha lateral de perfil
      const earProfileD = 'M -20 5 C -43 3.84 -51 14.19 -51 23.39 C -51 34.89 -39.5 42.94 -20 41.79 Z';
      const earProfilePath = this.getPath2D(earProfileD);
      ctx.fill(earProfilePath);
      ctx.stroke(earProfilePath);
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
      this.drawCheekItem(ctx, 35, 34, cfg.cheeksShape, 'right');
      this.drawEyeItem(ctx, 32, 4, cfg.eyeShape, cfg.eyeColor, 'right');
      this.drawNoseItem(ctx, 70, 16.5, cfg.noseShape, 'east');
      this.drawMouthItem(ctx, 50, 42, cfg.mouthShape, 'east');
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
      // 1. Arco Sorridente (Face Components.svg: d="M406.71 342.634... stroke-width=4")
      ctx.strokeStyle = '#8C501D';
      ctx.lineWidth = 4.0;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(0, 0, 16, Math.PI * 1.12, Math.PI * 1.88);
      ctx.stroke();

    } else if (eyeDef.type === 'round_button') {
      // 2. Botão Redondo ACNH (Face Components.svg: circle r=19.5, circle r=15)
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#8C501D';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

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

    } else if (eyeDef.type === 'sharp_determined') {
      // 3. Determinado / Focado (Face Components.svg: arco superior reto e forte com pupila inferior)
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#8C501D';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(-16, -8);
      ctx.lineTo(16, -2);
      ctx.bezierCurveTo(14, 16, -10, 18, -16, -8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = irisColor || '#8C501D';
      ctx.beginPath();
      ctx.ellipse(1, 2, 10, 13, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.ellipse(1.5, 3, 6, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(-3, -2, 4.0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#8C501D';
      ctx.lineWidth = 4.0;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-18, -10);
      ctx.lineTo(18, -4);
      ctx.stroke();

    } else if (eyeDef.type === 'sleepy_calm') {
      // 4. Calmo / Sonhador (Face Components.svg: pálpebra superior semi-fechada)
      ctx.fillStyle = irisColor || '#8C501D';
      ctx.beginPath();
      ctx.ellipse(0, 4, 14, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.ellipse(0, 5, 8, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(-4, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Pálpebra calma em arco suave
      ctx.strokeStyle = '#8C501D';
      ctx.lineWidth = 4.0;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-16, -2);
      ctx.quadraticCurveTo(0, -8, 16, 2);
      ctx.stroke();

    } else if (eyeDef.type === 'gentle_oval') {
      // 5. Oval Acolhedor (Face Components.svg: ellipse cx=260.5 rx=15 ry=17)
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#8C501D';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.ellipse(0, 0, 15, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = irisColor || '#8C501D';
      ctx.beginPath();
      ctx.ellipse(2, 0, 11, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.ellipse(2, 0, 7, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(-2, -5, 4.0, 0, Math.PI * 2);
      ctx.fill();

    } else {
      // 6. Anime Sparkle / Almond Lash / Cat Lashes (Face Components.svg: ellipse rx=14.5 ry=19.5 com sparkles)
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
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-15.5, -16.5);
      ctx.quadraticCurveTo(-7, -21.5, 5.5, -21.5);
      ctx.stroke();

      if (eyeDef.type === 'cat_lashes' || eyeDef.type === 'almond_lash') {
        ctx.beginPath();
        ctx.moveTo(8, -18);
        ctx.lineTo(15, -24);
        ctx.moveTo(5, -20);
        ctx.lineTo(10, -27);
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

  drawHairFront(ctx, cfg, dir = 'south') {
    if (dir === 'north') return;

    const hairDef = SVG_HAIRS.find(h => h.id === cfg.hairStyle) || SVG_HAIRS[0];
    const color = cfg.hairColor || '#3d2314';
    const shadow = cfg.hairShadow || '#241208';

    ctx.save();

    ctx.fillStyle = color;
    ctx.strokeStyle = shadow;
    ctx.lineWidth = 2.2;
    ctx.lineJoin = 'round';

    if (dir === 'east') {
      // PERFIL LATERAL: Preenche o topo e a nuca do crânio com a cor do cabelo (evitando que fique careca)
      ctx.beginPath();
      ctx.moveTo(-75, -5);
      ctx.bezierCurveTo(-75, -50, -45, -88, 0, -88);
      ctx.bezierCurveTo(45, -88, 70, -60, 75, -5);
      ctx.lineTo(60, -5);
      ctx.bezierCurveTo(55, -50, 30, -75, 0, -75);
      ctx.bezierCurveTo(-30, -75, -55, -45, -60, -5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Franja recortada projetada para a frente de perfil
      ctx.translate(-hairDef.cx + 25, -hairDef.topY - 83.5);
      if (Array.isArray(hairDef.frontPaths)) {
        for (const d of hairDef.frontPaths) {
          const path = this.getPath2D(d);
          ctx.fill(path);
          ctx.stroke(path);
        }
      }
    } else {
      // VISTA FRONTAL (SOUTH)
      // Máscara no canvas para que a franja frontal não sobreponha indevidamente o corpo/roupa abaixo do queixo
      ctx.save();
      ctx.beginPath();
      ctx.rect(-140, -140, 280, 218); // Limite vertical no queixo (y <= 78)
      ctx.clip();

      // Preenchimento de base do crânio superior
      ctx.beginPath();
      ctx.arc(0, -25, 68, Math.PI * 1.0, Math.PI * 2.0);
      ctx.fill();

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

    ctx.restore();
  }

  drawHairBack(ctx, x, y, cfg, dir) {
    const hairDef = SVG_HAIRS.find(h => h.id === cfg.hairStyle) || SVG_HAIRS[0];
    const color = cfg.hairColor || '#3d2314';
    const shadow = cfg.hairShadow || '#241208';

    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color;
    ctx.strokeStyle = shadow;
    ctx.lineWidth = 2.2;
    ctx.lineJoin = 'round';

    if (dir === 'east') {
      // Cabelo de Trás visto de perfil
      if (cfg.hairStyle === 'hair_long_straight') {
        ctx.beginPath();
        ctx.roundRect(-75, -20, 85, 180, 16);
        ctx.fill();
        ctx.stroke();
      } else if (cfg.hairStyle === 'hair_twin_buns') {
        ctx.beginPath();
        ctx.arc(-45, -55, 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (cfg.hairStyle === 'hair_high_ponytail') {
        ctx.beginPath();
        ctx.moveTo(-40, -60);
        ctx.quadraticCurveTo(-95, -40, -90, 35);
        ctx.quadraticCurveTo(-70, 50, -55, 15);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (cfg.hairStyle === 'hair_twin_braids') {
        ctx.beginPath();
        ctx.roundRect(-60, 0, 30, 120, 12);
        ctx.fill();
        ctx.stroke();
      }
    } else {
      if (Array.isArray(hairDef.backPaths)) {
        for (const bp of hairDef.backPaths) {
          ctx.save();
          ctx.translate(-bp.cx, -bp.topY - 83.5);
          const path = this.getPath2D(bp.d);
          ctx.fill(path);
          ctx.stroke(path);
          ctx.restore();
        }
      } else {
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
        } else if (cfg.hairStyle === 'hair_twin_braids') {
          [-65, 65].forEach(bx => {
            ctx.beginPath();
            ctx.roundRect(bx - 15, 10, 30, 130, 12);
            ctx.fill();
            ctx.stroke();
          });
        }
      }
    }

    ctx.restore();
  }

  drawHairBackSolid(ctx, x, y, cfg, dir = 'north') {
    const hairDef = SVG_HAIRS.find(h => h.id === cfg.hairStyle) || SVG_HAIRS[0];
    const color = cfg.hairColor || '#3d2314';
    const shadow = cfg.hairShadow || '#241208';

    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color;
    ctx.strokeStyle = shadow;
    ctx.lineWidth = 2.2;
    ctx.lineJoin = 'round';

    // Base preenchida do crânio
    ctx.beginPath();
    ctx.arc(0, -25, 68, Math.PI * 1.0, Math.PI * 2.0);
    ctx.fill();

    if (Array.isArray(hairDef.backPaths)) {
      for (const bp of hairDef.backPaths) {
        ctx.save();
        ctx.translate(-bp.cx, -bp.topY - 83.5);
        const path = this.getPath2D(bp.d);
        ctx.fill(path);
        ctx.stroke(path);
        ctx.restore();
      }
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, 72, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  /* ========================================================================= */
  /*  CORPO INTEIRO & TOPS OFICIAIS (/assets/Tops)                             */
  /* ========================================================================= */

  drawTorso(ctx, x, y, rot, cfg, dir) {
    const skin = cfg.skinTone || '#ffd0a8';
    const skinShadow = cfg.skinShadow || '#e0ae82';
    const primary = cfg.topColorPrimary || '#19c8b9';
    const secondary = cfg.topColorSecondary || '#ffffff';
    const bottomColor = cfg.bottomColor || '#2563eb';
    const topStyle = cfg.topStyle || 'top_tee';
    const bottomStyle = cfg.bottomStyle || 'shorts_denim';

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);

    // 1. BASE DO TRONCO DE PELE (_08_Tronco_Corpo de Base_char_flat.svg)
    ctx.fillStyle = skin;
    ctx.strokeStyle = skinShadow;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';

    const torsoBaseD = 'M -23 -64.4 C -11.5 -66.7 11.5 -66.7 23 -64.4 C 36.8 -57.5 46 -29.9 47.15 2.3 C 49.45 29.9 41.4 56.35 20.7 63.25 C 9.2 66.7 -9.2 66.7 -20.7 63.25 C -41.4 56.35 -49.45 29.9 -47.15 2.3 C -46 -29.9 -36.8 -57.5 -23 -64.4 Z';
    const torsoBasePath = this.getPath2D(torsoBaseD);
    ctx.fill(torsoBasePath);
    ctx.stroke(torsoBasePath);

    // 2. ROUPA SUPERIOR / TOPS OFICIAIS (assets/Tops)
    ctx.fillStyle = primary;
    ctx.strokeStyle = '#0f8e83';
    ctx.lineWidth = 2.5;

    if (topStyle === 'top_crop_top') {
      // Top Cropped (Crop Top.svg): Corte alto, detalhes e acabamento
      ctx.beginPath();
      ctx.moveTo(-48, -25);
      ctx.lineTo(48, -25);
      ctx.lineTo(44, 22);
      ctx.lineTo(-44, 22);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Bainha de destaque inferior
      ctx.fillStyle = secondary;
      ctx.fillRect(-44, 18, 88, 5);

      // Decote sutil
      if (dir !== 'north') {
        ctx.fillStyle = secondary;
        ctx.beginPath();
        ctx.ellipse(0, -24, 18, 7, 0, 0, Math.PI);
        ctx.fill();
      }

    } else if (topStyle === 'top_cupcake_dress') {
      // Vestido Cupcake (Cupcake Dress.svg): Tronco ajustado + Saia rodada ampla com babados
      ctx.beginPath();
      ctx.moveTo(-48, -25);
      ctx.lineTo(48, -25);
      ctx.lineTo(42, 28);
      ctx.lineTo(-42, 28);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Saia rodada ampla
      ctx.fillStyle = primary;
      ctx.beginPath();
      ctx.moveTo(-44, 28);
      ctx.lineTo(44, 28);
      ctx.lineTo(68, 82);
      ctx.lineTo(-68, 82);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Babados em ondas da saia
      ctx.fillStyle = secondary;
      ctx.beginPath();
      ctx.roundRect(-70, 76, 140, 8, 4);
      ctx.fill();

      // Detalhes frontais do vestido
      if (dir !== 'north') {
        ctx.fillStyle = secondary;
        ctx.beginPath();
        ctx.ellipse(0, -24, 20, 8, 0, 0, Math.PI);
        ctx.fill();

        ctx.strokeStyle = secondary;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -16);
        ctx.lineTo(0, 24);
        ctx.stroke();
      }

    } else if (topStyle === 'top_sweater') {
      // Suéter de Lã (Sweater.svg): Modelagem aconchegante, barra canelada e gola alta
      ctx.beginPath();
      ctx.moveTo(-52, -26);
      ctx.lineTo(52, -26);
      ctx.lineTo(46, 52);
      ctx.lineTo(-46, 52);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Barra canelada inferior
      ctx.fillStyle = secondary;
      ctx.fillRect(-46, 44, 92, 8);

      // Gola estruturada do suéter
      if (dir !== 'north') {
        ctx.fillStyle = secondary;
        ctx.beginPath();
        ctx.roundRect(-28, -32, 56, 14, 5);
        ctx.fill();
        ctx.stroke();
      }

    } else if (topStyle === 'top_puffy_sleeve') {
      // Blusa Manga Bufante (Puffy Sleeve.svg): Tronco ajustado com gola canoa e barra scalloped
      ctx.beginPath();
      ctx.moveTo(-50, -25);
      ctx.lineTo(50, -25);
      ctx.lineTo(44, 48);
      ctx.lineTo(-44, 48);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      if (dir !== 'north') {
        ctx.fillStyle = secondary;
        ctx.beginPath();
        ctx.ellipse(0, -24, 24, 8, 0, 0, Math.PI);
        ctx.fill();
        ctx.stroke();
      }

    } else if (topStyle === 'top_sleeveless') {
      // Regata Sem Mangas (Sleeveless.svg): Alças estruturadas e corte anatômico
      ctx.beginPath();
      ctx.moveTo(-45, -25);
      ctx.lineTo(45, -25);
      ctx.lineTo(43, 48);
      ctx.lineTo(-43, 48);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      if (dir !== 'north') {
        ctx.fillStyle = skin;
        ctx.beginPath();
        ctx.ellipse(0, -25, 20, 10, 0, 0, Math.PI);
        ctx.fill();
      }

    } else if (topStyle === 'top_long_sleeve') {
      // Blusa Manga Longa (Long Sleeve.svg): Corpo com barra canelada e gola redonda
      ctx.beginPath();
      ctx.moveTo(-50, -25);
      ctx.lineTo(50, -25);
      ctx.lineTo(44, 50);
      ctx.lineTo(-44, 50);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = secondary;
      ctx.fillRect(-44, 44, 88, 6);

      if (dir !== 'north') {
        ctx.fillStyle = secondary;
        ctx.beginPath();
        ctx.ellipse(0, -24, 22, 8, 0, 0, Math.PI);
        ctx.fill();
      }

    } else {
      // Camiseta Clássica (Tee.svg): Corte clássico de camiseta com gola reforçada
      ctx.beginPath();
      ctx.moveTo(-50, -25);
      ctx.lineTo(50, -25);
      ctx.lineTo(44, 48);
      ctx.lineTo(-44, 48);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      if (dir !== 'north') {
        ctx.fillStyle = secondary;
        ctx.beginPath();
        ctx.ellipse(0, -24, 20, 8, 0, 0, Math.PI);
        ctx.fill();
      }
    }

    // 3. Shorts / Calça / Saia (Pelve)
    if (topStyle !== 'top_cupcake_dress') {
      ctx.fillStyle = bottomColor;
      ctx.strokeStyle = '#1e3a8a';
      ctx.lineWidth = 2.2;

      if (bottomStyle === 'skirt_pleated') {
        // Saia Plissada
        ctx.beginPath();
        ctx.moveTo(-45, 48);
        ctx.lineTo(45, 48);
        ctx.lineTo(58, 80);
        ctx.lineTo(-58, 80);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2.0;
        [-30, -15, 0, 15, 30].forEach(px => {
          ctx.beginPath();
          ctx.moveTo(px * 0.8, 50);
          ctx.lineTo(px * 1.15, 80);
          ctx.stroke();
        });

      } else if (bottomStyle === 'pants_cargo') {
        // Calça Cargo
        ctx.beginPath();
        ctx.moveTo(-44, 48);
        ctx.lineTo(44, 48);
        ctx.lineTo(42, 75);
        ctx.lineTo(-42, 75);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-35, 50, 70, 5);

      } else {
        // Shorts Jeans
        ctx.beginPath();
        ctx.moveTo(-44, 48);
        ctx.lineTo(44, 48);
        ctx.lineTo(40, 70);
        ctx.lineTo(-40, 70);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(-40, 68);
        ctx.lineTo(40, 68);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  drawArms(ctx, x, y, pose, cfg, dir) {
    const skin = cfg.skinTone || '#ffd0a8';
    const skinShadow = cfg.skinShadow || '#e0ae82';
    const primary = cfg.topColorPrimary || '#19c8b9';
    const topStyle = cfg.topStyle || 'top_tee';

    ctx.save();
    ctx.translate(x, y);

    // Braço Esquerdo (Ombro x=-52)
    ctx.save();
    ctx.translate(-52, 0);
    ctx.rotate(pose.arm_l.rot);
    this.renderArmGraphic(ctx, skin, skinShadow, primary, topStyle);
    ctx.restore();

    // Braço Direito (Ombro x=+52)
    ctx.save();
    ctx.translate(52, 0);
    ctx.rotate(pose.arm_r.rot);
    this.renderArmGraphic(ctx, skin, skinShadow, primary, topStyle);
    ctx.restore();

    ctx.restore();
  }

  renderArmGraphic(ctx, skin, skinShadow, clothColor, topStyle) {
    ctx.fillStyle = clothColor;
    ctx.strokeStyle = '#0f8e83';
    ctx.lineWidth = 2.0;

    if (topStyle === 'top_long_sleeve' || topStyle === 'top_sweater') {
      // Manga Longa (Long Sleeve.svg / Sweater.svg): cobre todo o braço até o punho
      ctx.beginPath();
      ctx.roundRect(-12, -4, 24, 42, 8);
      ctx.fill();
      ctx.stroke();

      // Punho decorativo
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-12, 34, 24, 4);

      // Mãozinha de Base_char_flat.svg (_10_Mao_Esquerda / _12_Mao_Direita: r=62*0.23 ≈ 14.3)
      ctx.fillStyle = skin;
      ctx.strokeStyle = skinShadow;
      ctx.beginPath();
      ctx.arc(0, 46, 14.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

    } else if (topStyle === 'top_puffy_sleeve') {
      // Manga Bufante (Puffy Sleeve.svg): Manga esférica volumosa + braço e mão expostos
      ctx.beginPath();
      ctx.arc(0, 8, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Antebraço e mão de Base_char_flat.svg
      ctx.fillStyle = skin;
      ctx.strokeStyle = skinShadow;
      ctx.beginPath();
      ctx.rect(-9, 16, 18, 26);
      ctx.arc(0, 46, 14.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

    } else if (topStyle === 'top_sleeveless' || topStyle === 'top_crop_top') {
      // Sem mangas (Sleeveless.svg / Crop Top.svg): braço inteiro e mão de Base_char_flat.svg
      ctx.fillStyle = skin;
      ctx.strokeStyle = skinShadow;
      ctx.beginPath();
      ctx.rect(-10, -2, 20, 44);
      ctx.arc(0, 46, 14.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

    } else {
      // Manga Curta padrão (Tee.svg / Cupcake Dress.svg)
      ctx.beginPath();
      ctx.arc(0, 6, 17, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = skin;
      ctx.strokeStyle = skinShadow;
      ctx.beginPath();
      ctx.rect(-10, 10, 20, 32);
      ctx.arc(0, 46, 14.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  drawLegs(ctx, x, y, pose, cfg, dir) {
    const skin = cfg.skinTone || '#ffd0a8';
    const bottomColor = cfg.bottomColor || '#2563eb';
    const shoeColor = cfg.shoesColor || '#ea580c';
    const shoeTrim = cfg.shoesTrim || '#ffffff';
    const bottomStyle = cfg.bottomStyle || 'shorts_denim';
    const shoesStyle = cfg.shoesStyle || 'sneakers_classic';

    ctx.save();
    ctx.translate(x, y);

    const liftL = (pose.hip_l && pose.hip_l.y !== undefined) ? (pose.hip_l.y - 6) : 0;
    const liftR = (pose.hip_r && pose.hip_r.y !== undefined) ? (pose.hip_r.y - 6) : 0;

    // Perna Esquerda
    ctx.save();
    ctx.translate(-22, liftL);
    ctx.rotate(pose.hip_l.rot + pose.leg_l.rot);
    this.renderSingleLeg(ctx, skin, bottomColor, shoeColor, shoeTrim, bottomStyle, shoesStyle);
    ctx.restore();

    // Perna Direita
    ctx.save();
    ctx.translate(22, liftR);
    ctx.rotate(pose.hip_r.rot + pose.leg_r.rot);
    this.renderSingleLeg(ctx, skin, bottomColor, shoeColor, shoeTrim, bottomStyle, shoesStyle);
    ctx.restore();

    ctx.restore();
  }

  renderSingleLeg(ctx, skin, bottomColor, shoeColor, shoeTrim, bottomStyle, shoesStyle) {
    // 1. Perna de Base_char_flat.svg (_04_Perna_Esquerda / _06_Perna_Direita)
    if (bottomStyle === 'pants_cargo') {
      // Calça comprida cobrindo a perna
      ctx.fillStyle = bottomColor;
      ctx.strokeStyle = '#1e3a8a';
      ctx.lineWidth = 2.0;
      ctx.fillRect(-12, 0, 24, 38);
      ctx.strokeRect(-12, 0, 24, 38);

      // Bolso cargo lateral
      ctx.fillStyle = '#1d4ed8';
      ctx.fillRect(-13, 14, 6, 14);

    } else if (bottomStyle === 'skirt_pleated') {
      // Saia: perna exposta
      ctx.fillStyle = skin;
      ctx.fillRect(-11, 0, 22, 38);

    } else {
      // Shorts: parte superior coberta por tecido e perna exposta
      ctx.fillStyle = bottomColor;
      ctx.fillRect(-12, 0, 24, 14);
      ctx.fillStyle = skin;
      ctx.fillRect(-11, 14, 22, 24);
    }

    // 2. Calçados e Pés de Base_char_flat.svg (_03_Pe_Esquerdo / _05_Pe_Direito)
    if (shoesStyle === 'boots_hunter') {
      // Bota de trilha resistente
      ctx.fillStyle = shoeColor;
      ctx.strokeStyle = '#9a3412';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.roundRect(-16, 24, 32, 34, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-8, 28, 16, 4);

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-17, 52, 34, 6);

    } else if (shoesStyle === 'sandals_beach') {
      // Sandália aberta de praia
      ctx.fillStyle = skin;
      ctx.fillRect(-11, 28, 22, 20);

      ctx.fillStyle = shoeColor;
      ctx.strokeStyle = '#9a3412';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.roundRect(-16, 48, 32, 8, 4);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3.0;
      ctx.beginPath();
      ctx.moveTo(-13, 48);
      ctx.lineTo(0, 36);
      ctx.lineTo(13, 48);
      ctx.stroke();

    } else {
      // Tênis clássico com formato anatômico arredondado
      ctx.fillStyle = shoeColor;
      ctx.strokeStyle = '#9a3412';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.roundRect(-15, 32, 30, 24, 8);
      ctx.fill();
      ctx.stroke();

      // Sola e biqueira
      ctx.fillStyle = shoeTrim;
      ctx.fillRect(-15, 50, 30, 6);
      ctx.beginPath();
      ctx.arc(0, 35, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawGlasses(ctx, cfg, dir) {
    if (dir === 'north') return;

    ctx.save();
    ctx.strokeStyle = cfg.glassesColor || '#5c3c26';
    ctx.lineWidth = 3.5;

    if (dir === 'east') {
      // PERFIL LATERAL: uma única lente de perfil com haste até a orelha
      if (cfg.glassesStyle === 'sunglasses_cool') {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.beginPath();
        ctx.roundRect(18, -12, 38, 32, 6);
        ctx.fill();
        ctx.stroke();

        // Haste lateral até a orelha
        ctx.beginPath();
        ctx.moveTo(18, 0);
        ctx.lineTo(-20, 4);
        ctx.stroke();
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.beginPath();
        ctx.ellipse(34, 4, 18, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Haste lateral até a orelha
        ctx.beginPath();
        ctx.moveTo(20, 4);
        ctx.lineTo(-20, 4);
        ctx.stroke();
      }

    } else {
      // VISTA FRONTAL (SOUTH)
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
