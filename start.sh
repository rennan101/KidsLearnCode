#!/bin/bash
# Script de inicialização rápida do servidor local para Geralt's Realm RPG
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

PORT=8000

echo "🎮 ==================================================="
echo "⚔️   Geralt's Realm - RPG Engine & World Editor"
echo "🌐   Iniciando servidor local em http://localhost:$PORT"
echo "🎮 ==================================================="

# Abre o navegador padrão na URL
if command -v open >/dev/null 2>&1; then
  # macOS
  sleep 1 && open "http://localhost:$PORT" &
elif command -v xdg-open >/dev/null 2>&1; then
  # Linux
  sleep 1 && xdg-open "http://localhost:$PORT" &
fi

# Tenta usar npx serve, python3 ou python como fallback
if command -v npx >/dev/null 2>&1; then
  npx -y serve . -p $PORT -s
elif command -v python3 >/dev/null 2>&1; then
  python3 -m http.server $PORT
elif command -v python >/dev/null 2>&1; then
  python -m SimpleHTTPServer $PORT
else
  echo "⚠️ Nenhum interpretador (npx, python3, python) encontrado para rodar o servidor."
  exit 1
fi
