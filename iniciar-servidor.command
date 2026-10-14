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

# 3. Garantir que o Node.js está rodando na porta 8080
if ! lsof -i :8080 >/dev/null 2>&1; then
  echo "🚀 Iniciando Servidor Node.js (KidsLearnCode MMORPG)..."
  node "$DIR/server/index.js" &
  SERVER_PID=$!
  echo "✅ Servidor iniciado com PID $SERVER_PID"
  sleep 3
else
  echo "ℹ️ Servidor Node.js já está ativo na porta 8080."
fi

# 4. Iniciar o Auto-Watcher em segundo plano (Auto-Deploy a cada 15 segundos)
if ! pgrep -f "auto-watcher.sh" >/dev/null 2>&1; then
  echo "🤖 Ativando Auto-Watcher (Atualização a cada 15s)..."
  ./server/scripts/auto-watcher.sh > /dev/null 2>&1 &
fi

# 5. Executar o Cloudflare Tunnel oficial com protocolo http2 (TCP 443 sem bloqueio UDP)
mkdir -p server
rm -f server/cloudflared.log
touch server/cloudflared.log

# Monitor do log do túnel em segundo plano: extrai a URL e publica no DuckDNS
(
  LAST_TUNNEL=""
  while true; do
    if [ -f server/cloudflared.log ]; then
      FOUND_URL=$(grep -oE "https://[a-zA-Z0-9.-]+\.trycloudflare\.com" server/cloudflared.log | tail -n 1)
      if [ -n "$FOUND_URL" ] && [ "$FOUND_URL" != "$LAST_TUNNEL" ]; then
        LAST_TUNNEL="$FOUND_URL"
        echo "$FOUND_URL" > server/active_tunnel.txt
        echo ""
        echo "========================================================"
        echo "🎉 NOVO TÚNEL CLOUDFLARE DETECTADO!"
        echo "🌐 URL: $FOUND_URL"
        echo "📡 Atualizando DuckDNS TXT (kidslearncode.duckdns.org)..."
        UPDATE_RES=$(curl -s "https://www.duckdns.org/update?domains=kidslearncode&token=8d1cfee6-b6f4-40cd-8f68-725e85ebc171&txt=${FOUND_URL}&verbose=true")
        echo "✅ Resposta DuckDNS: $UPDATE_RES"
        echo "========================================================"
        echo "🏰 JOGO 100% ONLINE PARA O MUNDO INTEIRO!"
        echo "👉 Jogar agora: https://kids-learn-code.vercel.app"
        echo "🖥️  Painel Admin: http://localhost:8080/admin"
        echo "========================================================"
        echo "ℹ️  Mantenha esta janela aberta para manter o servidor online."
        echo ""
      fi
    fi
    sleep 2
  done
) &
TUNNEL_MONITOR_PID=$!

cleanup() {
  echo ""
  echo "🛑 Encerrando monitor de túnel..."
  kill $TUNNEL_MONITOR_PID 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# Executa o cloudflared com protocolo http2 resiliente (TCP 443)
./cloudflared tunnel --protocol http2 --url http://127.0.0.1:8080 2>&1 | tee -a server/cloudflared.log

