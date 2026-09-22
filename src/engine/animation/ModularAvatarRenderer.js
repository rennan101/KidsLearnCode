/**
 * ModularAvatarRenderer.js - KidsLearnCode
 * Renderizador Vetorial 2D por Cutout / Paper-Doll para Personagens Customizáveis.
 * 
 * Renderiza todas as partes do corpo, roupas, rostos e cabelos usando transformações
 * hierárquicas de matrizes 2D orientadas pelo SkeletonRig.
 */

import { SkeletonRig } from './SkeletonRig.js';
import { DEFAULT_AVATAR_CONFIG } from './AvatarConfig.js';

export class ModularAvatarRenderer {
  constructor() {
    this.rig = new SkeletonRig();
    // Cache de renderização opcional para otimização
    this.offscreenCache = new Map();
  }

  /**
   * Renderiza o avatar completo no contexto 2D alvo.
   * @param {CanvasRenderingContext2D} ctx - Contexto Canvas onde desenhar
   * @param {number} x - Posição X no mundo (origem do sprite 64x64)
   * @param {number} y - Posição Y no mundo
   * @param {string} direction - 'south' | 'north' | 'east' | 'west'
   * @param {string} state - 'idle' | 'walk' | 'run' | 'craft' | 'riding' | 'celebrate'
   * @param {number} time - Tempo de animação acumulado em segundos
   * @param {Object} config - Objeto de configuração do avatar (AvatarConfig)
   * @param {number} scale - Escala global do personagem (padrão 1.0)
   */
  render(ctx, x, y, direction = 'south', state = 'idle', time = 0, config = DEFAULT_AVATAR_CONFIG, scale = 1.0) {
    const isWest = direction === 'west';
    const effectiveDir = isWest ? 'east' : direction;
    const pose = this.rig.evaluate(state, direction, time);

    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));

    // Se for 'west', espelha horizontalmente em torno do centro (x = 32)
    if (isWest) {
      ctx.translate(32 * scale, 0);
      ctx.scale(-1, 1);
      ctx.translate(-32 * scale, 0);
    }

    if (scale !== 1.0) {
      ctx.scale(scale, scale);
    }

    // 1. Sombra elíptica no chão (exceto se montado)
    if (state !== 'riding') {
      this.drawShadow(ctx, pose.root.x, 60, pose.shadow.scale);
    }

    // Ordenação de Z-Index de acordo com a direção da câmera
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
    const hairColor = cfg.hairColor || '#3d2314';
    const hairShadow = cfg.hairShadow || '#241208';

    // 1. Cabelo Traseiro / Longo (atrás de tudo)
    this.drawHairBack(ctx, pose.root.x + pose.head.x, pose.root.y + pose.head.y + pose.head.bobY, cfg, 'south');

    // 2. Braço Esquerdo (Posterior / Atrás)
    this.drawArm(ctx, pose.root.x + pose.shoulder_l.x, pose.root.y + pose.shoulder_l.y, pose.arm_l.rot, cfg, 'left', 'south');

    // 3. Pernas e Pés
    this.drawLeg(ctx, pose.root.x + pose.hip_l.x, pose.root.y + pose.hip_l.y, pose.hip_l.rot + pose.leg_l.rot, cfg, 'left', 'south');
    this.drawLeg(ctx, pose.root.x + pose.hip_r.x, pose.root.y + pose.hip_r.y, pose.hip_r.rot + pose.leg_r.rot, cfg, 'right', 'south');

    // 4. Tronco & Roupas
    this.drawTorso(ctx, pose.root.x + pose.torso.x, pose.root.y + pose.torso.y, pose.root.rot, cfg, 'south');

    // 5. Braço Direito (Anterior / Frente)
    this.drawArm(ctx, pose.root.x + pose.shoulder_r.x, pose.root.y + pose.shoulder_r.y, pose.arm_r.rot, cfg, 'right', 'south');

    // 6. Cabeça, Rosto & Acessórios
    const headX = pose.root.x + pose.head.x;
    const headY = pose.root.y + pose.head.y + pose.head.bobY;

    ctx.save();
    ctx.translate(headX, headY);
    ctx.rotate(pose.head.rot);

    // Formato da Cabeça Chibi
    this.drawHeadBase(ctx, 0, 0, skin, skinShadow, 'south');

    // Feições do Rosto (Olhos, Nariz, Boca, Bochechas)
    this.drawFaceFeatures(ctx, 0, 0, cfg, 'south');

    // Cabelo Frontal (Franja / Topo)
    this.drawHairFront(ctx, 0, 0, cfg, 'south');

    // Óculos
    if (cfg.glassesStyle && cfg.glassesStyle !== 'none') {
      this.drawGlasses(ctx, 0, 0, cfg, 'south');
    }

    // Chapéus & Acessórios de Cabeça
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

    // 1. Braços (Ambos ligeiramente atrás do corpo)
    this.drawArm(ctx, pose.root.x + pose.shoulder_l.x, pose.root.y + pose.shoulder_l.y, pose.arm_l.rot, cfg, 'left', 'north');
    this.drawArm(ctx, pose.root.x + pose.shoulder_r.x, pose.root.y + pose.shoulder_r.y, pose.arm_r.rot, cfg, 'right', 'north');

    // 2. Pernas e Pés
    this.drawLeg(ctx, pose.root.x + pose.hip_l.x, pose.root.y + pose.hip_l.y, pose.hip_l.rot + pose.leg_l.rot, cfg, 'left', 'north');
    this.drawLeg(ctx, pose.root.x + pose.hip_r.x, pose.root.y + pose.hip_r.y, pose.hip_r.rot + pose.leg_r.rot, cfg, 'right', 'north');

    // 3. Tronco & Roupas (Costas)
    this.drawTorso(ctx, pose.root.x + pose.torso.x, pose.root.y + pose.torso.y, pose.root.rot, cfg, 'north');

    // 4. Cabeça (Nuca e Cabelo de Trás cobrindo tudo)
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

    // 1. Cabelo Traseiro
    this.drawHairBack(ctx, pose.root.x + pose.head.x, pose.root.y + pose.head.y + pose.head.bobY, cfg, 'east');

    // 2. Braço Traseiro (Esquerdo)
    this.drawArm(ctx, pose.root.x - 2, pose.root.y + pose.shoulder_l.y, pose.arm_l.rot, cfg, 'left', 'east');

    // 3. Perna Traseira (Esquerda)
    this.drawLeg(ctx, pose.root.x - 3, pose.root.y + pose.hip_l.y, pose.hip_l.rot + pose.leg_l.rot, cfg, 'left', 'east');

    // 4. Tronco & Roupas
    this.drawTorso(ctx, pose.root.x + pose.torso.x, pose.root.y + pose.torso.y, pose.root.rot, cfg, 'east');

    // 5. Perna Dianteira (Direita)
    this.drawLeg(ctx, pose.root.x + 3, pose.root.y + pose.hip_r.y, pose.hip_r.rot + pose.leg_r.rot, cfg, 'right', 'east');

    // 6. Braço Dianteiro (Direito)
    this.drawArm(ctx, pose.root.x + 2, pose.root.y + pose.shoulder_r.y, pose.arm_r.rot, cfg, 'right', 'east');

    // 7. Cabeça, Rosto & Acessórios
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
  /*  SUB-RENDERIZADORES ANATÔMICOS & VESTUÁRIO                                */
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

    // Formato Chibi esférico fofo ligeiramente mais largo nas bochechas
    ctx.fillStyle = skin;
    ctx.strokeStyle = skinShadow;
    ctx.lineWidth = 1.2;

    ctx.beginPath();
    if (dir === 'east') {
      // Perfil com leve elevação do nariz/focinho suave
      ctx.moveTo(-12, -14);
      ctx.bezierCurveTo(8, -16, 15, -6, 15, 3);
      ctx.bezierCurveTo(15, 11, 4, 15, -4, 15);
      ctx.bezierCurveTo(-14, 15, -16, 8, -16, -2);
      ctx.bezierCurveTo(-16, -10, -14, -14, -12, -14);
    } else {
      // Frontal e Traseira
      ctx.ellipse(0, 0, 16, 14, 0, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.stroke();

    // Orelhas arredondadas
    if (dir === 'south') {
      // Orelha Esquerda
      ctx.beginPath();
      ctx.arc(-16, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Orelha Direita
      ctx.beginPath();
      ctx.arc(16, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (dir === 'east') {
      // Apenas a orelha visível no perfil
      ctx.beginPath();
      ctx.arc(-6, 1, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  drawFaceFeatures(ctx, x, y, cfg, dir) {
    if (dir === 'north') return; // Sem rosto de costas

    const eyeColor = cfg.eyeColor || '#2563eb';
    const cheekColor = cfg.cheeksColor || 'rgba(244, 114, 182, 0.45)';

    ctx.save();
    ctx.translate(x, y);

    if (dir === 'south') {
      // 1. Bochechas / Blush
      if (cfg.cheeksShape !== 'none') {
        ctx.fillStyle = cheekColor;
        if (cfg.cheeksShape === 'freckles') {
          ctx.fillStyle = '#92400e';
          [-9, -8, -10, 8, 9, 10].forEach((fx, i) => {
            ctx.beginPath();
            ctx.arc(fx, 4 + (i % 2) * 2, 0.9, 0, Math.PI * 2);
            ctx.fill();
          });
        } else if (cfg.cheeksShape === 'cat_whiskers') {
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 1;
          [-1, 1].forEach(side => {
            ctx.beginPath();
            ctx.moveTo(side * 8, 2);
            ctx.lineTo(side * 15, 0);
            ctx.moveTo(side * 8, 4);
            ctx.lineTo(side * 15, 5);
            ctx.stroke();
          });
        } else {
          // Blush padrão (círculos/ovais)
          ctx.beginPath();
          ctx.ellipse(-9, 3, 3.5, 2.2, 0, 0, Math.PI * 2);
          ctx.ellipse(9, 3, 3.5, 2.2, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 2. Olhos
      this.drawEyes(ctx, -7, 0, eyeColor, cfg.eyeShape, 'left');
      this.drawEyes(ctx, 7, 0, eyeColor, cfg.eyeShape, 'right');

      // 3. Nariz
      ctx.fillStyle = cfg.skinShadow || '#e0ae82';
      ctx.beginPath();
      if (cfg.noseShape === 'button_dot') {
        ctx.arc(0, 1.5, 1.2, 0, Math.PI * 2);
      } else if (cfg.noseShape === 'cute_cat') {
        ctx.moveTo(0, 2);
        ctx.lineTo(-1.8, 0.5);
        ctx.lineTo(1.8, 0.5);
      } else {
        // Triângulo suave padrão ACNH
        ctx.moveTo(0, 0.5);
        ctx.lineTo(-2, 2.5);
        ctx.lineTo(2, 2.5);
      }
      ctx.closePath();
      ctx.fill();

      // 4. Boca
      ctx.strokeStyle = '#831843';
      ctx.fillStyle = '#e11d48';
      ctx.lineWidth = 1.2;
      ctx.lineCap = 'round';
      ctx.beginPath();

      if (cfg.mouthShape === 'cat_w') {
        ctx.moveTo(-4, 5);
        ctx.quadraticCurveTo(-2, 7, 0, 5.5);
        ctx.quadraticCurveTo(2, 7, 4, 5);
        ctx.stroke();
      } else if (cfg.mouthShape === 'open_joy') {
        ctx.arc(0, 5, 3.2, 0, Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (cfg.mouthShape === 'neutral_smirk') {
        ctx.moveTo(-2, 6);
        ctx.quadraticCurveTo(2, 6, 4, 5);
        ctx.stroke();
      } else {
        // Happy Smile clássico
        ctx.arc(0, 4.5, 3.2, 0.2, Math.PI - 0.2);
        ctx.stroke();
      }

    } else if (dir === 'east') {
      // Perfil: apenas olho direito, nariz e boca lateral
      if (cfg.cheeksShape !== 'none') {
        ctx.fillStyle = cheekColor;
        ctx.beginPath();
        ctx.ellipse(8, 3, 3.2, 2.0, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      this.drawEyes(ctx, 7, 0, eyeColor, cfg.eyeShape, 'right');

      // Nariz em perfil
      ctx.fillStyle = cfg.skinShadow || '#e0ae82';
      ctx.beginPath();
      ctx.moveTo(14, 1);
      ctx.lineTo(16, 2.5);
      ctx.lineTo(14, 3);
      ctx.closePath();
      ctx.fill();

      // Boca em perfil
      ctx.strokeStyle = '#831843';
      ctx.lineWidth = 1.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(10, 6);
      ctx.lineTo(13, 5.5);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawEyes(ctx, x, y, irisColor, shape = 'sparkle_round', side = 'right') {
    ctx.save();
    ctx.translate(x, y);

    if (shape === 'cheerful_arc') {
      // Olhos fechados sorrindo em arco ^_^
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.0;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(0, 0, 3.5, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
    } else {
      // Globo ocular e íris expressiva
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(0, 0, 3.6, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Íris
      ctx.fillStyle = irisColor;
      ctx.beginPath();
      ctx.ellipse(side === 'right' ? 0.6 : -0.6, 0.4, 2.6, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pupila escura
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(side === 'right' ? 0.6 : -0.6, 0.4, 1.4, 2.0, 0, 0, Math.PI * 2);
      ctx.fill();

      // Brilho de luz branco (Sparkle)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(side === 'right' ? -0.4 : -1.2, -1.2, 1.2, 0, Math.PI * 2);
      ctx.arc(side === 'right' ? 1.4 : 0.6, 1.4, 0.6, 0, Math.PI * 2);
      ctx.fill();

      // Delineador superior / cílio suave
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(0, -0.4, 3.6, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawHairFront(ctx, x, y, cfg, dir) {
    const style = cfg.hairStyle || 'fluffy_curls';
    const color = cfg.hairColor || '#3d2314';
    const shadow = cfg.hairShadow || '#241208';

    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color;
    ctx.strokeStyle = shadow;
    ctx.lineWidth = 1.4;
    ctx.lineJoin = 'round';

    ctx.beginPath();
    switch (style) {
      case 'spiky_hero': {
        ctx.moveTo(-16, -4);
        ctx.lineTo(-14, -16);
        ctx.lineTo(-8, -12);
        ctx.lineTo(0, -20);
        ctx.lineTo(8, -12);
        ctx.lineTo(14, -16);
        ctx.lineTo(16, -4);
        ctx.lineTo(10, -6);
        ctx.lineTo(0, -8);
        ctx.lineTo(-10, -6);
        break;
      }
      case 'wavy_bob': {
        ctx.arc(0, -5, 17, Math.PI * 1.05, Math.PI * 1.95);
        ctx.bezierCurveTo(18, 5, 16, 12, 13, 15);
        ctx.quadraticCurveTo(10, 10, 8, -4);
        ctx.quadraticCurveTo(0, -1, -8, -4);
        ctx.quadraticCurveTo(-10, 10, -13, 15);
        ctx.bezierCurveTo(-16, 12, -18, 5, -16, -5);
        break;
      }
      case 'curtains_middle': {
        ctx.arc(0, -6, 16.5, Math.PI * 1.0, Math.PI * 2.0);
        ctx.quadraticCurveTo(15, 6, 13, 8);
        ctx.quadraticCurveTo(6, 2, 2, -6);
        ctx.quadraticCurveTo(-2, -6, -6, 2);
        ctx.quadraticCurveTo(-13, 8, -15, 6);
        break;
      }
      case 'afro_puff': {
        // Grandes nuvens de cachos
        ctx.arc(0, -10, 19, 0, Math.PI * 2);
        break;
      }
      default: {
        // Fluffy curls padrão
        ctx.arc(0, -6, 16.5, Math.PI * 1.0, Math.PI * 2.0);
        ctx.quadraticCurveTo(15, 4, 12, 6);
        ctx.quadraticCurveTo(6, -2, 2, -5);
        ctx.quadraticCurveTo(-2, -5, -6, -2);
        ctx.quadraticCurveTo(-12, 4, -15, 6);
        break;
      }
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Destaque brilhante de mecha no topo
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, -12, 11, Math.PI * 1.25, Math.PI * 1.65);
    ctx.stroke();

    ctx.restore();
  }

  drawHairBack(ctx, x, y, cfg, dir) {
    const style = cfg.hairStyle || 'fluffy_curls';
    const color = cfg.hairColor || '#3d2314';
    const shadow = cfg.hairShadow || '#241208';

    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color;
    ctx.strokeStyle = shadow;
    ctx.lineWidth = 1.4;

    if (style === 'high_ponytail') {
      ctx.beginPath();
      ctx.ellipse(0, -18, 8, 12, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (style === 'twin_braids') {
      // Duas trancinhas laterais
      [-14, 14].forEach(bx => {
        ctx.beginPath();
        ctx.ellipse(bx, 6, 4, 10, bx < 0 ? 0.2 : -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    } else if (style === 'straight_long') {
      ctx.beginPath();
      ctx.rect(-15, -4, 30, 24);
      ctx.fill();
      ctx.stroke();
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

    // 1. Camisa / Top
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

    // Estampa / Listras se for estilo listrado
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

    // Braço / Pele
    ctx.fillStyle = skin;
    ctx.strokeStyle = cfg.skinShadow || '#e0ae82';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.rect(-2.5, 3, 5, 8);
    ctx.arc(0, 11, 3.2, 0, Math.PI * 2); // Mão esférica tátil
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

    // Perna / Pele (shorts visível)
    ctx.fillStyle = skin;
    ctx.fillRect(-2.5, 0, 5, 8);

    // Sapato / Tênis 3D
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

    // Sola branca do tênis
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
      // Óculos redondos clássicos
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
    const hatColor = cfg.hatColor || '#f59e0b';

    if (cfg.hatStyle === 'straw_hat') {
      // Chapéu de Palha clássico Animal Crossing
      ctx.fillStyle = '#fde68a';
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.2;

      // Aba larga
      ctx.beginPath();
      ctx.ellipse(0, -12, 22, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Copa do chapéu
      ctx.beginPath();
      ctx.arc(0, -17, 10, Math.PI * 1.0, Math.PI * 2.0);
      ctx.fill();
      ctx.stroke();

      // Fita vermelha
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, -13.5, 9.8, Math.PI * 1.05, Math.PI * 1.95);
      ctx.stroke();

    } else if (cfg.hatStyle === 'witch_hat') {
      // Chapéu pontudo de bruxo
      ctx.fillStyle = '#4c1d95';
      ctx.strokeStyle = '#2e1065';
      ctx.lineWidth = 1.2;

      // Aba
      ctx.beginPath();
      ctx.ellipse(0, -13, 20, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Cone pontudo inclinado
      ctx.beginPath();
      ctx.moveTo(-11, -14);
      ctx.quadraticCurveTo(0, -28, 6, -34);
      ctx.quadraticCurveTo(8, -24, 11, -14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

    } else if (cfg.hatStyle === 'cat_ears_band') {
      // Tiara com Orelhinhas de Gato
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, -11, 14, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();

      // Orelhas
      [-9, 9].forEach(ox => {
        ctx.fillStyle = cfg.hairColor || '#3d2314';
        ctx.beginPath();
        ctx.moveTo(ox - 4, -13);
        ctx.lineTo(ox, -24);
        ctx.lineTo(ox + 4, -13);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Interior rosa
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

  /**
   * Gera uma imagem DataURL (PNG) do avatar renderizado para usar como retrato em HUDs e cartas.
   * @param {Object} config - Configuração do avatar
   * @param {number} size - Tamanho do quadrado em pixels
   * @returns {string} DataURL em formato PNG
   */
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
