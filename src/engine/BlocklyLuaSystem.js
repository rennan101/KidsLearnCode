/**
 * BlocklyLuaSystem - Sprint 6 Educational Coding Engine
 * Gerencia a trilha pedagógica de pensamento computacional, transpilador Blockly ➔ Lua,
 * execução no sandbox e recompensas no jogo com o mentor Dr. Arquimedes.
 */

export const LUA_LESSONS = [
  {
    id: 'lesson_1_variables',
    title: 'Lição 1: Variáveis & Criação de Móveis',
    concept: 'Variáveis & Instanciação',
    mentor: 'Dr. Arquimedes',
    mentorRole: 'Professor da Ilha Lua',
    description: 'Aprenda a guardar valores em variáveis e criar seu primeiro item para a vila. Declare a variável item e use criar(item).',
    starterBlocks: [
      { type: 'set_var', name: 'item', value: 'bancada_madeira' },
      { type: 'call_action', action: 'criar', param: 'item' }
    ],
    starterLua: '-- Lição 1: Crie uma variável e invoque criar()\nlocal item = "bancada_madeira"\ncriar(item)',
    expectedOutput: ['item_criado:bancada_madeira'],
    rewardXP: 100,
    rewardGold: 50,
    rewardDesc: '+100 XP, +50 Moedas e Receita da Cadeira Real'
  },
  {
    id: 'lesson_2_conditionals',
    title: 'Lição 2: Condicionais (Se / Então / Senão)',
    concept: 'Condicionais (If / Else)',
    mentor: 'Dr. Arquimedes',
    mentorRole: 'Professor da Ilha Lua',
    description: 'Use uma condição para verificar se você possui a Chave de Ouro antes de tentar abrir o Portão Ancestral.',
    starterBlocks: [
      { type: 'if_cond', condition: 'tem_item("chave_ouro")', thenAction: 'abrir_portao()', elseAction: 'pedir_dica()' }
    ],
    starterLua: '-- Lição 2: Verifique a posse do item com if\nse tem_item("chave_ouro") entao\n  abrir_portao()\nsenao\n  pedir_dica()\nfim',
    expectedOutput: ['portao_aberto'],
    rewardXP: 150,
    rewardGold: 75,
    rewardDesc: '+150 XP e Chave de Ferro da Floresta'
  },
  {
    id: 'lesson_3_math_workbench',
    title: 'Lição 3: Matemática & Forja de Ferramentas',
    concept: 'Operadores Lógicos & Aritméticos',
    mentor: 'Brutus da Bigorna',
    mentorRole: 'Ferreiro Real',
    description: 'Verifique se você possui madeira suficiente (>= 10) e minério de ferro (>= 5) para forjar uma Picareta Mágica.',
    starterBlocks: [
      { type: 'if_cond', condition: 'madeira >= 10 e ferro >= 5', thenAction: 'forjar("picareta_magica")', elseAction: 'coletar_mais()' }
    ],
    starterLua: '-- Lição 3: Valide recursos na bigorna\nse madeira >= 10 e ferro >= 5 entao\n  forjar("picareta_magica")\nsenao\n  coletar_mais()\nfim',
    expectedOutput: ['item_forjado:picareta_magica'],
    rewardXP: 200,
    rewardGold: 100,
    rewardDesc: '+200 XP e Picareta Mágica'
  },
  {
    id: 'lesson_4_loops',
    title: 'Lição 4: Laços de Repetição (Para / For)',
    concept: 'Laços de Repetição (Loops)',
    mentor: 'Flora dos Brotos',
    mentorRole: 'Herbalista da Vila',
    description: 'Use um laço de repetição (for) para plantar 4 árvores frutíferas em fileira ao redor do vilarejo.',
    starterBlocks: [
      { type: 'for_loop', count: 4, action: 'plantar_arvore(i)' }
    ],
    starterLua: '-- Lição 4: Plante 4 árvores com um laço for\npara i = 1, 4 faca\n  plantar_arvore(i)\n  avancar()\nfim',
    expectedOutput: ['arvore_plantada:1', 'avanco', 'arvore_plantada:2', 'avanco', 'arvore_plantada:3', 'avanco', 'arvore_plantada:4', 'avanco'],
    rewardXP: 250,
    rewardGold: 120,
    rewardDesc: '+250 XP e Sementes de Flores Raras'
  },
  {
    id: 'lesson_5_functions',
    title: 'Lição 5: Funções & Chocagem de Ovos',
    concept: 'Funções & Modularização',
    mentor: 'Dr. Arquimedes',
    mentorRole: 'Professor da Ilha Lua',
    description: 'Crie uma função chamada chocar_ninho(tipo) que executa aquecer() e adotar(tipo). Depois chame a função!',
    starterBlocks: [
      { type: 'def_func', name: 'chocar_ninho', param: 'tipo' },
      { type: 'call_func', name: 'chocar_ninho', param: '"solar"' }
    ],
    starterLua: '-- Lição 5: Declare e execute sua função\nfuncao chocar_ninho(tipo)\n  aquecer_ninho()\n  adotar(tipo)\nfim\n\nchocar_ninho("solar")',
    expectedOutput: ['ninho_aquecido', 'dragao_adotado:solar'],
    rewardXP: 300,
    rewardGold: 150,
    rewardDesc: '+300 XP e Apito Dourado de Dragão'
  },
  {
    id: 'lesson_6_dragon_field_moves',
    title: 'Lição 6: Field Moves dos Dragões via Código',
    concept: 'Automação & Lógica Avançada',
    mentor: 'Mestre Casco',
    mentorRole: 'Guardião Ancestral',
    description: 'Programe seu dragão para ativar o Field Move correto: se estiver na água ("mar"), use congelar_superficie(); senão use voo_livre().',
    starterBlocks: [
      { type: 'if_cond', condition: 'terreno == "mar"', thenAction: 'congelar_superficie()', elseAction: 'voo_livre()' }
    ],
    starterLua: '-- Lição 6: Controle o poder dos dragões com Lua!\nse terreno == "mar" entao\n  congelar_superficie()\nsenao\n  voo_livre()\nfim',
    expectedOutput: ['superficie_congelada'],
    rewardXP: 500,
    rewardGold: 300,
    rewardDesc: '+500 XP, Medalha Mestre da Programação Lua e Dragão Mítico Astra'
  }
];

