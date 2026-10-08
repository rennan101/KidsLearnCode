/**
 * NPCManager.js - KidsLearnCode
 * Gerenciador de IA, Movimentação Autônoma (Wander System) e Comportamento Vivo
 * para NPCs e Heróis na ilha, inspirado em Animal Crossing: New Horizons.
 * 
 * Principais Recursos:
 * - Passeio calmo e orgânico dentro de um raio de convivência (Leash Radius) ao redor da âncora.
 * - Máquina de Estados Finita (FSM): 'idle', 'wander', 'admire', 'talking', 'evade'.
 * - Prevenção absoluta de colisão contra terreno, água, falésias e construções (TileMap AABB).
 * - Evasão suave e respeito ao espaço pessoal do jogador e jogadores remotos (sem esbarrões).
 * - Rotação e foco visual inteligente ao dialogar com o jogador (olha nos olhos).
 * - Piscar de olhos natural e sincronização com o ciclo dia/noite.
 */

import { CharacterRegistry, getNPCData, hasAvailableQuestForNpc } from './CharacterRegistry.js';
import { ModularAvatarRenderer } from './animation/ModularAvatarRenderer.js';
import { MASTER_NPC_CONFIGS } from './animation/NPCAppearanceGenerator.js';
import { DEFAULT_AVATAR_CONFIG } from './animation/AvatarConfig.js';

export class NPCEntity {
  constructor(tileId, gridX, gridY, npcData = null) {
    this.id = tileId;
    this.anchorX = gridX * 64;
    this.anchorY = gridY * 64;
    this.x = this.anchorX;
    this.y = this.anchorY;
    this.targetX = this.x;
    this.targetY = this.y;

    // Dados de Identidade e Aparência
    this.data = npcData || getNPCData(tileId);
    this.name = this.data?.name || tileId;
    this.timeOfDay = this.data?.timeOfDay || 'both'; // 'day' | 'night' | 'both'
    this.avatarConfig = this.data?.avatarConfig || MASTER_NPC_CONFIGS[tileId] || DEFAULT_AVATAR_CONFIG;

    // Estado da FSM: 'idle' | 'wander' | 'admire' | 'talking' | 'evade'
    this.state = 'idle';
    this.direction = ['south', 'north', 'east', 'west'][Math.floor(Math.random() * 4)];
    this.speed = 68 + Math.random() * 24; // Velocidade de caminhada suave e perceptível (68 a 92 px/s)
    this.leashRadius = 384; // Raio máximo de convivência (6 tiles)
    
    // Temporizadores de Comportamento Orgânico (ACNH) - Inicia atividades no mundo imediatamente
    this.stateTimer = 0.1 + Math.random() * 0.4; // Começa a andar imediatamente após spawn
    this.animTimer = Math.random() * 100.0; // Deslocamento para piscar de olhos e passos
    this.stepTimer = 0;

    // Colisor do pé para física (AABB ágil e centralizado)
    this.collider = {
      offsetX: 20,
      offsetY: 48,
      width: 24,
      height: 14
    };

    // Alvo atual de observação / diálogo
    this.interactTarget = null;
    this.pauseAfterDialogueTimer = 0;
  }

  getFeetBox(px = this.x, py = this.y) {
    return {
      x: px + this.collider.offsetX,
      y: py + this.collider.offsetY,
      w: this.collider.width,
      h: this.collider.height
    };
  }

  getCenter(px = this.x, py = this.y) {
    return {
      x: px + 32,
      y: py + 32
    };
  }
}

export class NPCManager {
  constructor(tileMap = null, assetLoader = null) {
    this.tileMap = tileMap;
    this.assetLoader = assetLoader;
    this.avatarRenderer = new ModularAvatarRenderer();
    
    // Mapa de entidades ativas: Map<string, NPCEntity>
    this.entities = new Map();
  }

