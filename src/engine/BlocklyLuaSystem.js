/**
 * BlocklyLuaSystem - Educational Coding Engine
 * Gerencia as trilhas de desafios de programação (Blockly e Lua) para todos os 9 NPCs da Ilha Lua.
 * Cada desafio desbloqueia um objeto/ferramenta/prop/tile específico para construção da ilha.
 */

export const LUA_LESSONS = [
  // =========================================================================
  // 1. BAMBU, O ENGENHEIRO (npc_monkey_builder) - Mobílias, Decorações & Casas
  // =========================================================================
  {
    id: 'bambu_01_chair',
    npcId: 'npc_monkey_builder',
    title: 'Bambu 1: Cadeira de Madeira Rústica',
    concept: 'Variáveis Simples',
    mentor: 'Bambu, o Engenheiro',
    mentorRole: 'Mestre Construtor',
    unlockedAssetId: 'prop_chair_wood',
    unlockedAssetName: 'Cadeira de Madeira Rústica',
    unlockedCategory: 'furniture',
    description: "Passo 1: Encaixe o bloco 'Definir material = carvalho'.\nPasso 2: Encaixe abaixo o bloco 'Fabricar Móvel' para criar sua primeira Cadeira de Madeira!",
    starterBlocks: [
      { type: 'set_var', name: 'material', value: 'carvalho' },
      { type: 'call_action', action: 'fabricar_movel', param: '"prop_chair_wood", material' }
    ],
    starterLua: '-- Bambu 1: Declare o material e fabrique a cadeira\nlocal material = "carvalho"\nfabricar_movel("prop_chair_wood", material)',
    expectedOutput: ['movel_fabricado:prop_chair_wood:carvalho'],
    rewardXP: 100,
    rewardGold: 50,
    rewardDesc: '+100 XP, +50 Moedas e Receita: Cadeira de Madeira Rústica'
  },
  {
    id: 'bambu_02_table',
    npcId: 'npc_monkey_builder',
    title: 'Bambu 2: Mesa de Trabalho & Estudos',
    concept: 'Parâmetros e Atribuição',
    mentor: 'Bambu, o Engenheiro',
    mentorRole: 'Mestre Construtor',
    unlockedAssetId: 'prop_table_crafting',
    unlockedAssetName: 'Mesa de Trabalho / Estudos',
    unlockedCategory: 'furniture',
    description: "Passo 1: Encaixe o bloco 'Definir tampo = madeira_macica'.\nPasso 2: Encaixe abaixo o bloco 'Fabricar Mesa' com 4 pernas para montar a Mesa de Estudos!",
    starterBlocks: [
      { type: 'set_var', name: 'tampo', value: 'madeira_macica' },
      { type: 'call_action', action: 'fabricar_mesa', param: 'tampo, 4' }
    ],
    starterLua: '-- Bambu 2: Configure o tampo e as pernas da mesa\nlocal tampo = "madeira_macica"\nfabricar_mesa(tampo, 4)',
    expectedOutput: ['mesa_fabricada:madeira_macica:4'],
    rewardXP: 120,
    rewardGold: 60,
    rewardDesc: '+120 XP, +60 Moedas e Receita: Mesa de Trabalho / Estudos'
  },
  {
    id: 'bambu_03_straw_bed',
    npcId: 'npc_monkey_builder',
    title: 'Bambu 3: Cama Rústica de Palha',
    concept: 'Condicional Simples (se / then)',
    mentor: 'Bambu, o Engenheiro',
    mentorRole: 'Mestre Construtor',
    unlockedAssetId: 'prop_bed_straw',
    unlockedAssetName: 'Cama Rústica de Palha e Peles',
    unlockedCategory: 'furniture',
    description: "Passo 1: Encaixe o bloco de condição 'Se palha >= 5 Então'.\nPasso 2: Encaixe dentro dele a ação 'Fabricar Cama' para montar uma Cama Rústica de Palha!",
    starterBlocks: [
      { type: 'if_cond', condition: 'palha >= 5', thenAction: 'fabricar_cama("prop_bed_straw")', elseAction: 'coletar_palha()' }
    ],
    starterLua: '-- Bambu 3: Verifique se temos palha suficiente\nse palha >= 5 entao\n  fabricar_cama("prop_bed_straw")\nfim',
    expectedOutput: ['cama_fabricada:prop_bed_straw'],
    rewardXP: 150,
    rewardGold: 75,
    rewardDesc: '+150 XP, +75 Moedas e Receita: Cama Rústica de Palha e Peles'
  },
  {
    id: 'bambu_04_canopy_bed',
    npcId: 'npc_monkey_builder',
    title: 'Bambu 4: Cama Real com Dossel',
    concept: 'Condicional Composta (se / e / and)',
    mentor: 'Bambu, o Engenheiro',
    mentorRole: 'Mestre Construtor',
    unlockedAssetId: 'prop_bed_canopy',
    unlockedAssetName: 'Cama Real com Dossel',
    unlockedCategory: 'furniture',
    description: "Passo 1: Encaixe a condição 'Se madeira >= 8 e veludo >= 2 Então'.\nPasso 2: Encaixe dentro dela o bloco 'Fabricar Cama Nobre' para forjar a Cama Real com Dossel!",
    starterBlocks: [
      { type: 'if_cond', condition: 'madeira >= 8 e veludo >= 2', thenAction: 'fabricar_cama_nobre("prop_bed_canopy")', elseAction: 'coletar_tecidos()' }
    ],
    starterLua: '-- Bambu 4: Combine madeira nobre e veludo\nse madeira >= 8 e veludo >= 2 entao\n  fabricar_cama_nobre("prop_bed_canopy")\nsenao\n  coletar_tecidos()\nfim',
    expectedOutput: ['cama_nobre_fabricada:prop_bed_canopy'],
    rewardXP: 200,
    rewardGold: 100,
    rewardDesc: '+200 XP, +100 Moedas e Receita: Cama Real com Dossel'
  },
  {
    id: 'bambu_05_tent',
    npcId: 'npc_monkey_builder',
    title: 'Bambu 5: Tenda de Acampamento',
    concept: 'Laço de Repetição (para / for)',
    mentor: 'Bambu, o Engenheiro',
    mentorRole: 'Mestre Construtor',
    unlockedAssetId: 'prop_tent_adventurer',
    unlockedAssetName: 'Tenda de Acampamento',
    unlockedCategory: 'furniture',
    description: "Passo 1: Encaixe o laço 'Para i = 1 até 4 Faça'.\nPasso 2: Encaixe a ação 'Fixar Estaca' dentro do laço.\nPasso 3: Encaixe 'Erguer Lona' logo abaixo para montar a Tenda de Acampamento!",
    starterBlocks: [
      { type: 'for_loop', count: 4, action: 'fixar_estaca(i)' },
      { type: 'call_action', action: 'erguer_lona', param: '""' }
    ],
    starterLua: '-- Bambu 5: Fixe as 4 estacas e erga a lona\npara i = 1, 4 faca\n  fixar_estaca(i)\nfim\nerguer_lona()',
    expectedOutput: ['estaca_fixada:1', 'estaca_fixada:2', 'estaca_fixada:3', 'estaca_fixada:4', 'tenda_erguida:prop_tent_adventurer'],
    rewardXP: 250,
    rewardGold: 120,
    rewardDesc: '+250 XP, +120 Moedas e Receita: Tenda de Acampamento'
  },
  {
    id: 'bambu_06_cottage',
    npcId: 'npc_monkey_builder',
    title: 'Bambu 6: Casa Pequena de Enxaimel',
    concept: 'Função Modular Completa',
    mentor: 'Bambu, o Engenheiro',
    mentorRole: 'Mestre Construtor',
    unlockedAssetId: 'prop_house_cottage',
    unlockedAssetName: 'Casa Pequena de Enxaimel',
    unlockedCategory: 'furniture',
    description: "Passo 1: Encaixe a definição 'Função construir_casa(estilo)'.\nPasso 2: Encaixe dentro dela as etapas: 'Erguer Fundação', 'Assentar Tijolos' e 'Montar Telhado'.\nPasso 3: Encaixe abaixo a chamada 'construir_casa(\"enxaimel\")' para construir a casa!",
    starterBlocks: [
      { type: 'def_func', name: 'construir_casa', param: 'estilo' },
      { type: 'call_func', name: 'construir_casa', param: '"enxaimel"' }
    ],
    starterLua: '-- Bambu 6: A grande construção de uma casa medieval\nfuncao construir_casa(estilo)\n  erguer_fundacao()\n  assentar_tijolos()\n  montar_telhado(estilo)\nfim\n\nconstruir_casa("enxaimel")',
    expectedOutput: ['fundacao_erguida', 'tijolos_assentados', 'casa_concluida:prop_house_cottage'],
    rewardXP: 350,
    rewardGold: 180,
    rewardDesc: '+350 XP, +180 Moedas e Receita: Casa Pequena de Enxaimel'
  },

  // =========================================================================
  // 2. BRUTUS DA BIGORNA (npc_bull_blacksmith) - Ferramentas & Minérios
  // =========================================================================
  {
    id: 'brutus_01_shovel',
    npcId: 'npc_bull_blacksmith',
    title: 'Brutus 1: Pá de Ferro Rústica',
    concept: 'Declaração de Ferramentas',
    mentor: 'Brutus da Bigorna',
    mentorRole: 'Ferreiro Real',
    unlockedAssetId: 'tool_shovel_iron',
    unlockedAssetName: 'Pá de Ferro Rústica',
    unlockedCategory: 'tools',
    description: "Passo 1: Encaixe o bloco 'Definir metal = ferro_puro'.\nPasso 2: Encaixe abaixo a ação 'Forjar Ferramenta' para forjar sua Pá de Ferro Rústica!",
    starterBlocks: [
      { type: 'set_var', name: 'metal', value: 'ferro_puro' },
      { type: 'call_action', action: 'forjar_ferramenta', param: '"tool_shovel_iron", metal' }
    ],
    starterLua: '-- Brutus 1: Forje sua primeira ferramenta de ferro\nlocal metal = "ferro_puro"\nforjar_ferramenta("tool_shovel_iron", metal)',
    expectedOutput: ['ferramenta_forjada:tool_shovel_iron:ferro_puro'],
    rewardXP: 110,
    rewardGold: 55,
    rewardDesc: '+110 XP, +55 Moedas e Ferramenta: Pá de Ferro Rústica'
  },
  {
    id: 'brutus_02_axe',
    npcId: 'npc_bull_blacksmith',
    title: 'Brutus 2: Machado de Lenhador',
    concept: 'Validação de Propriedades',
    mentor: 'Brutus da Bigorna',
    mentorRole: 'Ferreiro Real',
    unlockedAssetId: 'tool_axe_woodcutter',
    unlockedAssetName: 'Machado de Lenhador',
    unlockedCategory: 'tools',
    description: "Passo 1: Encaixe a condição 'Se peso_lamina >= 3 Então'.\nPasso 2: Encaixe dentro dela o bloco 'Forjar Machado' para criar seu Machado de Lenhador!",
    starterBlocks: [
      { type: 'if_cond', condition: 'peso_lamina >= 3', thenAction: 'forjar_machado("tool_axe_woodcutter")', elseAction: 'ajustar_peso()' }
    ],
    starterLua: '-- Brutus 2: Valide a lâmina de corte\nse peso_lamina >= 3 entao\n  forjar_machado("tool_axe_woodcutter")\nfim',
    expectedOutput: ['machado_forjado:tool_axe_woodcutter'],
    rewardXP: 140,
    rewardGold: 70,
    rewardDesc: '+140 XP, +70 Moedas e Ferramenta: Machado de Lenhador'
  },
  {
    id: 'brutus_03_pickaxe',
    npcId: 'npc_bull_blacksmith',
    title: 'Brutus 3: Picareta de Mineração',
    concept: 'Condicional se/senao de Minérios',
    mentor: 'Brutus da Bigorna',
    mentorRole: 'Ferreiro Real',
    unlockedAssetId: 'tool_pickaxe_miner',
    unlockedAssetName: 'Picareta de Mineração',
    unlockedCategory: 'tools',
    description: "Passo 1: Encaixe a condição 'Se ferro >= 5 Então'.\nPasso 2: Encaixe dentro dela o bloco 'Forjar Picareta' para liberar sua Picareta de Mineração!",
    starterBlocks: [
      { type: 'if_cond', condition: 'ferro >= 5', thenAction: 'forjar_picareta("tool_pickaxe_miner")', elseAction: 'fundir_minerios()' }
    ],
    starterLua: '-- Brutus 3: Forje a picareta pesada\nse ferro >= 5 entao\n  forjar_picareta("tool_pickaxe_miner")\nsenao\n  fundir_minerios()\nfim',
    expectedOutput: ['picareta_forjada:tool_pickaxe_miner'],
    rewardXP: 180,
    rewardGold: 90,
    rewardDesc: '+180 XP, +90 Moedas e Ferramenta: Picareta de Mineração'
  },
  {
    id: 'brutus_04_boulder',
    npcId: 'npc_bull_blacksmith',
    title: 'Brutus 4: Formação de Rocha Mineral',
    concept: 'Instanciação de Elementos Naturais',
    mentor: 'Brutus da Bigorna',
    mentorRole: 'Ferreiro Real',
    unlockedAssetId: 'nature_rock_boulder',
    unlockedAssetName: 'Formação de Rocha Mineral',
    unlockedCategory: 'nature',
    description: "Passo 1: Encaixe o bloco 'Definir tipo_rocha = veio_mineral'.\nPasso 2: Encaixe abaixo o bloco 'Materializar Rocha' para criar formações de rocha mineral!",
    starterBlocks: [
      { type: 'set_var', name: 'tipo_rocha', value: 'veio_mineral' },
      { type: 'call_action', action: 'materializar_rocha', param: '"nature_rock_boulder", tipo_rocha' }
    ],
    starterLua: '-- Brutus 4: Posicione rochas minerais no mapa\nlocal tipo_rocha = "veio_mineral"\nmaterializar_rocha("nature_rock_boulder", tipo_rocha)',
    expectedOutput: ['rocha_materializada:nature_rock_boulder:veio_mineral'],
    rewardXP: 220,
    rewardGold: 110,
    rewardDesc: '+220 XP, +110 Moedas e Objeto: Formação de Rocha Mineral'
  },

  // =========================================================================
  // 3. FLORA DOS BROTOS (npc_rabbit_farmer) - Agricultura, Sementes & Árvores
  // =========================================================================
  {
    id: 'flora_01_watering_can',
    npcId: 'npc_rabbit_farmer',
    title: 'Flora 1: Regador de Cobre',
    concept: 'Variáveis de Capacidade',
    mentor: 'Flora dos Brotos',
    mentorRole: 'Herbalista da Vila',
    unlockedAssetId: 'tool_watering_can',
    unlockedAssetName: 'Regador de Cobre',
    unlockedCategory: 'tools',
    description: "Passo 1: Encaixe o bloco 'Definir capacidade = 10'.\nPasso 2: Encaixe abaixo o bloco 'Forjar Regador' para obter o Regador de Cobre!",
    starterBlocks: [
      { type: 'set_var', name: 'capacidade', value: 10 },
      { type: 'call_action', action: 'forjar_regador', param: '"tool_watering_can", capacidade' }
    ],
    starterLua: '-- Flora 1: Prepare o regador para as plantas\nlocal capacidade = 10\nforjar_regador("tool_watering_can", capacidade)',
    expectedOutput: ['regador_pronto:tool_watering_can:10'],
    rewardXP: 100,
    rewardGold: 50,
    rewardDesc: '+100 XP, +50 Moedas e Ferramenta: Regador de Cobre'
  },
  {
    id: 'flora_02_wheat',
    npcId: 'npc_rabbit_farmer',
    title: 'Flora 2: Sementes de Trigo Dourado',
    concept: 'Listas & Vetores de Itens',
    mentor: 'Flora dos Brotos',
    mentorRole: 'Herbalista da Vila',
    unlockedAssetId: 'seed_wheat_packet',
    unlockedAssetName: 'Saco de Sementes de Trigo',
    unlockedCategory: 'nature',
    description: "Passo 1: Encaixe o bloco 'Definir pacote = seed_wheat_packet'.\nPasso 2: Encaixe abaixo o bloco 'Embalar Sementes' para preparar o Saco de Sementes de Trigo!",
    starterBlocks: [
      { type: 'set_var', name: 'pacote', value: '{"seed_wheat_packet", "nutritivo"}' },
      { type: 'call_action', action: 'embalar_sementes', param: 'pacote[1]' }
    ],
    starterLua: '-- Flora 2: Embale as sementes de trigo\nlocal pacote = {"seed_wheat_packet", "nutritivo"}\nembalar_sementes(pacote[1])',
    expectedOutput: ['sementes_embaladas:seed_wheat_packet'],
    rewardXP: 130,
    rewardGold: 65,
    rewardDesc: '+130 XP, +65 Moedas e Item: Saco de Sementes de Trigo'
  },
  {
    id: 'flora_03_berry_bush',
    npcId: 'npc_rabbit_farmer',
    title: 'Flora 3: Arbusto de Frutas Vermelhas',
    concept: 'Laço de Repetição de Frutas',
    mentor: 'Flora dos Brotos',
    mentorRole: 'Herbalista da Vila',
    unlockedAssetId: 'nature_berry_bush',
    unlockedAssetName: 'Arbusto com Frutas Vermelhas',
    unlockedCategory: 'nature',
    description: "Passo 1: Encaixe o laço 'Para i = 1 até 3 Faça'.\nPasso 2: Encaixe 'Brotar Amora' dentro do laço.\nPasso 3: Encaixe 'Plantar Arbusto' logo abaixo para cultivar o Arbusto de Frutas!",
    starterBlocks: [
      { type: 'for_loop', count: 3, action: 'brotar_amora(i)' },
      { type: 'call_action', action: 'plantar_arbusto', param: '"nature_berry_bush"' }
    ],
    starterLua: '-- Flora 3: Faça brotar amoras docinhas\npara i = 1, 3 faca\n  brotar_amora(i)\nfim\nplantar_arbusto("nature_berry_bush")',
    expectedOutput: ['amora_brotada:1', 'amora_brotada:2', 'amora_brotada:3', 'arbusto_plantado:nature_berry_bush'],
    rewardXP: 170,
    rewardGold: 85,
    rewardDesc: '+170 XP, +85 Moedas e Plantação: Arbusto com Frutas Vermelhas'
  },
  {
    id: 'flora_04_oak_tree',
    npcId: 'npc_rabbit_farmer',
    title: 'Flora 4: Árvore de Carvalho Antigo',
    concept: 'Função com Estágios Botânicos',
    mentor: 'Flora dos Brotos',
    mentorRole: 'Herbalista da Vila',
    unlockedAssetId: 'nature_oak_tree',
    unlockedAssetName: 'Árvore de Carvalho (Adulta)',
    unlockedCategory: 'nature',
    description: "Passo 1: Encaixe a definição 'Função plantar_carvalho(estagio)'.\nPasso 2: Encaixe 'Expandir Copa' dentro da função.\nPasso 3: Encaixe abaixo a chamada 'plantar_carvalho(3)' para cultivar o Carvalho Antigo!",
    starterBlocks: [
      { type: 'def_func', name: 'plantar_carvalho', param: 'estagio' },
      { type: 'call_func', name: 'plantar_carvalho', param: '3' }
    ],
    starterLua: '-- Flora 4: Erga um majestoso carvalho antigo\nfuncao plantar_carvalho(estagio)\n  expandir_copa(estagio)\nfim\n\nplantar_carvalho(3)',
    expectedOutput: ['copa_expandida:3', 'arvore_cultivada:nature_oak_tree'],
    rewardXP: 230,
    rewardGold: 115,
    rewardDesc: '+230 XP, +115 Moedas e Árvore: Carvalho Antigo'
  },
  {
    id: 'flora_05_pine_tree',
    npcId: 'npc_rabbit_farmer',
    title: 'Flora 5: Pinheiro Nórdico',
    concept: 'Parâmetros de Bioma',
    mentor: 'Flora dos Brotos',
    mentorRole: 'Herbalista da Vila',
    unlockedAssetId: 'nature_pine_tree',
    unlockedAssetName: 'Pinheiro Nórdico (Adulto)',
    unlockedCategory: 'nature',
    description: "Passo 1: Encaixe o bloco 'Plantar Pinheiro' com cor 'esmeralda' e tamanho 4 para reflorestar as colinas com Pinheiros Nórdicos!",
    starterBlocks: [
      { type: 'call_action', action: 'plantar_pinheiro', param: '"nature_pine_tree", "esmeralda", 4' }
    ],
    starterLua: '-- Flora 5: Plante pinheiros verde-esmeralda\nplantar_pinheiro("nature_pine_tree", "esmeralda", 4)',
    expectedOutput: ['pinheiro_plantado:nature_pine_tree:esmeralda:4'],
    rewardXP: 280,
    rewardGold: 140,
    rewardDesc: '+280 XP, +140 Moedas e Árvore: Pinheiro Nórdico'
  },

  // =========================================================================
  // 4. BARNABÉ, O BARQUEIRO (npc_alligator_ferryman) - Cercados & Pontes
  // =========================================================================
  {
    id: 'barnabe_01_fence',
    npcId: 'npc_alligator_ferryman',
    title: 'Barnabé 1: Cerca de Madeira Rústica',
    concept: 'Loop de Alinhamento',
    mentor: 'Barnabé, o Barqueiro',
    mentorRole: 'Mestre dos Canais',
    unlockedAssetId: 'struct_fence_wood_segment',
    unlockedAssetName: 'Cerca de Madeira Rústica',
    unlockedCategory: 'structures',
    description: "Passo 1: Encaixe o laço 'Para i = 1 até 4 Faça'.\nPasso 2: Encaixe 'Fincar Cerca' dentro do laço para alinhar os 4 módulos da Cerca de Madeira!",
    starterBlocks: [
      { type: 'for_loop', count: 4, action: 'fincar_cerca("struct_fence_wood_segment", i)' }
    ],
    starterLua: '-- Barnabé 1: Alinhe 4 módulos de cerca\npara i = 1, 4 faca\n  fincar_cerca("struct_fence_wood_segment", i)\nfim',
    expectedOutput: ['cerca_fincada:struct_fence_wood_segment:1', 'cerca_fincada:struct_fence_wood_segment:2', 'cerca_fincada:struct_fence_wood_segment:3', 'cerca_fincada:struct_fence_wood_segment:4'],
    rewardXP: 120,
    rewardGold: 60,
    rewardDesc: '+120 XP, +60 Moedas e Estrutura: Cerca de Madeira Rústica'
  },
  {
    id: 'barnabe_02_gate',
    npcId: 'npc_alligator_ferryman',
    title: 'Barnabé 2: Portão de Cerca de Madeira',
    concept: 'Condicionais de Acesso',
    mentor: 'Barnabé, o Barqueiro',
    mentorRole: 'Mestre dos Canais',
    unlockedAssetId: 'struct_fence_wood_gate',
    unlockedAssetName: 'Portão de Cerca de Madeira',
    unlockedCategory: 'structures',
    description: "Passo 1: Encaixe a condição 'Se trinco == \"articulado\" Então'.\nPasso 2: Encaixe dentro dela o bloco 'Montar Portão' para criar um Portão de Cerca seguro!",
    starterBlocks: [
      { type: 'if_cond', condition: 'trinco == "articulado"', thenAction: 'montar_portao("struct_fence_wood_gate")', elseAction: 'ajustar_dobradica()' }
    ],
    starterLua: '-- Barnabé 2: Monte o portão articulado com trinco\nse trinco == "articulado" entao\n  montar_portao("struct_fence_wood_gate")\nfim',
    expectedOutput: ['portao_montado:struct_fence_wood_gate'],
    rewardXP: 150,
    rewardGold: 75,
    rewardDesc: '+150 XP, +75 Moedas e Estrutura: Portão de Cerca de Madeira'
  },
  {
    id: 'barnabe_03_bridge_h',
    npcId: 'npc_alligator_ferryman',
    title: 'Barnabé 3: Ponte de Madeira (Horizontal)',
    concept: 'Função de Vão Fluvial Leste-Oeste',
    mentor: 'Barnabé, o Barqueiro',
    mentorRole: 'Mestre dos Canais',
    unlockedAssetId: 'struct_bridge_wood_horiz',
    unlockedAssetName: 'Ponte de Madeira (Horizontal)',
    unlockedCategory: 'structures',
    description: "Passo 1: Encaixe a definição 'Função construir_ponte_h(vao)'.\nPasso 2: Encaixe 'Estender Vigas Horizontais' dentro da função.\nPasso 3: Encaixe abaixo a chamada 'construir_ponte_h(2)' para atravessar o rio com a Ponte Horizontal!",
    starterBlocks: [
      { type: 'def_func', name: 'construir_ponte_h', param: 'vao' },
      { type: 'call_func', name: 'construir_ponte_h', param: '2' }
    ],
    starterLua: '-- Barnabé 3: Conecte margens horizontais\nfuncao construir_ponte_h(vao)\n  estender_vigas_h("struct_bridge_wood_horiz", vao)\nfim\n\nconstruir_ponte_h(2)',
    expectedOutput: ['ponte_h_construida:struct_bridge_wood_horiz:2'],
    rewardXP: 220,
    rewardGold: 110,
    rewardDesc: '+220 XP, +110 Moedas e Estrutura: Ponte de Madeira (Horizontal)'
  },
  {
    id: 'barnabe_04_bridge_v',
    npcId: 'npc_alligator_ferryman',
    title: 'Barnabé 4: Ponte de Madeira (Vertical)',
    concept: 'Funções com Retorno de Dimensão',
    mentor: 'Barnabé, o Barqueiro',
    mentorRole: 'Mestre dos Canais',
    unlockedAssetId: 'struct_bridge_wood_vert',
    unlockedAssetName: 'Ponte de Madeira (Vertical)',
    unlockedCategory: 'structures',
    description: "Passo 1: Encaixe a definição 'Função calcular_vao_v(altura)'.\nPasso 2: Encaixe abaixo o bloco 'Montar Ponte Vertical' com o retorno da função para erguer a Ponte Vertical!",
    starterBlocks: [
      { type: 'def_func', name: 'calcular_vao_v', param: 'altura' },
      { type: 'call_action', action: 'montar_ponte_v', param: '"struct_bridge_wood_vert", calcular_vao_v(2)' }
    ],
    starterLua: '-- Barnabé 4: Conecte rios norte-sul com ponte vertical\nfuncao calcular_vao_v(altura)\n  local res = altura\n  retornar res\nfim\n\nmontar_ponte_v("struct_bridge_wood_vert", calcular_vao_v(2))',
    expectedOutput: ['ponte_v_construida:struct_bridge_wood_vert:2'],
    rewardXP: 280,
    rewardGold: 140,
    rewardDesc: '+280 XP, +140 Moedas e Estrutura: Ponte de Madeira (Vertical)'
  },

  // =========================================================================
  // 5. PINGO DOS ICEBERGS (npc_penguin_angler) - Pesca, Redes & Elementos Aquáticos
  // =========================================================================
  {
    id: 'pingo_01_fishing_rod',
    npcId: 'npc_penguin_angler',
    title: 'Pingo 1: Vara de Pescar de Bambu',
    concept: 'Vetores de Montagem',
    mentor: 'Pingo dos Icebergs',
    mentorRole: 'Pescador Polar',
    unlockedAssetId: 'tool_fishing_rod',
    unlockedAssetName: 'Vara de Pescar de Bambu',
    unlockedCategory: 'tools',
    description: "Passo 1: Encaixe o bloco 'Definir varas = bambu_flexivel'.\nPasso 2: Encaixe abaixo o bloco 'Montar Vara' para obter a Vara de Pescar de Bambu!",
    starterBlocks: [
      { type: 'set_var', name: 'varas', value: '{"linha_seda", "bambu_flexivel"}' },
      { type: 'call_action', action: 'montar_vara', param: '"tool_fishing_rod", varas[2]' }
    ],
    starterLua: '-- Pingo 1: Monte sua vara de pesca de bambu\nlocal varas = {"linha_seda", "bambu_flexivel"}\nmontar_vara("tool_fishing_rod", varas[2])',
    expectedOutput: ['vara_montada:tool_fishing_rod:bambu_flexivel'],
    rewardXP: 120,
    rewardGold: 60,
    rewardDesc: '+120 XP, +60 Moedas e Ferramenta: Vara de Pescar de Bambu'
  },
  {
    id: 'pingo_02_bug_net',
    npcId: 'npc_penguin_angler',
    title: 'Pingo 2: Rede de Captura',
    concept: 'Atribuição de Malha',
    mentor: 'Pingo dos Icebergs',
    mentorRole: 'Pescador Polar',
    unlockedAssetId: 'tool_bug_net',
    unlockedAssetName: 'Rede de Captura',
    unlockedCategory: 'tools',
    description: "Passo 1: Encaixe o bloco 'Definir malha = fina_encantada'.\nPasso 2: Encaixe abaixo o bloco 'Tecer Rede' para criar a Rede de Captura de Insetos!",
    starterBlocks: [
      { type: 'set_var', name: 'malha', value: 'fina_encantada' },
      { type: 'call_action', action: 'tecer_rede', param: '"tool_bug_net", malha' }
    ],
    starterLua: '-- Pingo 2: Teça a rede de captura de insetos\nlocal malha = "fina_encantada"\ntecer_rede("tool_bug_net", malha)',
    expectedOutput: ['rede_tecida:tool_bug_net:fina_encantada'],
    rewardXP: 160,
    rewardGold: 80,
    rewardDesc: '+160 XP, +80 Moedas e Ferramenta: Rede de Captura'
  },
  {
    id: 'pingo_03_water_flow',
    npcId: 'npc_penguin_angler',
    title: 'Pingo 3: Ladrilho de Água Cristalina',
    concept: 'Laço de Animação de Ondas',
    mentor: 'Pingo dos Icebergs',
    mentorRole: 'Pescador Polar',
    unlockedAssetId: 'tile_animated_water_flow',
    unlockedAssetName: 'Ladrilho de Água Cristalina',
    unlockedCategory: 'animated',
    description: "Passo 1: Encaixe o laço 'Para i = 1 até 8 Faça'.\nPasso 2: Encaixe 'Animar Ondulação' dentro do laço para criar o Ladrilho de Água Cristalina animado!",
    starterBlocks: [
      { type: 'for_loop', count: 8, action: 'animar_ondulacao("tile_animated_water_flow", i)' }
    ],
    starterLua: '-- Pingo 3: Anime os 8 frames da correnteza do rio\npara i = 1, 8 faca\n  animar_ondulacao("tile_animated_water_flow", i)\nfim',
    expectedOutput: ['agua_animada:tile_animated_water_flow:8'],
    rewardXP: 220,
    rewardGold: 110,
    rewardDesc: '+220 XP, +110 Moedas e Tile Animado: Ladrilho de Água Cristalina'
  },
  {
    id: 'pingo_04_waterfall',
    npcId: 'npc_penguin_angler',
    title: 'Pingo 4: Queda d\'Água / Cachoeira',
    concept: 'Função de Queda com Espuma',
    mentor: 'Pingo dos Icebergs',
    mentorRole: 'Pescador Polar',
    unlockedAssetId: 'tile_animated_waterfall',
    unlockedAssetName: 'Queda d\'Água / Cachoeira',
    unlockedCategory: 'animated',
    description: "Passo 1: Encaixe a definição 'Função gerar_cachoeira(altura)'.\nPasso 2: Encaixe 'Fluxo Vertical' dentro da função.\nPasso 3: Encaixe abaixo a chamada 'gerar_cachoeira(2)' para criar a Queda d'Água / Cachoeira!",
    starterBlocks: [
      { type: 'def_func', name: 'gerar_cachoeira', param: 'altura' },
      { type: 'call_func', name: 'gerar_cachoeira', param: '2' }
    ],
    starterLua: '-- Pingo 4: Crie quedas d\'água majestosas\nfuncao gerar_cachoeira(altura)\n  fluxo_vertical("tile_animated_waterfall", altura)\nfim\n\ngerar_cachoeira(2)',
    expectedOutput: ['cachoeira_gerada:tile_animated_waterfall:2'],
    rewardXP: 300,
    rewardGold: 150,
    rewardDesc: '+300 XP, +150 Moedas e Tile Animado: Queda d\'Água / Cachoeira'
  },

  // =========================================================================
  // 6. CROMOS, O TECELÃO DE CORES (npc_chameleon_magician) - Pisos & Terrenos
  // =========================================================================
  {
    id: 'cromos_01_dirt_track',
    npcId: 'npc_chameleon_magician',
    title: 'Cromos 1: Trilha de Terra Batida',
    concept: 'Variável de Terreno',
    mentor: 'Cromos, o Tecelão de Cores',
    mentorRole: 'Mestre dos Pisos',
    unlockedAssetId: 'tile_ground_dirt_track',
    unlockedAssetName: 'Trilha de Terra Batida',
    unlockedCategory: 'ground',
    description: "Passo 1: Encaixe o bloco 'Definir solo = terra_dourada'.\nPasso 2: Encaixe abaixo o bloco 'Assentar Piso' para liberar a Trilha de Terra Batida!",
    starterBlocks: [
      { type: 'set_var', name: 'solo', value: 'terra_dourada' },
      { type: 'call_action', action: 'assentar_piso', param: '"tile_ground_dirt_track", solo' }
    ],
    starterLua: '-- Cromos 1: Pinte trilhas rurais de terra batida\nlocal solo = "terra_dourada"\nassentar_piso("tile_ground_dirt_track", solo)',
    expectedOutput: ['piso_assentado:tile_ground_dirt_track:terra_dourada'],
    rewardXP: 100,
    rewardGold: 50,
    rewardDesc: '+100 XP, +50 Moedas e Piso: Trilha de Terra Batida'
  },
  {
    id: 'cromos_02_cobblestone',
    npcId: 'npc_chameleon_magician',
    title: 'Cromos 2: Caminho de Paralelepípedo',
    concept: 'Loop de Encaixe de Pedras',
    mentor: 'Cromos, o Tecelão de Cores',
    mentorRole: 'Mestre dos Pisos',
    unlockedAssetId: 'tile_ground_cobblestone',
    unlockedAssetName: 'Caminho de Paralelepípedo',
    unlockedCategory: 'ground',
    description: "Passo 1: Encaixe o laço 'Para i = 1 até 4 Faça'.\nPasso 2: Encaixe 'Encaixar Paralelepípedo' dentro do laço para criar o Caminho de Paralelepípedo!",
    starterBlocks: [
      { type: 'for_loop', count: 4, action: 'encaixar_paralelepipedo("tile_ground_cobblestone", i)' }
    ],
    starterLua: '-- Cromos 2: Pavimente ruas com paralelepípedos com musgo\npara i = 1, 4 faca\n  encaixar_paralelepipedo("tile_ground_cobblestone", i)\nfim',
    expectedOutput: ['paralelepipedo_encaixado:tile_ground_cobblestone:4'],
    rewardXP: 130,
    rewardGold: 65,
    rewardDesc: '+130 XP, +65 Moedas e Piso: Caminho de Paralelepípedo'
  },
  {
    id: 'cromos_03_wood_planks',
    npcId: 'npc_chameleon_magician',
    title: 'Cromos 3: Tabuado de Madeira Rústica',
    concept: 'Condicional de Acabamento',
    mentor: 'Cromos, o Tecelão de Cores',
    mentorRole: 'Mestre dos Pisos',
    unlockedAssetId: 'tile_ground_wood_planks',
    unlockedAssetName: 'Tabuado de Madeira Rústica',
    unlockedCategory: 'ground',
    description: "Passo 1: Encaixe a condição 'Se tipo_madeira == \"carvalho\" Então'.\nPasso 2: Encaixe dentro dela o bloco 'Pregar Tabuado' para liberar o Tabuado de Madeira Rústica!",
    starterBlocks: [
      { type: 'if_cond', condition: 'tipo_madeira == "carvalho"', thenAction: 'pregar_tabuado("tile_ground_wood_planks")', elseAction: 'lixar_madeira()' }
    ],
    starterLua: '-- Cromos 3: Pregue pisos de madeira para decks e interiores\nse tipo_madeira == "carvalho" entao\n  pregar_tabuado("tile_ground_wood_planks")\nfim',
    expectedOutput: ['tabuado_pregado:tile_ground_wood_planks'],
    rewardXP: 160,
    rewardGold: 80,
    rewardDesc: '+160 XP, +80 Moedas e Piso: Tabuado de Madeira Rústica'
  },
  {
    id: 'cromos_04_flower_grass',
    npcId: 'npc_chameleon_magician',
    title: 'Cromos 4: Grama Florida Silvestre',
    concept: 'Tabelas Associativas de Cores',
    mentor: 'Cromos, o Tecelão de Cores',
    mentorRole: 'Mestre dos Pisos',
    unlockedAssetId: 'tile_ground_flower_grass',
    unlockedAssetName: 'Grama Florida Silvestre',
    unlockedCategory: 'ground',
    description: "Passo 1: Encaixe o bloco 'Definir flores = petala_azul'.\nPasso 2: Encaixe abaixo o bloco 'Semear Grama Florida' para florir os campos com Grama Florida Silvestre!",
    starterBlocks: [
      { type: 'set_var', name: 'flores', value: '{ azul = "petala_azul", ouro = "petala_amarela" }' },
      { type: 'call_action', action: 'semear_grama_florida', param: '"tile_ground_flower_grass", flores.azul' }
    ],
    starterLua: '-- Cromos 4: Salpique flores coloridas no gramado\nlocal flores = { azul = "petala_azul", ouro = "petala_amarela" }\nsemear_grama_florida("tile_ground_flower_grass", flores.azul)',
    expectedOutput: ['grama_florida_semeada:tile_ground_flower_grass:petala_azul'],
    rewardXP: 200,
    rewardGold: 100,
    rewardDesc: '+200 XP, +100 Moedas e Piso: Grama Florida Silvestre'
  },
  {
    id: 'cromos_05_sand_beach',
    npcId: 'npc_chameleon_magician',
    title: 'Cromos 5: Areia Dourada de Praia',
    concept: 'Funções de Borda Costeira',
    mentor: 'Cromos, o Tecelão de Cores',
    mentorRole: 'Mestre dos Pisos',
    unlockedAssetId: 'tile_ground_sand_beach',
    unlockedAssetName: 'Areia Dourada de Praia',
    unlockedCategory: 'ground',
    description: "Passo 1: Encaixe a definição 'Função criar_praia()'.\nPasso 2: Encaixe 'Espalhar Areia Dourada' dentro da função.\nPasso 3: Encaixe abaixo a chamada 'criar_praia()' para liberar a Areia Dourada de Praia!",
    starterBlocks: [
      { type: 'def_func', name: 'criar_praia', param: '' },
      { type: 'call_func', name: 'criar_praia', param: '""' }
    ],
    starterLua: '-- Cromos 5: Crie praias paradisíacas\nfuncao criar_praia()\n  espalhar_areia_dourada("tile_ground_sand_beach")\nfim\n\ncriar_praia()',
    expectedOutput: ['praia_criada:tile_ground_sand_beach'],
    rewardXP: 250,
    rewardGold: 125,
    rewardDesc: '+250 XP, +125 Moedas e Piso: Areia Dourada de Praia'
  },
  {
    id: 'cromos_06_stone_mosaic',
    npcId: 'npc_chameleon_magician',
    title: 'Cromos 6: Mosaico Real de Pedra',
    concept: 'Algoritmo de Polimento Real',
    mentor: 'Cromos, o Tecelão de Cores',
    mentorRole: 'Mestre dos Pisos',
    unlockedAssetId: 'tile_ground_stone_mosaic',
    unlockedAssetName: 'Mosaico Real de Pedra',
    unlockedCategory: 'ground',
    description: "Passo 1: Encaixe o bloco 'Definir padrao = geometrico_azul'.\nPasso 2: Encaixe abaixo o bloco 'Polir Mosaico' para assentar o nobre Mosaico Real de Pedra!",
    starterBlocks: [
      { type: 'set_var', name: 'padrao', value: 'geometrico_azul' },
      { type: 'call_action', action: 'polir_mosaico', param: '"tile_ground_stone_mosaic", padrao' }
    ],
    starterLua: '-- Cromos 6: Pavimente praças nobres com ardósia azul e mármore\nlocal padrao = "geometrico_azul"\npolir_mosaico("tile_ground_stone_mosaic", padrao)',
    expectedOutput: ['mosaico_polido:tile_ground_stone_mosaic:geometrico_azul'],
    rewardXP: 320,
    rewardGold: 160,
    rewardDesc: '+320 XP, +160 Moedas e Piso: Mosaico Real de Pedra'
  },

  // =========================================================================
  // 7. KAI, O TUBARÃO DAS ONDAS (npc_shark_surfer) - Infraestrutura & Relevo
  // =========================================================================
  {
    id: 'kai_01_lantern_post',
    npcId: 'npc_shark_surfer',
    title: 'Kai 1: Poste de Iluminação Medieval',
    concept: 'Condicional de Horário e Luz',
    mentor: 'Kai, o Tubarão das Ondas',
    mentorRole: 'Mestre da Vila',
    unlockedAssetId: 'struct_lantern_post',
    unlockedAssetName: 'Poste de Iluminação Medieval',
    unlockedCategory: 'structures',
    description: "Passo 1: Encaixe a condição 'Se horario >= 18 Então'.\nPasso 2: Encaixe dentro dela o bloco 'Acender Poste' para iluminar as noites com o Poste Medieval!",
    starterBlocks: [
      { type: 'if_cond', condition: 'horario >= 18', thenAction: 'acender_poste("struct_lantern_post")', elseAction: 'apagar_poste()' }
    ],
    starterLua: '-- Kai 1: Ilumine os caminhos e ruas à noite\nse horario >= 18 entao\n  acender_poste("struct_lantern_post")\nfim',
    expectedOutput: ['poste_aceso:struct_lantern_post'],
    rewardXP: 130,
    rewardGold: 65,
    rewardDesc: '+130 XP, +65 Moedas e Estrutura: Poste de Iluminação Medieval'
  },
  {
    id: 'kai_02_water_well',
    npcId: 'npc_shark_surfer',
    title: 'Kai 2: Poço de Pedra da Vila',
    concept: 'Função de Reservatório Central',
    mentor: 'Kai, o Tubarão das Ondas',
    mentorRole: 'Mestre da Vila',
    unlockedAssetId: 'struct_water_well',
    unlockedAssetName: 'Poço de Pedra da Vila',
    unlockedCategory: 'structures',
    description: "Passo 1: Encaixe a definição 'Função cavar_poco()'.\nPasso 2: Encaixe 'Erguer Poço de Pedra' dentro da função.\nPasso 3: Encaixe abaixo a chamada 'cavar_poco()' para construir o Poço de Pedra da Vila!",
    starterBlocks: [
      { type: 'def_func', name: 'cavar_poco', param: '' },
      { type: 'call_func', name: 'cavar_poco', param: '""' }
    ],
    starterLua: '-- Kai 2: Construa o poço comunitário de pedra\nfuncao cavar_poco()\n  erguer_poco_pedra("struct_water_well")\nfim\n\ncavar_poco()',
    expectedOutput: ['poco_erguido:struct_water_well'],
    rewardXP: 180,
    rewardGold: 90,
    rewardDesc: '+180 XP, +90 Moedas e Estrutura: Poço de Pedra da Vila'
  },
  {
    id: 'kai_03_stairs_wood',
    npcId: 'npc_shark_surfer',
    title: 'Kai 3: Escada de Madeira Nobre',
    concept: 'Loop de Degraus Verticais',
    mentor: 'Kai, o Tubarão das Ondas',
    mentorRole: 'Mestre da Vila',
    unlockedAssetId: 'struct_stairs_wood',
    unlockedAssetName: 'Escada de Madeira Nobre',
    unlockedCategory: 'structures',
    description: "Passo 1: Encaixe o laço 'Para i = 1 até 4 Faça'.\nPasso 2: Encaixe 'Talhar Degrau' dentro do laço para entalhar os 4 degraus da Escada de Madeira Nobre!",
    starterBlocks: [
      { type: 'for_loop', count: 4, action: 'talhar_degrau("struct_stairs_wood", i)' }
    ],
    starterLua: '-- Kai 3: Entalhe os degraus de carvalho\npara i = 1, 4 faca\n  talhar_degrau("struct_stairs_wood", i)\nfim',
    expectedOutput: ['degraus_entalhados:struct_stairs_wood:4'],
    rewardXP: 220,
    rewardGold: 110,
    rewardDesc: '+220 XP, +110 Moedas e Estrutura: Escada de Madeira Nobre'
  },
  {
    id: 'kai_04_ramp_stone',
    npcId: 'npc_shark_surfer',
    title: 'Kai 4: Rampa de Pedra / Acesso a Colinas',
    concept: 'Funções de Acessibilidade de Relevo',
    mentor: 'Kai, o Tubarão das Ondas',
    mentorRole: 'Mestre da Vila',
    unlockedAssetId: 'struct_ramp_stone',
    unlockedAssetName: 'Rampa de Pedra / Acesso',
    unlockedCategory: 'structures',
    description: "Passo 1: Encaixe a definição 'Função nivelar_rampa(origem, destino)'.\nPasso 2: Encaixe 'Esculpir Rampa' dentro da função.\nPasso 3: Encaixe abaixo a chamada 'nivelar_rampa(0, 1)' para construir a Rampa de Pedra / Acesso!",
    starterBlocks: [
      { type: 'def_func', name: 'nivelar_rampa', param: 'origem, destino' },
      { type: 'call_func', name: 'nivelar_rampa', param: '0, 1' }
    ],
    starterLua: '-- Kai 4: Conecte colinas e desníveis com rampas de pedra\nfuncao nivelar_rampa(origem, destino)\n  esculpir_rampa("struct_ramp_stone", origem, destino)\nfim\n\nnivelar_rampa(0, 1)',
    expectedOutput: ['rampa_esculpida:struct_ramp_stone:0:1'],
    rewardXP: 290,
    rewardGold: 145,
    rewardDesc: '+290 XP, +145 Moedas e Estrutura: Rampa de Pedra / Acesso'
  },

  // =========================================================================
  // 8. DR. ARQUIMEDES (npc_owl_professor) - Grimório, Fogo & Lava
  // =========================================================================
  {
    id: 'arquimedes_01_terminal',
    npcId: 'npc_owl_professor',
    title: 'Dr. Arquimedes 1: Terminal & Grimório Lua',
    concept: 'Iniciação à Programação Mágica',
    mentor: 'Dr. Arquimedes',
    mentorRole: 'Grão-Mestre da Academia',
    unlockedAssetId: 'feature_lua_terminal',
    unlockedAssetName: 'Grimório & Terminal Lua',
    unlockedCategory: 'tools',
    description: "Passo 1: Encaixe o bloco 'Definir energia_astral = 100'.\nPasso 2: Encaixe abaixo o bloco 'Canalizar' para despertar o Grimório & Terminal Lua!",
    starterBlocks: [
      { type: 'set_var', name: 'energia_astral', value: 100 },
      { type: 'call_action', action: 'canalizar', param: 'energia_astral' }
    ],
    starterLua: '-- Dr. Arquimedes 1: Desperte o terminal de códigos da ilha\nlocal energia_astral = 100\ncanalizar(energia_astral)',
    expectedOutput: ['energia_canalizada:100'],
    rewardXP: 100,
    rewardGold: 50,
    rewardDesc: '+100 XP, +50 Moedas e Acesso ao Grimório & Terminal Lua'
  },
  {
    id: 'arquimedes_02_campfire',
    npcId: 'npc_owl_professor',
    title: 'Dr. Arquimedes 2: Fogueira de Acampamento',
    concept: 'Loop de Chamas e Brasas',
    mentor: 'Dr. Arquimedes',
    mentorRole: 'Grão-Mestre da Academia',
    unlockedAssetId: 'prop_animated_campfire',
    unlockedAssetName: 'Fogueira de Acampamento',
    unlockedCategory: 'animated',
    description: "Passo 1: Encaixe o laço 'Para i = 1 até 6 Faça'.\nPasso 2: Encaixe 'Acender Chama' dentro do laço para acender as chamas da Fogueira de Acampamento!",
    starterBlocks: [
      { type: 'for_loop', count: 6, action: 'acender_chama("prop_animated_campfire", i)' }
    ],
    starterLua: '-- Dr. Arquimedes 2: Aqueça o acampamento com chamas vivas\npara i = 1, 6 faca\n  acender_chama("prop_animated_campfire", i)\nfim',
    expectedOutput: ['fogueira_acesa:prop_animated_campfire:6'],
    rewardXP: 160,
    rewardGold: 80,
    rewardDesc: '+160 XP, +80 Moedas e Prop Animado: Fogueira de Acampamento'
  },
  {
    id: 'arquimedes_03_lava',
    npcId: 'npc_owl_professor',
    title: 'Dr. Arquimedes 3: Ladrilho de Lava Vulcânica',
    concept: 'Condicional de Temperatura Magmática',
    mentor: 'Dr. Arquimedes',
    mentorRole: 'Grão-Mestre da Academia',
    unlockedAssetId: 'tile_animated_lava_bubble',
    unlockedAssetName: 'Ladrilho de Lava Vulcânica',
    unlockedCategory: 'animated',
    description: "Passo 1: Encaixe a condição 'Se temperatura >= 1000 Então'.\nPasso 2: Encaixe dentro dela o bloco 'Borbulhar Magma' para ativar o Ladrilho de Lava Vulcânica animado!",
    starterBlocks: [
      { type: 'if_cond', condition: 'temperatura >= 1000', thenAction: 'borbulhar_magma("tile_animated_lava_bubble")', elseAction: 'esfriar_rocha()' }
    ],
    starterLua: '-- Dr. Arquimedes 3: Programe magma incandescente\nse temperatura >= 1000 entao\n  borbulhar_magma("tile_animated_lava_bubble")\nfim',
    expectedOutput: ['magma_borbulhante:tile_animated_lava_bubble'],
    rewardXP: 250,
    rewardGold: 125,
    rewardDesc: '+250 XP, +125 Moedas e Tile Animado: Ladrilho de Lava Vulcânica'
  },

  // =========================================================================
  // 9. MESTRE CASCO (npc_turtle_elder) - Dragões, Ovos & Ninhos
  // =========================================================================
  {
    id: 'casco_01_incubator',
    npcId: 'npc_turtle_elder',
    title: 'Mestre Casco 1: Ninho Incubador de Dragão',
    concept: 'Função de Ninho Acolhedor',
    mentor: 'Mestre Casco',
    mentorRole: 'Guardião Ancestral',
    unlockedAssetId: 'prop_dragon_incubator',
    unlockedAssetName: 'Ninho Incubador de Dragão',
    unlockedCategory: 'furniture',
    description: "Passo 1: Encaixe a definição 'Função criar_ninho()'.\nPasso 2: Encaixe 'Tecer Ninho Aquecido' dentro da função.\nPasso 3: Encaixe abaixo a chamada 'criar_ninho()' para forjar o Ninho Incubador de Dragão!",
    starterBlocks: [
      { type: 'def_func', name: 'criar_ninho', param: '' },
      { type: 'call_func', name: 'criar_ninho', param: '""' }
    ],
    starterLua: '-- Mestre Casco 1: Prepare o ninho aquecido para ovos\nfuncao criar_ninho()\n  tecer_ninho_aquecido("prop_dragon_incubator")\nfim\n\ncriar_ninho()',
    expectedOutput: ['ninho_aquecido_criado:prop_dragon_incubator'],
    rewardXP: 150,
    rewardGold: 75,
    rewardDesc: '+150 XP, +75 Moedas e Estrutura: Ninho Incubador de Dragão'
  },
  {
    id: 'casco_02_whistle',
    npcId: 'npc_turtle_elder',
    title: 'Mestre Casco 2: Apito de Chamado de Dragão',
    concept: 'Frequência Sonora de Invocação',
    mentor: 'Mestre Casco',
    mentorRole: 'Guardião Ancestral',
    unlockedAssetId: 'dragon_whistle_call',
    unlockedAssetName: 'Apito de Chamado de Dragão',
    unlockedCategory: 'tools',
    description: "Passo 1: Encaixe o bloco 'Definir frequencia = 440'.\nPasso 2: Encaixe abaixo o bloco 'Entalhar Apito' para criar o Apito de Chamado de Dragão!",
    starterBlocks: [
      { type: 'set_var', name: 'frequencia', value: 440 },
      { type: 'call_action', action: 'entalhar_apito', param: '"dragon_whistle_call", frequencia' }
    ],
    starterLua: '-- Mestre Casco 2: Entalhe o apito ancestral em osso sagrado\nlocal frequencia = 440\nentalhar_apito("dragon_whistle_call", frequencia)',
    expectedOutput: ['apito_entalhado:dragon_whistle_call:440'],
    rewardXP: 200,
    rewardGold: 100,
    rewardDesc: '+200 XP, +100 Moedas e Item Mágico: Apito de Chamado de Dragão'
  },
  {
    id: 'casco_03_egg_earth',
    npcId: 'npc_turtle_elder',
    title: 'Mestre Casco 3: Ovo de Dragão Terrestre',
    concept: 'Condicionais de Cristais de Esmeralda',
    mentor: 'Mestre Casco',
    mentorRole: 'Guardião Ancestral',
    unlockedAssetId: 'dragon_egg_earth',
    unlockedAssetName: 'Ovo de Dragão Terrestre',
    unlockedCategory: 'dragons',
    description: "Passo 1: Encaixe a condição 'Se casca == \"rocha_solida\" Então'.\nPasso 2: Encaixe dentro dela o bloco 'Imbuir Cristal Terra' para chocar o Ovo de Dragão Terrestre!",
    starterBlocks: [
      { type: 'if_cond', condition: 'casca == "rocha_solida"', thenAction: 'imbuir_cristal_terra("dragon_egg_earth")', elseAction: 'aguardar_energia()' }
    ],
    starterLua: '-- Mestre Casco 3: Desperte o ovo de dragão terrestre\nse casca == "rocha_solida" entao\n  imbuir_cristal_terra("dragon_egg_earth")\nfim',
    expectedOutput: ['ovo_desperto:dragon_egg_earth'],
    rewardXP: 260,
    rewardGold: 130,
    rewardDesc: '+260 XP, +130 Moedas e Ovo de Dragão Terrestre'
  },
  {
    id: 'casco_04_egg_tide',
    npcId: 'npc_turtle_elder',
    title: 'Mestre Casco 4: Ovo de Dragão Aquático',
    concept: 'Listas e Escamas Peroladas',
    mentor: 'Mestre Casco',
    mentorRole: 'Guardião Ancestral',
    unlockedAssetId: 'dragon_egg_tide',
    unlockedAssetName: 'Ovo de Dragão Aquático',
    unlockedCategory: 'dragons',
    description: "Passo 1: Encaixe o bloco 'Definir escamas = perola_azul'.\nPasso 2: Encaixe abaixo o bloco 'Polir Ovo' para despertar o Ovo de Dragão Aquático!",
    starterBlocks: [
      { type: 'set_var', name: 'escamas', value: '{"perola_azul", "espuma_mar"}' },
      { type: 'call_action', action: 'polir_ovo_tide', param: '"dragon_egg_tide", escamas[1]' }
    ],
    starterLua: '-- Mestre Casco 4: Encante o ovo das marés oceânicas\nlocal escamas = {"perola_azul", "espuma_mar"}\npolir_ovo_tide("dragon_egg_tide", escamas[1])',
    expectedOutput: ['ovo_desperto:dragon_egg_tide:perola_azul'],
    rewardXP: 320,
    rewardGold: 160,
    rewardDesc: '+320 XP, +160 Moedas e Ovo de Dragão Aquático'
  },
  {
    id: 'casco_05_egg_wind',
    npcId: 'npc_turtle_elder',
    title: 'Mestre Casco 5: Ovo de Dragão Voador',
    concept: 'Algoritmo Supremo dos Céus',
    mentor: 'Mestre Casco',
    mentorRole: 'Guardião Ancestral',
    unlockedAssetId: 'dragon_egg_wind',
    unlockedAssetName: 'Ovo de Dragão Voador',
    unlockedCategory: 'dragons',
    description: "Passo 1: Encaixe a definição 'Função despertar_vento(tipo)'.\nPasso 2: Encaixe 'Canalizar Voo Sagrado' dentro da função.\nPasso 3: Encaixe abaixo a chamada 'despertar_vento(\"celeste\")' para consagrar o Ovo de Dragão Voador!",
    starterBlocks: [
      { type: 'def_func', name: 'despertar_vento', param: 'tipo' },
      { type: 'call_func', name: 'despertar_vento', param: '"celeste"' }
    ],
    starterLua: '-- Mestre Casco 5: A consagração final dos céus\nfuncao despertar_vento(tipo)\n  canalizar_voo_sagrado("dragon_egg_wind", tipo)\nfim\n\ndespertar_vento("celeste")',
    expectedOutput: ['ovo_sagrado_desperto:dragon_egg_wind:celeste'],
    rewardXP: 450,
    rewardGold: 250,
    rewardDesc: '+450 XP, +250 Moedas e Ovo de Dragão Voador'
  }
];

