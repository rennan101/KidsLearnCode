# Diretrizes de Design & UI - KidsLearnCode

## 1. Regra de Ouro: Sem Emojis na Interface (UI)
- **Proibição Estrita de Emojis**: É expressamente proibido o uso de emojis (ex: 🔑, 🎒, 🎭, 🛡️, ☁️, 🧙‍♂️, 🐾, ✨, etc.) em botões, abas, modais, cabeçalhos, formulários ou qualquer componente de interface com o usuário.
- **Uso Exclusivo de SVGs Profissionais**: Todos os ícones visuais devem ser renderizados através de elementos `<svg>` inline limpos, com classes utilitárias (`ui-icon`, `icon-sm`, etc.), `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"` e traços vetoriais modernos (Lucide / Feather / Heroicons style).

## 2. Padrões de Interface do Usuário
- **Tipografia**: Utilizar as fontes do projeto (`Cinzel` para títulos de alta fantasia, `Outfit` para corpo/botões e `JetBrains Mono` para coordenadas/código).
- **Consistência Visual**: Manter a paleta dark fantasy / cyberpunk medieval (#090c12, #141923, #1e293b, acentos em #3b82f6 e #10b981).
- **Sem Informações Desnecessárias**: Modais e painéis devem ser objetivos, minimalistas e livres de textos redundantes ou placeholders desnecessários.
