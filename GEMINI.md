# Diretrizes de Design & UI - KidsLearnCode

## 1. Regra de Ouro: Padrão Visual Animal Island UI (Obrigatório em Toda a Plataforma)
- **Animal Island UI Obrigatório**: É mandatório utilizar o sistema visual do **Animal Island UI (`animal-island-ui-style`)** em **TODA** a plataforma KidsLearnCode (Play Mode, Edit Mode, Modais, Desafios de Código, Gaveta de Assets, Diálogos e Menus).
- **Paleta de Cores Aconchegante**:
  - **Fundos**: Pergaminho e creme aconchegante (`#f8f8f0`, `#fdfbf7`, `#f7f3df`, `#e6f9f6`).
  - **Tipografia**: Marrom-terra acolhedor (`#794f27`, `#725d42`, `#8a7b66`) — **NUNCA** utilizar preto puro (`#000000`).
  - **Acentos**: Verde Menta/Teal (`#19c8b9`, `#0f8e83`, `#3dd4c6`), Madeira (`#7a583e`, `#5c3c26`), Dourado (`#f59e0b`) e Laranja (`#ea580c`).
- **Formas e Botões 3D Táteis**:
  - Botões, inputs, abas e badges devem utilizar formato de **pílula de 50px (`border-radius: 50px`)** com profundidade sólida 3D (`box-shadow: 0 4px 0 0 [tom-escuro]`) e efeito *press-down* no clique (`:active { transform: translateY(3px); box-shadow: 0 1px 0 0 [tom-escuro]; }`).
- **Modais e Painéis**:
  - Cartões com cantos arredondados generosos (`border-radius: 18px` a `24px`), borda marrom-chocolate suave (`#7a583e` ou `#c4b89e`), fundo pergaminho (`#fdfbf7`), sem desfoque de fundo (sem `backdrop-filter: blur`), com transições limpas.

## 2. Regra Estrita: Sem Emojis na Interface (UI)
- **Proibição Estrita de Emojis**: É expressamente proibido o uso de emojis (ex: 🔑, 🎒, 🎭, 🛡️, ☁️, 🧙‍♂️, 🐾, ✨, etc.) em botões, abas, modais, cabeçalhos, formulários ou qualquer componente visual.
- **Uso Exclusivo de SVGs Profissionais**: Todos os ícones visuais devem ser renderizados através de elementos `<svg>` inline limpos, com classes utilitárias (`ui-icon`, `icon-sm`, etc.), `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"` e traços vetoriais modernos.

## 3. Tipografia & Cursores
- **Tipografia**: `Nunito` / `Outfit` para corpo e botões, `Cinzel` para títulos de destaque e `JetBrains Mono` para código e coordenadas.
- **Cursores Animal Island**: Utilizar os cursores temáticos em SVG com estilo Animal Crossing (`--animal-cursor-default`, `--animal-cursor-pointer`, `--animal-cursor-grab`, `--animal-cursor-grabbing`).

## 4. Integridade de Código & Prevenção de Regressões
- **Verificação Obrigatória de Impacto Cruzado**: Antes e após qualquer alteração, é mandatório verificar rigorosamente se a mudança afeta ou quebra outros módulos, sintaxe, assinaturas de funções, variáveis e referências no DOM (`document.getElementById`, classes e listeners).
- **Validação de Sintaxe e Imports**: Executar checagem de sintaxe e testes de importação nos módulos JavaScript para assegurar que nenhum erro em tempo de execução impeça a inicialização da engine, o carregamento de assets ou o ciclo do game loop.