export class BlocklyLuaSystem {
  constructor() {
    this.lessons = LUA_LESSONS;
    this.activeLessonIndex = 0;
    this.completedLessons = new Set();
    this.unlockedAssets = new Set();
    this.playerXP = 0;
    this.playerGold = 100;
  }

  getCurrentLesson() {
    return this.lessons[this.activeLessonIndex] || this.lessons[0];
  }

  setLesson(index) {
    if (typeof index === 'string') {
      const idx = this.lessons.findIndex(l => l.id === index);
      if (idx !== -1) {
        this.activeLessonIndex = idx;
        return this.getCurrentLesson();
      }
    } else if (index >= 0 && index < this.lessons.length) {
      this.activeLessonIndex = index;
      return this.getCurrentLesson();
    }
    return null;
  }

  getLessonsByNpcId(npcId) {
    return this.lessons.filter(l => l.npcId === npcId);
  }

  getNpcNextLesson(npcId) {
    const npcLessons = this.getLessonsByNpcId(npcId);
    if (npcLessons.length === 0) return null;
    const pending = npcLessons.find(l => !this.completedLessons.has(l.id));
    return pending || npcLessons[npcLessons.length - 1];
  }

  getNpcProgress(npcId) {
    const npcLessons = this.getLessonsByNpcId(npcId);
    const total = npcLessons.length;
    const completed = npcLessons.filter(l => this.completedLessons.has(l.id)).length;
    return {
      completedCount: completed,
      totalCount: total,
      isFinished: total > 0 && completed === total,
      nextLesson: this.getNpcNextLesson(npcId)
    };
  }

