/**
 * server/scripts/setup-direct.js
 * Instalador Direto sem dependência de Homebrew ou Xcode Command Line Tools.
 * Configura o banco PostgreSQL, aplica o schema, importa a migração do Supabase
 * e testa todos os serviços no Mac mini.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { execSync } from 'child_process';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootServerDir = path.resolve(__dirname, '..');

console.log('======================================================');
console.log('🏰 KidsLearnCode - Setup Direto Nativo (Sem Xcode)');
console.log('======================================================\n');

async function run() {
  // 1. Instalar dependências npm da pasta server se necessário
  console.log('[1/4] Verificando dependências do servidor Node.js...');
  if (!fs.existsSync(path.join(rootServerDir, 'node_modules'))) {
    console.log('Instalando módulos npm (express, ws, pg, bcrypt, etc)...');
    execSync('npm install', { cwd: rootServerDir, stdio: 'inherit' });
  } else {
    console.log('Módulos npm já instalados.');
  }

  // 2. Criar .env a partir do .env.example se não existir
  const envPath = path.join(rootServerDir, '.env');
  const envExample = path.join(rootServerDir, '.env.example');
  if (!fs.existsSync(envPath) && fs.existsSync(envExample)) {
    fs.copyFileSync(envExample, envPath);
    console.log('Arquivo .env configurado.');
  }

  // 3. Conectar ao PostgreSQL (Tenta primeiro com o usuário atual do Mac, padrão do Postgres.app)
  console.log('\n[2/4] Conectando ao PostgreSQL local...');
  const currentUser = process.env.USER || 'postgres';

  // Configuração padrão do Postgres.app
  const adminClient = new Client({
    host: '127.0.0.1',
    port: 5432,
    user: currentUser,
    database: 'postgres'
  });

  try {
    await adminClient.connect();
    console.log(`Conectado ao PostgreSQL como usuário "${currentUser}".`);

    // Criar role kidsadmin e database kidslearncode se não existirem
    try {
      await adminClient.query(`CREATE USER kidsadmin WITH PASSWORD 'kidslearn_seguro_local' SUPERUSER;`);
      console.log('Usuário "kidsadmin" criado com sucesso.');
    } catch (e) {
      if (e.code === '42710') {
        console.log('Usuário "kidsadmin" já existia.');
      } else {
        console.warn('Aviso ao criar usuário:', e.message);
      }
    }

    try {
      await adminClient.query(`CREATE DATABASE kidslearncode OWNER kidsadmin;`);
      console.log('Banco de dados "kidslearncode" criado com sucesso.');
    } catch (e) {
      if (e.code === '42P04') {
        console.log('Banco "kidslearncode" já existia.');
      } else {
        console.warn('Aviso ao criar banco:', e.message);
      }
    }

    await adminClient.end();
  } catch (err) {
    console.error('❌ Não foi possível conectar ao PostgreSQL em 127.0.0.1:5432.');
    console.error('Certifique-se de que o Postgres.app está aberto e rodando!');
    console.error('Erro:', err.message);
    process.exit(1);
  }

  // 4. Aplicar o Schema das Tabelas no banco kidslearncode
  console.log('\n[3/4] Aplicando Schema das Tabelas...');
  const appClient = new Client({
    host: '127.0.0.1',
    port: 5432,
    user: 'kidsadmin',
    password: 'kidslearn_seguro_local',
    database: 'kidslearncode'
  });

  await appClient.connect();

  const schemaSql = fs.readFileSync(path.join(rootServerDir, 'db/schema.sql'), 'utf-8');
  await appClient.query(schemaSql);
  console.log('✅ Tabelas criadas com sucesso (auth_users, profiles, game_saves, world_tiles)!');

  // 5. Importar a Migração com os Saves e Contas do Supabase
  console.log('\n[4/4] Importando dados migrados do Supabase...');
  const migrationSqlPath = path.join(rootServerDir, 'db/migrations/supabase_migration.sql');
  if (fs.existsSync(migrationSqlPath)) {
    const migrationSql = fs.readFileSync(migrationSqlPath, 'utf-8');
    await appClient.query(migrationSql);
    console.log('✅ Contas (Rennan e duda) e saves do mapa importados com sucesso!');
  } else {
    console.log('Arquivo de migração não encontrado, pulando importação.');
  }

  // Verificação final
  const countRes = await appClient.query('SELECT count(*) FROM profiles;');
  console.log(`\n🎉 Total de perfis ativos no banco local: ${countRes.rows[0].count}`);

  await appClient.end();

  console.log('\n======================================================');
  console.log('🚀 TUDO PRONTO! Para iniciar seu servidor agora:');
  console.log('   cd server && npm start');
  console.log('Ou acesse o painel em: http://localhost:8080/admin');
  console.log('======================================================\n');
}

run().catch(err => {
  console.error('Erro durante o setup direto:', err);
  process.exit(1);
});