  /**
   * Sincroniza e descobre todos os NPCs e Heróis posicionados nas camadas do TileMap.
   * Cria instâncias vivas de NPCEntity respeitando suas posições âncora originais e ativando sua IA no mundo vivo.
   */
  syncFromTileMap(tileMap = this.tileMap) {
    if (!tileMap || !tileMap.layers) return;
    this.tileMap = tileMap;

    // 1. Remove automaticamente quaisquer NPCs ou Heróis que estejam em células de água
    if (typeof tileMap.removeCharactersOnWater === 'function') {
      tileMap.removeCharactersOnWater(this.assetLoader);
    }

    const discoveredKeys = new Set();
    const discoveredTileIds = new Set();
    const layersToCheck = ['characters', 'solid', 'decor'];

    for (const layerName of layersToCheck) {
      const layer = tileMap.layers[layerName];
      if (!layer) continue;

      for (const [key, cell] of layer.entries()) {
        const tileId = (typeof cell === 'object' && cell !== null) ? cell.tileId : (typeof cell === 'string' ? cell : null);
        if (!tileId || typeof tileId !== 'string') continue;

        const lower = tileId.toLowerCase();
        // Ignora totalmente dragões (gerenciados exclusivamente pelo DragonManager)
        if (lower.startsWith('dragon_') || lower.startsWith('dragon-') || lower.includes('dragon')) {
          continue;
        }

        const isChar = (layerName === 'characters') || 
          lower.startsWith('npc_') || lower.startsWith('char_') || 
          lower.startsWith('npc-') || lower.startsWith('char-') || 
          lower.startsWith('hero_') || lower.startsWith('hero-') ||
          !!MASTER_NPC_CONFIGS[tileId] ||
          (cell && cell.isCharacter);

        if (isChar) {
          const [tx, ty] = key.split(',').map(Number);
          const worldCenterX = tx * (tileMap.tileSize || 64) + 32;
          const worldCenterY = ty * (tileMap.tileSize || 64) + 32;

          // Ignora se estiver na água
          if (tileMap.isWaterAt && tileMap.isWaterAt(worldCenterX, worldCenterY, this.assetLoader)) {
            layer.delete(key);
            continue;
          }

          // Se for NPC Mestre/Herói com identidade única e já foi descoberto em outra camada, remove a duplicata residual
          const isMasterNpc = lower.startsWith('npc_') || !!MASTER_NPC_CONFIGS[tileId];
          if (isMasterNpc && discoveredTileIds.has(tileId)) {
            if (layerName !== 'characters') {
              layer.delete(key); // Limpa resíduo duplicado em solid ou decor
            }
            continue;
          }

          const entityKey = isMasterNpc ? tileId : `${tileId}_${tx}_${ty}`;
          discoveredKeys.add(entityKey);
          discoveredTileIds.add(tileId);

          if (!this.entities.has(entityKey)) {
            // Verifica se já existe por ID antes de criar
            let existingEntity = null;
            for (const ent of this.entities.values()) {
              if (ent.id === tileId) {
                existingEntity = ent;
                break;
              }
            }

            if (existingEntity) {
              // Reutiliza entidade existente preservando sua posição atual de caminhada
              this.entities.set(entityKey, existingEntity);
            } else {
              const npcData = getNPCData(tileId);
              const entity = new NPCEntity(tileId, tx, ty, npcData);
              this.entities.set(entityKey, entity);
            }
          }
        }
      }
    }

    // Remove entidades que foram apagadas do mapa pelo editor
    for (const [entityKey, ent] of this.entities.entries()) {
      if (!discoveredKeys.has(entityKey) && !discoveredTileIds.has(ent.id)) {
        this.entities.delete(entityKey);
      }
    }
  }

