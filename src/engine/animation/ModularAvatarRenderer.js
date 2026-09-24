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
  SVG_HEADS,
  SVG_EYES,
  SVG_NOSES,
  SVG_MOUTHS,
  SVG_BLUSHES,
  getHeadSvgContent,
  getHeadBackSvgContent,
  getEyeSvgContent,
  getNoseSvgContent,
  getMouthSvgContent,
  getBlushSvgContent
} from './CharacterSvgAssets.js';
import {
  SVG_BASE_CHARACTER,
  SVG_TOPS
} from './SvgAssetCatalog.js';

export class ModularAvatarRenderer {
  constructor() {
    this.rig = new SkeletonRig();
    this.pathCache = new Map();
    this.svgImageCache = new Map();
  }

  getSvgImage(key, svgString) {
    if (!this.svgImageCache.has(key)) {
      const img = new Image();
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      img.src = url;
      this.svgImageCache.set(key, img);
    }
    return this.svgImageCache.get(key);
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
    const headRot = pose.head.rot;
    const isCelebrating = state === 'celebrate';

    // 0. Cabelo Traseiro (quando for longo / chiquinhas / marias chiquinhas / cachos que caem atrás)
    ctx.save();
    ctx.translate(1250, 760);
    ctx.rotate(headRot);
    this.drawBackHair(ctx, cfg, 'south');
    ctx.restore();

    // 1. Pernas e Pés de Base_char_flat.svg (_04_Perna_Esquerda, _06_Perna_Direita, _03_Pe_Esquerdo, _05_Pe_Direito)
    this.drawLegs(ctx, pose, cfg, 'south');

    // 2. Pescoço (_07_Pescoco) e Tronco (_08_Tronco_Corpo) + Roupas oficiais (assets/Tops) - desenhado SOBRE o cabelo traseiro
    this.drawTorsoAndNeck(ctx, pose.root.rot, cfg, 'south');

    // 3. Braços e Mãos (_09_Braco_Esquerdo, _11_Braco_Direito, _10_Mao_Esquerda, _12_Mao_Direita) - desenhado SOBRE o cabelo traseiro
    if (!isCelebrating) {
      this.drawArms(ctx, pose, cfg, 'south');
    }

    // 4. Cabeça e Feições Faciais (assets/characters/Heads, Eyes, Mouth, Nose, Blush)
    ctx.save();
    ctx.translate(1250, 760);
    ctx.rotate(headRot);

    this.drawHeadBase(ctx, cfg, 'south');
    this.drawFaceFeatures(ctx, cfg, 'south');

    if (cfg.glassesStyle && cfg.glassesStyle !== 'none') {
      this.drawGlasses(ctx, cfg, 'south');
    }

    ctx.restore();

    // 5. Se estiver comemorando, braços na frente de tudo
    if (isCelebrating) {
      this.drawArms(ctx, pose, cfg, 'south');
    }
  }

  /* ========================================================================= */
  /*  RENDERIZAÇÃO: VISTA TRASEIRA (NORTH)                                     */
  /* ========================================================================= */
  renderNorth(ctx, pose, cfg, state) {
    const headRot = pose.head.rot;
    const isCelebrating = state === 'celebrate';

    // 1. Braços (se não comemorando, ficam atrás)
    if (!isCelebrating) {
      this.drawArms(ctx, pose, cfg, 'north');
    }

    // 2. Pernas e Pés
    this.drawLegs(ctx, pose, cfg, 'north');

    // 3. Tronco e Roupas (costas)
    this.drawTorsoAndNeck(ctx, pose.root.rot, cfg, 'north');

    // 4. Cabeça Oficial de Costas
    ctx.save();
    ctx.translate(1250, 760);
    ctx.rotate(headRot);

    this.drawHeadBase(ctx, cfg, 'north');

    ctx.restore();

    if (isCelebrating) {
      this.drawArms(ctx, pose, cfg, 'north');
    }
  }

