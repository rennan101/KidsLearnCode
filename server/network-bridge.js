/**
 * server/network-bridge.js
 * Ponte de Rede Nativa (Zero Cloudflare / Zero DuckDNS)
 * - Expõe o servidor automaticamente via Subdomínio Fixo (Localtunnel) + Ponte SSH Nativa (localhost.run)
 * - Detecta IP da Rede Local (LAN) para conexão em 0ms na mesma rede
 * - Publica automaticamente o endereço ativo na branch dedicada 'server-status' do GitHub
 *   para descoberta instantânea em qualquer computador ou navegador sem copiar links!
 */

import { spawn, execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

export class NetworkBridge {
  constructor(options = {}) {
    this.port = options.port || 8080;
    this.preferredSubdomain = options.subdomain || 'kidslearncode-mmorpg';
    this.onUrlChanged = options.onUrlChanged || (() => {});
    this.onLog = options.onLog || ((msg) => console.log(msg));

    this.primaryUrl = `https://${this.preferredSubdomain}.loca.lt`;
    this.serveoUrl = null;
    this.sshBackupUrl = null;
    this.lanIp = this.detectLanIp();
    this.localUrl = `http://localhost:${this.port}`;
    this.lanUrl = this.lanIp ? `http://${this.lanIp}:${this.port}` : this.localUrl;

    this.ltProcess = null;
    this.serveoProcess = null;
    this.sshProcess = null;
    this.isStopped = false;
    this.lastPublishedUrl = null;
    this.liveServerFile = path.join(__dirname, 'live-server.json');
  }

  detectLanIp() {
    try {
      const interfaces = os.networkInterfaces();
      for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
          if (iface.family === 'IPv4' && !iface.internal) {
            return iface.address;
          }
        }
      }
    } catch (_) {}
    return null;
  }

  start() {
    this.isStopped = false;
    this.lanIp = this.detectLanIp();
    this.lanUrl = this.lanIp ? `http://${this.lanIp}:${this.port}` : this.localUrl;

    this.saveLiveStatus();
    this.startServeoBridge();
    this.startSshBridge();
    this.startLocaltunnel();
  }

  stop() {
    this.isStopped = true;
    if (this.ltProcess) {
      try { this.ltProcess.kill('SIGTERM'); } catch (_) {}
      this.ltProcess = null;
    }
    if (this.serveoProcess) {
      try { this.serveoProcess.kill('SIGTERM'); } catch (_) {}
      this.serveoProcess = null;
    }
    if (this.sshProcess) {
      try { this.sshProcess.kill('SIGTERM'); } catch (_) {}
      this.sshProcess = null;
    }
  }

  /**
   * Canal 1: Ponte SSH Estável Contínua (serveo.net - HTTP/2 + WSS sem rotação de 15 minutos)
   */
  startServeoBridge() {
    if (this.isStopped) return;

    try {
      this.serveoProcess = spawn(
        '/usr/bin/ssh',
        [
          '-o', 'StrictHostKeyChecking=no',
          '-o', 'UserKnownHostsFile=/dev/null',
          '-o', 'ServerAliveInterval=25',
          '-o', 'ExitOnForwardFailure=yes',
          '-R', `80:127.0.0.1:${this.port}`,
          'serveo.net'
        ],
        { stdio: ['ignore', 'pipe', 'pipe'] }
      );

      const handleServeoOutput = (chunk) => {
        const text = chunk.toString();
        const match = text.match(/https:\/\/[a-zA-Z0-9.-]+\.serveousercontent\.com/);
        if (match && match[0]) {
          const detectedUrl = match[0].trim();
          if (this.serveoUrl !== detectedUrl) {
            this.serveoUrl = detectedUrl;
            this.onLog(`[NetworkBridge] Ponte SSH Primária Estável Ativa: ${this.serveoUrl}`);
            this.saveLiveStatus();
            this.publishStatusToGitHub();
            this.onUrlChanged(this.getActiveUrl());
          }
        }
      };

      this.serveoProcess.stdout.on('data', handleServeoOutput);
      this.serveoProcess.stderr.on('data', handleServeoOutput);

      this.serveoProcess.on('close', () => {
        this.serveoUrl = null;
        if (!this.isStopped) {
          setTimeout(() => this.startServeoBridge(), 5000);
        }
      });

      this.serveoProcess.on('error', () => {});
    } catch (_) {}
  }

  /**
   * Canal 2: Subdomínio Fixo determinístico via Localtunnel (loca.lt)
   */
  startLocaltunnel() {
    if (this.isStopped) return;

    const ltBins = ['/opt/homebrew/bin/lt', '/usr/local/bin/lt', 'lt'];
    let chosenBin = 'npx';
    let args = ['localtunnel', '--port', String(this.port), '--subdomain', this.preferredSubdomain];

    for (const bin of ltBins) {
      try {
        if (bin.startsWith('/') && fs.existsSync(bin)) {
          chosenBin = bin;
          args = ['--port', String(this.port), '--subdomain', this.preferredSubdomain];
          break;
        }
      } catch (_) {}
    }

    try {
      this.ltProcess = spawn(chosenBin, args, {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, PATH: `/opt/homebrew/bin:/usr/local/bin:${process.env.PATH || ''}` }
      });

      const handleOutput = (chunk) => {
        const text = chunk.toString();
        const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.loca\.lt/);
        if (match && match[0]) {
          const detectedUrl = match[0].trim();
          if (this.primaryUrl !== detectedUrl || this.lastPublishedUrl !== detectedUrl) {
            this.primaryUrl = detectedUrl;
            this.onLog(`[NetworkBridge] Canal Fixo Ativo: ${this.primaryUrl}`);
            this.saveLiveStatus();
            this.publishStatusToGitHub();
            this.onUrlChanged(this.getActiveUrl());
          }
        }
      };

      this.ltProcess.stdout.on('data', handleOutput);
      this.ltProcess.stderr.on('data', handleOutput);

      this.ltProcess.on('close', () => {
        if (!this.isStopped) {
          setTimeout(() => this.startLocaltunnel(), 5000);
        }
      });

      this.ltProcess.on('error', () => {
        if (!this.isStopped) {
          setTimeout(() => this.startLocaltunnel(), 10000);
        }
      });
    } catch (err) {
      this.onLog(`[NetworkBridge] Aviso no canal lt: ${err.message}`);
    }
  }

  /**
   * Canal 3: Ponte SSH Nativa Redundante (localhost.run)
   */
  startSshBridge() {
    if (this.isStopped) return;

    try {
      this.sshProcess = spawn(
        '/usr/bin/ssh',
        [
          '-o', 'StrictHostKeyChecking=no',
          '-o', 'UserKnownHostsFile=/dev/null',
          '-o', 'ServerAliveInterval=30',
          '-o', 'ExitOnForwardFailure=yes',
          '-R', `80:127.0.0.1:${this.port}`,
          'nokey@localhost.run'
        ],
        { stdio: ['ignore', 'pipe', 'pipe'] }
      );

      const handleSshOutput = (chunk) => {
        const text = chunk.toString();
        const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.lhr\.life/);
        if (match && match[0]) {
          const detectedSshUrl = match[0].trim();
          if (this.sshBackupUrl !== detectedSshUrl) {
            this.sshBackupUrl = detectedSshUrl;
            this.onLog(`[NetworkBridge] Ponte SSH Redundante Ativa: ${this.sshBackupUrl}`);
            this.saveLiveStatus();
            this.publishStatusToGitHub();
            this.onUrlChanged(this.getActiveUrl());
          }
        }
      };

      this.sshProcess.stdout.on('data', handleSshOutput);
      this.sshProcess.stderr.on('data', handleSshOutput);

      this.sshProcess.on('close', () => {
        this.sshBackupUrl = null;
        if (!this.isStopped) {
          setTimeout(() => this.startSshBridge(), 6000);
        }
      });

      this.sshProcess.on('error', () => {});
    } catch (_) {}
  }

  getActiveUrl() {
    // Prioriza a ponte SSH estável (serveoUrl) e a ponte SSH redundante (sshBackupUrl)
    return this.serveoUrl || this.sshBackupUrl || this.primaryUrl || this.lanUrl || this.localUrl;
  }

  getStatusPayload() {
    return {
      url: this.getActiveUrl(),
      serveoUrl: this.serveoUrl,
      sshUrl: this.sshBackupUrl,
      ltUrl: this.primaryUrl,
      lanUrl: this.lanUrl,
      localUrl: this.localUrl,
      updatedAt: Date.now(),
      updatedAtISO: new Date().toISOString()
    };
  }

  saveLiveStatus() {
    try {
      const payload = this.getStatusPayload();
      fs.writeFileSync(this.liveServerFile, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (_) {}
  }

  /**
   * Publica o JSON de status em uma branch isolada 'server-status' no GitHub
   * usando um diretório temporário para nunca interferir nos arquivos locais do projeto.
   */
  publishStatusToGitHub() {
    const currentActive = this.getActiveUrl();
    if (!currentActive) return;

    clearTimeout(this.publishDebounceTimer);
    this.publishDebounceTimer = setTimeout(() => {
      try {
        const remoteUrl = execSync('git config --get remote.origin.url', {
          cwd: projectRoot,
          encoding: 'utf-8'
        }).trim();

        if (!remoteUrl) return;

        const tmpSyncDir = path.join(os.tmpdir(), 'klc-live-status-sync');
        if (fs.existsSync(tmpSyncDir)) {
          fs.rmSync(tmpSyncDir, { recursive: true, force: true });
        }
        fs.mkdirSync(tmpSyncDir, { recursive: true });

        const payload = this.getStatusPayload();
        fs.writeFileSync(path.join(tmpSyncDir, 'live-server.json'), JSON.stringify(payload, null, 2), 'utf-8');

        execSync('git init -q', { cwd: tmpSyncDir });
        execSync('git config user.name "KidsLearnCode Server"', { cwd: tmpSyncDir });
        execSync('git config user.email "server@kidslearncode.local"', { cwd: tmpSyncDir });
        execSync('git add live-server.json', { cwd: tmpSyncDir });
        execSync('git commit -q -m "chore(status): auto-sync live server endpoint"', { cwd: tmpSyncDir });
        execSync(`git push -q -f "${remoteUrl}" HEAD:refs/heads/server-status`, {
          cwd: tmpSyncDir,
          stdio: 'ignore',
          timeout: 15000
        });

        this.lastPublishedUrl = payload.url;
        this.onLog(`[NetworkBridge] Endereço público sincronizado automaticamente para todos os dispositivos: ${payload.url}`);
      } catch (err) {
        // Silencioso caso esteja sem internet no momento
      }
    }, 1500);
  }
}