  /**
   * Atualiza a IA, movimentação contínua, desvio e prevenção de colisões de todos os NPCs.
   */
  update(deltaTime, player, multiplayerClient = null, dayNightSystem = null, tileMap = this.tileMap) {
    if (this.entities.size === 0) return;
    const dt = Math.min(deltaTime / 1000, 0.1);

    // Coleta caixas de colisão de pés de todos os jogadores
    const playerFeetBoxes = [];
    if (player) {
      if (typeof player.getFeetBox === 'function') {
        playerFeetBoxes.push(player.getFeetBox());
      } else {
        playerFeetBoxes.push({ x: player.x + 18, y: player.y + 48, w: 28, h: 16 });
      }
    }

    if (multiplayerClient) {
      const remoteList = multiplayerClient.isConnected 
        ? Array.from(multiplayerClient.remotePlayers.values()) 
        : (multiplayerClient.simulatedBots || []);
      for (const rp of remoteList) {
        playerFeetBoxes.push({ x: rp.x + 18, y: rp.y + 48, w: 28, h: 16 });
      }
    }

    for (const [, npc] of this.entities) {
      if (npc.state === 'wander' || npc.state === 'evade') {
        npc.animTimer += dt * (npc.speed / 45);
      } else {
        npc.animTimer += dt;
      }

      // 1. Tratamento de Diálogo Ativo
      if (npc.state === 'talking') {
        // Encarar o jogador enquanto conversa
        if (player) {
          npc.direction = this.getDirectionTowards(npc.x, npc.y, player.x, player.y);
        }
        continue;
      }

      // Reduz temporizador de pausa pós-diálogo
      if (npc.pauseAfterDialogueTimer > 0) {
        npc.pauseAfterDialogueTimer -= dt;
        continue;
      }

      npc.stateTimer -= dt;

      // 2. Máquina de Estados (FSM) de Passeio Animal Crossing
      switch (npc.state) {
        case 'idle':
        case 'admire': {
          if (npc.stateTimer <= 0) {
            // Decide a próxima ação: 92% de chance de iniciar novo passeio pela ilha
            const roll = Math.random();
            if (roll < 0.92) {
              this.pickWanderDestination(npc, tileMap, playerFeetBoxes);
            } else {
              // Olha para uma direção aleatória e contempla a ilha
              const dirs = ['south', 'north', 'east', 'west'];
              npc.direction = dirs[Math.floor(Math.random() * dirs.length)];
              npc.state = 'idle';
              npc.stateTimer = 0.4 + Math.random() * 0.7;
            }
          }
          break;
        }

        case 'wander': {
          const dx = npc.targetX - npc.x;
          const dy = npc.targetY - npc.y;
          const dist = Math.hypot(dx, dy);

          if (dist < 2.5 || npc.stateTimer <= 0) {
            // Chegou ao destino com sucesso
            npc.x = npc.targetX;
            npc.y = npc.targetY;
            npc.state = 'idle';
            npc.stateTimer = 0.3 + Math.random() * 0.8;
            break;
          }

          // Movimentação suave contínua em passos
          const stepDist = npc.speed * dt;
          const moveX = (dx / dist) * Math.min(stepDist, dist);
          const moveY = (dy / dist) * Math.min(stepDist, dist);

          // Atualiza direção principal do movimento
          if (Math.abs(dx) > Math.abs(dy)) {
            npc.direction = dx > 0 ? 'east' : 'west';
          } else {
            npc.direction = dy > 0 ? 'south' : 'north';
          }

          const nextX = npc.x + moveX;
          const nextY = npc.y + moveY;

          // Verificação de Colisão com Terreno, Jogadores e Outros NPCs
          const isTerrainBlocked = this.checkTerrainCollision(npc, nextX, nextY, tileMap);
          const isPlayerBlocked = this.checkPlayerProximity(npc, nextX, nextY, playerFeetBoxes);
          const isOtherNpcBlocked = this.checkOtherNpcProximity(npc, nextX, nextY);

          if (isTerrainBlocked || isPlayerBlocked || isOtherNpcBlocked) {
            // Obstáculo detectado: conclui o passo e entra em breve idle antes de nova rota
            npc.state = 'idle';
            npc.stateTimer = 0.2 + Math.random() * 0.5;
            break;
          }

          npc.x = nextX;
          npc.y = nextY;
          break;
        }

        case 'evade': {
          if (npc.stateTimer <= 0) {
            npc.state = 'idle';
            npc.stateTimer = 0.3 + Math.random() * 0.6;
          }
          break;
        }
      }
    }
  }

