/**
 * SkeletonRig.js - KidsLearnCode
 * Esqueleto 2D e motor de curvas de animação procedural por Cutout/Paper-Doll.
 * 
 * Fornece a matriz de transformação de cada articulação para renderização em tempo real:
 * - root (pelve/quadril)
 * - torso (tronco)
 * - head (cabeça e face)
 * - arm_left, hand_left (braço esquerdo)
 * - arm_right, hand_right (braço direito)
 * - leg_left, foot_left (perna esquerda)
 * - leg_right, foot_right (perna direita)
 */

export class SkeletonRig {
  constructor() {
    this.bones = {};
  }

  /**
   * Calcula a pose atual do esqueleto com base no estado e no timer de animação.
   * @param {string} state - 'idle' | 'walk' | 'run' | 'craft' | 'riding' | 'celebrate'
   * @param {string} direction - 'south' | 'north' | 'east' | 'west'
   * @param {number} time - Tempo decorrido em segundos
   * @returns {Object} Mapa de ossos transformados com rotações (rad), translações (px) e zIndex
   */
  evaluate(state = 'idle', direction = 'south', time = 0) {
    const isWest = direction === 'west';
    const effectiveDir = isWest ? 'east' : direction; // 'west' usa o 'east' espelhado com flipX no renderer
    
    // Frequência e amplitudes de acordo com a animação
    let walkFreq = 8.0;   // Hz do ciclo de passos
    let legAmp = 0.55;    // Ângulo de oscilação das pernas (rad)
    let armAmp = 0.50;    // Ângulo de oscilação dos braços (rad)
    let bobAmp = 2.0;     // Balanço vertical da cabeça/corpo (px)
    let bodyTilt = 0.0;   // Inclinação frontal do corpo
    
    if (state === 'run') {
      walkFreq = 14.0;
      legAmp = 0.85;
      armAmp = 0.90;
      bobAmp = 3.5;
      bodyTilt = effectiveDir === 'east' ? 0.22 : 0.08;
    }

    const phase = time * walkFreq;
    const sinPhase = Math.sin(phase);
    const cosPhase = Math.cos(phase);

    // Estrutura de ossos padrão
    const pose = {
      root: { x: 32, y: 38, rot: 0, scaleX: 1, scaleY: 1 },
      torso: { x: 0, y: -4, rot: 0 },
      head: { x: 0, y: -18, rot: 0, bobY: 0 },
      shoulder_l: { x: -10, y: -12, rot: 0 },
      arm_l: { x: 0, y: 6, rot: 0 },
      hand_l: { x: 0, y: 10, rot: 0 },
      shoulder_r: { x: 10, y: -12, rot: 0 },
      arm_r: { x: 0, y: 6, rot: 0 },
      hand_r: { x: 0, y: 10, rot: 0 },
      hip_l: { x: -6, y: 6, rot: 0 },
      leg_l: { x: 0, y: 8, rot: 0 },
      foot_l: { x: 0, y: 9, rot: 0 },
      hip_r: { x: 6, y: 6, rot: 0 },
      leg_r: { x: 0, y: 8, rot: 0 },
      foot_r: { x: 0, y: 9, rot: 0 },
      shadow: { scale: 1.0 }
    };

    switch (state) {
      case 'idle': {
        const breathe = Math.sin(time * 3.0);
        pose.root.y += breathe * 0.8;
        pose.head.bobY = breathe * 0.6;
        pose.head.rot = Math.sin(time * 1.5) * 0.03;
        
        if (effectiveDir === 'east') {
          // Idle de perfil: braço dianteiro e traseiro levemente inclinados
          pose.arm_l.rot = 0.12 + breathe * 0.04;
          pose.arm_r.rot = 0.06 + breathe * 0.03;
        } else {
          // Idle frontal e costas
          pose.arm_l.rot = 0.08 + breathe * 0.04;
          pose.arm_r.rot = -0.08 - breathe * 0.04;
        }
        pose.leg_l.rot = 0;
        pose.leg_r.rot = 0;
        pose.shadow.scale = 1.0 - breathe * 0.03;
        break;
      }

      case 'walk':
      case 'run': {
        if (effectiveDir === 'south') {
          // CAMINHADA SUL (Frontal): Waddle Chibi acolhedor com balanceio lateral e elevação alternada
          const waddle = Math.sin(phase) * 0.08;
          pose.root.y += -Math.abs(sinPhase) * (bobAmp * 0.9);
          pose.root.rot = waddle;
          pose.head.bobY = -Math.abs(sinPhase) * (bobAmp * 0.6);
          pose.head.rot = -waddle * 0.7;

          // Pernas com elevação e passada frontal
          pose.hip_l.rot = sinPhase * (legAmp * 0.55);
          pose.hip_r.rot = -sinPhase * (legAmp * 0.55);
          pose.leg_l.rot = Math.max(0, -sinPhase) * 0.35;
          pose.leg_r.rot = Math.max(0, sinPhase) * 0.35;

          // Braços balançando alternadamente
          pose.arm_l.rot = -sinPhase * (armAmp * 0.75);
          pose.arm_r.rot = sinPhase * (armAmp * 0.75);

        } else if (effectiveDir === 'north') {
          // CAMINHADA NORTE (Costas): Passadas firmes com passos apontando para frente
          pose.root.y += -Math.abs(sinPhase) * (bobAmp * 0.85);
          pose.root.rot = -Math.sin(phase) * 0.05;
          pose.head.bobY = -Math.abs(sinPhase) * (bobAmp * 0.55);
          pose.head.rot = Math.sin(phase) * 0.04;

          pose.hip_l.rot = sinPhase * (legAmp * 0.5);
          pose.hip_r.rot = -sinPhase * (legAmp * 0.5);
          pose.leg_l.rot = Math.max(0, sinPhase) * 0.3;
          pose.leg_r.rot = Math.max(0, -sinPhase) * 0.3;

          pose.arm_l.rot = sinPhase * (armAmp * 0.7);
          pose.arm_r.rot = -sinPhase * (armAmp * 0.7);

        } else {
          // CAMINHADA LESTE / OESTE (Perfil / Lateral): Ciclo de passada em tesoura clássico com stride e flexão de joelho
          pose.root.y += -Math.abs(sinPhase) * bobAmp;
          pose.root.rot = bodyTilt + (sinPhase * 0.04);
          pose.head.bobY = -Math.abs(sinPhase) * (bobAmp * 0.75);
          pose.head.rot = -sinPhase * 0.05;

          // Movimento em tesoura das pernas (stride amplo)
          pose.hip_l.rot = -sinPhase * legAmp;       // Perna traseira (esquerda)
          pose.hip_r.rot = sinPhase * legAmp;        // Perna dianteira (direita)

          // Flexão do joelho quando a perna é levantada/recolhida
          pose.leg_l.rot = sinPhase > 0 ? Math.abs(sinPhase) * 0.7 : 0;
          pose.leg_r.rot = sinPhase < 0 ? Math.abs(sinPhase) * 0.7 : 0;

          // Balanço oposto de braços com alcance completo de perfil
          pose.arm_l.rot = sinPhase * armAmp;        // Braço traseiro
          pose.arm_r.rot = -sinPhase * armAmp;       // Braço dianteiro
        }
        pose.shadow.scale = 1.0 - Math.abs(sinPhase) * 0.12;
        break;
      }

      case 'craft': {
        // Personagem trabalhando na bancada (braços ativos na frente)
        const craftFast = Math.sin(time * 16.0);
        pose.root.y += Math.abs(craftFast) * 1.5;
        pose.head.bobY = Math.abs(craftFast) * 1.2;
        pose.head.rot = Math.sin(time * 8.0) * 0.08;
        pose.arm_l.rot = -0.7 + craftFast * 0.35;
        pose.arm_r.rot = 0.7 - craftFast * 0.35;
        pose.hand_l.rot = craftFast * 0.4;
        pose.hand_r.rot = -craftFast * 0.4;
        break;
      }

      case 'riding': {
        // Posição sentada adaptada para montar dragões
        pose.root.y += 2;
        pose.hip_l.rot = 0.8;  // Pernas dobradas para a sela
        pose.hip_r.rot = 0.8;
        pose.leg_l.rot = -0.6;
        pose.leg_r.rot = -0.6;
        pose.arm_l.rot = -0.5; // Braços estendidos segurando rédeas
        pose.arm_r.rot = -0.5;
        break;
      }

      case 'celebrate': {
        // Pulo alegre com as duas mãos levantadas
        const jump = Math.abs(Math.sin(time * 6.0));
        pose.root.y += -jump * 8.0;
        pose.head.bobY = -jump * 2.0;
        pose.head.rot = Math.sin(time * 12.0) * 0.1;
        pose.arm_l.rot = -2.4 + Math.sin(time * 12.0) * 0.3; // Braço para cima
        pose.arm_r.rot = 2.4 - Math.sin(time * 12.0) * 0.3;  // Braço para cima
        pose.hip_l.rot = jump * 0.3;
        pose.hip_r.rot = -jump * 0.3;
        pose.shadow.scale = Math.max(0.4, 1.0 - jump * 0.4);
        break;
      }
    }

    return pose;
  }
}
