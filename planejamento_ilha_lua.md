# Documento de Design de Jogo (GDD) e Roadmap de Desenvolvimento
## Projeto: MMO Educativo 3D (Baseado em Three.js)

### 1. Visão Geral do Projeto
Um jogo multiplayer massivo (MMO) de simulação de vida rodando diretamente no navegador (Web), utilizando **Three.js** para renderização 3D. O jogo possui uma estética lúdica e mecânicas de construção baseadas em *Animal Crossing: New Horizons*.
O diferencial principal é o **foco no Pensamento Computacional**: todas as ações de conquista de recursos, itens e interações com a fauna exigem a resolução de desafios de programação visual (blocos que geram código Lua, semelhante ao Scratch).

---

### 2. Repositório de Assets
Todos os modelos 3D, texturas, sprites de interface e efeitos sonoros devem ser organizados seguindo o caminho base abaixo.
*   **Caminho da Pasta Local/Servidor:** `[INSERIR CAMINHO DA PASTA DE ASSETS AQUI]`
*   *Recomendação de estrutura:*
    *   `/models` (Casas, tendas, árvores, móveis)
    *   `/textures` (Materiais estilizados *low-poly/hand-painted*)
    *   `/ui` (Ícones do inventário, blocos de programação)
    *   `/audio` (Músicas ambientes, efeitos de *crafting* e sucesso)

---

### 3. Mecânicas Principais (Core Gameplay Loop)
1. **A Ilha Compartilhada (MMO):**
   * Todos os jogadores iniciam na mesma ilha central.
   * Eles podem ver os avatares uns dos outros se movimentando em tempo real.
2. **Housing e Instanciamento:**
   * O jogador começa com uma tenda.
   * Transição fluida (ou loading curto) para entrar no interior da residência.
   * Sistema de *Grid* para posicionar e rotacionar móveis, seguindo regras rígidas de colisão (estilo Animal Crossing).
   * Upgrades da residência expandem o tamanho do grid interior.
3. **Expansão da Ilha:**
   * Contribuições coletivas (ou missões pessoais) permitem liberar pontes ou novas áreas da ilha.
4. **Atividades de Coleta:**
   * Pesquisa, captura de insetos e pesca.

---

### 4. Sistema Educativo e Desafios (Blockly -> Lua)
Para garantir que o aprendizado seja progressivo e evite frustrações, o sistema utilizará uma interface de blocos visuais (como o *Google Blockly*) adaptada para gerar lógica em **Lua**. O jogador abre uma interface sobreposta (HUD) para "hackear" ou "invocar" a ação.

#### Trilha de Aprendizado (Curva de Dificuldade):
*   **Nível 1 (Básico): Instanciar e Variáveis Simples**
    *   *Objetivo:* Obter o primeiro móvel para a tenda.
    *   *Desafio:* Declarar uma variável para o objeto e usar uma função para instanciá-lo.
    *   *Conceitos:* `var cadeira = "madeira"; criar(cadeira);`
*   **Nível 2: Condicionais (If/Else) e Inputs**
    *   *Objetivo:* Pescar um peixe ou capturar um inseto que está fugindo.
    *   *Desafio:* Criar uma lógica que verifica se a rede/vara foi lançada no momento certo (capturando input do mouse).
    *   *Conceitos:* `se (mouse_clicado e peixe_perto) entao capturar(); senao esperar();`
*   **Nível 3: Manipulação de Variáveis e Matemática Básica**
    *   *Objetivo:* Melhorar a tenda para uma casa.
    *   *Desafio:* Somar os recursos coletados na ilha e verificar se atingiram o valor necessário.
*   **Nível 4: Loops (For / While)**
    *   *Objetivo:* Plantar uma fileira de árvores ou expandir um terreno cercado.
    *   *Desafio:* Usar um laço de repetição para instanciar a cerca X vezes em vez de colocar bloco por bloco.
    *   *Conceitos:* `para i de 1 ate 5 faca criar("cerca", i);`
*   **Nível 5: Funções (Reaproveitamento de código)**
    *   *Objetivo:* Automatizar a rega de plantas na ilha.
    *   *Desafio:* Criar uma função `regarPlantas()` e chamá-la em diferentes canteiros.
*   **Nível 6 (Avançado): Foreach / Iteração em Listas**
    *   *Objetivo:* Organizar o inventário ou aplicar uma cor a todos os móveis de uma mesma categoria dentro de casa.

---

### 5. Arquitetura Técnica Sugerida
*   **Frontend (Cliente):**
    *   **Three.js:** Para renderização 3D, carregamento de modelos GLTF/GLB e física básica.
    *   **Google Blockly:** Para criar o editor visual de blocos de forma customizada (exportando para Lua ou interpretando localmente em JS).
    *   **HTML/CSS/Vanilla JS (ou React):** Para a interface de usuário (UI), inventário e janelas de chat.
*   **Backend (Servidor MMO):**
    *   **Node.js + Socket.io:** Essencial para o gerenciamento de estado da ilha em tempo real (movimentação de avatares, chat, quem está pescando o quê).
    *   **Banco de Dados (MongoDB ou PostgreSQL):** Salvar o inventário do jogador, o layout do grid da sua casa (coordenadas x,y,z e rotação de cada móvel) e o progresso na trilha de programação.

---

### 6. Roadmap de Desenvolvimento (Estrutura Scrum)

#### Sprint 1: Setup e Prototipagem do Core 3D
*   [ ] Configurar ambiente Three.js e pipeline de importação de assets da pasta base.
*   [ ] Implementar o controle de câmera (visão isométrica/terceira pessoa semelhante ao AC).
*   [ ] Implementar movimentação básica do avatar (point-and-click ou WASD).
*   [ ] Carregar a malha (mesh) básica da ilha.

#### Sprint 2: O Sistema de Grid e Housing
*   [ ] Desenvolver o sistema de Grid matemático para posicionamento de objetos.
*   [ ] Criar a lógica de entrar/sair da tenda (mudança de cena ou instanciamento local).
*   [ ] Implementar o modo de edição (mover, rotacionar, guardar itens no inventário).

#### Sprint 3: Integração Educativa (O Coração do Jogo)
*   [ ] Integrar o Blockly no projeto Web.
*   [ ] Customizar os blocos para usar a linguagem do jogo (ex: blocos de "Invocar", "Rede", "Peixe").
*   [ ] Desenvolver os validadores: O sistema que verifica se o código em blocos resolveu o desafio.
*   [ ] Ligar o sucesso do desafio ao surgimento do item no inventário.

#### Sprint 4: Ecossistema e Atividades
*   [ ] IA básica para peixes e insetos (movimentação errática, fuga).
*   [ ] Vincular a captura aos desafios de programação (ex: inputs e if/else).
*   [ ] Implementar ciclo de dia/noite (iluminação no Three.js).

#### Sprint 5: Multiplayer (MMO)
*   [ ] Configurar servidor Node.js e websockets.
*   [ ] Sincronizar posições dos jogadores na ilha principal.
*   [ ] Implementar chat básico e sistema de emojis sobre a cabeça dos avatares.
*   [ ] Sincronizar estado global da ilha (ex: se alguém colheu uma fruta, ela some para todos).

#### Sprint 6: Polimento, UI e Testes
*   [ ] Polimento das transições de UI e feedback visual/sonoro ao acertar o código.
*   [ ] Testes de carga no servidor.
*   [ ] Playtest focado em Level Design: avaliar a curva de dificuldade dos desafios para garantir que estão lúdicos e não frustrantes.