  /**
   * Escolhe um destino viável de passeio dentro do raio de convivência (Leash Radius)
   * explorando 8 direções e múltiplos tamanhos de passos.
   */
  pickWanderDestination(npc, tileMap, playerFeetBoxes) {
    const distances = [32, 48, 64, 24, 80, 96, 128];
    const distToAnchor = Math.hypot(npc.x - npc.anchorX, npc.y - npc.anchorY);

    for (const d of distances) {
      const diagDist = d * 0.7071;
      const candidateDirections = [
        { dir: 'south', dx: 0, dy: d },
        { dir: 'north', dx: 0, dy: -d },
        { dir: 'east', dx: d, dy: 0 },
        { dir: 'west', dx: -d, dy: 0 },
        { dir: 'south', dx: diagDist, dy: diagDist },
        { dir: 'south', dx: -diagDist, dy: diagDist },
        { dir: 'north', dx: diagDist, dy: -diagDist },
        { dir: 'north', dx: -diagDist, dy: -diagDist }
      ];

      // Se estiver se afastando da âncora (> 55% do leash), prioriza direções que voltam para a âncora
      if (distToAnchor > npc.leashRadius * 0.55) {
        candidateDirections.sort((a, b) => {
          const distA = Math.hypot((npc.x + a.dx) - npc.anchorX, (npc.y + a.dy) - npc.anchorY);
          const distB = Math.hypot((npc.x + b.dx) - npc.anchorX, (npc.y + b.dy) - npc.anchorY);
          return distA - distB;
        });
      } else {
        // Embaralha para passeios orgânicos e imprevisíveis
        candidateDirections.sort(() => Math.random() - 0.5);
      }

      for (const cand of candidateDirections) {
        const targetX = npc.x + cand.dx;
        const targetY = npc.y + cand.dy;

        // Verifica limite de afastamento da âncora
        const candDistToAnchor = Math.hypot(targetX - npc.anchorX, targetY - npc.anchorY);
        if (candDistToAnchor > npc.leashRadius) continue;

        // Verifica colisão no ponto de destino e no meio do caminho
        let pathBlocked = false;
        const checkSteps = 2;
        for (let s = 1; s <= checkSteps; s++) {
          const stepX = npc.x + (cand.dx * s / checkSteps);
          const stepY = npc.y + (cand.dy * s / checkSteps);
          if (
            this.checkTerrainCollision(npc, stepX, stepY, tileMap) ||
            this.checkPlayerProximity(npc, stepX, stepY, playerFeetBoxes) ||
            this.checkOtherNpcProximity(npc, stepX, stepY)
          ) {
            pathBlocked = true;
            break;
          }
        }

        if (!pathBlocked) {
          npc.targetX = targetX;
          npc.targetY = targetY;
          npc.direction = cand.dir;
          npc.state = 'wander';
          const walkDist = Math.hypot(cand.dx, cand.dy);
          npc.stateTimer = (walkDist / npc.speed) + 1.0; // Tempo estimado de viagem + margem segura
          return;
        }
      }
    }

    // Se nenhuma direção for viável de imediato, faz uma breve pausa
    npc.state = 'idle';
    npc.stateTimer = 0.3 + Math.random() * 0.6;
  }

