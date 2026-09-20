// Educational Blockly / Lua Coding Challenges & Execution Sandbox for Kids (Dr. Arquimedes Questline)

export class BlocklyLuaSystem {
  constructor() {
    this.challenges = [
      {
        id: 'challenge_01_intro_lua',
        npcId: 'npc_owl_professor',
        title: 'Lição 1: O Primeiro Feitiço do Dragão',
        description: 'Faça o dragão acender 3 tochas mágicas em linha reta usando um laço de repetição (`for`).',
        starterLua: '-- Dr. Arquimedes: Use um loop para acender as 3 tochas!\nfor i = 1, 3 do\n  acender_tocha(i)\n  avancar()\nend',
        expectedOutput: ['tocha_1_acesa', 'avanco', 'tocha_2_acesa', 'avanco', 'tocha_3_acesa', 'avanco'],
        rewardXP: 100,
        rewardAP: 1
      },
      {
        id: 'challenge_02_conditions',
        npcId: 'npc_owl_professor',
        title: 'Lição 2: O Guardião dos Portões',
        description: 'Crie uma condição (`if`) para abrir o portão apenas se o herói tiver a Chave Dourada.',
        starterLua: '-- Verifique se possui a chave da ilha!\nif tem_item("chave_dourada") then\n  abrir_portao()\nelse\n  pedir_ajuda()\nend',
        expectedOutput: ['portao_aberto'],
        rewardXP: 150,
        rewardAP: 1
      }
    ];

    this.activeChallengeIndex = 0;
    this.completedChallenges = new Set();
  }

  getCurrentChallenge() {
    return this.challenges[this.activeChallengeIndex];
  }

  // Safe client-side evaluator for educational Lua-like pseudo-script
  runScript(scriptCode, gameContext = {}) {
    const logs = [];
    try {
      const sandboxEnv = {
        acender_tocha: (num) => logs.push(`tocha_${num}_acesa`),
        avancar: () => logs.push('avanco'),
        abrir_portao: () => logs.push('portao_aberto'),
        pedir_ajuda: () => logs.push('ajuda_solicitada'),
        tem_item: (item) => gameContext.hasItem ? gameContext.hasItem(item) : true,
        print: (...args) => logs.push(args.join(' '))
      };

      // Convert simple Lua syntax (for, if then end) to JS equivalent for instant kid feedback
      let jsCode = scriptCode
        .replace(/--.*$/gm, '')
        .replace(/for\s+([a-zA-Z_]\w*)\s*=\s*(\d+)\s*,\s*(\d+)\s+do/g, 'for (let $1 = $2; $1 <= $3; $1++) {')
        .replace(/if\s+(.+)\s+then/g, 'if ($1) {')
        .replace(/else/g, '} else {')
        .replace(/end/g, '}');

      const fn = new Function('env', `with(env) { ${jsCode} }`);
      fn(sandboxEnv);

      return {
        success: true,
        logs,
        message: 'Código executado com sucesso!'
      };
    } catch (err) {
      return {
        success: false,
        error: err.message,
        message: `Erro na execução do código: ${err.message}`
      };
    }
  }
}