export class BlocklyLuaSystem {
  constructor() {
    this.lessons = LUA_LESSONS;
    this.activeLessonIndex = 0;
    this.completedLessons = new Set();
    this.playerXP = 0;
    this.playerGold = 100;
  }

  getCurrentLesson() {
    return this.lessons[this.activeLessonIndex] || this.lessons[0];
  }

  setLesson(index) {
    if (index >= 0 && index < this.lessons.length) {
      this.activeLessonIndex = index;
      return this.getCurrentLesson();
    }
    return null;
  }

  // Transpiles structured visual blocks to clean, formatted Lua code
  transpileBlocksToLua(blocks) {
    let code = '';
    for (const b of blocks) {
      if (b.type === 'set_var') {
        code += `local ${b.name} = "${b.value}"\n`;
      } else if (b.type === 'call_action') {
        code += `${b.action}(${b.param})\n`;
      } else if (b.type === 'if_cond') {
        code += `se ${b.condition} entao\n  ${b.thenAction}\nsenao\n  ${b.elseAction}\nfim\n`;
      } else if (b.type === 'for_loop') {
        code += `para i = 1, ${b.count} faca\n  ${b.action}\n  avancar()\nfim\n`;
      } else if (b.type === 'def_func') {
        code += `funcao ${b.name}(${b.param})\n  aquecer_ninho()\n  adotar(${b.param})\nfim\n`;
      } else if (b.type === 'call_func') {
        code += `${b.name}(${b.param})\n`;
      }
    }
    return code;
  }

  // Safe client-side evaluator for educational Lua scripts
  runScript(scriptCode, mockContext = {}) {
    const logs = [];
    const lesson = this.getCurrentLesson();

    try {
      const sandboxEnv = {
        madeira: mockContext.madeira ?? 15,
        ferro: mockContext.ferro ?? 8,
        terreno: mockContext.terreno ?? 'mar',
        criar: (item) => logs.push(`item_criado:${item}`),
        tem_item: (item) => true,
        abrir_portao: () => logs.push('portao_aberto'),
        pedir_dica: () => logs.push('dica_solicitada'),
        forjar: (item) => logs.push(`item_forjado:${item}`),
        coletar_mais: () => logs.push('precisa_mais_recursos'),
        plantar_arvore: (i) => logs.push(`arvore_plantada:${i}`),
        avancar: () => logs.push('avanco'),
        aquecer_ninho: () => logs.push('ninho_aquecido'),
        adotar: (tipo) => logs.push(`dragao_adotado:${tipo}`),
        congelar_superficie: () => logs.push('superficie_congelada'),
        voo_livre: () => logs.push('voo_ativado'),
        print: (...args) => logs.push(args.join(' '))
      };

      // Convert Portuguese Lua keywords to executable JS sandbox code
      let jsCode = scriptCode
        .replace(/--.*$/gm, '')
        .replace(/local\s+/g, 'let ')
        .replace(/para\s+([a-zA-Z_]\w*)\s*=\s*(\d+)\s*,\s*(\d+)\s+faca/g, 'for (let $1 = $2; $1 <= $3; $1++) {')
        .replace(/se\s+(.+)\s+entao/g, 'if ($1) {')
        .replace(/senao/g, '} else {')
        .replace(/fim/g, '}')
        .replace(/funcao\s+([a-zA-Z_]\w*)\s*\((.*?)\)/g, 'function $1($2) {')
        .replace(/\b(e)\b/g, '&&')
        .replace(/\b(ou)\b/g, '||')
        .replace(/\b(nao)\b/g, '!');

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
        this.playerXP += lesson.rewardXP;
        this.playerGold += lesson.rewardGold;
      }

      return {
        success: isSuccess,
        logs,
        message: isSuccess 
          ? `🎉 Parabéns! Desafio concluído! Recompensa: ${lesson.rewardDesc}` 
          : `⚠️ O código rodou, mas o resultado esperado não foi atingido. Revise a lógica e tente novamente!`,
        rewardXP: lesson.rewardXP,
        rewardGold: lesson.rewardGold
      };
    } catch (err) {
      return {
        success: false,
        error: err.message,
        message: `❌ Erro de sintaxe no código Lua: ${err.message}`
      };
    }
  }
}
