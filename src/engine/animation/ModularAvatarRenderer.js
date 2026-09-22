/**
 * ModularAvatarRenderer.js - KidsLearnCode
 * Renderizador Vetorial 2D por Cutout / Paper-Doll para Personagens Customizáveis.
 * 
 * Utiliza as proporções oficiais de base_character.png e os componentes vetoriais
 * extraídos de Face Components.svg e Hairs.svg.
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
    this.path2dCache = new Map();
  }

  getPath2D(d) {
    if (!this.path2dCache.has(d)) {
      this.path2dCache.set(d, new Path2D(d));
    }
    return this.path2dCache.get(d);
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
   * @param {number} scale - Escala global do avatar
   */
  render(ctx, x, y, direction = 'south', state = 'idle', time = 0, config = DEFAULT_AVATAR_CONFIG, scale = 1.0) {
    const isWest = direction === 'west';
    const effectiveDir = isWest ? 'east' : direction;
    const pose = this.rig.evaluate(state, direction, time);

    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));

    if (isWest) {
      ctx.translate(32 * scale, 0);
      ctx.scale(-1, 1);
      ctx.translate(-32 * scale, 0);
    }

    if (scale !== 1.0) {
      ctx.scale(scale, scale);
    }

    // Sombra elíptica no chão (exceto se montado)
    if (state !== 'riding') {
      this.drawShadow(ctx, pose.root.x, 60, pose.shadow.scale);
    }

    if (effectiveDir === 'north') {
      this.renderNorth(ctx, pose, config);
    } else if (effectiveDir === 'east') {
      this.renderEast(ctx, pose, config);
    } else {
      this.renderSouth(ctx, pose, config);
    }

    ctx.restore();
  }

  /* ========================================================================= */
  /*  RENDERIZAÇÃO: VISTA FRONTAL (SOUTH)                                      */
  /* ========================================================================= */
  renderSouth(ctx, pose, cfg) {
    const skin = cfg.skinTone || '#ffd0a8';
    const skinShadow = cfg.skinShadow || '#e0ae82';

    // 1. Cabelo Traseiro
    this.drawHairBack(ctx, pose.root.x + pose.head.x, pose.root.y + pose.head.y + pose.head.bobY, cfg, 'south');

    // 2. Braço Esquerdo (Traseiro)
    this.drawArm(ctx, pose.root.x + pose.shoulder_l.x, pose.root.y + pose.shoulder_l.y, pose.arm_l.rot, cfg, 'left', 'south');

    // 3. Pernas e Pés
    this.drawLeg(ctx, pose.root.x + pose.hip_l.x, pose.root.y + pose.hip_l.y, pose.hip_l.rot + pose.leg_l.rot, cfg, 'left', 'south');
    this.drawLeg(ctx, pose.root.x + pose.hip_r.x, pose.root.y + pose.hip_r.y, pose.hip_r.rot + pose.leg_r.rot, cfg, 'right', 'south');

    // 4. Tronco & Roupas
    this.drawTorso(ctx, pose.root.x + pose.torso.x, pose.root.y + pose.torso.y, pose.root.rot, cfg, 'south');

    // 5. Braço Direito (Dianteiro)
    this.drawArm(ctx, pose.root.x + pose.shoulder_r.x, pose.root.y + pose.shoulder_r.y, pose.arm_r.rot, cfg, 'right', 'south');

    // 6. Cabeça, Rosto & Acessórios
    const headX = pose.root.x + pose.head.x;
    const headY = pose.root.y + pose.head.y + pose.head.bobY;

    ctx.save();
    ctx.translate(headX, headY);
    ctx.rotate(pose.head.rot);

    // Formato da Cabeça Chibi (base_character.png)
    this.drawHeadBase(ctx, 0, 0, skin, skinShadow, 'south');

    // Feições faciais (Face Components.svg)
    this.drawFaceFeatures(ctx, 0, 0, cfg, 'south');

    // Cabelo Frontal (Hairs.svg)
    this.drawHairFront(ctx, 0, 0, cfg, 'south');

    // Óculos
    if (cfg.glassesStyle && cfg.glassesStyle !== 'none') {
      this.drawGlasses(ctx, 0, 0, cfg, 'south');
    }

    // Chapéus & Acessórios
    if (cfg.hatStyle && cfg.hatStyle !== 'none') {
      this.drawHat(ctx, 0, 0, cfg, 'south');
    }

    ctx.restore();
  }

  /* ========================================================================= */
  /*  RENDERIZAÇÃO: VISTA TRASEIRA (NORTH)                                     */
  /* ========================================================================= */
  renderNorth(ctx, pose, cfg) {
    const skin = cfg.skinTone || '#ffd0a8';
    const skinShadow = cfg.skinShadow || '#e0ae82';

    this.drawArm(ctx, pose.root.x + pose.shoulder_l.x, pose.root.y + pose.shoulder_l.y, pose.arm_l.rot, cfg, 'left', 'north');
    this.drawArm(ctx, pose.root.x + pose.shoulder_r.x, pose.root.y + pose.shoulder_r.y, pose.arm_r.rot, cfg, 'right', 'north');

    this.drawLeg(ctx, pose.root.x + pose.hip_l.x, pose.root.y + pose.hip_l.y, pose.hip_l.rot + pose.leg_l.rot, cfg, 'left', 'north');
    this.drawLeg(ctx, pose.root.x + pose.hip_r.x, pose.root.y + pose.hip_r.y, pose.hip_r.rot + pose.leg_r.rot, cfg, 'right', 'north');

    this.drawTorso(ctx, pose.root.x + pose.torso.x, pose.root.y + pose.torso.y, pose.root.rot, cfg, 'north');

    const headX = pose.root.x + pose.head.x;
    const headY = pose.root.y + pose.head.y + pose.head.bobY;

    ctx.save();
    ctx.translate(headX, headY);
    ctx.rotate(pose.head.rot);

    this.drawHeadBase(ctx, 0, 0, skin, skinShadow, 'north');
    this.drawHairBack(ctx, 0, 0, cfg, 'north');
    this.drawHairFront(ctx, 0, 0, cfg, 'north');

    if (cfg.hatStyle && cfg.hatStyle !== 'none') {
      this.drawHat(ctx, 0, 0, cfg, 'north');
    }

    ctx.restore();
  }

  /* ========================================================================= */
  /*  RENDERIZAÇÃO: VISTA LATERAL (EAST / PERFIL)                              */
  /* ========================================================================= */
  renderEast(ctx, pose, cfg) {
    const skin = cfg.skinTone || '#ffd0a8';
    const skinShadow = cfg.skinShadow || '#e0ae82';

    this.drawHairBack(ctx, pose.root.x + pose.head.x, pose.root.y + pose.head.y + pose.head.bobY, cfg, 'east');

    this.drawArm(ctx, pose.root.x - 2, pose.root.y + pose.shoulder_l.y, pose.arm_l.rot, cfg, 'left', 'east');
    this.drawLeg(ctx, pose.root.x - 3, pose.root.y + pose.hip_l.y, pose.hip_l.rot + pose.leg_l.rot, cfg, 'left', 'east');
    this.drawTorso(ctx, pose.root.x + pose.torso.x, pose.root.y + pose.torso.y, pose.root.rot, cfg, 'east');
    this.drawLeg(ctx, pose.root.x + 3, pose.root.y + pose.hip_r.y, pose.hip_r.rot + pose.leg_r.rot, cfg, 'right', 'east');
    this.drawArm(ctx, pose.root.x + 2, pose.root.y + pose.shoulder_r.y, pose.arm_r.rot, cfg, 'right', 'east');

    const headX = pose.root.x + pose.head.x;
    const headY = pose.root.y + pose.head.y + pose.head.bobY;

    ctx.save();
    ctx.translate(headX, headY);
    ctx.rotate(pose.head.rot);

    this.drawHeadBase(ctx, 0, 0, skin, skinShadow, 'east');
    this.drawFaceFeatures(ctx, 0, 0, cfg, 'east');
    this.drawHairFront(ctx, 0, 0, cfg, 'east');

    if (cfg.glassesStyle && cfg.glassesStyle !== 'none') {
      this.drawGlasses(ctx, 0, 0, cfg, 'east');
    }

    if (cfg.hatStyle && cfg.hatStyle !== 'none') {
      this.drawHat(ctx, 0, 0, cfg, 'east');
    }

    ctx.restore();
  }

  /* ========================================================================= */
  /*  SUB-RENDERIZADORES VETORIAIS (Face Components.svg & Hairs.svg)          */
  /* ========================================================================= */

  drawShadow(ctx, x, y, scale = 1.0) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.ellipse(x, y, 14 * scale, 5 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawHeadBase(ctx, x, y, skin, skinShadow, dir) {
    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = skin;
    ctx.strokeStyle = skinShadow;
    ctx.lineWidth = 1.2;

    ctx.beginPath();
    if (dir === 'east') {
      ctx.moveTo(-12, -14);
      ctx.bezierCurveTo(8, -16, 15, -6, 15, 3);
      ctx.bezierCurveTo(15, 11, 4, 15, -4, 15);
      ctx.bezierCurveTo(-14, 15, -16, 8, -16, -2);
      ctx.bezierCurveTo(-16, -10, -14, -14, -12, -14);
    } else {
      ctx.ellipse(0, 0, 16.5, 14.5, 0, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.stroke();

    // Orelhas arredondadas
    if (dir === 'south') {
      ctx.beginPath();
      ctx.arc(-16.5, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(16.5, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (dir === 'east') {
      ctx.beginPath();
      ctx.arc(-6, 1, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  drawFaceFeatures(ctx, x, y, cfg, dir) {
    if (dir === 'north') return;

    ctx.save();
    ctx.translate(x, y);

    if (dir === 'south') {
      // 1. Bochechas (Face Components.svg)
      this.drawCheekItem(ctx, -9, 3.5, cfg.cheeksShape, 'left');
      this.drawCheekItem(ctx, 9, 3.5, cfg.cheeksShape, 'right');

      // 2. Olhos (Face Components.svg)
      this.drawEyeItem(ctx, -7.5, -0.5, cfg.eyeShape, cfg.eyeColor, 'left');
      this.drawEyeItem(ctx, 7.5, -0.5, cfg.eyeShape, cfg.eyeColor, 'right');

      // 3. Nariz (Face Components.svg)
      this.drawNoseItem(ctx, 0, 1.8, cfg.noseShape);

      // 4. Boca (Face Components.svg)
      this.drawMouthItem(ctx, 0, 5.5, cfg.mouthShape);

    } else if (dir === 'east') {
      // Perfil
      this.drawCheekItem(ctx, 7.5, 3.5, cfg.cheeksShape, 'right');
      this.drawEyeItem(ctx, 7.5, -0.5, cfg.eyeShape, cfg.eyeColor, 'right');
      this.drawNoseItem(ctx, 14, 1.8, cfg.noseShape, 'east');
      this.drawMouthItem(ctx, 11, 5.5, cfg.mouthShape, 'east');
    }

    ctx.restore();
  }

  drawNoseItem(ctx, x, y, noseShape, dir = 'south') {
    ctx.save();
    ctx.translate(x, y);

    const noseDef = SVG_NOSES.find(n => n.id === noseShape) || SVG_NOSES[0];
    ctx.fillStyle = noseDef.color || '#FF7E36';
    ctx.strokeStyle = '#D96522';
    ctx.lineWidth = 0.8;

    if (noseDef.type === 'circle') {
      ctx.beginPath();
      ctx.arc(0, 0, noseDef.r * 0.45, 0, Math.PI * 2);
      ctx.fill();
    } else if (noseDef.type === 'ellipse') {
      ctx.beginPath();
      ctx.ellipse(0, 0, noseDef.rx * 0.45, noseDef.ry * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (noseDef.type === 'rect') {
      ctx.beginPath();
      ctx.roundRect(-noseDef.w * 0.25, -noseDef.h * 0.25, noseDef.w * 0.5, noseDef.h * 0.5, 1);
      ctx.fill();
    } else {
      // Triângulo clássico ACNH
      ctx.beginPath();
      ctx.moveTo(0, -2.5);
      ctx.lineTo(2.5, 1.5);
      ctx.lineTo(-2.5, 1.5);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  drawMouthItem(ctx, x, y, mouthShape, dir = 'south') {
    ctx.save();
    ctx.translate(x, y);

    const mouthDef = SVG_MOUTHS.find(m => m.id === mouthShape) || SVG_MOUTHS[0];

    if (dir === 'east') {
      // Perfil da boca
      ctx.strokeStyle = '#8C501D';
      ctx.lineWidth = 1.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-1, 0);
      ctx.lineTo(3, 0);
      ctx.stroke();
      ctx.restore();
      return;
    }

    ctx.scale(mouthDef.scale || 0.45, mouthDef.scale || 0.45);

    if (mouthDef.type === 'fill') {
      ctx.fillStyle = mouthDef.color || '#8C501D';
      ctx.beginPath();
      ctx.ellipse(0, 0, mouthDef.rx, mouthDef.ry, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (mouthDef.type === 'fill_stroke') {
      const path = this.getPath2D(mouthDef.d);
      ctx.fillStyle = mouthDef.fillColor || '#FFFFFF';
      ctx.strokeStyle = mouthDef.strokeColor || '#8C501D';
      ctx.lineWidth = mouthDef.strokeWidth || 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.fill(path);
      ctx.stroke(path);
    } else if (mouthDef.type === 'tooth') {
      const path = this.getPath2D(mouthDef.d);
      ctx.strokeStyle = mouthDef.color || '#8C501D';
      ctx.lineWidth = mouthDef.strokeWidth || 2;
      ctx.lineCap = 'round';
      ctx.stroke(path);
      // Dente branco
      const toothPath = this.getPath2D(mouthDef.toothD);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill(toothPath);
      ctx.stroke(toothPath);
    } else {
      // Traço de linha
      const path = this.getPath2D(mouthDef.d);
      ctx.strokeStyle = mouthDef.color || '#8C501D';
      ctx.lineWidth = mouthDef.strokeWidth || 2.2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke(path);
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
      // Arco fechado feliz
      ctx.strokeStyle = '#8C501D';
      ctx.lineWidth = 1.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(0, 0, 3.8, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
    } else if (eyeDef.type === 'round_button') {
      // Botão redondo preto com brilho
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, 0, 4.0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = irisColor || '#8C501D';
      ctx.beginPath();
      ctx.arc(0.4, 0.2, 3.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(0.4, 0.2, 1.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(-0.6, -1.0, 1.0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Brilho anime e formatos expressivos
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(0, 0, 3.8, 4.8, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = irisColor || '#8C501D';
      ctx.beginPath();
      ctx.ellipse(0.6, 0.3, 2.8, 3.8, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.ellipse(0.6, 0.3, 1.6, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Destaques de luz branca (sparkles)
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(-0.5, -1.2, 1.2, 0, Math.PI * 2);
      ctx.arc(1.5, 1.4, 0.6, 0, Math.PI * 2);
      ctx.fill();

      // Cílios superiores
      ctx.strokeStyle = '#8C501D';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(0, -0.6, 3.8, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();

      if (eyeDef.type === 'cat_lashes' || eyeDef.type === 'almond_lash') {
        ctx.beginPath();
        ctx.moveTo(3.2, -1.5);
        ctx.lineTo(4.8, -3.0);
        ctx.moveTo(2.0, -2.8);
        ctx.lineTo(2.8, -4.5);
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
      [-2, 0, 2].forEach((fx, i) => {
        ctx.beginPath();
        ctx.arc(fx, (i % 2) * 1.5, 0.8, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (cheekDef.type === 'whiskers') {
      ctx.strokeStyle = cheekDef.color || '#8C501D';
      ctx.lineWidth = 1.0;
      const s = side === 'left' ? -1 : 1;
      ctx.beginPath();
      ctx.moveTo(0, -1);
      ctx.lineTo(s * 6, -2);
      ctx.moveTo(0, 1.5);
      ctx.lineTo(s * 6, 2.5);
      ctx.stroke();
    } else {
      // Blush oval corado
      ctx.fillStyle = cheekDef.color || 'rgba(255, 186, 165, 0.75)';
      ctx.beginPath();
      ctx.ellipse(0, 0, cheekDef.rx * 0.6, cheekDef.ry * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  drawHairFront(ctx, x, y, cfg, dir) {
    const hairDef = SVG_HAIRS.find(h => h.id === cfg.hairStyle) || SVG_HAIRS[1];
    const color = cfg.hairColor || '#3d2314';
    const shadow = cfg.hairShadow || '#241208';

    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = color;
    ctx.strokeStyle = shadow;
    ctx.lineWidth = 1.4;
    ctx.lineJoin = 'round';

    const path = this.getPath2D(hairDef.d);
    ctx.scale(hairDef.scale || 0.15, hairDef.scale || 0.15);
    ctx.fill(path);
    ctx.stroke(path);

    // Destaque luminoso
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(0, -40, 45, Math.PI * 1.25, Math.PI * 1.65);
    ctx.stroke();

    ctx.restore();
  }

  drawHairBack(ctx, x, y, cfg, dir) {
    const color = cfg.hairColor || '#3d2314';
    const shadow = cfg.hairShadow || '#241208';

    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color;
    ctx.strokeStyle = shadow;
    ctx.lineWidth = 1.4;

    if (cfg.hairStyle === 'hair_long_straight') {
      ctx.beginPath();
      ctx.roundRect(-16, -4, 32, 26, 4);
      ctx.fill();
      ctx.stroke();
    } else if (cfg.hairStyle === 'hair_twin_buns') {
      [-15, 15].forEach(bx => {
        ctx.beginPath();
        ctx.arc(bx, -12, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    }

    ctx.restore();
  }

  drawTorso(ctx, x, y, rot, cfg, dir) {
    const primary = cfg.topColorPrimary || '#19c8b9';
    const secondary = cfg.topColorSecondary || '#ffffff';
    const bottomColor = cfg.bottomColor || '#2563eb';

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);

    // 1. Camisa / Tronco (base_character.png)
    ctx.fillStyle = primary;
    ctx.strokeStyle = '#0f8e83';
    ctx.lineWidth = 1.2;

    ctx.beginPath();
    if (dir === 'east') {
      ctx.moveTo(-7, -10);
      ctx.lineTo(8, -10);
      ctx.lineTo(6, 6);
      ctx.lineTo(-6, 6);
    } else {
      ctx.moveTo(-11, -10);
      ctx.lineTo(11, -10);
      ctx.lineTo(8, 6);
      ctx.lineTo(-8, 6);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Listras
    if (cfg.topStyle === 'shirt_striped_teal' && dir !== 'north') {
      ctx.fillStyle = secondary;
      [-4, 0].forEach(sy => {
        ctx.fillRect(-8, sy, 16, 2.2);
      });
    }

    // 2. Calça / Shorts (Pelve)
    ctx.fillStyle = bottomColor;
    ctx.strokeStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.moveTo(-8, 6);
    ctx.lineTo(8, 6);
    ctx.lineTo(7, 12);
    ctx.lineTo(-7, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  drawArm(ctx, x, y, rot, cfg, side = 'left', dir = 'south') {
    const skin = cfg.skinTone || '#ffd0a8';
    const primary = cfg.topColorPrimary || '#19c8b9';

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);

    // Manga
    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.arc(0, 2, 4, 0, Math.PI * 2);
    ctx.fill();

    // Braço & Mãozinha esférica (base_character.png)
    ctx.fillStyle = skin;
    ctx.strokeStyle = cfg.skinShadow || '#e0ae82';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.rect(-2.5, 3, 5, 8);
    ctx.arc(0, 11, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  drawLeg(ctx, x, y, rot, cfg, side = 'left', dir = 'south') {
    const skin = cfg.skinTone || '#ffd0a8';
    const shoeColor = cfg.shoesColor || '#ea580c';
    const shoeTrim = cfg.shoesTrim || '#ffffff';

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);

    // Perna / Pele
    ctx.fillStyle = skin;
    ctx.fillRect(-2.5, 0, 5, 8);

    // Sapato 3D
    ctx.fillStyle = shoeColor;
    ctx.strokeStyle = '#9a3412';
    ctx.lineWidth = 1.0;

    ctx.beginPath();
    if (dir === 'east') {
      ctx.roundRect(-3, 7, 10, 6, 3);
    } else {
      ctx.roundRect(-3.5, 7, 7, 6, 3);
    }
    ctx.fill();
    ctx.stroke();

    // Sola branca
    ctx.fillStyle = shoeTrim;
    ctx.fillRect(dir === 'east' ? -3 : -3.5, 11.5, dir === 'east' ? 10 : 7, 1.8);

    ctx.restore();
  }

  drawGlasses(ctx, x, y, cfg, dir) {
    if (dir === 'north') return;

    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = cfg.glassesColor || '#5c3c26';
    ctx.lineWidth = 1.5;

    if (cfg.glassesStyle === 'sunglasses_cool') {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      if (dir === 'south') {
        [-7, 7].forEach(gx => {
          ctx.beginPath();
          ctx.roundRect(gx - 4, -3, 8, 7, 2);
          ctx.fill();
          ctx.stroke();
        });
        ctx.beginPath();
        ctx.moveTo(-3, 0);
        ctx.lineTo(3, 0);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.roundRect(4, -3, 8, 7, 2);
        ctx.fill();
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      if (dir === 'south') {
        [-7, 7].forEach(gx => {
          ctx.beginPath();
          ctx.arc(gx, 0, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });
        ctx.beginPath();
        ctx.moveTo(-2.5, 0);
        ctx.lineTo(2.5, 0);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(7, 0, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  drawHat(ctx, x, y, cfg, dir) {
    ctx.save();
    ctx.translate(x, y);

    if (cfg.hatStyle === 'straw_hat') {
      ctx.fillStyle = '#fde68a';
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.2;

      ctx.beginPath();
      ctx.ellipse(0, -12, 22, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, -17, 10, Math.PI * 1.0, Math.PI * 2.0);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, -13.5, 9.8, Math.PI * 1.05, Math.PI * 1.95);
      ctx.stroke();

    } else if (cfg.hatStyle === 'witch_hat') {
      ctx.fillStyle = '#4c1d95';
      ctx.strokeStyle = '#2e1065';
      ctx.lineWidth = 1.2;

      ctx.beginPath();
      ctx.ellipse(0, -13, 20, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-11, -14);
      ctx.quadraticCurveTo(0, -28, 6, -34);
      ctx.quadraticCurveTo(8, -24, 11, -14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

    } else if (cfg.hatStyle === 'cat_ears_band') {
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, -11, 14, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();

      [-9, 9].forEach(ox => {
        ctx.fillStyle = cfg.hairColor || '#3d2314';
        ctx.beginPath();
        ctx.moveTo(ox - 4, -13);
        ctx.lineTo(ox, -24);
        ctx.lineTo(ox + 4, -13);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.moveTo(ox - 2, -14);
        ctx.lineTo(ox, -21);
        ctx.lineTo(ox + 2, -14);
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
    const scale = size / 64;
    this.render(offCtx, 0, 0, 'south', 'idle', 0, config || DEFAULT_AVATAR_CONFIG, scale);
    return offCanvas.toDataURL('image/png');
  }
}
