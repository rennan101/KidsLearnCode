#!/bin/bash
# =============================================================================
# KidsLearnCode - Instalador 1-Click para Mac mini (SSD Interno)
# Zero PostgreSQL / Zero Supabase / Zero Cloudflare / Zero DuckDNS
# =============================================================================

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

echo "======================================================================"
echo "  KidsLearnCode - Setup Dedicado Independente (SSD Interno)"
echo "======================================================================"

# 1. Instalar dependências npm do servidor Node.js se necessário
cd "$SCRIPT_DIR"
if [ ! -d "node_modules" ]; then
  echo "[1/3] Instalando pacotes npm do servidor..."
  npm install --silent
else
  echo "[1/3] Pacotes npm verificados."
fi

# 2. Inicializar Banco de Dados Embutido e Primeiro Backup
echo "[2/3] Inicializando Banco de Dados Embutido em server/data/..."
node -e '
import("./db.js").then(({ Database }) => {
  const db = new Database();
  db.createBackup("setup_init");
  console.log("Banco pronto! Perfis carregados:", db.state.profiles.length);
});
'

# 3. Configurar LaunchAgent com caffeinate -dimsu (Blindagem 5 Anti-Sleep)
echo "[3/3] Configurando inicialização automática no login do macOS..."
PLIST_PATH="$HOME/Library/LaunchAgents/com.kidslearncode.server.plist"
mkdir -p "$HOME/Library/LaunchAgents"
NODE_BIN="$(which node)"

cat <<EOF > "$PLIST_PATH"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.kidslearncode.server</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/caffeinate</string>
        <string>-dimsu</string>
        <string>$NODE_BIN</string>
        <string>$SCRIPT_DIR/index.js</string>
    </array>
    <key>WorkingDirectory</key>
    <string>$SCRIPT_DIR</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>$SCRIPT_DIR/server.log</string>
    <key>StandardErrorPath</key>
    <string>$SCRIPT_DIR/server_error.log</string>
</dict>
</plist>
EOF

launchctl unload "$PLIST_PATH" 2>/dev/null || true
launchctl load "$PLIST_PATH" 2>/dev/null || true

echo "======================================================================"
echo "Servidor configurado e iniciado com sucesso!"
echo "Painel Local: http://localhost:8080/admin"
echo "Ou clique 2x em 'KidsLearnCode Server.app' na pasta principal."
echo "======================================================================"
