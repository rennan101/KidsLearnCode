#!/bin/bash
# =============================================================================
# KidsLearnCode - DuckDNS Auto Updater Daemon para Mac mini
# Atualiza automaticamente o IP do kidslearncode.duckdns.org a cada 5 minutos
# 100% Gratuito, Vitalício e Ilimitado!
# =============================================================================

DOMAIN="kidslearncode"
TOKEN="8d1cfee6-b6f4-40cd-8f68-725e85ebc171"
LOG_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"

echo "========================================================"
echo "🦆 DUCKDNS AUTO-UPDATER ATIVO PARA $DOMAIN.duckdns.org"
echo "========================================================"

while true; do
  RES=$(curl -s "https://www.duckdns.org/update?domains=${DOMAIN}&token=${TOKEN}&ip=")
  DATE=$(date "+%Y-%m-%d %H:%M:%S")
  
  if [ "$RES" = "OK" ]; then
    echo "[$DATE] ✅ DuckDNS IP atualizado com sucesso!" >> "$LOG_DIR/duckdns.log"
  else
    echo "[$DATE] ⚠️ DuckDNS resposta: $RES" >> "$LOG_DIR/duckdns.log"
  fi

  # Executa a cada 5 minutos (300s)
  sleep 300
done
