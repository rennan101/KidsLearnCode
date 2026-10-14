#!/bin/bash
# =============================================================================
# KidsLearnCode - DuckDNS Auto Updater Daemon para Mac mini
# Atualiza automaticamente o IP do kidslearncode.duckdns.org a cada 5 minutos
# 100% Gratuito, Vitalício e Ilimitado!
# =============================================================================

DOMAIN="kidslearncode"
TOKEN="8d1cfee6-b6f4-40cd-8f68-725e85ebc171"
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../.." && pwd )"

echo "========================================================"
echo "🦆 DUCKDNS TUNNEL AUTO-UPDATER PARA $DOMAIN.duckdns.org"
echo "========================================================"

while true; do
  TUNNEL_URL=""
  if [ -f "$PROJECT_DIR/server/active_tunnel.txt" ]; then
    TUNNEL_URL=$(cat "$PROJECT_DIR/server/active_tunnel.txt" 2>/dev/null | tr -d '\r\n')
  fi

  DATE=$(date "+%Y-%m-%d %H:%M:%S")

  if [ -n "$TUNNEL_URL" ] && [[ "$TUNNEL_URL" =~ ^https://.*\.trycloudflare\.com ]]; then
    RES=$(curl -s "https://www.duckdns.org/update?domains=${DOMAIN}&token=${TOKEN}&txt=${TUNNEL_URL}&verbose=true")
    echo "[$DATE] ✅ DuckDNS TXT sincronizado com $TUNNEL_URL: $RES" >> "$LOG_DIR/duckdns.log"
  fi

  # Mantém sincronizado a cada 2 minutos
  sleep 120
done
