#!/usr/bin/env node
/**
 * ⚡🦞 NeoClaw Health Server
 * Health endpoint + beautiful monitoring dashboard
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ─── Config ─────────────────────────────────────────────────
const PORT = process.env.HEALTH_PORT || 7862;
const GATEWAY_PORT = process.env.GATEWAY_PORT || 7861;
const GATEWAY_TOKEN = process.env.GATEWAY_TOKEN || '';
const LLM_MODEL = process.env.LLM_MODEL || 'unknown';
const PLATFORM = process.env.NEOCLAW_PLATFORM || 'local';
const WEBHOOK_URL = process.env.WEBHOOK_URL || '';

// ─── State ──────────────────────────────────────────────────
const startTime = Date.now();
let lastHealthCheck = null;
let healthHistory = [];

// ─── Dashboard HTML ─────────────────────────────────────────
const DASHBOARD_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>⚡🦞 NeoClaw Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        :root {
            --bg: #0a0a0f;
            --card: #12121a;
            --border: #1e1e2e;
            --text: #e0e0e0;
            --dim: #666;
            --green: #00ff88;
            --red: #ff4444;
            --yellow: #ffaa00;
            --blue: #00aaff;
            --purple: #aa44ff;
            --cyan: #00ddff;
        }
        body {
            font-family: 'SF Mono', 'Fira Code', monospace;
            background: var(--bg);
            color: var(--text);
            min-height: 100vh;
            padding: 20px;
        }
        .header {
            text-align: center;
            padding: 30px 0;
            border-bottom: 1px solid var(--border);
            margin-bottom: 30px;
        }
        .header h1 {
            font-size: 2em;
            background: linear-gradient(135deg, var(--purple), var(--cyan));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 8px;
        }
        .header .subtitle { color: var(--dim); font-size: 0.9em; }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }
        .card {
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 24px;
            transition: border-color 0.3s;
        }
        .card:hover { border-color: var(--purple); }
        .card-title {
            font-size: 0.8em;
            color: var(--dim);
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 12px;
        }
        .card-value {
            font-size: 2em;
            font-weight: bold;
            margin-bottom: 8px;
        }
        .card-detail { color: var(--dim); font-size: 0.85em; }
        .status-ok { color: var(--green); }
        .status-warn { color: var(--yellow); }
        .status-error { color: var(--red); }
        .status-info { color: var(--cyan); }
        .status-bar {
            height: 4px;
            background: var(--border);
            border-radius: 2px;
            margin-top: 12px;
            overflow: hidden;
        }
        .status-bar-fill {
            height: 100%;
            border-radius: 2px;
            transition: width 0.5s ease;
        }
        .channel-list {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            margin-top: 8px;
        }
        .channel-badge {
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 0.8em;
            border: 1px solid var(--border);
        }
        .channel-badge.active {
            border-color: var(--green);
            color: var(--green);
        }
        .channel-badge.inactive {
            color: var(--dim);
        }
        .keepalive-section {
            margin-top: 20px;
            padding: 16px;
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 12px;
            max-width: 1200px;
            margin-left: auto;
            margin-right: auto;
        }
        .keepalive-section h3 {
            color: var(--dim);
            font-size: 0.8em;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 12px;
        }
        .keepalive-row {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 8px 0;
            border-bottom: 1px solid var(--border);
        }
        .keepalive-row:last-child { border: none; }
        .dot { width: 8px; height: 8px; border-radius: 50%; }
        .dot.green { background: var(--green); }
        .dot.yellow { background: var(--yellow); }
        .dot.red { background: var(--red); }
        .footer {
            text-align: center;
            padding: 30px 0;
            color: var(--dim);
            font-size: 0.8em;
        }
        .footer a { color: var(--purple); text-decoration: none; }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        .pulse { animation: pulse 2s ease-in-out infinite; }
    </style>
</head>
<body>
    <div class="header">
        <h1>⚡🦞 NeoClaw</h1>
        <div class="subtitle">Always-On AI Assistant Dashboard</div>
    </div>

    <div class="grid">
        <div class="card">
            <div class="card-title">Status</div>
            <div class="card-value status-ok pulse" id="status">● Online</div>
            <div class="card-detail" id="uptime">Uptime: calculating...</div>
            <div class="status-bar">
                <div class="status-bar-fill" id="uptime-bar" style="width: 100%; background: var(--green);"></div>
            </div>
        </div>

        <div class="card">
            <div class="card-title">Model</div>
            <div class="card-value status-info" id="model">${LLM_MODEL}</div>
            <div class="card-detail" id="platform">Platform: ${PLATFORM}</div>
        </div>

        <div class="card">
            <div class="card-title">Gateway</div>
            <div class="card-value" id="gateway-status">Checking...</div>
            <div class="card-detail" id="gateway-port">Port: ${GATEWAY_PORT}</div>
        </div>

        <div class="card">
            <div class="card-title">Resources</div>
            <div class="card-value" id="memory">--</div>
            <div class="card-detail" id="cpu">CPU: checking...</div>
            <div class="status-bar">
                <div class="status-bar-fill" id="mem-bar" style="width: 0%; background: var(--blue);"></div>
            </div>
        </div>

        <div class="card">
            <div class="card-title">Channels</div>
            <div class="channel-list" id="channels">
                <span class="channel-badge inactive">Loading...</span>
            </div>
        </div>

        <div class="card">
            <div class="card-title">Backup</div>
            <div class="card-value" id="backup-status">--</div>
            <div class="card-detail" id="backup-detail">Checking sync status...</div>
        </div>
    </div>

    <div class="keepalive-section">
        <h3>⏰ Keep-Alive Monitors</h3>
        <div id="keepalive-list">
            <div class="keepalive-row">
                <div class="dot yellow"></div>
                <span>Checking monitor status...</span>
            </div>
        </div>
    </div>

    <div class="footer">
        <p>⚡🦞 NeoClaw v1.0.0 — <a href="https://github.com/neo-claw/neoclaw">GitHub</a></p>
    </div>

    <script>
        function formatUptime(ms) {
            const s = Math.floor(ms / 1000);
            const m = Math.floor(s / 60);
            const h = Math.floor(m / 60);
            const d = Math.floor(h / 24);
            if (d > 0) return d + 'd ' + (h % 24) + 'h ' + (m % 60) + 'm';
            if (h > 0) return h + 'h ' + (m % 60) + 'm';
            if (m > 0) return m + 'm ' + (s % 60) + 's';
            return s + 's';
        }

        async function refresh() {
            try {
                const resp = await fetch('/api/status');
                const data = await resp.json();

                // Uptime
                const uptimeMs = Date.now() - data.startTime;
                document.getElementById('uptime').textContent = 'Uptime: ' + formatUptime(uptimeMs);

                // Gateway
                const gwEl = document.getElementById('gateway-status');
                if (data.gatewayHealthy) {
                    gwEl.textContent = '✓ Healthy';
                    gwEl.className = 'card-value status-ok';
                } else {
                    gwEl.textContent = '✗ Down';
                    gwEl.className = 'card-value status-error';
                }

                // Memory
                if (data.memory) {
                    const memMB = Math.round(data.memory.rss / 1024 / 1024);
                    document.getElementById('memory').textContent = memMB + ' MB';
                    const pct = Math.min((memMB / 2048) * 100, 100);
                    document.getElementById('mem-bar').style.width = pct + '%';
                    document.getElementById('mem-bar').style.background =
                        pct > 80 ? 'var(--red)' : pct > 50 ? 'var(--yellow)' : 'var(--green)';
                }

                // CPU
                if (data.cpuUsage !== undefined) {
                    document.getElementById('cpu').textContent = 'CPU: ' + data.cpuUsage.toFixed(1) + '%';
                }

                // Channels
                if (data.channels) {
                    const chEl = document.getElementById('channels');
                    chEl.innerHTML = data.channels.map(ch =>
                        '<span class="channel-badge ' + (ch.active ? 'active' : 'inactive') + '">' +
                        ch.icon + ' ' + ch.name + '</span>'
                    ).join('');
                }

                // Backup
                if (data.backup) {
                    const bEl = document.getElementById('backup-status');
                    if (data.backup.enabled) {
                        bEl.textContent = '✓ Active';
                        bEl.className = 'card-value status-ok';
                        document.getElementById('backup-detail').textContent =
                            'Last sync: ' + (data.backup.lastSync || 'never') +
                            ' | Backend: ' + (data.backup.backend || 'unknown');
                    } else {
                        bEl.textContent = '○ Disabled';
                        bEl.className = 'card-value';
                        document.getElementById('backup-detail').textContent = 'Configure HF_USERNAME and HF_TOKEN';
                    }
                }

                // Keep-alive
                if (data.keepalive) {
                    const kaEl = document.getElementById('keepalive-list');
                    kaEl.innerHTML = data.keepalive.map(m =>
                        '<div class="keepalive-row">' +
                        '<div class="dot ' + (m.status === 'active' ? 'green' : m.status === 'warn' ? 'yellow' : 'red') + '"></div>' +
                        '<span>' + m.name + ' — ' + m.detail + '</span>' +
                        '</div>'
                    ).join('');
                }
            } catch (e) {
                console.error('Status fetch failed:', e);
            }
        }

        refresh();
        setInterval(refresh, 10000);
    </script>
</body>
</html>`;

// ─── API Helpers ────────────────────────────────────────────
function getMemoryUsage() {
    return process.memoryUsage();
}

function getCpuUsage() {
    try {
        const load = execSync("cat /proc/loadavg 2>/dev/null || echo '0 0 0'").toString().trim();
        const parts = load.split(' ');
        return parseFloat(parts[0]) * 100 / (require('os').cpus().length || 1);
    } catch {
        return 0;
    }
}

function checkGatewayHealth() {
    return new Promise((resolve) => {
        const req = http.get(`http://localhost:${GATEWAY_PORT}/health`, { timeout: 3000 }, (res) => {
            resolve(res.statusCode === 200);
        });
        req.on('error', () => resolve(false));
        req.on('timeout', () => { req.destroy(); resolve(false); });
    });
}

function getChannels() {
    const channels = [];
    if (process.env.TELEGRAM_BOT_TOKEN) {
        channels.push({ name: 'Telegram', icon: '📱', active: true });
    } else {
        channels.push({ name: 'Telegram', icon: '📱', active: false });
    }
    if (process.env.WHATSAPP_ENABLED === 'true') {
        channels.push({ name: 'WhatsApp', icon: '📲', active: true });
    } else {
        channels.push({ name: 'WhatsApp', icon: '📲', active: false });
    }
    channels.push({ name: 'Web Chat', icon: '🌐', active: true });
    if (process.env.DISCORD_TOKEN) {
        channels.push({ name: 'Discord', icon: '🎮', active: true });
    }
    if (process.env.SLACK_TOKEN) {
        channels.push({ name: 'Slack', icon: '💼', active: true });
    }
    return channels;
}

function getBackupStatus() {
    try {
        const statePath = '/tmp/neoclaw-sync-state.json';
        if (fs.existsSync(statePath)) {
            const state = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
            return {
                enabled: true,
                lastSync: state.last_sync ? new Date(state.last_sync * 1000).toISOString() : null,
                syncCount: state.sync_count || 0,
                backend: process.env.HF_TOKEN ? 'HuggingFace Datasets' : 'Git'
            };
        }
    } catch {}
    return {
        enabled: !!(process.env.HF_TOKEN && process.env.HF_USERNAME),
        lastSync: null,
        syncCount: 0,
        backend: process.env.HF_TOKEN ? 'HuggingFace Datasets' : 'none'
    };
}

function getKeepaliveStatus() {
    const monitors = [];

    if (process.env.UPTIMEROBOT_API_KEY) {
        monitors.push({
            name: 'UptimeRobot',
            status: 'active',
            detail: 'Monitoring enabled'
        });
    } else {
        monitors.push({
            name: 'UptimeRobot',
            status: 'warn',
            detail: 'Not configured — add UPTIMEROBOT_API_KEY'
        });
    }

    monitors.push({
        name: 'Internal Health Check',
        status: 'active',
        detail: `localhost:${PORT}/health`
    });

    if (process.env.CRONJOB_ORG_KEY) {
        monitors.push({
            name: 'cron-job.org',
            status: 'active',
            detail: 'External pinger active'
        });
    }

    return monitors;
}

// ─── HTTP Server ────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Health endpoint
    if (url.pathname === '/health') {
        const gatewayOk = await checkGatewayHealth();
        lastHealthCheck = { time: Date.now(), gateway: gatewayOk };

        res.writeHead(gatewayOk ? 200 : 503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: gatewayOk ? 'healthy' : 'degraded',
            uptime: Date.now() - startTime,
            model: LLM_MODEL,
            platform: PLATFORM,
            timestamp: new Date().toISOString()
        }));
        return;
    }

    // API status
    if (url.pathname === '/api/status') {
        const gatewayOk = await checkGatewayHealth();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            startTime,
            gatewayHealthy: gatewayOk,
            memory: getMemoryUsage(),
            cpuUsage: getCpuUsage(),
            model: LLM_MODEL,
            platform: PLATFORM,
            channels: getChannels(),
            backup: getBackupStatus(),
            keepalive: getKeepaliveStatus()
        }));
        return;
    }

    // Dashboard
    if (url.pathname === '/' || url.pathname === '/dashboard') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(DASHBOARD_HTML);
        return;
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🦞⚡ NeoClaw Health Server running on port ${PORT}`);
    console.log(`   Dashboard: http://localhost:${PORT}/`);
    console.log(`   Health:    http://localhost:${PORT}/health`);
});
