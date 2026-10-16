/**
 * server/scripts/setup-direct.js
 * Setup Direto Independente (Zero PostgreSQL / Zero Xcode / Zero Cloudflare)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { Database } from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootServerDir = path.resolve(__dirname, '..');

async function run() {
  console.log('======================================================');
  console.log('KidsLearnCode - Setup Independente (Banco Embutido)');
  console.log('======================================================\n');

  if (!fs.existsSync(path.join(rootServerDir, 'node_modules'))) {
    console.log('Instalando pacotes npm do servidor...');
    execSync('npm install', { cwd: rootServerDir, stdio: 'inherit' });
  }

  const db = new Database();
  const health = await db.healthCheck();
  const bkp = db.createBackup('setup_direct');

  console.log('Status do Banco Embutido:', health);
  console.log('Backup inicial gerado:', bkp.filename);
  console.log('\nPara iniciar o servidor: clique 2x em "KidsLearnCode Server.app" ou rode "cd server && npm start"');
}

run().catch(console.error);