  /**
   * Checagem de colisão contra terreno e camadas com colisores físicos do TileMap.
   * Leva em consideração água, magma, limites configurados e camadas físicas ('colliders' e 'solid'),
   * ignorando personagens dinâmicos para permitir movimentação viva desimpedida.
   */
  checkTerrainCollision(npc, px, py, tileMap, assetLoader = this.assetLoader) {
    if (!tileMap) return false;

    const feet = npc.getFeetBox(px, py);

    // 1. Limites explícitos do mapa se definidos
    if (tileMap.minX !== undefined && feet.x < tileMap.minX * (tileMap.tileSize || 64)) return true;
    if (tileMap.minY !== undefined && feet.y < tileMap.minY * (tileMap.tileSize || 64)) return true;
    if (tileMap.maxX !== undefined && feet.x + feet.w > tileMap.maxX * (tileMap.tileSize || 64)) return true;
    if (tileMap.maxY !== undefined && feet.y + feet.h > tileMap.maxY * (tileMap.tileSize || 64)) return true;

    // 2. Verifica se a posição central dos pés está na água ou magma
    const centerFeetX = feet.x + feet.w / 2;
    const centerFeetY = feet.y + feet.h / 2;
    if (tileMap.isWaterAt && tileMap.isWaterAt(centerFeetX, centerFeetY, assetLoader)) {
      return true; // Água / mar bloqueia passagem
    }

    // 3. Verifica se há suporte de chão sob os pés do NPC (impede andar no vácuo se não houver ground nem ponte)
    const tx = Math.floor(centerFeetX / (tileMap.tileSize || 64));
    const ty = Math.floor(centerFeetY / (tileMap.tileSize || 64));
    const key = tileMap.getKey(tx, ty);
    const groundCell = tileMap.layers?.ground?.get(key);
    if (!groundCell) {
      const upperLayers = ['solid', 'decor', 'overhead'];
      let hasSupport = false;
      for (const lName of upperLayers) {
        if (tileMap.layers?.[lName]?.has(key)) {
          hasSupport = true;
          break;
        }
      }
      if (!hasSupport) return true; // Abismo / vácuo sem terreno
    }

    // 4. Verifica colisores AABB de camadas físicas reais
    if (typeof tileMap.checkCollision === 'function') {
      const isSolidBlocked = tileMap.checkCollision(
        feet.x,
        feet.y,
        feet.w,
        feet.h,
        assetLoader,
        false,
        ['colliders', 'solid'],
        true // ignoreCharacters = true
      );
      if (isSolidBlocked) return true;
    }

    return false;
  }

  /**
   * Prevenção de esbarrões contra o jogador principal e outros jogadores (AABB nos pés com escape inteligente).
   */
  checkPlayerProximity(npc, px, py, playerFeetBoxes) {
    if (!playerFeetBoxes || playerFeetBoxes.length === 0) return false;
    const feet = npc.getFeetBox(px, py);
    const curFeet = npc.getFeetBox(npc.x, npc.y);

    for (const pf of playerFeetBoxes) {
      const isOverlapping = (
        feet.x < pf.x + pf.w &&
        feet.x + feet.w > pf.x &&
        feet.y < pf.y + pf.h &&
        feet.y + feet.h > pf.y
      );
      if (isOverlapping) {
        // Se já estiver em contato/sobreposição, permite passos que aumentem o afastamento
        const curDist = Math.hypot(curFeet.x - pf.x, curFeet.y - pf.y);
        const newDist = Math.hypot(feet.x - pf.x, feet.y - pf.y);
        if (newDist >= curDist) {
          continue; // Afastando-se do jogador: permitido!
        }
        return true; // Indo de encontro ao jogador: bloqueia
      }
    }
    return false;
  }

