#!/bin/bash
# =============================================================================
# KidsLearnCode - Auto Deploy & Watcher Daemon
# - Blindagem 5: Mantém o Mac acordado com caffeinate -dimsu
# - Blindagem 6: Atualiza o código automaticamente sem tocar no banco em server/data/
#   e sem destruir alterações locais não comitadas.
# =============================================================================

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../.." && pwd )"
cd "$DIR"

echo "========================================================"
echo "KIDSLEARNCODE AUTO-WATCHER ATIVO"
echo "Diretório do projeto: $DIR"
echo "========================================================"

while true; do
  # 0. Garante que as dependências do servidor (express, ws, etc.) existem antes de iniciar
  if [ ! -d "$DIR/server/node_modules/express" ]; then
    echo "Reparando dependências em server/node_modules..."
    npm --prefix "$DIR/server" install --no-audit --no-fund --silent
  fi

  # 1. Garante que o servidor Node.js está vivo na porta 8080 sob caffeinate
  if ! lsof -i :8080 >/dev/null 2>&1; then
    echo "Iniciando servidor KidsLearnCode na porta 8080..."
    (cd "$DIR/server" && nohup /usr/bin/caffeinate -dimsu node index.js >> "$DIR/server/server.log" 2>&1 &)
    sleep 3
  fi

  # 2. Checa se há atualizações na branch main do GitHub (apenas se não houver edições locais pendentes)
  git fetch origin main --quiet 2>/dev/null
  LOCAL=$(git rev-parse HEAD 2>/dev/null)
  REMOTE=$(git rev-parse origin/main 2>/dev/null)
  DIRTY=$(git status --porcelain 2>/dev/null)

  if [ "$LOCAL" != "$REMOTE" ] && [ -n "$REMOTE" ] && [ -z "$DIRTY" ]; then
    echo "Nova atualização detectada no GitHub! Aplicando sem afetar server/data/..."
    git reset --hard origin/main

    if [ ! -d "$DIR/server/node_modules/express" ] || git diff --name-only "$LOCAL" "$REMOTE" 2>/dev/null | grep -q "server/package.json"; then
      npm --prefix "$DIR/server" install --no-audit --no-fund --silent
    fi

    echo "Reiniciando servidor com o novo código..."
    kill $(lsof -t -i:8080) 2>/dev/null || true
    sleep 2
    (cd "$DIR/server" && nohup /usr/bin/caffeinate -dimsu node index.js >> "$DIR/server/server.log" 2>&1 &)
    echo "Servidor atualizado com sucesso!"
  fi

  sleep 20
done
