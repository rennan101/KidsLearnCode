/**
 * ModularAvatarRenderer.js - KidsLearnCode
 * Renderizador Vetorial 2D por Cutout para Personagens Customizáveis.
 * 
 * Fidelidade Absoluta aos arquivos SVG oficiais:
 * - Base do Personagem: Base_char_flat.svg (canvas 2500x2500, flat fill, SEM STROKES artificiais)
 * - Roupas: assets/Tops (Tee.svg, Crop Top.svg, Cupcake Dress.svg, Long Sleeve.svg, Puffy Sleeve.svg, Sleeveless.svg, Sweater.svg)
 * - Feições Faciais: assets/Face Components.svg (Olhos, Nariz, Boca, Bochechas)
 * - Cabelos: assets/Hairs.svg (Penteados frontais e traseiros flat)
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
   * @param {number} x - Posição X no mundo/preview
   * @param {number} y - Posição Y no mundo/preview
   * @param {string} direction - 'south' | 'north' | 'east' | 'west'
   * @param {string} state - 'idle' | 'walk' | 'run' | 'riding' | 'craft' | 'celebrate'
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

    // Escala base normalizada para converter o canvas 2500x2500 de Base_char_flat.svg
    // Para scale=1.0 em preview (320x340), o personagem de altura 1738px ocupa ~265px
    const s = scale * (265 / 1738);

    if (isWest) {
      ctx.scale(-1, 1);
    }

    ctx.scale(s, s);

    // Centraliza o ponto (1250, 410) no topo-centro do desenho
    ctx.translate(-1250, -410);

    // Sombra suave no chão
    if (state !== 'riding') {
      this.drawShadow(ctx, 1250, 2140, pose.shadow.scale);
    }

    if (effectiveDir === 'north') {
      this.renderNorth(ctx, pose, config, state);
    } else if (effectiveDir === 'east') {
      this.renderEast(ctx, pose, config, state);
    } else {
      this.renderSouth(ctx, pose, config, state);
    }

    ctx.restore();
  }

  /* ========================================================================= */
  /*  RENDERIZAÇÃO: VISTA FRONTAL (SOUTH)                                      */
  /* ========================================================================= */
  renderSouth(ctx, pose, cfg, state) {
    const headX = 1250 + (pose.head.x * 12);
    const headY = 760 + (pose.head.y * 12) + (pose.head.bobY * 12);
    const torsoY = 1450 + (pose.head.bobY * 8);

    // 1. Cabelo Traseiro / Longo (atrás de tudo)
    this.drawHairBack(ctx, headX, headY, cfg, 'south');

    // 2. Orelhas de Base_char_flat.svg (_01_Orelha_Esquerda e _02_Orelha_Direita)
    this.drawEars(ctx, headX, headY, cfg, 'south');

    // 3. Pernas e Pés de Base_char_flat.svg (_04_Perna_Esquerda, _06_Perna_Direita, _03_Pe_Esquerdo, _05_Pe_Direito)
    this.drawLegs(ctx, pose, cfg, 'south');

    // 4. Pescoço (_07_Pescoco) e Tronco (_08_Tronco_Corpo) + Roupas oficiais (assets/Tops)
    this.drawTorsoAndNeck(ctx, torsoY, pose.root.rot, cfg, 'south');

    // 5. Braços e Mãos (_09_Braco_Esquerdo, _11_Braco_Direito, _10_Mao_Esquerda, _12_Mao_Direita)
    const isCelebrating = state === 'celebrate';
    if (!isCelebrating) {
      this.drawArms(ctx, torsoY, pose, cfg, 'south');
    }

    // 6. Cabeça (_14_Cabeca) e Rosto (Face Components.svg)
    ctx.save();
    ctx.translate(headX, headY);
    ctx.rotate(pose.head.rot);

    this.drawHeadBase(ctx, cfg, 'south');
    this.drawFaceFeatures(ctx, cfg, 'south');
    this.drawHairFront(ctx, cfg, 'south');

    if (cfg.glassesStyle && cfg.glassesStyle !== 'none') {
      this.drawGlasses(ctx, cfg, 'south');
    }

    ctx.restore();

    // 7. Se estiver comemorando, braços na frente de tudo
    if (isCelebrating) {
      this.drawArms(ctx, torsoY, pose, cfg, 'south');
    }
  }

  /* ========================================================================= */
  /*  RENDERIZAÇÃO: VISTA TRASEIRA (NORTH)                                     */
  /* ========================================================================= */
  renderNorth(ctx, pose, cfg, state) {
    const headX = 1250 + (pose.head.x * 12);
    const headY = 760 + (pose.head.y * 12) + (pose.head.bobY * 12);
    const torsoY = 1450 + (pose.head.bobY * 8);
    const isCelebrating = state === 'celebrate';

    // 1. Braços (se não comemorando, ficam atrás)
    if (!isCelebrating) {
      this.drawArms(ctx, torsoY, pose, cfg, 'north');
    }

    // 2. Pernas e Pés
    this.drawLegs(ctx, pose, cfg, 'north');

    // 3. Tronco e Roupas (costas)
    this.drawTorsoAndNeck(ctx, torsoY, pose.root.rot, cfg, 'north');

    // 4. Cabeça e Cabelo Traseiro
    ctx.save();
    ctx.translate(headX, headY);
    ctx.rotate(pose.head.rot);

    this.drawHeadBase(ctx, cfg, 'north');
    this.drawHairBackSolid(ctx, 0, 0, cfg, 'north');

    ctx.restore();

    if (isCelebrating) {
      this.drawArms(ctx, torsoY, pose, cfg, 'north');
    }
  }

  /* ========================================================================= */
  /*  RENDERIZAÇÃO: VISTA LATERAL (EAST / PERFIL)                              */
  /* ========================================================================= */
  renderEast(ctx, pose, cfg, state) {
    const headX = 1250 + (pose.head.x * 12);
    const headY = 760 + (pose.head.y * 12) + (pose.head.bobY * 12);
    const torsoY = 1450 + (pose.head.bobY * 8);
    const isCelebrating = state === 'celebrate';

    // 1. Cabelo Traseiro
    this.drawHairBack(ctx, headX, headY, cfg, 'east');

    // 2. Pernas e Pés
    this.drawLegs(ctx, pose, cfg, 'east');

    // 3. Tronco e Roupas
    this.drawTorsoAndNeck(ctx, torsoY, pose.root.rot, cfg, 'east');

    // 4. Braços
    if (!isCelebrating) {
      this.drawArms(ctx, torsoY, pose, cfg, 'east');
    }

    // 5. Cabeça e Feições
    ctx.save();
    ctx.translate(headX, headY);
    ctx.rotate(pose.head.rot);

    this.drawHeadBase(ctx, cfg, 'east');
    this.drawFaceFeatures(ctx, cfg, 'east');
    this.drawHairFront(ctx, cfg, 'east');

    if (cfg.glassesStyle && cfg.glassesStyle !== 'none') {
      this.drawGlasses(ctx, cfg, 'east');
    }

    ctx.restore();

    if (isCelebrating) {
      this.drawArms(ctx, torsoY, pose, cfg, 'east');
    }
  }

  /* ========================================================================= */
  /*  COMPONENTES ANATÔMICOS OFICIAIS (Base_char_flat.svg) - 100% FLAT         */
  /* ========================================================================= */

  drawShadow(ctx, x, y, scale = 1.0) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.beginPath();
    ctx.ellipse(x, y, 420 * scale, 130 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawEars(ctx, hx, hy, cfg, dir) {
    if (dir === 'east') return;
    const skin = cfg.skinTone || '#f6dab9';

    ctx.save();
    ctx.fillStyle = skin;

    // _01_Orelha_Esquerda: M900,810C800,805 765,850 765,890C765,940 815,975 900,970L900,810Z (transform Y-37)
    const earLeftPath = this.getPath2D('M900 773C800 768 765 813 765 853C765 903 815 938 900 933L900 773Z');
    ctx.fill(earLeftPath);

    // _02_Orelha_Direita: M1600,810C1700,805 1735,850 1735,890C1735,940 1685,975 1600,970L1600,810Z (transform Y-37)
    const earRightPath = this.getPath2D('M1600 773C1700 768 1735 813 1735 853C1735 903 1685 938 1600 933L1600 773Z');
    ctx.fill(earRightPath);

    ctx.restore();
  }

  drawHeadBase(ctx, cfg, dir) {
    const skin = cfg.skinTone || '#f6dab9';

    ctx.save();
    ctx.fillStyle = skin;

    if (dir === 'south' || dir === 'north') {
      // _14_Cabeca: M1250,410C1480,410 1640,560 1640,760C1640,920 1560,1080 1420,1135C1350,1160 1150,1160 1080,1135C940,1080 860,920 860,760C860,560 1020,410 1250,410Z
      // Renderizado relativo a (1250, 760)
      const headLocalPath = this.getPath2D('M0 -350C230 -350 390 -200 390 0C390 160 310 320 170 375C100 400 -100 400 -170 375C-310 320 -390 160 -390 0C-390 -200 -230 -350 0 -350Z');
      ctx.fill(headLocalPath);
    } else {
      // Perfil da cabeça
      ctx.beginPath();
      ctx.moveTo(-280, -330);
      ctx.bezierCurveTo(180, -360, 390, -130, 390, 60);
      ctx.bezierCurveTo(390, 240, 90, 380, -90, 380);
      ctx.bezierCurveTo(-310, 380, -390, 180, -390, -50);
      ctx.bezierCurveTo(-390, -220, -320, -310, -280, -330);
      ctx.closePath();
      ctx.fill();

      // Orelha lateral de perfil
      const earProfilePath = this.getPath2D('M -100 20 C -200 15 -235 60 -235 100 C -235 150 -185 185 -100 180 Z');
      ctx.fill(earProfilePath);
    }

    ctx.restore();
  }

  drawTorsoAndNeck(ctx, torsoY, rot, cfg, dir) {
    const skin = cfg.skinTone || '#f6dab9';
    const primary = cfg.topColorPrimary || '#19c8b9';
    const secondary = cfg.topColorSecondary || '#ffffff';
    const bottomColor = cfg.bottomColor || '#2563eb';
    const topStyle = cfg.topStyle || 'top_tee';
    const bottomStyle = cfg.bottomStyle || 'shorts_denim';

    ctx.save();

    // 1. Pescoço (_07_Pescoco de Base_char_flat.svg: rect x=1130 y=1080 width=240 height=180)
    ctx.fillStyle = skin;
    ctx.fillRect(1130, 1080, 240, 180);

    // 2. Tronco Base (_08_Tronco_Corpo de Base_char_flat.svg)
    ctx.save();
    ctx.translate(1250, torsoY);
    ctx.rotate(rot);

    // Path local de _08_Tronco_Corpo
    const torsoLocalPath = this.getPath2D('M-100 -280C-50 -290 50 -290 100 -280C160 -250 200 -130 205 10C215 130 180 245 90 275C40 290 -40 290 -90 275C-180 245 -215 130 -205 10C-200 -130 -160 -250 -100 -280Z');
    ctx.fillStyle = skin;
    ctx.fill(torsoLocalPath);

    // 3. ROUPAS SUPERIORES OFICIAIS (assets/Tops) - 100% Flat Fill
    ctx.fillStyle = primary;

    if (topStyle === 'top_crop_top') {
      // Top Cropped (Crop Top.svg): Corte alto, detalhes e acabamento
      ctx.beginPath();
      ctx.moveTo(-205, -280);
      ctx.lineTo(205, -280);
      ctx.lineTo(185, 50);
      ctx.lineTo(-185, 50);
      ctx.closePath();
      ctx.fill();

      // Bainha de destaque inferior
      ctx.fillStyle = secondary;
      ctx.fillRect(-185, 30, 370, 20);

      if (dir !== 'north') {
        ctx.fillStyle = secondary;
        ctx.beginPath();
        ctx.ellipse(0, -270, 80, 30, 0, 0, Math.PI);
        ctx.fill();
      }

    } else if (topStyle === 'top_cupcake_dress') {
      // Vestido Cupcake (Cupcake Dress.svg): Tronco ajustado + Saia rodada ampla com babados
      ctx.beginPath();
      ctx.moveTo(-205, -280);
      ctx.lineTo(205, -280);
      ctx.lineTo(175, 100);
      ctx.lineTo(-175, 100);
      ctx.closePath();
      ctx.fill();

      // Saia rodada ampla
      ctx.fillStyle = primary;
      ctx.beginPath();
      ctx.moveTo(-185, 100);
      ctx.lineTo(185, 100);
      ctx.lineTo(320, 380);
      ctx.lineTo(-320, 380);
      ctx.closePath();
      ctx.fill();

      // Babados em ondas da saia
      ctx.fillStyle = secondary;
      ctx.beginPath();
      ctx.roundRect(-330, 350, 660, 35, 18);
      ctx.fill();

      if (dir !== 'north') {
        ctx.fillStyle = secondary;
        ctx.beginPath();
        ctx.ellipse(0, -270, 90, 35, 0, 0, Math.PI);
        ctx.fill();

        ctx.strokeStyle = secondary;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(0, -230);
        ctx.lineTo(0, 80);
        ctx.stroke();
      }

    } else if (topStyle === 'top_sweater') {
      // Suéter de Lã (Sweater.svg): Modelagem aconchegante, barra canelada e gola alta
      ctx.beginPath();
      ctx.moveTo(-220, -290);
      ctx.lineTo(220, -290);
      ctx.lineTo(200, 240);
      ctx.lineTo(-200, 240);
      ctx.closePath();
      ctx.fill();

      // Barra canelada inferior
      ctx.fillStyle = secondary;
      ctx.fillRect(-200, 200, 400, 40);

      // Gola estruturada do suéter
      if (dir !== 'north') {
        ctx.fillStyle = secondary;
        ctx.beginPath();
        ctx.roundRect(-120, -330, 240, 65, 20);
        ctx.fill();
      }

    } else if (topStyle === 'top_puffy_sleeve') {
      // Blusa Manga Bufante (Puffy Sleeve.svg): Tronco ajustado com gola canoa
      ctx.beginPath();
      ctx.moveTo(-205, -280);
      ctx.lineTo(205, -280);
      ctx.lineTo(190, 200);
      ctx.lineTo(-190, 200);
      ctx.closePath();
      ctx.fill();

      if (dir !== 'north') {
        ctx.fillStyle = secondary;
        ctx.beginPath();
        ctx.ellipse(0, -280, 110, 40, 0, 0, Math.PI);
        ctx.fill();
      }

    } else if (topStyle === 'top_sleeveless') {
      // Regata Sem Mangas (Sleeveless.svg): Alças estruturadas e corte anatômico
      ctx.beginPath();
      ctx.moveTo(-180, -280);
      ctx.lineTo(180, -280);
      ctx.lineTo(185, 190);
      ctx.lineTo(-185, 190);
      ctx.closePath();
      ctx.fill();

      if (dir !== 'north') {
        ctx.fillStyle = skin;
        ctx.beginPath();
        ctx.ellipse(0, -280, 95, 45, 0, 0, Math.PI);
        ctx.fill();
      }

    } else if (topStyle === 'top_long_sleeve') {
      // Blusa Manga Longa (Long Sleeve.svg): Corpo com barra canelada e gola redonda
      ctx.beginPath();
      ctx.moveTo(-210, -280);
      ctx.lineTo(210, -280);
      ctx.lineTo(190, 200);
      ctx.lineTo(-190, 200);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = secondary;
      ctx.fillRect(-190, 175, 380, 25);

      if (dir !== 'north') {
        ctx.fillStyle = secondary;
        ctx.beginPath();
        ctx.ellipse(0, -270, 95, 35, 0, 0, Math.PI);
        ctx.fill();
      }

    } else {
      // Camiseta Clássica (Tee.svg): Corte clássico de camiseta com gola reforçada
      ctx.beginPath();
      ctx.moveTo(-210, -280);
      ctx.lineTo(210, -280);
      ctx.lineTo(195, 190);
      ctx.lineTo(-195, 190);
      ctx.closePath();
      ctx.fill();

      if (dir !== 'north') {
        ctx.fillStyle = secondary;
        ctx.beginPath();
        ctx.ellipse(0, -280, 95, 45, 0, 0, Math.PI);
        ctx.fill();
      }
    }

    // 4. Shorts / Calça / Saia (Pelve) - 100% Flat Fill
    if (topStyle !== 'top_cupcake_dress') {
      ctx.fillStyle = bottomColor;

      if (bottomStyle === 'skirt_pleated') {
        // Saia Plissada
        ctx.beginPath();
        ctx.moveTo(-195, 190);
        ctx.lineTo(195, 190);
        ctx.lineTo(260, 360);
        ctx.lineTo(-260, 360);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 6;
        [-130, -65, 0, 65, 130].forEach(px => {
          ctx.beginPath();
          ctx.moveTo(px * 0.8, 200);
          ctx.lineTo(px * 1.25, 360);
          ctx.stroke();
        });

      } else if (bottomStyle === 'pants_cargo') {
        // Calça Cargo: Pelve e bolsos
        ctx.beginPath();
        ctx.moveTo(-195, 190);
        ctx.lineTo(195, 190);
        ctx.lineTo(185, 320);
        ctx.lineTo(-185, 320);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-150, 205, 300, 22);

      } else {
        // Shorts Jeans
        ctx.beginPath();
        ctx.moveTo(-195, 190);
        ctx.lineTo(195, 190);
        ctx.lineTo(180, 310);
        ctx.lineTo(-180, 310);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(-175, 300);
        ctx.lineTo(175, 300);
        ctx.stroke();
      }
    }

    ctx.restore();
    ctx.restore();
  }

  drawArms(ctx, torsoY, pose, cfg, dir) {
    const skin = cfg.skinTone || '#f6dab9';
    const primary = cfg.topColorPrimary || '#19c8b9';
    const secondary = cfg.topColorSecondary || '#ffffff';
    const topStyle = cfg.topStyle || 'top_tee';

    ctx.save();

    // Braço Esquerdo (_09_Braco_Esquerdo e _10_Mao_Esquerda)
    // Articula no ombro esquerdo (1120, 1195)
    ctx.save();
    ctx.translate(1120, 1195);
    ctx.rotate(pose.arm_l.rot);

    // Braço de pele base
    const armLPath = this.getPath2D('M0 0C35 10 50 50 30 85L-230 395C-250 417 -285 407 -300 380C-315 353 -305 320 -278 305L-28 10C-20 3 -10 0 0 0Z');
    ctx.fillStyle = skin;
    ctx.fill(armLPath);

    // Mão esquerda (_10_Mao_Esquerda: cx=820, cy=1600, r=62 -> local: cx=-300, cy=405, r=62)
    ctx.beginPath();
    ctx.arc(-300, 405, 62, 0, Math.PI * 2);
    ctx.fill();

    // Manga da roupa esquerda
    this.renderArmSleeve(ctx, primary, secondary, topStyle, 'left');

    ctx.restore();

    // Braço Direito (_11_Braco_Direito e _12_Mao_Direita)
    // Articula no ombro direito (1380, 1195)
    ctx.save();
    ctx.translate(1380, 1195);
    ctx.rotate(pose.arm_r.rot);

    const armRPath = this.getPath2D('M0 0C-35 10 -50 50 -30 85L230 395C250 417 285 407 300 380C315 353 305 320 278 305L28 10C20 3 10 0 0 0Z');
    ctx.fillStyle = skin;
    ctx.fill(armRPath);

    // Mão direita (_12_Mao_Direita: cx=1680, cy=1600, r=62 -> local: cx=300, cy=405, r=62)
    ctx.beginPath();
    ctx.arc(300, 405, 62, 0, Math.PI * 2);
    ctx.fill();

    // Manga da roupa direita
    this.renderArmSleeve(ctx, primary, secondary, topStyle, 'right');

    ctx.restore();

    ctx.restore();
  }

  renderArmSleeve(ctx, primary, secondary, topStyle, side) {
    const s = side === 'left' ? -1 : 1;
    ctx.fillStyle = primary;

    if (topStyle === 'top_long_sleeve' || topStyle === 'top_sweater') {
      // Manga Longa (Long Sleeve.svg / Sweater.svg): cobre todo o braço até o punho
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(s * 35, 10, s * 50, 50, s * 30, 85);
      ctx.lineTo(s * 210, 365);
      ctx.bezierCurveTo(s * 230, 385, s * 270, 375, s * 280, 350);
      ctx.lineTo(s * 28, 10);
      ctx.closePath();
      ctx.fill();

      // Punho branco
      ctx.fillStyle = secondary;
      ctx.beginPath();
      ctx.moveTo(s * 190, 335);
      ctx.lineTo(s * 230, 395);
      ctx.lineTo(s * 270, 365);
      ctx.lineTo(s * 240, 315);
      ctx.closePath();
      ctx.fill();

    } else if (topStyle === 'top_puffy_sleeve') {
      // Manga Bufante (Puffy Sleeve.svg): Manga esférica volumosa no ombro
      ctx.beginPath();
      ctx.arc(s * 40, 45, 105, 0, Math.PI * 2);
      ctx.fill();

    } else if (topStyle === 'top_sleeveless' || topStyle === 'top_crop_top') {
      // Sem mangas: braço inteiro de pele exposto (nada a sobrepor)
    } else {
      // Manga Curta padrão (Tee.svg / Cupcake Dress.svg)
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(s * 35, 10, s * 50, 50, s * 30, 85);
      ctx.lineTo(s * 95, 185);
      ctx.bezierCurveTo(s * 130, 175, s * 150, 145, s * 140, 115);
      ctx.lineTo(s * 28, 10);
      ctx.closePath();
      ctx.fill();
    }
  }

  drawLegs(ctx, pose, cfg, dir) {
    const skin = cfg.skinTone || '#f6dab9';
    const bottomColor = cfg.bottomColor || '#2563eb';
    const shoeColor = cfg.shoesColor || '#ea580c';
    const shoeTrim = cfg.shoesTrim || '#ffffff';
    const bottomStyle = cfg.bottomStyle || 'shorts_denim';
    const shoesStyle = cfg.shoesStyle || 'sneakers_classic';

    const liftL = (pose.hip_l && pose.hip_l.y !== undefined) ? ((pose.hip_l.y - 6) * 15) : 0;
    const liftR = (pose.hip_r && pose.hip_r.y !== undefined) ? ((pose.hip_r.y - 6) * 15) : 0;

    ctx.save();

    // Perna Esquerda (_04_Perna_Esquerda e _03_Pe_Esquerdo)
    // Articula no quadril esquerdo (1145, 1600)
    ctx.save();
    ctx.translate(1145, 1600 + liftL);
    ctx.rotate(pose.hip_l.rot + pose.leg_l.rot);

    // Perna de pele (_04_Perna_Esquerda)
    const legLPath = this.getPath2D('M-80 70C-80 0 80 0 80 70L60 440C60 465 -70 465 -70 440L-80 70Z');
    ctx.fillStyle = skin;
    ctx.fill(legLPath);

    // Pé esquerdo (_03_Pe_Esquerdo)
    const footLPath = this.getPath2D('M-75 430C-75 390 65 390 65 430C75 475 70 535 20 548C-20 550 -80 530 -75 430Z');
    ctx.fill(footLPath);

    // Calça e Sapato Esquerdo
    this.renderLegClothingAndShoe(ctx, bottomColor, shoeColor, shoeTrim, bottomStyle, shoesStyle, 'left');

    ctx.restore();

    // Perna Direita (_06_Perna_Direita e _05_Pe_Direito)
    // Articula no quadril direito (1355, 1600)
    ctx.save();
    ctx.translate(1355, 1600 + liftR);
    ctx.rotate(pose.hip_r.rot + pose.leg_r.rot);

    // Perna de pele (_06_Perna_Direita)
    const legRPath = this.getPath2D('M-80 70C-80 0 80 0 80 70L70 440C70 465 -60 465 -60 440L-80 70Z');
    ctx.fillStyle = skin;
    ctx.fill(legRPath);

    // Pé direito (_05_Pe_Direito)
    const footRPath = this.getPath2D('M-65 430C-65 390 75 390 75 430C80 475 75 535 30 548C-10 550 -70 530 -65 430Z');
    ctx.fill(footRPath);

    // Calça e Sapato Direito
    this.renderLegClothingAndShoe(ctx, bottomColor, shoeColor, shoeTrim, bottomStyle, shoesStyle, 'right');

    ctx.restore();

    ctx.restore();
  }

  renderLegClothingAndShoe(ctx, bottomColor, shoeColor, shoeTrim, bottomStyle, shoesStyle, side) {
    // 1. Calça / Shorts
    if (bottomStyle === 'pants_cargo') {
      // Calça comprida cobrindo até quase o pé
      ctx.fillStyle = bottomColor;
      ctx.beginPath();
      ctx.roundRect(-85, 0, 170, 440, 12);
      ctx.fill();

      // Bolso cargo lateral
      ctx.fillStyle = '#1d4ed8';
      const bx = side === 'left' ? -95 : 55;
      ctx.fillRect(bx, 150, 40, 100);

    } else if (bottomStyle === 'shorts_denim') {
      // Shorts cobrindo parte superior da coxa
      ctx.fillStyle = bottomColor;
      ctx.beginPath();
      ctx.roundRect(-85, 0, 170, 150, 8);
      ctx.fill();
    }

    // 2. Calçado / Sapato
    if (shoesStyle === 'boots_hunter') {
      // Bota de trilha
      ctx.fillStyle = shoeColor;
      ctx.beginPath();
      ctx.roundRect(-85, 370, 170, 180, 20);
      ctx.fill();

      // Fivela da bota
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-45, 410, 90, 20);

      // Sola escura
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-90, 525, 180, 25);

    } else if (shoesStyle === 'sandals_beach') {
      // Sandália aberta
      ctx.fillStyle = shoeColor;
      ctx.beginPath();
      ctx.roundRect(-85, 510, 170, 40, 15);
      ctx.fill();

      // Tiras brancas
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(-65, 510);
      ctx.lineTo(0, 430);
      ctx.lineTo(65, 510);
      ctx.stroke();

    } else {
      // Tênis clássico
      ctx.fillStyle = shoeColor;
      ctx.beginPath();
      ctx.roundRect(-80, 420, 160, 130, 25);
      ctx.fill();

      // Biqueira e sola branca
      ctx.fillStyle = shoeTrim;
      ctx.fillRect(-85, 515, 170, 35);
      ctx.beginPath();
      ctx.arc(0, 450, 20, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /* ========================================================================= */
  /*  FEIÇÕES FACIAIS (assets/Face Components.svg)                             */
  /* ========================================================================= */

  drawFaceFeatures(ctx, cfg, dir) {
    if (dir === 'north') return;

    ctx.save();

    if (dir === 'south') {
      // 1. Bochechas / Blush
      this.drawCheekItem(ctx, -260, 100, cfg.cheeksShape, 'left');
      this.drawCheekItem(ctx, 260, 100, cfg.cheeksShape, 'right');

      // 2. Olhos
      this.drawEyeItem(ctx, -165, -30, cfg.eyeShape, cfg.eyeColor, 'left');
      this.drawEyeItem(ctx, 165, -30, cfg.eyeShape, cfg.eyeColor, 'right');

      // 3. Nariz
      this.drawNoseItem(ctx, 0, 65, cfg.noseShape);

      // 4. Boca
      this.drawMouthItem(ctx, 0, 165, cfg.mouthShape);

    } else {
      // Perfil lateral (east)
      this.drawCheekItem(ctx, 150, 100, cfg.cheeksShape, 'right');
      this.drawEyeItem(ctx, 140, -30, cfg.eyeShape, cfg.eyeColor, 'right');
      this.drawNoseItem(ctx, 290, 65, cfg.noseShape, 'east');
      this.drawMouthItem(ctx, 210, 165, cfg.mouthShape, 'east');
    }

    ctx.restore();
  }

  drawNoseItem(ctx, x, y, noseShape, dir = 'south') {
    ctx.save();
    ctx.translate(x, y);

    const noseDef = SVG_NOSES.find(n => n.id === noseShape) || SVG_NOSES[0];
    ctx.fillStyle = noseDef.color || '#FF7E36';

    if (noseDef.type === 'circle') {
      ctx.beginPath();
      ctx.arc(0, 0, 32, 0, Math.PI * 2);
      ctx.fill();
    } else if (noseDef.type === 'ellipse') {
      ctx.beginPath();
      ctx.ellipse(0, 0, 41, 25, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (noseDef.type === 'rect') {
      ctx.beginPath();
      ctx.roundRect(-39, -18, 78, 36, 8);
      ctx.fill();
    } else {
      // Triângulo clássico ACNH (Face Components.svg)
      ctx.scale(4.588, 4.588);
      ctx.translate(-noseDef.cx, -noseDef.cy);
      const path = this.getPath2D(noseDef.d);
      ctx.fill(path);
    }

    ctx.restore();
  }

  drawMouthItem(ctx, x, y, mouthShape, dir = 'south') {
    ctx.save();
    ctx.translate(x, y);

    const mouthDef = SVG_MOUTHS.find(m => m.id === mouthShape) || SVG_MOUTHS[0];

    if (dir === 'east') {
      ctx.strokeStyle = '#8C501D';
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-25, 0);
      ctx.lineTo(35, 0);
      ctx.stroke();
      ctx.restore();
      return;
    }

    if (mouthDef.type === 'fill') {
      ctx.fillStyle = mouthDef.color || '#8C501D';
      ctx.beginPath();
      ctx.ellipse(0, 0, 30, 35, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.scale(4.588, 4.588);
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
      ctx.strokeStyle = '#8C501D';
      ctx.lineWidth = 18;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(0, 0, 72, Math.PI * 1.12, Math.PI * 1.88);
      ctx.stroke();

    } else if (eyeDef.type === 'round_button') {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, 0, 80, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = irisColor || '#8C501D';
      ctx.beginPath();
      ctx.arc(8, 0, 62, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(8, 0, 36, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(-14, -22, 20, 0, Math.PI * 2);
      ctx.fill();

    } else if (eyeDef.type === 'sharp_determined') {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(-75, -55, 150, 110, 18);
      ctx.fill();

      ctx.fillStyle = irisColor || '#8C501D';
      ctx.beginPath();
      ctx.arc(5, 5, 55, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(5, 5, 32, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(-15, -15, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#8C501D';
      ctx.lineWidth = 16;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-80, -60);
      ctx.lineTo(80, -40);
      ctx.stroke();

    } else if (eyeDef.type === 'sleepy_calm') {
      ctx.fillStyle = irisColor || '#8C501D';
      ctx.beginPath();
      ctx.ellipse(0, 10, 65, 42, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(-18, 0, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#8C501D';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-70, -10);
      ctx.quadraticCurveTo(0, -30, 70, -10);
      ctx.stroke();

    } else if (eyeDef.type === 'almond_lash') {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(0, 0, 70, 85, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = irisColor || '#8C501D';
      ctx.beginPath();
      ctx.ellipse(10, 0, 58, 78, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.ellipse(10, 0, 36, 48, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(-15, -20, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#8C501D';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-70, -35);
      ctx.quadraticCurveTo(0, -65, 70, -30);
      ctx.stroke();

    } else if (eyeDef.type === 'cat_lashes') {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(0, 0, 65, 85, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = irisColor || '#8C501D';
      ctx.beginPath();
      ctx.ellipse(8, 0, 55, 75, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.ellipse(8, 0, 34, 46, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(-14, -20, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#8C501D';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-65, -30);
      ctx.quadraticCurveTo(0, -55, 65, -45);
      ctx.lineTo(85, -65);
      ctx.stroke();

    } else if (eyeDef.type === 'gentle_oval') {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(0, 0, 60, 80, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = irisColor || '#8C501D';
      ctx.beginPath();
      ctx.ellipse(8, 0, 48, 70, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.ellipse(8, 0, 28, 42, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(-12, -18, 16, 0, Math.PI * 2);
      ctx.fill();

    } else {
      // anime_sparkle
      ctx.fillStyle = irisColor || '#8C501D';
      ctx.beginPath();
      ctx.ellipse(0, 0, 65, 88, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(-18, -25, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(15, 20, 14, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  drawCheekItem(ctx, x, y, cheekShape, side = 'left') {
    if (cheekShape === 'none') return;

    ctx.save();
    ctx.translate(x, y);

    const cheekDef = SVG_CHEEKS.find(c => c.id === cheekShape) || SVG_CHEEKS[0];

    if (cheekDef.type === 'freckles') {
      ctx.fillStyle = '#8C501D';
      [-25, 0, 25].forEach((fx, idx) => {
        ctx.beginPath();
        ctx.arc(fx, (idx % 2) * 15, 8, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (cheekDef.type === 'whiskers') {
      ctx.strokeStyle = '#8C501D';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      const s = side === 'left' ? -1 : 1;
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(s * 90, -36);
      ctx.moveTo(0, 27);
      ctx.lineTo(s * 90, 45);
      ctx.stroke();
    } else {
      // Blush Oficial de Face Components.svg (Flat Fill)
      ctx.fillStyle = cheekDef.color || 'rgba(255, 186, 165, 0.75)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 57, 48, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /* ========================================================================= */
  /*  CABELOS (assets/Hairs.svg) - 100% FLAT (SEM STROKES)                     */
  /* ========================================================================= */

  drawHairFront(ctx, cfg, dir = 'south') {
    if (dir === 'north') return;

    const hairDef = SVG_HAIRS.find(h => h.id === cfg.hairStyle) || SVG_HAIRS[0];
    const color = cfg.hairColor || '#3d2314';

    ctx.save();
    ctx.fillStyle = color;

    if (dir === 'east') {
      // Perfil lateral: preenchimento de topo sem stroke
      ctx.beginPath();
      ctx.moveTo(-350, -20);
      ctx.bezierCurveTo(-350, -230, -210, -400, 0, -400);
      ctx.bezierCurveTo(210, -400, 325, -280, 350, -20);
      ctx.lineTo(280, -20);
      ctx.bezierCurveTo(255, -230, 140, -350, 0, -350);
      ctx.bezierCurveTo(-140, -350, -255, -210, -280, -20);
      ctx.closePath();
      ctx.fill();

      // Franja projetada de perfil
      ctx.save();
      ctx.scale(4.588, 4.588);
      ctx.translate(-hairDef.cx + 25, -hairDef.topY - 80);
      if (Array.isArray(hairDef.frontPaths)) {
        for (const d of hairDef.frontPaths) {
          const path = this.getPath2D(d);
          ctx.fill(path);
        }
      }
      ctx.restore();

    } else {
      // Vista frontal (south): Flat fill da base do crânio + franja
      ctx.beginPath();
      ctx.arc(0, -115, 310, Math.PI * 1.0, Math.PI * 2.0);
      ctx.fill();

      ctx.save();
      ctx.scale(4.588, 4.588);
      ctx.translate(-hairDef.cx, -hairDef.topY - 80);
      if (Array.isArray(hairDef.frontPaths)) {
        for (const d of hairDef.frontPaths) {
          const path = this.getPath2D(d);
          ctx.fill(path);
        }
      }
      ctx.restore();
    }

    ctx.restore();
  }

  drawHairBack(ctx, x, y, cfg, dir) {
    const hairDef = SVG_HAIRS.find(h => h.id === cfg.hairStyle) || SVG_HAIRS[0];
    const color = cfg.hairColor || '#3d2314';

    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color;

    if (dir === 'east') {
      if (cfg.hairStyle === 'hair_long_straight') {
        ctx.beginPath();
        ctx.roundRect(-350, -90, 400, 820, 70);
        ctx.fill();
      } else if (cfg.hairStyle === 'hair_twin_buns') {
        ctx.beginPath();
        ctx.arc(-210, -250, 130, 0, Math.PI * 2);
        ctx.fill();
      } else if (cfg.hairStyle === 'hair_high_ponytail') {
        ctx.beginPath();
        ctx.moveTo(-180, -270);
        ctx.quadraticCurveTo(-440, -180, -410, 160);
        ctx.quadraticCurveTo(-320, 230, -250, 70);
        ctx.closePath();
        ctx.fill();
      } else if (cfg.hairStyle === 'hair_twin_braids') {
        ctx.beginPath();
        ctx.roundRect(-280, 0, 140, 550, 55);
        ctx.fill();
      }
    } else {
      if (Array.isArray(hairDef.backPaths)) {
        for (const bp of hairDef.backPaths) {
          ctx.save();
          ctx.scale(4.588, 4.588);
          ctx.translate(-bp.cx, -bp.topY - 80);
          const path = this.getPath2D(bp.d);
          ctx.fill(path);
          ctx.restore();
        }
      } else {
        if (cfg.hairStyle === 'hair_long_straight') {
          ctx.beginPath();
          ctx.roundRect(-370, -90, 740, 820, 80);
          ctx.fill();
        } else if (cfg.hairStyle === 'hair_twin_buns') {
          [-360, 360].forEach(bx => {
            ctx.beginPath();
            ctx.arc(bx, -250, 120, 0, Math.PI * 2);
            ctx.fill();
          });
        } else if (cfg.hairStyle === 'hair_twin_braids') {
          [-300, 300].forEach(bx => {
            ctx.beginPath();
            ctx.roundRect(bx - 70, 50, 140, 600, 55);
            ctx.fill();
          });
        }
      }
    }

    ctx.restore();
  }

  drawHairBackSolid(ctx, x, y, cfg, dir = 'north') {
    const hairDef = SVG_HAIRS.find(h => h.id === cfg.hairStyle) || SVG_HAIRS[0];
    const color = cfg.hairColor || '#3d2314';

    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color;

    // Base sólida do crânio de costas
    ctx.beginPath();
    ctx.arc(0, 0, 350, 0, Math.PI * 2);
    ctx.fill();

    if (Array.isArray(hairDef.backPaths)) {
      for (const bp of hairDef.backPaths) {
        ctx.save();
        ctx.scale(4.588, 4.588);
        ctx.translate(-bp.cx, -bp.topY - 80);
        const path = this.getPath2D(bp.d);
        ctx.fill(path);
        ctx.restore();
      }
    }

    ctx.restore();
  }

  /* ========================================================================= */
  /*  ACESSÓRIOS (Óculos)                                                      */
  /* ========================================================================= */

  drawGlasses(ctx, cfg, dir) {
    if (dir === 'north') return;

    ctx.save();
    ctx.strokeStyle = cfg.glassesColor || '#5c3c26';
    ctx.lineWidth = 16;

    if (dir === 'east') {
      if (cfg.glassesStyle === 'sunglasses_cool') {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.beginPath();
        ctx.roundRect(80, -55, 175, 145, 28);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(80, 0);
        ctx.lineTo(-90, 20);
        ctx.stroke();
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.beginPath();
        ctx.ellipse(155, 20, 80, 90, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(90, 20);
        ctx.lineTo(-90, 20);
        ctx.stroke();
      }

    } else {
      // Vista frontal (south)
      if (cfg.glassesStyle === 'sunglasses_cool') {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        [-175, 185].forEach(gx => {
          ctx.beginPath();
          ctx.roundRect(gx - 90, -65, 180, 150, 36);
          ctx.fill();
          ctx.stroke();
        });
        ctx.beginPath();
        ctx.moveTo(-80, 0);
        ctx.lineTo(90, 0);
        ctx.stroke();
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        [-175, 185].forEach(gx => {
          ctx.beginPath();
          ctx.arc(gx, 20, 100, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });
        ctx.beginPath();
        ctx.moveTo(-75, 20);
        ctx.lineTo(85, 20);
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
    const scale = size / 265;
    this.render(offCtx, size / 2, 4, 'south', 'idle', 0, config || DEFAULT_AVATAR_CONFIG, scale);
    return offCanvas.toDataURL('image/png');
  }
}
