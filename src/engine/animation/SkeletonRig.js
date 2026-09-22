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
        if (effectiveDir === 'south' || effectiveDir === 'north') {
          // CAMINHADA FRENTE / COSTAS: Pés sobem e descem (movimento vertical puro de elevação/pisada, sem ir para os lados)
          const bob = Math.abs(sinPhase) * bobAmp;
          pose.root.y += -bob;
          pose.root.rot = 0; // Sem waddle lateral
          pose.head.bobY = -bob * 0.7;
          pose.head.rot = 0;

          // Elevação e descida alternada estrita dos pés (passo para cima e para baixo)
          const stepLiftL = Math.max(0, -sinPhase);
          const stepLiftR = Math.max(0, sinPhase);

          pose.hip_l.rot = 0;
          pose.hip_r.rot = 0;
          pose.leg_l.rot = 0;
          pose.leg_r.rot = 0;

          // Translação vertical pura da perna/pé subindo e descendo
          pose.hip_l.y = 6 - (stepLiftL * 9);
          pose.hip_r.y = 6 - (stepLiftR * 9);

          // Braços oscilam suavemente na vertical/frontal
          pose.arm_l.rot = -sinPhase * (armAmp * 0.5);
          pose.arm_r.rot = sinPhase * (armAmp * 0.5);

        } else {
          // CAMINHADA DIREITA / ESQUERDA (LATERAL): Cabeça e torso NÃO se movem (fixos em 0). Apenas pernas e braços se movem!
          const sidePhase = Math.sin(phase);
          pose.root.y = 38; // Posição Y fixa do torso
          pose.root.rot = 0; // Sem rotação do tronco
          pose.head.bobY = 0; // Cabeça estática sem bobbing
          pose.head.rot = 0; // Cabeça estática sem rotação

          // Perna esquerda e direita balançam para um lado e para o outro
          pose.hip_l.rot = -sidePhase * legAmp;
          pose.hip_r.rot = sidePhase * legAmp;
          pose.leg_l.rot = sidePhase > 0 ? Math.abs(sidePhase) * 0.35 : 0;
          pose.leg_r.rot = sidePhase < 0 ? Math.abs(sidePhase) * 0.35 : 0;

          // Braços balançando de um lado para o outro em oposição
          pose.arm_l.rot = sidePhase * armAmp;
          pose.arm_r.rot = -sidePhase * armAmp;
        }
        pose.shadow.scale = 1.0;
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