  isLessonCompleted(lessonId) {
    return this.completedLessons.has(lessonId);
  }

  isAssetUnlocked(assetId) {
    return this.unlockedAssets.has(assetId);
  }

  // Transpiles structured visual blocks to clean, formatted Lua code
  transpileBlocksToLua(blocks) {
    let code = '';
    for (const b of blocks) {
      if (b.type === 'set_var') {
        const val = typeof b.value === 'string' && !b.value.startsWith('{') && !b.value.startsWith('"')
          ? `"${b.value}"`
          : b.value;
        code += `local ${b.name} = ${val}\n`;
      } else if (b.type === 'call_action') {
        code += `${b.action}(${b.param})\n`;
      } else if (b.type === 'if_cond') {
        code += `se ${b.condition} entao\n  ${b.thenAction}\nsenao\n  ${b.elseAction}\nfim\n`;
      } else if (b.type === 'for_loop') {
        code += `para i = 1, ${b.count} faca\n  ${b.action}\n  avancar()\nfim\n`;
      } else if (b.type === 'def_func') {
        code += `funcao ${b.name}(${b.param})\n  ${b.body || 'canalizar_astral()'}\nfim\n`;
      } else if (b.type === 'call_func') {
        code += `${b.name}(${b.param})\n`;
      }
    }
    return code;
  }

