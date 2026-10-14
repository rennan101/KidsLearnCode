#!/bin/bash
# =============================================================================
# Iniciar Servidor KidsLearnCode (1-Click Launcher para Mac mini)
# Dá dois cliques ou roda uma vez: baixa cloudflared se faltar,
# inicia o servidor Node.js + Banco e liga o Cloudflare Tunnel automaticamente.
# =============================================================================

# Define a pasta raiz do projeto de forma resiliente
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "========================================================"
echo "🏰 INICIANDO SERVIDOR DEDICADO KIDSLEARNCODE"
echo "========================================================"
echo "Pasta do Projeto: $DIR"
echo ""

# 1. Verificar se cloudflared local existe e é executável
if [ ! -f "./cloudflared" ] || [ ! -s "./cloudflared" ] || grep -q "Not Found" "./cloudflared" 2>/dev/null; then
  echo "📥 Baixando utilitário de conexão Cloudflare Tunnel (macOS Intel)..."
  rm -f ./cloudflared ./cloudflared.tgz
  curl -s -L -o ./cloudflared.tgz https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-amd64.tgz
  tar -xzf ./cloudflared.tgz
  rm -f ./cloudflared.tgz
  chmod +x ./cloudflared
  xattr -d com.apple.quarantine ./cloudflared 2>/dev/null || true
  echo "✅ Cloudflared pronto!"
fi

# 2. Verificar dependências do servidor Node.js
if [ ! -d "server/node_modules" ]; then
  echo "📦 Instalando dependências do servidor (express, pg, ws, etc)..."
  npm --prefix server install
fi

# 3. Iniciar o servidor Node.js em segundo plano (se já não estiver rodando)
if ! lsof -i :8080 >/dev/null 2>&1; then
  echo "🚀 Iniciando Servidor Node.js (MMORPG + REST + Banco)..."
  (npm --prefix server start) > server/server.log 2>&1 &
  SERVER_PID=$!
  echo "✅ Servidor Node.js ativo (PID: $SERVER_PID)"
  sleep 3
else
  echo "ℹ️ Servidor Node.js já estava ativo na porta 8080."
fi

echo ""
echo "🖥️  Painel Administrativo Local: http://localhost:8080/admin"
echo ""
echo "========================================================"
echo "🌐 CONECTANDO JOGADORES PELA INTERNET (CLOUDFLARE)..."
echo "Aguarde alguns segundos enquanto seu link público é gerado:"
echo "========================================================"
echo ""

# 3. Executar o Cloudflare Tunnel exibindo o link público na tela
./cloudflared tunnel --url http://localhost:8080