  /* ========================================================================= */
  /*  RENDERIZAÇÃO: VISTA LATERAL (EAST / PERFIL)                              */
  /* ========================================================================= */
  renderEast(ctx, pose, cfg, state) {
    const headRot = pose.head.rot;
    const isCelebrating = state === 'celebrate';

    // 0. Cabelo Traseiro (fica atrás de pernas, tronco e braços)
    ctx.save();
    ctx.translate(1250, 760);
    ctx.rotate(headRot);
    this.drawBackHair(ctx, cfg, 'east');
    ctx.restore();

    // 1. Pernas e Pés
    this.drawLegs(ctx, pose, cfg, 'east');

    // 2. Tronco e Roupas
    this.drawTorsoAndNeck(ctx, pose.root.rot, cfg, 'east');

    // 3. Braços
    if (!isCelebrating) {
      this.drawArms(ctx, pose, cfg, 'east');
    }

    // 4. Cabeça Oficial e Feições
    ctx.save();
    ctx.translate(1250, 760);
    ctx.rotate(headRot);

    this.drawHeadBase(ctx, cfg, 'south');
    this.drawFaceFeatures(ctx, cfg, 'south');

    if (cfg.glassesStyle && cfg.glassesStyle !== 'none') {
      this.drawGlasses(ctx, cfg, 'south');
    }

    ctx.restore();

    if (isCelebrating) {
      this.drawArms(ctx, pose, cfg, 'east');
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

  drawBackHair(ctx, cfg, dir) {
    if (dir === 'north') return;
    const hair = cfg.hairColor || '#3d2314';
    const headId = cfg.headStyle || 'head_01';
    const backSvg = getHeadBackSvgContent(headId, hair);
    if (!backSvg) return;

    const headDef = SVG_HEADS.find(h => h.id === headId) || SVG_HEADS[0];
    const img = this.getSvgImage(`headback_${headId}_${hair}`, backSvg);

    if (img && img.complete && img.naturalWidth > 0) {
      const [,, vw, vh] = headDef.viewBox.split(' ').map(Number);
      const cx = headDef.cx !== undefined ? headDef.cx : vw / 2;
      const cy = headDef.cy !== undefined ? headDef.cy : 350;
      ctx.drawImage(img, -cx, -cy, vw, vh);
    }
  }

  drawHeadBase(ctx, cfg, dir) {
    const skin = cfg.skinTone || '#ffd0a8';
    const hair = cfg.hairColor || '#3d2314';
    const headId = cfg.headStyle || 'head_01';

    ctx.save();

    // 1. Renderiza o Head SVG Oficial (Cabeça + Penteado + Orelhas integradas dos arquivos assets/characters/Heads)
    const headSvg = getHeadSvgContent(headId, skin, hair);
    const headDef = SVG_HEADS.find(h => h.id === headId) || SVG_HEADS[0];
    const img = this.getSvgImage(`head_${headId}_${skin}_${hair}`, headSvg);

    if (img && img.complete && img.naturalWidth > 0) {
      // O viewBox de headDef está mapeado com precisão pelo centro (1250, 760)
      const [,, vw, vh] = headDef.viewBox.split(' ').map(Number);
      const cx = headDef.cx !== undefined ? headDef.cx : vw / 2;
      const cy = headDef.cy !== undefined ? headDef.cy : 350;
      ctx.drawImage(img, -cx, -cy, vw, vh);
    } else {
      // Fallback vetorial instantâneo enquanto a imagem carrega no primeiro tick
      ctx.fillStyle = skin;
      const headLocalPath = this.getPath2D('M0 -350C230 -350 390 -200 390 0C390 160 310 320 170 375C100 400 -100 400 -170 375C-310 320 -390 160 -390 0C-390 -200 -230 -350 0 -350Z');
      ctx.fill(headLocalPath);
    }

    ctx.restore();
  }

  drawTorsoAndNeck(ctx, rot, cfg, dir) {
    const skin = cfg.skinTone || '#f6dab9';
    const primary = cfg.topColorPrimary || '#19c8b9';
    const secondary = cfg.topColorSecondary || '#ffffff';
    const bottomColor = cfg.bottomColor || '#2563eb';
    const topStyle = cfg.topStyle || 'top_tee';
    const bottomStyle = cfg.bottomStyle || 'shorts_denim';

    ctx.save();
    ctx.translate(1250, 1450);
    ctx.rotate(rot);

    // 1. Pescoço (_07_Pescoco de Base_char_flat.svg: x=1130, y=1080, w=240, h=180 -> relativo a (1250, 1450): x=-120, y=-370, w=240, h=180)
    ctx.fillStyle = skin;
    ctx.fillRect(-120, -370, 240, 180);

    // 2. Tronco Base (_08_Tronco_Corpo de Base_char_flat.svg)
    const torsoLocalPath = this.getPath2D('M-100 -280C-50 -290 50 -290 100 -280C160 -250 200 -130 205 10C215 130 180 245 90 275C40 290 -40 290 -90 275C-180 245 -215 130 -205 10C-200 -130 -160 -250 -100 -280Z');
    ctx.fill(torsoLocalPath);

    // 3. ROUPAS SUPERIORES OFICIAIS (assets/Tops) - Renderização vetorial exata
    this.renderTopOnTorso(ctx, topStyle, primary, secondary, skin, dir);

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
  }

  renderTopOnTorso(ctx, topStyle, primary, secondary, skin, dir) {
    ctx.save();
    // Escala SVG oficial de Tops (largura 213px -> 430px de ombro a ombro)
    // Coordenadas dos Tops têm centro X=107.5 e gola superior em Y=1477 (Cupcake Dress em Y=825)
    ctx.save();

    if (topStyle === 'top_cupcake_dress') {
      ctx.translate(0, -280);
      ctx.scale(3.4, 3.4);
      ctx.translate(-107.5, -825);

      // SVG path oficial de Cupcake Dress.svg
      const dressPath = this.getPath2D('M80.5 825C48.5 815 30.3 854.8 32.5 864.3C31.7 865 30 865.3 31 867.3C31.5 870.8 36.3 876.7 39 878.5C41.5 880.2 48 882 51 883C52.2 883.8 52.8 882 53 881C56.5 881 59.7 882.6 61 877.8V884.5C48.2 897 21 933.5 21 963.5C21 967.5 32 969.5 32 965.5C32 969.5 42.5 971.5 42.5 967.5C42.5 971.5 53 971.5 53 967.5C53 971.5 64 973.5 64 969.5C64 973.5 75 974 75 970C75 974 85.5 974 85.5 970C85.5 974 96.5 974.5 96.5 970.5C96.5 974.5 108 974.5 108 970.5C108 974.5 119 974.5 119 970.5C119 974.5 129 974 129 970C129 974 139.5 973.5 139.5 969.5C139.5 973.5 150.5 973.5 150.5 969.5C150.5 973.5 161.5 971.5 161.5 967.5C161.5 971.5 172 971.5 172 967.5C172 971.5 182.5 969.5 182.5 965.5C182.5 969.5 193.5 967.5 193.5 963.5C193.5 929.9 166.8 896 153.5 885L153 875.5C154.8 882.6 158 881 161.5 881C161.7 882 162.3 883.8 163.5 883C166.5 882 173 880.2 175.5 878.5C178.2 876.7 183 870.8 183.5 867.3C184.5 865.3 182.8 865 182 864.3C184.2 854.8 166 815 134 825C127.8 827.5 121.5 832.5 107 832.5C92.5 832.5 86.7 827.5 80.5 825Z');
      ctx.fillStyle = primary;
      ctx.fill(dressPath);

      // Detalhe frontal da saia
      if (dir !== 'north') {
        const detailPath = this.getPath2D('M107.97 845.709C95.057 845.709 84.7984 847.717 81.2832 848.722L87.5244 878.207H129.492L134.442 848.722C130.999 847.717 120.883 845.709 107.97 845.709Z');
        ctx.fillStyle = secondary;
        ctx.fill(detailPath);
      }

    } else if (topStyle === 'top_crop_top') {
      ctx.translate(0, -280);
      ctx.scale(3.4, 3.4);
      ctx.translate(-107.5, -1477);

      // SVG path oficial de Crop Top.svg
      const cropPath = this.getPath2D('M31 1512.5C37.8 1498.5 69 1477 80.5 1477C86.6667 1479.5 93 1484.5 107.5 1484.5C122 1484.5 128 1479.5 134 1477C145.5 1477 176.7 1498.5 183.5 1512.5C181.333 1522 168 1533.5 164 1535.5C161 1533.5 154.6 1529.1 153 1527.5C151 1525.5 158 1545 157.5 1552.5C146.5 1554.5 120.1 1556.5 106.5 1556.5C92.9 1556.5 68 1555 57 1552.5C56.5 1545 63.5 1525.5 61.5 1527.5C59.9 1529.1 53.5 1533.5 50.5 1535.5C46.5 1533.5 33.1667 1522 31 1512.5Z');
      ctx.fillStyle = primary;
      ctx.fill(cropPath);

      if (dir !== 'north') {
        ctx.fillStyle = secondary;
        const trimBottom = this.getPath2D('M57 1552.5C68 1555 92.9 1556.5 106.5 1556.5C120.1 1556.5 146.5 1554.5 157.5 1552.5L157 1545C146 1547 120 1548.5 106.5 1548.5C93 1548.5 68 1547 57 1545Z');
        ctx.fill(trimBottom);
      }

    } else if (topStyle === 'top_sweater') {
      ctx.translate(0, -280);
      ctx.scale(3.4, 3.4);
      ctx.translate(-107.5, -1477);

      // SVG path oficial de Sweater.svg
      const sweaterPath = this.getPath2D('M79.8 1476.7C79.4 1477.3 79 1478 79 1478.5C69 1475.5 41.6 1498.7 34 1511.5C30 1518.2 25 1522.6 20.6 1526.5C14.5 1531.8 9.6 1536.1 10.5 1544C8.2 1545.8 3.7 1550 4.5 1552C7.8 1555.8 15.5 1563.7 19.5 1564.5C23.5 1564.5 26.8 1559.8 28 1557.5C32.5 1559 47.2 1547.2 50 1542C52.8 1536.8 58.8 1530.2 61.5 1527.5C56.7 1538.2 49.1 1560.5 57.5 1564.5C56.8 1567.8 56.2 1575.7 57 1576.5C71 1578.5 99.6 1578.5 106 1578.5C112.4 1578.5 149.5 1578 158.5 1576.5C159.3 1575.7 158.2 1567.8 157.5 1564.5C165.9 1560.5 158.3 1538.2 153.5 1527.5C156.2 1530.2 162.2 1536.8 165 1542C167.8 1547.2 182.5 1559 187 1557.5C188.2 1559.8 191.5 1564.5 195.5 1564.5C199.5 1563.7 207.2 1555.8 210.5 1552C211.3 1550 206.8 1545.8 204.5 1544C205.4 1536.1 200.5 1531.8 194.4 1526.5C190 1522.6 185 1518.2 181 1511.5C173.4 1498.7 146 1475.5 136 1478.5C136 1478 134.9 1477.2 134 1476.6C127.2 1478.3 117.6 1480 106.7 1480C96 1480 86.6 1478.4 79.8 1476.7Z');
      ctx.fillStyle = primary;
      ctx.fill(sweaterPath);

      // Barra e gola do suéter
      if (dir !== 'north') {
        ctx.fillStyle = secondary;
        ctx.beginPath();
        ctx.roundRect(85, 1474, 43, 10, 5);
        ctx.fill();
      }

    } else if (topStyle === 'top_puffy_sleeve') {
      ctx.translate(0, -280);
      ctx.scale(3.4, 3.4);
      ctx.translate(-107.5, -1477);

      // SVG path oficial de Puffy Sleeve.svg
      const puffyPath = this.getPath2D('M80.5 1477C48.5 1467 30.3 1506.8 32.5 1516.3C31.7 1517 30 1517.3 31 1519.3C31.5 1522.8 36.3 1528.7 39 1530.5C41.5 1532.2 48 1534 51 1535C52.2 1535.8 52.8 1534 53 1533C56.5 1533 59.7 1534.5 61 1529.8C59.5 1538.6 54.6 1568.9 57.5 1575.5L58.5 1580.5C60 1580.5 64 1582 64 1578C64 1582 75 1582 75 1578C75 1582 85.5 1582 85.5 1578C85.5 1582 96 1582 96 1578C96 1582 107 1582 107 1578C107 1582 118.5 1582 118.5 1578C118.5 1582 129.5 1582 129.5 1578C129.5 1582 140.5 1582 140.5 1578C140.5 1582 151 1582 151 1578C151 1582 155 1580.5 156.5 1580.5L157.5 1575.5C160.4 1568.9 155.5 1538.6 154 1529.8C155.3 1534.5 158.5 1533 162 1533C162.2 1534 162.8 1535.8 164 1535C167 1534 173.5 1532.2 176 1530.5C178.7 1528.7 183.5 1522.8 184 1519.3C185 1517.3 183.3 1517 182.5 1516.3C184.7 1506.8 166.5 1467 134.5 1477C128.3 1479.5 122 1484.5 107.5 1484.5C93 1484.5 86.7 1479.5 80.5 1477Z');
      ctx.fillStyle = primary;
      ctx.fill(puffyPath);

    } else if (topStyle === 'top_sleeveless') {
      ctx.translate(0, -280);
      ctx.scale(3.4, 3.4);
      ctx.translate(-107.5, -1477);

      // SVG path oficial de Sleeveless.svg
      const sleeveLessPath = this.getPath2D('M107.5 1581.5C93.9 1581.5 68 1580 57 1577.5C56.5 1570.1 64 1529 65 1524C69.8 1519.2 70.2 1494.5 70.5 1482C72.9 1480.4 79.7 1478.2 82.5 1477.5C85 1478.2 90 1479.3 90 1482.5C90 1479.5 98.5 1480.3 98.5 1483.5C98.5 1481 107.5 1481 107.5 1485C107.5 1481 116.5 1481 116.5 1483.5C116.5 1480.3 125 1479.5 125 1482.5C125 1479.7 130 1478 132.5 1477.5C135.3 1478.2 142.6 1480.4 145 1482C145.2 1493.5 146.5 1518 150.5 1524C153.3 1539 159.2 1571.5 158 1577.5C147 1580 121.1 1581.5 107.5 1581.5Z');
      ctx.fillStyle = primary;
      ctx.fill(sleeveLessPath);

    } else if (topStyle === 'top_long_sleeve') {
      ctx.translate(0, -280);
      ctx.scale(3.4, 3.4);
      ctx.translate(-107.5, -1477);

      // SVG path oficial de Long Sleeve.svg (corpo)
      const longSleevePath = this.getPath2D('M41 1505.4C51.1 1492.5 71 1477.9 82.5 1477.9C88.7 1480.4 93 1484.5 107.5 1484.5C122 1484.5 126.3 1480.4 132.5 1477.9C144 1477.9 164.7 1493.5 174 1505.4C185 1519.4 209.5 1547 211.5 1549C210.5 1551.2 207.6 1556.2 204 1559C200.4 1561.8 189.5 1569.5 187 1569.5C177.2 1556 156.7 1528.7 153.5 1527.5C159 1559 170 1623.7 170 1630.5H45.5C44.7 1622.9 55.8 1558.7 61.5 1527.5C58.3 1528.7 37.8 1556 28 1569.5C25.5 1569.5 14.6 1561.8 11 1559C7.4 1556.2 4.5 1551.2 3.5 1549C5.5 1547 30 1519.4 41 1505.4Z');
      ctx.fillStyle = primary;
      ctx.fill(longSleevePath);

    } else {
      // Camiseta Clássica (Tee.svg)
      ctx.translate(0, -280);
      ctx.scale(3.4, 3.4);
      ctx.translate(-107.5, -1477);

      const teePath = this.getPath2D('M31 1512.5C37.8 1498.5 69 1477 80.5 1477C86.6667 1479.5 93 1484.5 107.5 1484.5C122 1484.5 128 1479.5 134 1477C145.5 1477 176.7 1498.5 183.5 1512.5C181.333 1522 168 1533.5 164 1535.5C161 1533.5 154.6 1529.1 153 1527.5C151 1525.5 158 1570 157.5 1577.5C146.5 1579.5 120.1 1581.5 106.5 1581.5C92.9 1581.5 68 1580 57 1577.5C56.5 1570 63.5 1525.5 61.5 1527.5C59.9 1529.1 53.5 1533.5 50.5 1535.5C46.5 1533.5 33.1667 1522 31 1512.5Z');
      ctx.fillStyle = primary;
      ctx.fill(teePath);
    }

    ctx.restore();
    ctx.restore();
  }

  drawArms(ctx, pose, cfg, dir) {
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

    // 1. Bochechas / Blush (assets/characters/Blush)
    if (cfg.cheeksShape && cfg.cheeksShape !== 'none') {
      const blushId = cfg.cheeksShape;
      const blushSvg = getBlushSvgContent(blushId);
      const blushDef = SVG_BLUSHES.find(b => b.id === blushId) || SVG_BLUSHES[0];
      const blushImg = this.getSvgImage(`blush_${blushId}`, blushSvg);

      if (blushImg && blushImg.complete && blushImg.naturalWidth > 0) {
        const [,, vw, vh] = blushDef.viewBox.split(' ').map(Number);
        // Centralizado no rosto (y: 135)
        ctx.drawImage(blushImg, -vw * 2.2, 135 - (vh * 2.2) / 2, vw * 4.4, vh * 4.4);
      }
    }

    // 2. Olhos (assets/characters/Eyes: 20 pares)
    const eyeId = cfg.eyeShape || 'olhos_1';
    const eyeColor = cfg.eyeColor || '#8C501D';
    const eyeSvg = getEyeSvgContent(eyeId, eyeColor);
    const eyeDef = SVG_EYES.find(e => e.id === eyeId) || SVG_EYES[0];
    const eyeImg = this.getSvgImage(`eye_${eyeId}_${eyeColor}`, eyeSvg);

    if (eyeImg && eyeImg.complete && eyeImg.naturalWidth > 0) {
      const [,, vw, vh] = eyeDef.viewBox.split(' ').map(Number);
      // Centralizado horizontalmente no rosto (y: 15)
      ctx.drawImage(eyeImg, -vw * 2.4, 15 - (vh * 2.4) / 2, vw * 4.8, vh * 4.8);
    }

    // 3. Nariz (assets/characters/Nose: 4 narizes)
    const noseId = cfg.noseShape || 'nariz_1';
    const noseSvg = getNoseSvgContent(noseId);
    const noseDef = SVG_NOSES.find(n => n.id === noseId) || SVG_NOSES[0];
    const noseImg = this.getSvgImage(`nose_${noseId}`, noseSvg);

    if (noseImg && noseImg.complete && noseImg.naturalWidth > 0) {
      const [,, vw, vh] = noseDef.viewBox.split(' ').map(Number);
      // Centralizado horizontalmente na altura do nariz (y: 110)
      ctx.drawImage(noseImg, -vw * 2.4, 110 - (vh * 2.4) / 2, vw * 4.8, vh * 4.8);
    }

    // 4. Boca (assets/characters/Mouth: 8 bocas)
    const mouthId = cfg.mouthShape || 'boca_1';
    const mouthSvg = getMouthSvgContent(mouthId);
    const mouthDef = SVG_MOUTHS.find(m => m.id === mouthId) || SVG_MOUTHS[0];
    const mouthImg = this.getSvgImage(`mouth_${mouthId}`, mouthSvg);

    if (mouthImg && mouthImg.complete && mouthImg.naturalWidth > 0) {
      const [,, vw, vh] = mouthDef.viewBox.split(' ').map(Number);
      // Centralizado horizontalmente na altura da boca (y: 225)
      ctx.drawImage(mouthImg, -vw * 2.4, 225 - (vh * 2.4) / 2, vw * 4.8, vh * 4.8);
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

    const eyeColor = irisColor || '#8C501D';

    switch (eyeShape) {
      case 'eye_pair_01': {
        // Pair 1: Olhar curvo com contorno e íris oval (linhas 18-21 de Face Components.svg)
        // Scaled to fit avatar coordinate space
        ctx.scale(2.4, 2.4);
        ctx.translate(-816, -187);
        const eyeSclera = this.getPath2D('M826.849 170.249C833.041 171.867 835.361 174.249 835.849 176.249C836.338 178.249 836.599 181.249 834.849 188.249C833.349 194.249 831.349 202.249 821.349 205.249C811.349 208.249 805.163 206.249 801.663 204.691C797.76 202.954 795.764 200.989 795.252 195.794C794.74 190.599 797.439 179.409 805.163 173.788C812.886 168.166 819.094 168.222 826.849 170.249Z');
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#8C501D';
        ctx.lineWidth = 2;
        ctx.fill(eyeSclera);
        ctx.stroke(eyeSclera);

        const eyePupil = this.getPath2D('M829.259 170.981C828.53 170.724 827.729 170.478 826.849 170.249C826.365 170.122 825.888 170.003 825.415 169.893C824.739 169.798 824.049 169.749 823.349 169.749C814.513 169.749 807.349 177.584 807.349 187.249C807.349 196.73 814.243 204.45 822.848 204.74C831.556 201.421 833.427 193.936 834.849 188.249C836.567 181.378 836.346 178.361 835.876 176.36C834.151 173.989 831.875 172.119 829.259 170.981Z');
        ctx.fillStyle = eyeColor;
        ctx.fill(eyePupil);
        break;
      }

      case 'eye_pair_02': {
        // Pair 2: Olhar com cílios duplos laterais (linhas 22-29 de Face Components.svg)
        ctx.scale(2.4, 2.4);
        ctx.translate(-816, -266);
        const eyeSclera = this.getPath2D('M822.314 249.951C832.059 253.101 837.431 263.332 834.381 272.768L834.372 272.794L834.366 272.82C833.628 275.609 831.849 278.785 828.524 281.108C825.207 283.425 820.263 284.955 813.081 284.3C809.759 283.998 805.592 283.169 802.107 282.107C800.364 281.575 798.821 280.995 797.652 280.408C797.067 280.114 796.599 279.83 796.251 279.563C795.892 279.288 795.723 279.077 795.658 278.95C795.587 278.813 795.508 278.527 795.475 278.036C795.443 277.562 795.46 276.973 795.523 276.282C795.649 274.903 795.952 273.213 796.355 271.415C797.159 267.823 798.334 263.905 799.171 261.397L799.174 261.388C802.225 251.952 812.569 246.8 822.314 249.951Z');
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#8C501D';
        ctx.lineWidth = 2;
        ctx.fill(eyeSclera);
        ctx.stroke(eyeSclera);

        const eyePupil = this.getPath2D('M820.512 248.44C812.796 250.143 807 257.385 807 266.061C807 275.911 814.473 283.914 823.744 284.059C833.312 280.524 836.104 273.44 836.14 268.248C836.725 258.664 829.911 250.294 820.512 248.44Z');
        ctx.fillStyle = eyeColor;
        ctx.fill(eyePupil);

        ctx.strokeStyle = '#8C501D';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(837, 251);
        ctx.lineTo(843, 247);
        ctx.moveTo(841, 259);
        ctx.lineTo(847, 257);
        ctx.stroke();
        break;
      }

      case 'eye_pair_03': {
        // Pair 3: Olhar com pálpebra superior curva e cílios meigos (linhas 30-35 de Face Components.svg)
        ctx.scale(2.4, 2.4);
        ctx.translate(-821, -120);
        const pupilPath = this.getPath2D('M821 132C828.18 132 834 126.18 834 119C834 117.99 833.885 117.008 833.667 116.064C830.331 113.066 823.841 109 815.797 109C814.642 109 813.513 109.084 812.417 109.236C809.709 111.619 808 115.11 808 119C808 126.18 813.82 132 821 132Z');
        ctx.fillStyle = eyeColor;
        ctx.fill(pupilPath);

        const lashArch = this.getPath2D('M795 117C797.773 114 805.814 108 815.797 108C825.78 108 833.425 114 836 117');
        ctx.strokeStyle = '#8C501D';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.stroke(lashArch);

        const lashSide = this.getPath2D('M836 117C837 116.833 839.1 115.8 839.5 113');
        ctx.stroke(lashSide);
        break;
      }

      case 'eye_pair_04': {
        // Pair 4: Olhar curvo doce clássico (linhas 36-39 de Face Components.svg)
        ctx.scale(2.4, 2.4);
        ctx.translate(-816, -340);
        const eyeSclera = this.getPath2D('M822.314 323.951C832.059 327.101 837.431 337.332 834.381 346.768L834.372 346.794L834.366 346.82C833.628 349.609 831.849 352.785 828.524 355.108C825.207 357.425 820.263 358.955 813.081 358.3C809.759 357.998 805.592 357.169 802.107 356.107C800.364 355.575 798.821 354.995 797.652 354.408C797.067 354.114 796.599 353.83 796.251 353.563C795.892 353.288 795.723 353.077 795.658 352.95C795.587 352.813 795.508 352.527 795.475 352.036C795.443 351.562 795.46 350.973 795.523 350.282C795.649 348.903 795.952 347.213 796.355 345.415C797.159 341.823 798.334 337.905 799.171 335.397L799.174 335.388C802.225 325.952 812.569 320.8 822.314 323.951Z');
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#8C501D';
        ctx.lineWidth = 2;
        ctx.fill(eyeSclera);
        ctx.stroke(eyeSclera);

        const eyePupil = this.getPath2D('M820.512 322.44C812.796 324.144 807 331.386 807 340.061C807 349.911 814.473 357.914 823.744 358.059C833.312 354.525 836.104 347.44 836.14 342.248C836.725 332.664 829.911 324.295 820.512 322.44Z');
        ctx.fillStyle = eyeColor;
        ctx.fill(eyePupil);
        break;
      }

      case 'eye_pair_05': {
        // Pair 5: Olhar anime com brilho duplo e cílio lateral (linhas 40-47 de Face Components.svg)
        ctx.scale(2.4, 2.4);
        ctx.translate(-655.5, -265.5);
        ctx.fillStyle = eyeColor;
        ctx.beginPath();
        ctx.ellipse(655.5, 265.5, 14.5, 19.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(651.5, 257.5, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(661.5, 273, 2.5, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        const lash = this.getPath2D('M640 249C640 249.667 640.7 252.2 641.5 253C642.5 254 644 254.5 645.5 254');
        ctx.strokeStyle = '#8C501D';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.stroke(lash);
        break;
      }

      case 'eye_pair_06': {
        // Pair 6: Olhar detalhado com pálpebra rosa e pupila (linhas 52-55 de Face Components.svg)
        ctx.scale(2.4, 2.4);
        ctx.translate(-656.678, -191.5);
        const rim = this.getPath2D('M642.139 178.213C641.994 178.742 642.267 179.299 642.749 179.458L670.096 188.462L670.11 188.466C671.34 188.826 673.255 189.082 675.009 188.623C675.896 188.391 676.782 187.965 677.508 187.234C678.244 186.492 678.77 185.482 678.985 184.179C679.075 183.636 678.747 183.115 678.252 183.016C677.757 182.917 677.283 183.278 677.193 183.821C677.044 184.718 676.704 185.329 676.276 185.76C675.837 186.202 675.259 186.501 674.586 186.677C673.225 187.033 671.64 186.842 670.592 186.538L643.273 177.542C642.791 177.383 642.283 177.684 642.139 178.213Z');
        ctx.fillStyle = '#8C501D';
        ctx.fill(rim);

        const base = this.getPath2D('M656.678 212C646.362 212 638 202.822 638 191.5C638 186.642 639.54 182.179 642.113 178.666C642.168 179.029 642.406 179.345 642.749 179.458L670.096 188.462L670.11 188.466C671.34 188.826 673.255 189.082 675.009 188.623C675.062 188.609 675.115 188.594 675.168 188.579C675.292 189.533 675.356 190.508 675.356 191.5C675.356 202.822 666.993 212 656.678 212Z');
        ctx.fillStyle = eyeColor;
        ctx.fill(base);

        const pinkLid = this.getPath2D('M674.821 186.61C672.823 177.649 665.458 171 656.678 171C651.294 171 646.443 173.5 643.034 177.5C643.113 177.502 643.194 177.516 643.273 177.542L670.593 186.538C671.64 186.842 673.225 187.033 674.586 186.677C674.666 186.656 674.744 186.634 674.821 186.61Z');
        ctx.fillStyle = '#FFAFA4';
        ctx.fill(pinkLid);

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(648, 191, 5, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'eye_pair_07': {
        // Pair 7: Botão redondo com brilho angular (linhas 56-63 de Face Components.svg)
        ctx.scale(2.4, 2.4);
        ctx.translate(-655, -117.5);
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#8C501D';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(655, 117.5, 22, 19.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = eyeColor;
        ctx.beginPath();
        ctx.ellipse(660.5, 116, 17.5, 18, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFAFA4';
        ctx.beginPath();
        ctx.rect(641.6, 88.7, 45.7, 19);
        ctx.fill();
        break;
      }

      case 'eye_pair_08': {
        // Pair 8: Círculo com 3 cílios inferiores (linhas 72-81 de Face Components.svg)
        ctx.scale(2.4, 2.4);
        ctx.translate(-493, -265);
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#8C501D';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(493, 265, 17, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = eyeColor;
        ctx.beginPath();
        ctx.arc(491, 264, 11, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#8C501D';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(494, 282);
        ctx.lineTo(494, 287);
        ctx.moveTo(504, 277);
        ctx.lineTo(507, 281);
        ctx.moveTo(482, 278);
        ctx.lineTo(479, 282);
        ctx.stroke();
        break;
      }

      case 'eye_pair_09': {
        // Pair 9: Círculo com 3 cílios superiores (linhas 82-91 de Face Components.svg)
        ctx.scale(2.4, 2.4);
        ctx.translate(-493, -191);
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#8C501D';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(493, 191, 17, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = eyeColor;
        ctx.beginPath();
        ctx.arc(491, 190, 11, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#8C501D';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(493, 173);
        ctx.lineTo(493, 168);
        ctx.moveTo(503.6, 177.7);
        ctx.lineTo(506.1, 173.4);
        ctx.moveTo(481.5, 179);
        ctx.lineTo(478.5, 175);
        ctx.stroke();
        break;
      }

      case 'eye_pair_10': {
        // Pair 10: Círculo médio simples com esclera (linhas 92-95 de Face Components.svg)
        ctx.scale(2.4, 2.4);
        ctx.translate(-493, -117);
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#8C501D';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(493, 117, 17, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = eyeColor;
        ctx.beginPath();
        ctx.arc(491, 116, 11, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'eye_pair_11': {
        // Pair 11: Arco sorridente clássico (linhas 96-97 de Face Components.svg)
        ctx.scale(2.4, 2.4);
        ctx.translate(-174, -338);
        const arcPath = this.getPath2D('M159.408 333.664C160.708 336.455 165.544 342.232 174.48 343.014C183.416 343.795 188.743 338.908 190.29 336.366');
        ctx.strokeStyle = '#8C501D';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.stroke(arcPath);
        break;
      }

      case 'eye_pair_12':
      default: {
        // Pair 12: Arco suave para cima (linhas 98-99 de Face Components.svg)
        ctx.scale(2.4, 2.4);
        ctx.translate(-492, -340);
        const arcPath = this.getPath2D('M477.408 345.336C478.708 342.545 483.544 336.768 492.48 335.986C501.416 335.205 506.743 340.092 508.29 342.634');
        ctx.strokeStyle = '#8C501D';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.stroke(arcPath);
        break;
      }
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
      // Vista frontal (south): Flat fill da base do crânio + franja (alinhado ao crânio y = -350)
      ctx.beginPath();
      ctx.arc(0, -160, 350, Math.PI * 1.0, Math.PI * 2.0);
      ctx.fill();

      ctx.save();

      // Para cabelos que possuem mechas longas que passam atrás dos ombros/corpo (hair_curtains_bob, hair_fluffy_afro, hair_long_straight),
      // aplicamos uma máscara de corte (clip) para que na camada frontal apareça apenas a franja/topo do rosto
      if (['hair_curtains_bob', 'hair_fluffy_afro', 'hair_long_straight'].includes(cfg.hairStyle)) {
        ctx.beginPath();
        // Máscara que cobre a cabeça até a altura do nariz/bochechas (y: -500 a 120), não descendo na frente do pescoço/tronco
        ctx.rect(-500, -500, 1000, 620);
        ctx.clip();
      }

      ctx.scale(4.588, 4.588);
      ctx.translate(-hairDef.cx, -hairDef.topY - 100);
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
      // Para cabelos com volume traseiro ou mechas longas atrás do corpo (curtains bob, fluffy afro, long straight, twin braids, etc.)
      if (['hair_curtains_bob', 'hair_fluffy_afro', 'hair_long_straight'].includes(cfg.hairStyle)) {
        ctx.save();
        ctx.scale(4.588, 4.588);
        ctx.translate(-hairDef.cx, -hairDef.topY - 100);
        if (Array.isArray(hairDef.frontPaths)) {
          for (const d of hairDef.frontPaths) {
            const path = this.getPath2D(d);
            ctx.fill(path);
          }
        }
        ctx.restore();
      } else if (Array.isArray(hairDef.backPaths)) {
        for (const bp of hairDef.backPaths) {
          ctx.save();
          ctx.scale(4.588, 4.588);
          ctx.translate(-bp.cx, -bp.topY - 100);
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
        ctx.translate(-bp.cx, -bp.topY - 100);
        const path = this.getPath2D(bp.d);
        ctx.fill(path);
        ctx.restore();
      }
    } else if (Array.isArray(hairDef.frontPaths)) {
      for (const fp of hairDef.frontPaths) {
        ctx.save();
        ctx.scale(4.588, 4.588);
        ctx.translate(-hairDef.cx, -hairDef.topY - 100);
        const path = this.getPath2D(fp);
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
        ctx.moveTo(80, 15);
        ctx.lineTo(-90, 35);
        ctx.stroke();
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.beginPath();
        ctx.ellipse(155, 15, 80, 90, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(90, 15);
        ctx.lineTo(-90, 35);
        ctx.stroke();
      }

    } else {
      // Vista frontal (south)
      if (cfg.glassesStyle === 'sunglasses_cool') {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        [-175, 185].forEach(gx => {
          ctx.beginPath();
          ctx.roundRect(gx - 90, -60, 180, 150, 36);
          ctx.fill();
          ctx.stroke();
        });
        ctx.beginPath();
        ctx.moveTo(-80, 15);
        ctx.lineTo(90, 15);
        ctx.stroke();
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        [-175, 185].forEach(gx => {
          ctx.beginPath();
          ctx.arc(gx, 15, 100, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });
        ctx.beginPath();
        ctx.moveTo(-75, 15);
        ctx.lineTo(85, 15);
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