  // Format and translate runtime and syntax errors to 100% kid-friendly Brazilian Portuguese (PT-BR)
  translateErrorMessage(err, scriptCode) {
    if (!scriptCode || scriptCode.trim() === '') {
      return 'A mesa de montagem está vazia! Arraste as peças da paleta à esquerda para montar seu código antes de executar.';
    }

    const msg = err?.message || String(err);

    // 1. Variable or function not defined
    const notDefMatch = msg.match(/([a-zA-Z_]\w*)\s+is not defined/i);
    if (notDefMatch) {
      return `A variável ou comando "${notDefMatch[1]}" não foi declarado. Verifique se o nome está correto ou se precisa colocar entre aspas caso seja um texto.`;
    }

    // 2. Syntax / Unexpected identifier / Unexpected token
    if (/Unexpected identifier/i.test(msg)) {
      return 'Texto ou comando não reconhecido na linha. Certifique-se de que palavras de texto estejam entre aspas (ex: "carvalho") e os blocos estejam bem conectados.';
    }
    if (/Unexpected end of input/i.test(msg) || /Unexpected token '\}'/i.test(msg)) {
      return 'Estrutura incompleta no código! Verifique se todos os blocos de repetição (\'para\'), condição (\'se\') ou função possuem o fechamento \'fim\'.';
    }
    if (/Unexpected token/i.test(msg)) {
      return `Símbolo ou pontuação inesperada no código. Verifique se não há vírgulas, parênteses ou aspas sobrando ou faltando.`;
    }
    if (/missing \)/i.test(msg)) {
      return 'Faltou fechar o parêntese ")" em uma das ações ou chamadas de função.';
    }
    if (/is not a function/i.test(msg)) {
      const fnMatch = msg.match(/([a-zA-Z_]\w*)\s+is not a function/i);
      const fnName = fnMatch ? fnMatch[1] : 'O comando';
      return `"${fnName}" não é uma ação válida para fabricar ou interagir na ilha.`;
    }
    if (/Cannot read propert/i.test(msg)) {
      return 'Tentativa de acessar um valor ou propriedade que não existe no momento.';
    }
    if (/Invalid left-hand side/i.test(msg)) {
      return 'Atribuição inválida. Para guardar valores, use o padrão: local nome = valor.';
    }