  /**
   * Prevenção de sobreposição entre NPCs diferentes (AABB nos pés com escape inteligente).
   */
  checkOtherNpcProximity(currentNpc, px, py) {
    const feet = currentNpc.getFeetBox(px, py);
    const curFeet = currentNpc.getFeetBox(currentNpc.x, currentNpc.y);

    for (const [, other] of this.entities) {
      if (other === currentNpc) continue;
      const ofeet = other.getFeetBox();
      const isOverlapping = (
        feet.x < ofeet.x + ofeet.w &&
        feet.x + feet.w > ofeet.x &&
        feet.y < ofeet.y + ofeet.h &&
        feet.y + feet.h > ofeet.y
      );
      if (isOverlapping) {
        const curDist = Math.hypot(curFeet.x - ofeet.x, curFeet.y - ofeet.y);
        const newDist = Math.hypot(feet.x - ofeet.x, feet.y - ofeet.y);
        if (newDist >= curDist) {
          continue; // Afastando-se de outro NPC: permitido!
        }
        return true;
      }
    }
    return false;
  }

  /**
   * Calcula a direção cardinal ('south', 'north', 'east', 'west') entre duas coordenadas.
   */
  getDirectionTowards(fromX, fromY, toX, toY) {
    const dx = toX - fromX;
    const dy = toY - fromY;
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'east' : 'west';
    } else {
      return dy > 0 ? 'south' : 'north';
    }
  }

  /**
   * Inicia o estado de conversa com o NPC, travando-o no lugar e encarando o jogador.
   */
  startDialogue(npcId, playerX, playerY) {
    for (const [, npc] of this.entities) {
      if (npc.id === npcId || npc.name === npcId || (npcId && (npc.id === npcId.id || npc.id === npcId.tileId))) {
        npc.state = 'talking';
        npc.direction = this.getDirectionTowards(npc.x, npc.y, playerX, playerY);
        npc.targetX = npc.x;
        npc.targetY = npc.y;
        return npc;
      }
    }
    return null;
  }

  /**
   * Finaliza o diálogo e relaxa o NPC com uma breve pausa antes de retomar o passeio.
   */
  endDialogue(npcId) {
    for (const [, npc] of this.entities) {
      if (npc.id === npcId || npc.name === npcId || (npcId && (npc.id === npcId.id || npc.id === npcId.tileId))) {
        npc.state = 'idle';
        npc.pauseAfterDialogueTimer = 2.0;
        npc.stateTimer = 2.5 + Math.random() * 3.0;
        return;
      }
    }
  }

  /**
   * Busca o NPC mais próximo dentro de um raio a partir de coordenadas no mundo em tempo real.
   */
  findNearbyNPC(worldX, worldY, radius = 110) {
    let nearest = null;
    let minDistance = radius;

    for (const [, npc] of this.entities) {
      const npcCenterX = npc.x + 32;
      const npcCenterY = npc.y + 32;
      const dist = Math.hypot(npcCenterX - (worldX + 32), npcCenterY - (worldY + 32));

      if (dist <= minDistance) {
        minDistance = dist;
        nearest = {
          ...npc.data,
          id: npc.id,
          tileId: npc.id,
          name: npc.name,
          worldX: npc.x,
          worldY: npc.y,
          tx: Math.floor(npc.x / 64),
          ty: Math.floor(npc.y / 64),
          entityRef: npc
        };
      }
    }
    return nearest;
  }

  /**
   * Retorna todas as entidades para serem incluídas na ordenação de profundidade (Y-Sort).
   */
  getEntities() {
    return Array.from(this.entities.values());
  }

  /**
   * Renderiza um NPC dinâmico completo no mundo com sombra, avatar modular e overhead badges.
   */
  renderNPCEntity(ctx, npc, isReflection = false, player = null, blocklySystem = null) {
    const avatarScale = 0.33;
    const targetX = npc.x + 32;
    const targetY = npc.y + 60 - (265 * avatarScale);
    const animState = (npc.state === 'wander' || npc.state === 'evade') ? 'walk' : 'idle';

    // 0. Sombra suave nos pés (omitida em reflexos)
    if (!isReflection) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(Math.round(npc.x + 32), Math.round(npc.y + 60), 16, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 1. Renderiza o Avatar Modular com animações e piscar de olhos
    this.avatarRenderer.render(
      ctx,
      targetX,
      targetY,
      npc.direction,
      animState,
      npc.animTimer,
      npc.avatarConfig || DEFAULT_AVATAR_CONFIG,
      avatarScale
    );

    // 2. Overhead NPC Name Badge & Quest Indicators (Omitido em reflexos de água)
    if (!isReflection) {
      ctx.save();
      const nameText = npc.name || 'Aldeão';
      ctx.font = 'bold 10.5px "Nunito", sans-serif';
      const textMetrics = ctx.measureText(nameText);
      const badgeW = Math.max(44, textMetrics.width + 16);
      const badgeH = 18;
      const badgeX = npc.x + 32 - badgeW / 2;
      const badgeY = npc.y - 58; // Posicionado confortavelmente acima da cabeça

      // Badge shadow 3D
      ctx.fillStyle = '#7a583e';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(badgeX, badgeY + 2.5, badgeW, badgeH, 9);
      } else {
        ctx.rect(badgeX, badgeY + 2.5, badgeW, badgeH);
      }
      ctx.fill();

      // Badge body
      ctx.fillStyle = '#fdfbf7';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 9);
      } else {
        ctx.rect(badgeX, badgeY, badgeW, badgeH);
      }
      ctx.fill();

      // Badge border mint
      ctx.strokeStyle = '#19c8b9';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Badge text (marrom terra aconchegante)
      ctx.fillStyle = '#794f27';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(nameText, npc.x + 32, badgeY + badgeH / 2);

      // Quest indicator (! dourado flutuante para mestres com desafios pendentes)
      const hasQuest = hasAvailableQuestForNpc(npc.id, blocklySystem);

      // Distância do jogador para exibir prompt de interação [E]
      let isPlayerNearby = false;
      if (player) {
        const pDist = Math.hypot((player.x + 32) - (npc.x + 32), (player.y + 32) - (npc.y + 32));
        isPlayerNearby = (pDist <= 110);
      }

      if (hasQuest) {
        const bounce = Math.sin(npc.animTimer * 4) * 3;
        // Se o [E] estiver ativo, o "!" fica deslocado à esquerda (-14px)
        const questX = isPlayerNearby ? (npc.x + 32 - 14) : (npc.x + 32);
        const questY = badgeY - 14 + bounce;

        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(questX, questY, 7.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('!', questX, questY);
      }

      // Prompt de Tecla [E] Flutuante (100% fisicamente atrelado ao NPC vivo)
      if (isPlayerNearby) {
        const bob = Math.sin(performance.now() / 160) * 2.5;
        const promptX = hasQuest ? (npc.x + 32 + 14) : (npc.x + 32);
        const promptY = badgeY - 15 + bob;
        const btnSize = 22;
        const bx = promptX - btnSize / 2;
        const by = promptY - btnSize / 2;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(bx, by + 2.5, btnSize, btnSize, 11);
        else ctx.rect(bx, by + 2.5, btnSize, btnSize);
        ctx.fill();

        // 3D edge
        ctx.fillStyle = '#0f766e';
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(bx, by + 1.8, btnSize, btnSize, 11);
        else ctx.rect(bx, by + 1.8, btnSize, btnSize);
        ctx.fill();

        // Button face
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(bx, by, btnSize, btnSize, 11);
        else ctx.rect(bx, by, btnSize, btnSize);
        ctx.fill();

        // Border mint
        ctx.strokeStyle = '#19c8b9';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Indicator notch pointing down
        ctx.fillStyle = '#19c8b9';
        ctx.beginPath();
        ctx.moveTo(promptX - 3.5, by + btnSize - 0.5);
        ctx.lineTo(promptX, by + btnSize + 3);
        ctx.lineTo(promptX + 3.5, by + btnSize - 0.5);
        ctx.fill();

        // Text 'E'
        ctx.fillStyle = '#0f766e';
        ctx.font = '900 11.5px "JetBrains Mono", "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('E', promptX, promptY);
      }

      ctx.restore();
    }
  }
}

export default NPCManager;
