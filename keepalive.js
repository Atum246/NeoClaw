#!/usr/bin/env node
/**
 * ⏰🦞 NeoClaw Keep-Alive System
 * Multi-pinger to prevent free tier sleeping
 * Supports: UptimeRobot, cron-job.org, self-ping
 */

const https = require('https');
const http = require('http');

// ─── Config ─────────────────────────────────────────────────
const HEALTH_URL = process.env.NEOCLAW_HEALTH_URL || `http://localhost:7862/health`;
const EXTERNAL_URL = process.env.NEOCLAW_EXTERNAL_URL || '';
const UPTIMEROBOT_KEY = process.env.UPTIMEROBOT_API_KEY || '';
const CRONJOB_ORG_KEY = process.env.CRONJOB_ORG_KEY || '';
const SELF_PING_INTERVAL = parseInt(process.env.SELF_PING_INTERVAL || '300000'); // 5 min

function log(msg) {
    console.log(`[⏰ KeepAlive] ${msg}`);
}

// ─── UptimeRobot Setup ─────────────────────────────────────
async function setupUptimeRobot() {
    if (!UPTIMEROBOT_KEY || !EXTERNAL_URL) {
        log('UptimeRobot: not configured (set UPTIMEROBOT_API_KEY + NEOCLAW_EXTERNAL_URL)');
        return;
    }

    try {
        // Check if monitor already exists
        const existing = await uptimerobotRequest('getMonitors', {
            search: EXTERNAL_URL
        });

        if (existing.monitors && existing.monitors.length > 0) {
            log(`UptimeRobot: monitor already exists (ID: ${existing.monitors[0].id})`);
            return;
        }

        // Create new monitor
        const result = await uptimerobotRequest('newMonitor', {
            friendlyName: 'NeoClaw Health',
            url: `${EXTERNAL_URL}/health`,
            type: 1, // HTTP
            interval: 300 // 5 minutes
        });

        if (result.monitor) {
            log(`UptimeRobot: monitor created! (ID: ${result.monitor.id}) ✅`);
        }
    } catch (e) {
        log(`UptimeRobot: setup failed — ${e.message}`);
    }
}

function uptimerobotRequest(action, params) {
    return new Promise((resolve, reject) => {
        const postData = new URLSearchParams({
            api_key: UPTIMEROBOT_KEY,
            format: 'json',
            ...params
        }).toString();

        const req = https.request({
            hostname: 'api.uptimerobot.com',
            path: '/v2/',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { reject(new Error('Invalid response')); }
            });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

// ─── cron-job.org Setup ─────────────────────────────────────
async function setupCronJobOrg() {
    if (!CRONJOB_ORG_KEY || !EXTERNAL_URL) {
        log('cron-job.org: not configured (set CRONJOB_ORG_KEY)');
        return;
    }

    try {
        const result = await new Promise((resolve, reject) => {
            const postData = JSON.stringify({
                job: {
                    url: `${EXTERNAL_URL}/health`,
                    title: 'NeoClaw Keep-Alive',
                    enabled: true,
                    saveResponses: false,
                    schedule: {
                        expiresAt: 0,
                        hours: [-1],
                        mdays: [-1],
                        minutes: [-1],
                        months: [-1],
                        wdays: [-1]
                    }
                }
            });

            const req = https.request({
                hostname: 'api.cron-job.org',
                path: '/jobs',
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${CRONJOB_ORG_KEY}`,
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try { resolve(JSON.parse(data)); }
                    catch { resolve({}); }
                });
            });

            req.on('error', reject);
            req.write(postData);
            req.end();
        });

        if (result.jobId) {
            log(`cron-job.org: job created! (ID: ${result.jobId}) ✅`);
        }
    } catch (e) {
        log(`cron-job.org: setup failed — ${e.message}`);
    }
}

// ─── Self-Ping ──────────────────────────────────────────────
function selfPing() {
    const url = new URL(HEALTH_URL);
    const client = url.protocol === 'https:' ? https : http;

    const req = client.get(HEALTH_URL, { timeout: 5000 }, (res) => {
        if (res.statusCode === 200) {
            log(`Self-ping: healthy ✅`);
        } else {
            log(`Self-ping: status ${res.statusCode} ⚠️`);
        }
    });

    req.on('error', (e) => {
        log(`Self-ping: failed — ${e.message} ❌`);
    });

    req.on('timeout', () => {
        req.destroy();
        log('Self-ping: timeout ⚠️');
    });
}

// ─── Main ───────────────────────────────────────────────────
async function main() {
    log('🦞⚡ NeoClaw Keep-Alive starting...');
    log(`External URL: ${EXTERNAL_URL || 'not set'}`);
    log(`Self-ping interval: ${SELF_PING_INTERVAL / 1000}s`);

    // Setup external monitors
    await setupUptimeRobot();
    await setupCronJobOrg();

    // Start self-ping
    if (SELF_PING_INTERVAL > 0) {
        setInterval(selfPing, SELF_PING_INTERVAL);
        log(`Self-ping started (every ${SELF_PING_INTERVAL / 1000}s)`);
    }

    log('Keep-alive system ready! 🚀');
}

main().catch(e => {
    log(`Fatal error: ${e.message}`);
    process.exit(1);
});
