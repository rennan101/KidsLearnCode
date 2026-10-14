#!/bin/bash
# =============================================================================
# KidsLearnCode - Instalador 1-Click para Mac mini Intel (macOS Sequoia)
# Configura PostgreSQL 16 Nativo, Node.js LTS, Cloudflare Tunnel e Services
# =============================================================================

set -e

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}======================================================================${NC}"
echo -e "${CYAN}       🏰 KidsLearnCode - Instalador Dedicado Mac mini (macOS)         ${NC}"
echo -e "${CYAN}======================================================================${NC}"
echo -e "Sistema Detectado: $(sw_vers -productName) $(sw_vers -productVersion) ($(uname -m))\n"

# 1. Verificar ou Instalar o Homebrew
if ! command -v brew &> /dev/null; then
  echo -e "${YELLOW}[1/6] Homebrew não encontrado. Instalando Homebrew...${NC}"
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zprofile
  eval "$(/usr/local/bin/brew shellenv)"
else
  echo -e "${GREEN}[1/6] Homebrew já instalado.${NC}"
fi

# 2. Instalar Node.js LTS, PostgreSQL 16 e cloudflared
echo -e "${YELLOW}[2/6] Instalando dependências nativas (Node.js, PostgreSQL 16, Cloudflare Tunnel)...${NC}"
brew install node postgresql@16 cloudflared

# Adicionar postgresql@16 ao PATH
brew link postgresql@16 --force --overwrite || true
export PATH="/usr/local/opt/postgresql@16/bin:$PATH"
echo 'export PATH="/usr/local/opt/postgresql@16/bin:$PATH"' >> ~/.zprofile

# 3. Configurar Local do Banco de Dados no SSD Externo de 500 GB
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
EXTERNAL_PGDATA="/Volumes/SSD FN501 PRO/pgdata"
LOCAL_PGDATA="/usr/local/var/postgresql@16"

if [ -d "/Volumes/SSD FN501 PRO" ]; then
  CHOSEN_PGDATA="$EXTERNAL_PGDATA"
  echo -e "${GREEN}[3/6] SSD Externo detectado! Armazenando banco em: $CHOSEN_PGDATA${NC}"
else
  CHOSEN_PGDATA="$LOCAL_PGDATA"
  echo -e "${YELLOW}[3/6] SSD Externo não montado. Usando armazenamento padrão: $CHOSEN_PGDATA${NC}"
fi

if [ ! -d "$CHOSEN_PGDATA" ]; then
  echo -e "Inicializando cluster do PostgreSQL..."
  mkdir -p "$CHOSEN_PGDATA"
  initdb -D "$CHOSEN_PGDATA" --encoding=UTF8 --locale=C
fi

# Iniciar o serviço PostgreSQL
echo -e "Iniciando PostgreSQL 16..."
brew services restart postgresql@16 || pg_ctl -D "$CHOSEN_PGDATA" start || true
sleep 3

# 4. Criar Banco de Dados e Usuário
echo -e "${YELLOW}[4/6] Configurando banco de dados kidslearncode e permissões...${NC}"
psql -U $(whoami) -d postgres -c "CREATE USER kidsadmin WITH PASSWORD 'kidslearn_seguro_local' SUPERUSER;" 2>/dev/null || true
psql -U $(whoami) -d postgres -c "CREATE DATABASE kidslearncode OWNER kidsadmin;" 2>/dev/null || true

# Aplicar o Schema das tabelas
echo -e "Aplicando Schema das tabelas..."
PGPASSWORD=kidslearn_seguro_local psql -h 127.0.0.1 -U kidsadmin -d kidslearncode -f "$SCRIPT_DIR/db/schema.sql"

# Importar a migração do Supabase atual
if [ -f "$SCRIPT_DIR/db/migrations/supabase_migration.sql" ]; then
  echo -e "${GREEN}Importando contas e saves migrados do Supabase...${NC}"
  PGPASSWORD=kidslearn_seguro_local psql -h 127.0.0.1 -U kidsadmin -d kidslearncode -f "$SCRIPT_DIR/db/migrations/supabase_migration.sql" || true
fi

# 5. Instalar dependências npm do servidor Node.js
echo -e "${YELLOW}[5/6] Instalando pacotes npm do servidor KidsLearnCode...${NC}"
cd "$SCRIPT_DIR"
npm install --silent

# Criar arquivo .env caso não exista
if [ ! -f "$SCRIPT_DIR/.env" ]; then
  cp "$SCRIPT_DIR/.env.example" "$SCRIPT_DIR/.env"
  echo -e "${GREEN}Arquivo .env criado com sucesso em $SCRIPT_DIR/.env${NC}"
fi

# 6. Criar LaunchDaemons para Inicialização Automática no Boot do Mac mini
echo -e "${YELLOW}[6/6] Configurando inicialização automática (launchd) ao ligar o Mac...${NC}"

PLIST_PATH="$HOME/Library/LaunchAgents/com.kidslearncode.server.plist"
mkdir -p "$HOME/Library/LaunchAgents"

cat <<EOF > "$PLIST_PATH"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.kidslearncode.server</string>
    <key>ProgramArguments</key>
    <array>
        <string>$(which node)</string>
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

echo -e "\n${GREEN}======================================================================${NC}"
echo -e "${GREEN}🎉 Instalação e Inicialização Concluídas com Sucesso!${NC}"
echo -e "${GREEN}======================================================================${NC}"
echo -e "📡 Servidor Local: ${CYAN}http://localhost:8080${NC}"
echo -e "🖥️  Painel Admin GUI: ${CYAN}http://localhost:8080/admin${NC}"
echo -e "🗄️  Banco PostgreSQL: ${CYAN}kidslearncode (kidsadmin:kidslearn_seguro_local)${NC}"
echo -e "\nPara expor para os jogadores na internet via Cloudflare Tunnel:"
echo -e "${YELLOW}cloudflared tunnel --url http://localhost:8080${NC}\n"