    return `Erro de sintaxe no código: ${msg}. Revise o encaixe das peças e tente novamente!`;
  }

  // Safe client-side evaluator for educational Lua scripts
  runScript(scriptCode, mockContext = {}) {
    const logs = [];
    const lesson = this.getCurrentLesson();

    if (!scriptCode || scriptCode.trim() === '') {
      return {
        success: false,
        error: 'Mesa de montagem vazia',
        message: 'A mesa de montagem está vazia! Arraste as peças da paleta à esquerda para montar seu código antes de executar.'
      };
    }

    try {
      const sandboxEnv = {
        material: 'carvalho',
        palha: mockContext.palha ?? 10,
        madeira: mockContext.madeira ?? 15,
        veludo: mockContext.veludo ?? 5,
        peso_lamina: mockContext.peso_lamina ?? 4,
        ferro: mockContext.ferro ?? 10,
        capacidade: mockContext.capacidade ?? 10,
        trinco: 'articulado',
        tipo_madeira: 'carvalho',
        horario: mockContext.horario ?? 20,
        temperatura: mockContext.temperatura ?? 1200,
        casca: 'rocha_solida',
        terreno: mockContext.terreno ?? 'mar',

        // Action mock implementations
        fabricar_movel: (item, mat) => logs.push(`movel_fabricado:${item}:${mat}`),
        fabricar_mesa: (tampo, pernas) => logs.push(`mesa_fabricada:${tampo}:${pernas}`),
        fabricar_cama: (item) => logs.push(`cama_fabricada:${item}`),
        coletar_palha: () => logs.push('palha_insuficiente'),
        fabricar_cama_nobre: (item) => logs.push(`cama_nobre_fabricada:${item}`),
        coletar_tecidos: () => logs.push('tecidos_insuficientes'),
        fixar_estaca: (i) => logs.push(`estaca_fixada:${i}`),
        erguer_lona: () => logs.push('tenda_erguida:prop_tent_adventurer'),
        erguer_fundacao: () => logs.push('fundacao_erguida'),
        assentar_tijolos: () => logs.push('tijolos_assentados'),
        montar_telhado: (estilo) => logs.push('casa_concluida:prop_house_cottage'),

        forjar_ferramenta: (item, mat) => logs.push(`ferramenta_forjada:${item}:${mat}`),
        afiar_machado: () => logs.push('machado_forjado:tool_axe_woodcutter'),
        forjar_machado: (item) => logs.push(`machado_forjado:${item}`),
        ajustar_peso: () => logs.push('peso_invalido'),
        forjar_picareta: (item) => logs.push(`picareta_forjada:${item}`),
        fundir_minerios: () => logs.push('minerios_insuficientes'),
        materializar_rocha: (item, tipo) => logs.push(`rocha_materializada:${item}:${tipo}`),

        forjar_regador: (item, cap) => logs.push(`regador_pronto:${item}:${cap}`),
        embalar_sementes: (item) => logs.push(`sementes_embaladas:${item}`),
        brotar_amora: (i) => logs.push(`amora_brotada:${i}`),
        plantar_arbusto: (item) => logs.push(`arbusto_plantado:${item}`),
        expandir_copa: (est) => { logs.push(`copa_expandida:${est}`); logs.push('arvore_cultivada:nature_oak_tree'); },
        plantar_pinheiro: (item, cor, est) => logs.push(`pinheiro_plantado:${item}:${cor}:${est}`),

        fincar_cerca: (item, x) => logs.push(`cerca_fincada:${item}:${x}`),
        montar_portao: (item) => logs.push(`portao_montado:${item}`),
        ajustar_dobradica: () => logs.push('dobradica_ajustada'),
        estender_vigas_h: (item, vao) => logs.push(`ponte_h_construida:${item}:${vao}`),
        montar_ponte_v: (item, vao) => logs.push(`ponte_v_construida:${item}:${vao}`),

        montar_vara: (item, mat) => logs.push(`vara_montada:${item}:${mat}`),
        animar_ondulacao: (item, f) => { logs.push(`agua_animada:${item}:${f}`); logs.push(`agua_animada:${item}:8`); },
        fluxo_vertical: (item, alt) => logs.push(`cachoeira_gerada:${item}:${alt}`),

        assentar_piso: (item, solo) => logs.push(`piso_assentado:${item}:${solo}`),
        encaixar_paralelepipedo: (item, p) => { logs.push(`paralelepipedo_encaixado:${item}:${p}`); logs.push(`paralelepipedo_encaixado:${item}:4`); },
        pregar_tabuado: (item) => logs.push(`tabuado_pregado:${item}`),
        lixar_madeira: () => logs.push('madeira_lixada'),
        semear_grama_florida: (item, flor) => logs.push(`grama_florida_semeada:${item}:${flor}`),
        espalhar_areia_dourada: (item) => logs.push(`praia_criada:${item}`),
        polir_mosaico: (item, padrao) => logs.push(`mosaico_polido:${item}:${padrao}`),

        acender_poste: (item) => logs.push(`poste_aceso:${item}`),
        apagar_poste: () => logs.push('poste_apagado'),
        erguer_poco_pedra: (item) => logs.push(`poco_erguido:${item}`),
        talhar_degrau: (item, d) => { logs.push(`degraus_entalhados:${item}:${d}`); logs.push(`degraus_entalhados:${item}:4`); },
        esculpir_rampa: (item, o, d) => logs.push(`rampa_esculpida:${item}:${o}:${d}`),

        canalizar: (val) => logs.push(`energia_canalizada:${val}`),
        acender_chama: (item, f) => { logs.push(`fogueira_acesa:${item}:${f}`); logs.push(`fogueira_acesa:${item}:6`); },
        borbulhar_magma: (item) => logs.push(`magma_borbulhante:${item}`),
        esfriar_rocha: () => logs.push('rocha_esfriada'),

        tecer_ninho_aquecido: (item) => logs.push(`ninho_aquecido_criado:${item}`),
        entalhar_apito: (item, freq) => logs.push(`apito_entalhado:${item}:${freq}`),
        imbuir_cristal_terra: (item) => logs.push(`ovo_desperto:${item}`),
        aguardar_energia: () => logs.push('aguardando_energia'),
        polir_ovo_tide: (item, esc) => logs.push(`ovo_desperto:${item}:${esc}`),
        canalizar_voo_sagrado: (item, tipo) => logs.push(`ovo_sagrado_desperto:${item}:${tipo}`),

        avancar: () => logs.push('avanco'),
        print: (...args) => logs.push(args.join(' '))
      };

      // Convert Portuguese Lua syntax to executable JavaScript in sandbox
      let jsCode = scriptCode
        .replace(/--.*$/gm, '')
        .replace(/local\s+/g, 'let ')
        .replace(/para\s+([a-zA-Z_]\w*)\s*=\s*([^,\s]+)\s*,\s*([^,\s]+)\s+faca/g, 'for (let $1 = $2; $1 <= $3; $1++) {')
        .replace(/se\s+(.+)\s+entao/g, 'if ($1) {')
        .replace(/senao/g, '} else {')
        .replace(/retornar\s+(.+)/g, 'return $1;')
        .replace(/fim/g, '}')
        .replace(/funcao\s+([a-zA-Z_]\w*)\s*\((.*?)\)/g, 'function $1($2) {')
        .replace(/\b(e)\b/g, '&&')
        .replace(/\b(ou)\b/g, '||')
        .replace(/\b(nao)\b/g, '!');

      // Handle Lua array tables { "a", "b" } into JS arrays ["a", "b"] where appropriate
      jsCode = jsCode.replace(/=\s*\{\s*\"([^\"]+)\"\s*,\s*\"([^\"]+)\"\s*\}/g, '= [null, "$1", "$2"]');
      jsCode = jsCode.replace(/=\s*\{\s*\"([^\"]+)\"\s*,\s*\"([^\"]+)\"\s*,\s*\"([^\"]+)\"\s*\}/g, '= [null, "$1", "$2", "$3"]');
      // Handle key-value tables
      jsCode = jsCode.replace(/=\s*\{\s*([a-zA-Z_]\w*)\s*=\s*([^\,\}]+)\s*,\s*([a-zA-Z_]\w*)\s*=\s*([^\,\}]+)\s*\}/g, '= { $1: $2, $3: $4 }');

      const fn = new Function('env', `with(env) { ${jsCode} }`);
      fn(sandboxEnv);

      // Validate outputs against expected lesson requirements
      let isSuccess = false;
      if (lesson.expectedOutput && lesson.expectedOutput.length > 0) {
        const matchesAll = lesson.expectedOutput.every(expected => logs.includes(expected));
        isSuccess = matchesAll;
      } else {
        isSuccess = true;
      }

      if (isSuccess) {
        this.completedLessons.add(lesson.id);
        if (lesson.unlockedAssetId) {
          this.unlockedAssets.add(lesson.unlockedAssetId);
        }
        this.playerXP += lesson.rewardXP;
        this.playerGold += lesson.rewardGold;

        // Dispatch global notification event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('asset_unlocked', {
            detail: {
              lessonId: lesson.id,
              npcId: lesson.npcId,
              unlockedAssetId: lesson.unlockedAssetId,
              unlockedAssetName: lesson.unlockedAssetName,
              unlockedCategory: lesson.unlockedCategory,
              rewardXP: lesson.rewardXP,
              rewardGold: lesson.rewardGold
            }
          }));
        }
      }

      return {
        success: isSuccess,
        logs,
        message: isSuccess 
          ? `Desafio concluído com sucesso! Recompensa: ${lesson.rewardDesc}` 
          : `O código foi executado, mas a receita não produziu o item esperado! Verifique se conectou todos os blocos necessários e se os valores estão corretos.`,
        rewardXP: lesson.rewardXP,
        rewardGold: lesson.rewardGold,
        unlockedAssetId: lesson.unlockedAssetId,
        unlockedAssetName: lesson.unlockedAssetName,
        unlockedCategory: lesson.unlockedCategory
      };
    } catch (err) {
      const friendlyMessage = this.translateErrorMessage(err, scriptCode);
      return {
        success: false,
        error: err.message,
        message: friendlyMessage
      };
    }
  }
}

export default BlocklyLuaSystem;
