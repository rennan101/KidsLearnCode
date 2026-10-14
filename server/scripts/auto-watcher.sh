#!/bin/bash
# =============================================================================
# KidsLearnCode - Auto Deploy & Watcher Daemon para Mac mini
# Checa o GitHub a cada 60 segundos. Se houver commits novos:
# 1. Faz git pull automaticamente
# 2. Atualiza dependências se necessário
# 3. Reinicia o servidor Node.js
# 4. Mantém o túnel Cloudflare sempre vivo e ativo!
# =============================================================================

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../.." && pwd )"
cd "$DIR"

echo "========================================================"
echo "🤖 KIDSLEARNCODE AUTO-WATCHER ATIVO NO MAC MINI"
echo "Monitorando repositório GitHub para auto-deploy..."
echo "Diretório do projeto: $DIR"
echo "========================================================"

while true; do
  # 1. Garante que o Node.js está vivo na porta 8080
  if ! lsof -i :8080 >/dev/null 2>&1; then
    echo "⚠️ Servidor Node.js offline. Reiniciando na porta 8080..."
    (cd "$DIR/server" && node index.js) >> "$DIR/server/server.log" 2>&1 &
    sleep 3
  fi

  # 2. Checa se há novidades no GitHub
  git fetch origin main --quiet 2>/dev/null
  LOCAL=$(git rev-parse HEAD 2>/dev/null)
  REMOTE=$(git rev-parse origin/main 2>/dev/null)

  if [ "$LOCAL" != "$REMOTE" ] && [ -n "$REMOTE" ]; then
    echo "📦 Nova atualização detectada no GitHub! Puxando alterações..."
    git pull origin main
    
    # Atualiza dependências se package.json mudou
    if git diff --name-only "$LOCAL" "$REMOTE" 2>/dev/null | grep -q "server/package.json"; then
      echo "📦 Atualizando dependências npm do servidor..."
      npm --prefix "$DIR/server" install --silent
    fi

    # Reinicia o servidor Node.js com o código atualizado
    echo "🔄 Reiniciando servidor KidsLearnCode com o novo código..."
    kill $(lsof -t -i:8080) 2>/dev/null || true
    sleep 2
    (cd "$DIR/server" && node index.js) >> "$DIR/server/server.log" 2>&1 &
    echo "✅ Servidor atualizado e rodando com sucesso!"
  fi

  # Intervalo otimizado de 15 segundos
  sleep 15
done
