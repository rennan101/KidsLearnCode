/**
 * server/network-bridge.js
 * Ponte de Rede Multi-Canal Resiliente (Cloudflare HTTP/2 + SSH + Localtunnel + LAN)
 * - Prioriza Cloudflare Quick Tunnel HTTP/2 (porta 443, compatível com firewalls restritivos e WSS nativo)
 * - Detecta IP da Rede Local (LAN) para conexão em 0ms na mesma rede
 * - Publica automaticamente o endereço ativo na branch 'server-status' do GitHub e no DuckDNS TXT
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

    this.cfUrl = this.readExistingCloudflareUrl();
    this.primaryUrl = `https://${this.preferredSubdomain}.loca.lt`;
    this.serveoUrl = null;
    this.sshBackupUrl = null;
    this.lanIp = this.detectLanIp();
    this.localUrl = `http://localhost:${this.port}`;
    this.lanUrl = this.lanIp ? `http://${this.lanIp}:${this.port}` : this.localUrl;

    this.cfProcess = null;
    this.cfFileWatcherTimer = null;
    this.ltProcess = null;
    this.serveoProcess = null;
    this.sshProcess = null;
    this.isStopped = false;
    this.lastPublishedUrl = null;
    this.liveServerFile = path.join(__dirname, 'live-server.json');
    this.activeTunnelFile = path.join(__dirname, 'active_tunnel.txt');
    this.cloudflaredLogFile = path.join(__dirname, 'cloudflared.log');
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

  readExistingCloudflareUrl() {
    try {
      const txtFile = path.join(__dirname, 'active_tunnel.txt');
      if (fs.existsSync(txtFile)) {
        const val = fs.readFileSync(txtFile, 'utf-8').trim();
        if (val.startsWith('https://') && val.includes('.trycloudflare.com')) {
          return val;
        }
      }
      const logFile = path.join(__dirname, 'cloudflared.log');
      if (fs.existsSync(logFile)) {
        const logText = fs.readFileSync(logFile, 'utf-8');
        const matches = logText.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/g);
        if (matches && matches.length > 0) {
          return matches[matches.length - 1].trim();
        }
      }
    } catch (_) {}
    return null;
  }

  start() {
    this.isStopped = false;
    this.lanIp = this.detectLanIp();
    this.lanUrl = this.lanIp ? `http://${this.lanIp}:${this.port}` : this.localUrl;

    this.startCloudflareBridge();
    this.startLocaltunnel();
    this.startServeoBridge();
    this.startSshBridge();
    this.saveLiveStatus();
    if (this.cfUrl) {
      this.publishStatusToGitHub();
    }
  }

  stop() {
    this.isStopped = true;
    if (this.cfFileWatcherTimer) {
      clearInterval(this.cfFileWatcherTimer);
      this.cfFileWatcherTimer = null;
    }
    for (const proc of [this.cfProcess, this.ltProcess, this.serveoProcess, this.sshProcess]) {
      if (proc) {
        try { proc.kill('SIGTERM'); } catch (_) {}
      }
    }
    this.cfProcess = null;
    this.ltProcess = null;
    this.serveoProcess = null;
    this.sshProcess = null;
  }

  /**
   * Canal 0 (Prioridade Máxima): Túnel Cloudflare HTTP/2 na porta 443 (WSS nativo sem bloqueio de porta 22 ou 408)
   */
  startCloudflareBridge() {
    if (this.isStopped) return;

    const applyCfUrl = (detectedUrl) => {
      if (!detectedUrl || this.cfUrl === detectedUrl) return;
      this.cfUrl = detectedUrl;
      try { fs.writeFileSync(this.activeTunnelFile, `${detectedUrl}\n`, 'utf-8'); } catch (_) {}
      this.onLog(`[NetworkBridge] Túnel Cloudflare HTTP/2 Ativo: ${this.cfUrl}`);
      this.saveLiveStatus();
      this.publishStatusToGitHub();
      this.onUrlChanged(this.getActiveUrl());
    };

    const existing = this.readExistingCloudflareUrl();
    if (existing) applyCfUrl(existing);

    // Monitora continuamente active_tunnel.txt caso iniciar-servidor.command já tenha subido o cloudflared externo
    clearInterval(this.cfFileWatcherTimer);
    this.cfFileWatcherTimer = setInterval(() => {
      const latest = this.readExistingCloudflareUrl();
      if (latest && latest !== this.cfUrl) {
        applyCfUrl(latest);
      }
    }, 4000);

    // Verifica se já existe um processo cloudflared ativo no sistema
    try {
      const running = execSync('pgrep -f "cloudflared tunnel" || true', { encoding: 'utf-8' }).trim();
      if (running) return;
    } catch (_) {}

    const cfBins = [
      path.join(projectRoot, 'cloudflared'),
      '/opt/homebrew/bin/cloudflared',
      '/usr/local/bin/cloudflared'
    ];
    const chosenCf = cfBins.find(b => {
      try { return fs.existsSync(b); } catch (_) { return false; }
    });
    if (!chosenCf) return;

    try {
      this.cfProcess = spawn(
        chosenCf,
        ['tunnel', '--protocol', 'http2', '--url', `http://127.0.0.1:${this.port}`],
        { stdio: ['ignore', 'pipe', 'pipe'] }
      );

      const handleCfOutput = (chunk) => {
        const text = chunk.toString();
        try { fs.appendFileSync(this.cloudflaredLogFile, text); } catch (_) {}
        const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
        if (match && match[0]) {
          applyCfUrl(match[0].trim());
        }
      };

      this.cfProcess.stdout.on('data', handleCfOutput);
      this.cfProcess.stderr.on('data', handleCfOutput);
      this.cfProcess.on('close', () => {
        this.cfProcess = null;
        if (!this.isStopped) setTimeout(() => this.startCloudflareBridge(), 5000);
      });
      this.cfProcess.on('error', () => {});
    } catch (_) {}
  }

  startServeoBridge() {
    if (this.isStopped) return;
    try {
      this.serveoProcess = spawn(
        '/usr/bin/ssh',
        ['-o', 'StrictHostKeyChecking=no', '-o', 'UserKnownHostsFile=/dev/null', '-o', 'ServerAliveInterval=25', '-o', 'ExitOnForwardFailure=yes', '-R', `80:127.0.0.1:${this.port}`, 'serveo.net'],
        { stdio: ['ignore', 'pipe', 'pipe'] }
      );
      const handleOut = (chunk) => {
        const match = chunk.toString().match(/https:\/\/[a-zA-Z0-9.-]+\.serveousercontent\.com/);
        if (match && match[0] && this.serveoUrl !== match[0].trim()) {
          this.serveoUrl = match[0].trim();
          this.onLog(`[NetworkBridge] Ponte SSH Serveo Ativa: ${this.serveoUrl}`);
          this.saveLiveStatus();
          this.publishStatusToGitHub();
          this.onUrlChanged(this.getActiveUrl());
        }
      };
      this.serveoProcess.stdout.on('data', handleOut);
      this.serveoProcess.stderr.on('data', handleOut);
      this.serveoProcess.on('close', () => {
        this.serveoUrl = null;
        if (!this.isStopped) setTimeout(() => this.startServeoBridge(), 15000);
      });
      this.serveoProcess.on('error', () => {});
    } catch (_) {}
  }

  startLocaltunnel() {
    if (this.isStopped) return;
    const ltBins = ['/opt/homebrew/bin/lt', '/usr/local/bin/lt'];
    let chosenBin = ltBins.find(b => fs.existsSync(b)) || 'npx';
    let args = chosenBin === 'npx'
      ? ['localtunnel', '--port', String(this.port), '--subdomain', this.preferredSubdomain]
      : ['--port', String(this.port), '--subdomain', this.preferredSubdomain];

    try {
      this.ltProcess = spawn(chosenBin, args, {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, PATH: `/opt/homebrew/bin:/usr/local/bin:${process.env.PATH || ''}` }
      });
      const handleOutput = (chunk) => {
        const match = chunk.toString().match(/https:\/\/[a-zA-Z0-9-]+\.loca\.lt/);
        if (match && match[0] && this.primaryUrl !== match[0].trim()) {
          this.primaryUrl = match[0].trim();
          this.onLog(`[NetworkBridge] Canal Localtunnel Ativo: ${this.primaryUrl}`);
          this.saveLiveStatus();
          this.publishStatusToGitHub();
          this.onUrlChanged(this.getActiveUrl());
        }
      };
      this.ltProcess.stdout.on('data', handleOutput);
      this.ltProcess.stderr.on('data', handleOutput);
      this.ltProcess.on('close', () => {
        if (!this.isStopped) setTimeout(() => this.startLocaltunnel(), 6000);
      });
      this.ltProcess.on('error', () => {});
    } catch (_) {}
  }

  startSshBridge() {
    if (this.isStopped) return;
    try {
      this.sshProcess = spawn(
        '/usr/bin/ssh',
        ['-o', 'StrictHostKeyChecking=no', '-o', 'UserKnownHostsFile=/dev/null', '-o', 'ServerAliveInterval=30', '-o', 'ExitOnForwardFailure=yes', '-R', `80:127.0.0.1:${this.port}`, 'nokey@localhost.run'],
        { stdio: ['ignore', 'pipe', 'pipe'] }
      );
      const handleSsh = (chunk) => {
        const match = chunk.toString().match(/https:\/\/[a-zA-Z0-9-]+\.lhr\.life/);
        if (match && match[0] && this.sshBackupUrl !== match[0].trim()) {
          this.sshBackupUrl = match[0].trim();
          this.onLog(`[NetworkBridge] Ponte SSH Redundante Ativa: ${this.sshBackupUrl}`);
          this.saveLiveStatus();
          this.publishStatusToGitHub();
          this.onUrlChanged(this.getActiveUrl());
        }
      };
      this.sshProcess.stdout.on('data', handleSsh);
      this.sshProcess.stderr.on('data', handleSsh);
      this.sshProcess.on('close', () => {
        this.sshBackupUrl = null;
        if (!this.isStopped) setTimeout(() => this.startSshBridge(), 15000);
      });
      this.sshProcess.on('error', () => {});
    } catch (_) {}
  }

  getActiveUrl() {
    return this.cfUrl || this.serveoUrl || this.sshBackupUrl || this.primaryUrl || this.lanUrl || this.localUrl;
  }

  getStatusPayload() {
    return {
      url: this.getActiveUrl(),
      cfUrl: this.cfUrl,
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
      fs.writeFileSync(this.liveServerFile, JSON.stringify(this.getStatusPayload(), null, 2), 'utf-8');
    } catch (_) {}
  }

  publishStatusToGitHub() {
    const currentActive = this.getActiveUrl();
    if (!currentActive) return;

    clearTimeout(this.publishDebounceTimer);
    this.publishDebounceTimer = setTimeout(() => {
      try {
        const remoteUrl = execSync('git config --get remote.origin.url', { cwd: projectRoot, encoding: 'utf-8' }).trim();
        if (!remoteUrl) return;

        const tmpSyncDir = path.join(os.tmpdir(), 'klc-live-status-sync');
        if (fs.existsSync(tmpSyncDir)) fs.rmSync(tmpSyncDir, { recursive: true, force: true });
        fs.mkdirSync(tmpSyncDir, { recursive: true });

        const payload = this.getStatusPayload();
        fs.writeFileSync(path.join(tmpSyncDir, 'live-server.json'), JSON.stringify(payload, null, 2), 'utf-8');

        execSync('git init -q', { cwd: tmpSyncDir });
        execSync('git config user.name "KidsLearnCode Server"', { cwd: tmpSyncDir });
        execSync('git config user.email "server@kidslearncode.local"', { cwd: tmpSyncDir });
        execSync('git add live-server.json', { cwd: tmpSyncDir });
        execSync('git commit -q -m "chore(status): auto-sync live server endpoint"', { cwd: tmpSyncDir });
        execSync(`git push -q -f "${remoteUrl}" HEAD:refs/heads/server-status`, { cwd: tmpSyncDir, stdio: 'ignore', timeout: 15000 });

        this.lastPublishedUrl = payload.url;
        this.onLog(`[NetworkBridge] Endereço público sincronizado para todos os dispositivos: ${payload.url}`);
      } catch (_) {}
    }, 1200);
  }
}
