---
title: NeoClaw
emoji: 🦞
colorFrom: purple
colorTo: cyan
sdk: docker
app_port: 7861
pinned: true
license: mit
---

# ⚡🦞 NeoClaw

**Your always-on AI assistant — free, no server needed.**

Run [OpenClaw](https://openclaw.ai) on **HuggingFace Spaces**, **Railway**, **Render**, **Fly.io**, or **locally** with Docker. Any LLM, any channel, full control.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](Dockerfile)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🚀 **Multi-Platform** | Deploy to HF Spaces, Railway, Render, Fly.io, Heroku, or any Docker host |
| 🤖 **Any LLM** | 40+ providers: Claude, GPT, Gemini, DeepSeek, Grok, Mistral, Qwen + local Ollama models |
| 📱 **Multi-Channel** | Telegram, WhatsApp, Discord, Slack, Web Chat |
| 💾 **Multi-Backend Backup** | HF Datasets, GitHub Gist, S3 — auto-sync with change detection |
| 📊 **Beautiful Dashboard** | Real-time monitoring: uptime, resources, channels, model info |
| ⏰ **Smart Keep-Alive** | UptimeRobot + cron-job.org + self-ping — free tier never sleeps |
| 🔐 **Flexible Auth** | Token, password, OAuth, IP allowlist, CORS control |
| 🎙️ **Voice Support** | TTS/STT via ElevenLabs integration |
| 🧩 **Plugin System** | Load custom skills and extensions |
| 🔧 **Interactive Setup** | Smart wizard validates everything before launch |

---

## 🎥 Quick Start

### Option 1: HuggingFace Spaces (Free) 🤗

1. Click **[Duplicate this Space](https://huggingface.co/spaces/neo-claw/NeoClaw?duplicate=true)**
2. Go to Settings → **Variables and secrets**
3. Add these **Secrets**:

| Secret | Value |
|--------|-------|
| `LLM_API_KEY` | Your provider API key |
| `LLM_MODEL` | e.g., `openai/gpt-4o` or `anthropic/claude-sonnet-4-6` |
| `GATEWAY_TOKEN` | A strong password |

4. Wait for build → Done! ✅

### Option 2: Docker 🐳

```bash
git clone https://github.com/neo-claw/neoclaw.git
cd neoclaw
cp .env.example .env
# Edit .env with your values
docker compose up -d
```

### Option 3: Railway / Render / Fly.io

1. Connect your GitHub repo
2. Set the 3 required environment variables
3. Deploy!

---

## 📱 Channel Setup

### Telegram

1. Create a bot via [@BotFather](https://t.me/BotFather) → `/newbot`
2. Get your user ID from [@userinfobot](https://t.me/userinfobot)
3. Add to your environment:

```
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_USER_ID=your-user-id
```

### WhatsApp

```
WHATSAPP_ENABLED=true
```

Then scan the QR code from the Dashboard (Channels → WhatsApp → Login).

### Discord

```
DISCORD_TOKEN=your-bot-token
```

---

## 💾 Workspace Backup

NeoClaw supports **3 backup backends**:

### HuggingFace Datasets (Recommended)
```
HF_USERNAME=your-username
HF_TOKEN=hf_your-token
```

### GitHub Gist
```
GITHUB_GIST_TOKEN=ghp_your-token
GITHUB_GIST_ID=optional-existing-gist-id
```

### S3
```
S3_BACKUP_BUCKET=your-bucket
S3_REGION=us-east-1
```

Auto-sync runs every 3 minutes with change detection — only syncs when workspace actually changes.

---

## ⏰ Keep-Alive

Free tier spaces can sleep. NeoClaw keeps them awake with **multi-pinger support**:

### UptimeRobot (Recommended)
1. Get your Main API key from [UptimeRobot](2. Paste it in `UPTIMEROBOT_API_KEY`

### cron-job.org
1. Get API key from [cron-job.org](https://cron-job.org)
2. Set `CRONJOB_ORG_KEY`

### Self-Ping
Built-in — pings itself every 5 minutes (configurable via `SELF_PING_INTERVAL`).

---

## 🤖 Supported LLM Providers

| Provider | Prefix | Example |
|----------|--------|---------|
| Anthropic | `anthropic/` | `anthropic/claude-sonnet-4-6` |
| OpenAI | `openai/` | `openai/gpt-4o` |
| Google | `google/` | `google/gemini-2.5-flash` |
| DeepSeek | `deepseek/` | `deepseek/deepseek-v3.2` |
| xAI (Grok) | `xai/` | `xai/grok-4` |
| Mistral | `mistral/` | `mistral/mistral-large-latest` |
| Moonshot | `moonshot/` | `moonshot/kimi-k2.5` |
| OpenRouter | `openrouter/` | `openrouter/anthropic/claude-sonnet-4-6` |
| Ollama (local) | `ollama/` | `ollama/llama3` |

[Full list →](https://docs.openclaw.ai/concepts/model-providers)

---

## 📊 Dashboard

Access your dashboard at `http://localhost:7862` (or your deployed URL).

Features:
- 🟢 Real-time status & uptime
- 📈 Memory & CPU monitoring
- 📱 Channel connection status
- 💾 Backup sync status
- ⏰ Keep-alive monitor status
- 🤖 Active model info

---

## 🔐 Security

| Variable | Description |
|----------|-------------|
| `GATEWAY_TOKEN` | Required — secures the Control UI |
| `OPENCLAW_PASSWORD` | Alternative password auth |
| `TRUSTED_PROXIES` | Comma-separated proxy IPs |
| `ALLOWED_ORIGINS` | CORS allowed origins |

---

## 🏗️ Architecture

```
NeoClaw/
├── Dockerfile           # Multi-stage Docker build
├── start.sh             # Setup wizard & config generator
├── workspace-sync.py    # Multi-backend backup system
├── health-server.js     # Health endpoint + dashboard
├── keepalive.js         # Multi-pinger keep-alive
├── docker-compose.yml   # Local Docker Compose
├── .env.example         # Environment reference
└── README.md            # You are here
```

### Startup Sequence

1. ✅ Validate required secrets
2. 🔑 Check HF token validity
3. 📦 Auto-create backup dataset
4. 💾 Restore workspace from backup
5. ⚙️ Generate `openclaw.json` config
6. 🖥️ Start health dashboard
7. 🔄 Start workspace sync daemon
8. ⏰ Start keep-alive monitors
9. 🚀 Launch OpenClaw gateway

---

## 🔧 CLI Access

```bash
npm install -g openclaw@latest
openclaw channels login --gateway https://your-space.hf.space
```

---

## 🐛 Troubleshooting

| Issue | Fix |
|-------|-----|
| Missing secrets error | Set `LLM_API_KEY`, `LLM_MODEL`, `GATEWAY_TOKEN` |
| Telegram not responding | Check `TELEGRAM_BOT_TOKEN` in Space logs |
| Backup failing | Verify `HF_USERNAME` and `HF_TOKEN` (needs write access) |
| Space keeps sleeping | Set up UptimeRobot from the dashboard |
| WhatsApp lost session | Ensure HF backup is configured |
| CORS errors | Set `ALLOWED_ORIGINS` to your Space URL |
| Auth locked out | Wait for retry window, use incognito, clear site storage |

---

## 📦 Local Development

```bash
# Clone
git clone https://github.com/neo-claw/neoclaw.git
cd neoclaw

# Setup
cp .env.example .env
# Edit .env

# Docker
docker build -t neoclaw .
docker run -p 7861:7861 -p 7862:7862 --env-file .env neoclaw

# Or without Docker
npm install -g openclaw@latest
export $(cat .env | xargs)
bash start.sh
```

---

## 🤝 Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📚 Links

- [OpenClaw Docs](https://docs.openclaw.ai)
- [OpenClaw GitHub](https://github.com/openclaw/openclaw)
- [HuggingFace Spaces](https://huggingface.co/docs/hub/spaces)

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.

---

**⚡🦞 Made with love by NeoClaw — because your AI assistant should never sleep.**
