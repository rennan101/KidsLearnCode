# 🚀 Local Server & Deployment Quickstart

#setup #server #localhost #deploy #guide

---

## ⚡ Como Rodar o Jogo Localmente

### Opção 1: Duplo Clique no Finder (macOS)
Dê um duplo clique no arquivo:
```
start.command
```
*O script inicia o servidor HTTP e abre o navegador padrão automaticamente em `http://localhost:8000`.*

---

### Opção 2: Via Terminal (Script Shell)
```bash
./start.sh
```

---

### Opção 3: Via NPM
```bash
npm start
```

---

## 🌐 Deploy em Produção (Static Web Hosting)
Como o motor é 100% cliente-side utilizando Vanilla JS, ES Modules e HTML5 Canvas, o projeto pode ser publicado diretamente em qualquer hospedagem estática:
* **Vercel**: `npx vercel`
* **Netlify**: `npx netlify deploy`
* **GitHub Pages**: Upload dos arquivos para a branch `gh-pages`
* **Firebase Hosting**: `firebase deploy`

---

## 🔗 Links Relacionados
* [[Keyboard Shortcuts & Controls Cheatsheet]]
* [[Developer Workflow & Coding Conventions]]
* [[Game Loop & Canvas Coordinator]]
