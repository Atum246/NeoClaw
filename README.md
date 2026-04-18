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

Run [OpenClaw](https://openclaw.ai) on **HuggingFace Spaces** for free. Any LLM, Telegram & WhatsApp support, auto-sync, built-in keep-alive, beautiful dashboard, and multi-platform deployment.

- [✨ Features](#-features)
- [🎥 Video Tutorial](#-video-tutorial)
- [🚀 Quick Start](#-quick-start)
- [💬 Where Do I Chat?](#-where-do-i-chat)
- [📱 Telegram Setup](#-telegram-setup-optional)
- [📲 WhatsApp Setup](#-whatsapp-setup-optional)
- [🎮 Discord Setup](#-discord-setup-optional)
- [💾 Workspace Backup](#-workspace-backup-optional)
- [⏰ Keep Space Awake](#-keep-space-awake)
- [🔔 Webhooks](#-webhooks-optional)
- [🔐 Security & Advanced](#-security--advanced-optional)
- [🤖 LLM Providers](#-llm-providers)
- [📊 Dashboard](#-dashboard)
- [💻 Local Development](#-local-development)
- [🔗 CLI Access](#-cli-access)
- [🏗️ Architecture](#️-architecture)
- [💓 Staying Alive](#-staying-alive)
- [🐛 Troubleshooting](#-troubleshooting)
- [📚 Links](#-links)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

- 🚀 **Multi-Platform Deploy**: HuggingFace Spaces, Railway, Render, Fly.io, Heroku, or any Docker host
- 🤖 **Any LLM**: Use Claude, OpenAI GPT, Google Gemini, Grok, DeepSeek, Qwen, and 40+ providers via [OpenRouter](https://openrouter.ai). Even supports local models via Ollama!
- ⚡ **Zero Config**: Duplicate this Space and set just three secrets (LLM_API_KEY, LLM_MODEL, GATEWAY_TOKEN) — no other setup needed
- 🐳 **Fast Builds**: Uses a pre-built OpenClaw Docker image to deploy in minutes
- 🌐 **Built-In Browser**: Headless Chromium is included, so browser actions work from the start
- 💾 **Multi-Backend Backup**: Sync workspace to HF Datasets, GitHub Gist, or S3 — with smart change detection
- ⏰ **Smart Keep-Alive**: Multi-pinger system (UptimeRobot + cron-job.org + self-ping) keeps your Space awake
- 📱 **Multi-User Messaging**: Support for Telegram (multi-user), WhatsApp (pairing), Discord, and Slack
- 📊 **Beautiful Dashboard**: Real-time Web UI to monitor uptime, resources, sync status, channels, and active models
- 🔔 **Webhooks**: Get notified on restarts or backup failures via standard webhooks
- 🔐 **Flexible Auth**: Secure the Control UI with token, password, OAuth, or IP allowlist
- 🎙️ **Voice Support**: TTS/STT via ElevenLabs integration
- 🧩 **Plugin System**: Load custom skills and extensions
- 🏠 **100% HF-Native**: Runs entirely on HuggingFace's free infrastructure (2 vCPU, 16GB RAM)
- 🔧 **Smart Setup Wizard**: Interactive validation — catches config errors before they cause problems

---

## 🎥 Video Tutorial

Watch a quick walkthrough: [Deploying NeoClaw on HF Spaces](https://youtube.com/watch?v=TBD)

---

## 🚀 Quick Start

### Step 1: Duplicate This Space

Click the button below to create your own copy:

[![Duplicate this Space](https://huggingface.co/datasets/huggingface/badges/raw/main/duplicate-this-space-sm.svg)](https://huggingface.co/spaces/Atum246/NeoClaw?duplicate=true)

### Step 2: Set Your Secrets

Navigate to your new Space's **Settings**, scroll down to **Variables and secrets**, and add the following three under **Secrets**:

| Secret | Description | Example |
|--------|-------------|---------|
| `LLM_API_KEY` | Your provider API key | `sk-ant-xxxxx` or `sk-or-v1-xxxxx` |
| `LLM_MODEL` | The model ID string | `anthropic/claude-sonnet-4-6` or `openai/gpt-4o` |
| `GATEWAY_TOKEN` | A password to secure your Control UI | Any strong password (e.g., `openssl rand -hex 32`) |

**Tip**: You can use [OpenRouter](https://openrouter.ai) to access all providers with one key:
```
LLM_API_KEY=sk-or-v1-xxxxxxxx
LLM_MODEL=openrouter/anthropic/claude-sonnet-4-6
```

### Step 3: Wait for Build & Start Chatting! 🎉

The Space will build the container and start up automatically. Monitor the build in the **Logs** tab. Once it's running, you're ready to chat! 👇

---

## 💬 Where Do I Chat?

**Your web chat UI is your Space URL!**

```
👉 https://your-username-neoclaw.hf.space
```

Just open that link in your browser and you'll see the **OpenClaw web chat interface**. Start typing and your AI assistant responds immediately! 💬⚡

### What You'll See:

| URL | What's There |
|-----|-------------|
| `https://your-username-neoclaw.hf.space` | 💬 **Web Chat UI** — talk to your AI directly! |
| Same URL + `/dashboard` | 📊 **NeoClaw Dashboard** — monitor everything |

### Chat From Anywhere:

| Channel | How |
|---------|-----|
| 🌐 **Web Browser** | Open your Space URL directly |
| 📱 **Telegram** | Set up your bot (see below) |
| 📲 **WhatsApp** | Scan QR from dashboard (see below) |
| 🎮 **Discord** | Add your bot token (see below) |

**No extra setup needed for web chat — it works out of the box!** ✅

---

## 📱 Telegram Setup (Optional)

To chat via Telegram:

1. Create a bot via [@BotFather](https://t.me/BotFather): send `/newbot`, follow prompts, and copy the bot token
2. Find your Telegram user ID with [@userinfobot](https://t.me/userinfobot)
3. Add these secrets in Settings → Secrets. After restarting, the bot should appear online on Telegram

| Variable | Default | Description |
|----------|---------|-------------|
| `TELEGRAM_BOT_TOKEN` | — | Telegram bot token from BotFather |
| `TELEGRAM_USER_ID` | — | Single Telegram user ID allowlist |
| `TELEGRAM_USER_IDS` | — | Comma-separated Telegram user IDs for team access |

---

## 📲 WhatsApp Setup (Optional)

To use WhatsApp:

1. Set `WHATSAPP_ENABLED=true` in your secrets
2. Restart the Space
3. Open your Space URL → Dashboard → **Channels → WhatsApp → Login**
4. Scan the QR code with WhatsApp

| Variable | Default | Description |
|----------|---------|-------------|
| `WHATSAPP_ENABLED` | `false` | Enable WhatsApp pairing support |

**Note**: For persistent WhatsApp sessions across restarts, configure HF backup (see below).

---

## 🎮 Discord Setup (Optional)

To use Discord:

1. Create a bot at [Discord Developer Portal](https://discord.com/developers/applications)
2. Copy the bot token
3. Add `DISCORD_TOKEN` to your secrets
4. Invite the bot to your server

| Variable | Default | Description |
|----------|---------|-------------|
| `DISCORD_TOKEN` | — | Discord bot token |

---

## 💾 Workspace Backup (Optional)

For persistent chat history and configuration, NeoClaw can sync your workspace using multiple backends:

### Option A: HuggingFace Datasets (Recommended)

On first run, NeoClaw will automatically create (or use) a private Dataset repo `HF_USERNAME/neoclaw-backup`, restore your workspace on startup, and sync changes periodically.

| Variable | Default | Description |
|----------|---------|-------------|
| `HF_USERNAME` | — | Your HuggingFace username |
| `HF_TOKEN` | — | HF token with write access |
| `BACKUP_DATASET_NAME` | `neoclaw-backup` | Dataset name for backup repo |
| `SYNC_INTERVAL` | `180` | Sync interval in seconds |

### Option B: GitHub Gist

| Variable | Default | Description |
|----------|---------|-------------|
| `GITHUB_GIST_TOKEN` | — | GitHub personal access token |
| `GITHUB_GIST_ID` | — | Existing Gist ID (auto-created if empty) |

### Option C: S3

| Variable | Default | Description |
|----------|---------|-------------|
| `S3_BACKUP_BUCKET` | — | S3 bucket name |
| `S3_REGION` | `us-east-1` | AWS region |

**Tip**: The backup also stores WhatsApp session credentials, allowing paired logins to survive Space restarts automatically.

---

## ⏰ Keep Space Awake

Free HuggingFace Spaces can sleep after inactivity. NeoClaw keeps them awake with **multi-pinger support**:

### UptimeRobot (Recommended)

1. Get your **Main API key** from [UptimeRobot](https://uptimerobot.com)
   - ⚠️ Use the Main API key, not the Read-only or Monitor-specific key
2. Add `UPTIMEROBOT_API_KEY` to your Space secrets
3. NeoClaw auto-creates a monitor for your Space's `/health` endpoint

### cron-job.org

1. Get an API key from [cron-job.org](https://cron-job.org)
2. Add `CRONJOB_ORG_KEY` to your secrets

### Self-Ping

Built-in — NeoClaw pings itself every 5 minutes. No setup needed!

| Variable | Default | Description |
|----------|---------|-------------|
| `UPTIMEROBOT_API_KEY` | — | UptimeRobot Main API key |
| `CRONJOB_ORG_KEY` | — | cron-job.org API key |
| `NEOCLAW_EXTERNAL_URL` | — | Your Space URL (e.g., `https://username-neoclaw.hf.space`) |
| `SELF_PING_INTERVAL` | `300000` | Self-ping interval in ms (default: 5 min) |

**Note**: Keep-alive works best for public Spaces. Private Spaces may not be reachable by external monitors.

---

## 🔔 Webhooks (Optional)

Get notified when your Space restarts or if a backup fails:

| Variable | Default | Description |
|----------|---------|-------------|
| `WEBHOOK_URL` | — | Endpoint URL for POST JSON notifications |

Example webhook payload:
```json
{
  "event": "neoclaw_restart",
  "platform": "huggingface",
  "model": "anthropic/claude-sonnet-4-6",
  "timestamp": "2026-04-19T05:00:00Z"
}
```

---

## 🔐 Security & Advanced (Optional)

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENCLAW_PASSWORD` | — | Enable simple password auth instead of token |
| `TRUSTED_PROXIES` | — | Comma-separated IPs of HF proxies |
| `ALLOWED_ORIGINS` | — | Comma-separated allowed origins for Control UI |
| `OPENCLAW_VERSION` | `latest` | Build-time pin for the OpenClaw image tag |

---

## 🤖 LLM Providers

NeoClaw supports all providers from OpenClaw. Set `LLM_MODEL=<provider/model>` and the provider is auto-detected:

| Provider | Prefix | Example Model | API Key Source |
|----------|--------|---------------|----------------|
| Anthropic | `anthropic/` | `anthropic/claude-sonnet-4-6` | [Anthropic Console](https://console.anthropic.com/) |
| OpenAI | `openai/` | `openai/gpt-4o` | [OpenAI Platform](https://platform.openai.com/) |
| Google | `google/` | `google/gemini-2.5-flash` | [AI Studio](https://ai.google.dev/) |
| DeepSeek | `deepseek/` | `deepseek/deepseek-v3.2` | [DeepSeek](https://platform.deepseek.com) |
| xAI (Grok) | `xai/` | `xai/grok-4` | [xAI](https://console.x.ai) |
| Mistral | `mistral/` | `mistral/mistral-large-latest` | [Mistral Console](https://console.mistral.ai) |
| Moonshot | `moonshot/` | `moonshot/kimi-k2.5` | [Moonshot](https://platform.moonshot.cn) |
| Cohere | `cohere/` | `cohere/command-a` | [Cohere Dashboard](https://dashboard.cohere.com) |
| Groq | `groq/` | `groq/mixtral-8x7b-32768` | [Groq](https://console.groq.com) |
| Ollama (local) | `ollama/` | `ollama/llama3` | Local install |

### OpenRouter (Access All Providers)

Get an [OpenRouter](https://openrouter.ai) API key to use all providers:

```
LLM_API_KEY=sk-or-v1-xxxxxxxx
LLM_MODEL=openrouter/anthropic/claude-sonnet-4-6
```

Popular options: `openrouter/google/gemini-2.5-flash`, `openrouter/meta-llama/llama-3.3-70b-instruct`

### Custom Providers

You can also use any custom provider:

```
LLM_API_KEY=your_api_key
LLM_MODEL=provider/model-name
```

See [OpenClaw Model Providers](https://docs.openclaw.ai/concepts/model-providers) for the full list.

---

## 📊 Dashboard

NeoClaw includes a beautiful real-time dashboard at your Space URL:

### Features:
- 🟢 **Status & Uptime** — real-time health monitoring
- 📈 **Resources** — memory & CPU usage
- 📱 **Channels** — connection status for Telegram, WhatsApp, Discord, Slack
- 💾 **Backup** — sync status and last backup time
- ⏰ **Keep-Alive** — monitor status for UptimeRobot, cron-job.org
- 🤖 **Model Info** — which LLM is currently powering your assistant

### API Endpoints:

| Endpoint | Description |
|----------|-------------|
| `/health` | JSON health check (for monitoring) |
| `/api/status` | Full status with resources, channels, backup |

---

## 💻 Local Development

```bash
# Clone
git clone https://github.com/Atum246/NeoClaw.git
cd NeoClaw

# Setup
cp .env.example .env
# Edit .env with your secret values

# Run with Docker
docker build --build-arg OPENCLAW_VERSION=latest -t neoclaw .
docker run -p 7861:7861 -p 7862:7862 --env-file .env neoclaw

# Or with Docker Compose
docker compose up -d

# Or without Docker
npm install -g openclaw@latest
export $(cat .env | xargs)
bash start.sh
```

---

## 🔗 CLI Access

After deploying, you can connect via the OpenClaw CLI:

```bash
npm install -g openclaw@latest
openclaw channels login --gateway https://YOUR_SPACE_NAME.hf.space
# When prompted, enter your GATEWAY_TOKEN
```

---

## 🏗️ Architecture

```
NeoClaw/
├── Dockerfile           # Multi-stage Docker build with Chromium
├── start.sh             # Smart setup wizard & config generator
├── workspace-sync.py    # Multi-backend backup (HF + Gist + S3)
├── health-server.js     # Health endpoint + beautiful dashboard
├── keepalive.js         # Multi-pinger keep-alive system
├── docker-compose.yml   # Local Docker Compose config
├── .env.example         # Environment variable reference
├── tests/test.sh        # Test suite (38 tests)
├── banner.txt           # ASCII art banner
├── CONTRIBUTING.md      # Contribution guidelines
├── LICENSE              # MIT License
└── README.md            # You are here
```

### Startup Sequence

1. 🔍 Validate required secrets (fail fast with clear error)
2. 🔑 Check HF token validity (warn if expired)
3. 📦 Auto-create backup dataset if missing
4. 💾 Restore workspace from backup
5. ⚙️ Generate `openclaw.json` from environment variables
6. 🖥️ Start health dashboard server
7. 🔄 Start workspace sync daemon
8. ⏰ Start keep-alive monitors
9. 🚀 Launch OpenClaw gateway (start listening)
10. 🔔 Send restart notification (if webhook configured)
11. On SIGTERM → save workspace and exit cleanly

---

## 🐛 Troubleshooting

| Issue | Fix |
|-------|-----|
| Missing secrets error | Ensure `LLM_API_KEY`, `LLM_MODEL`, and `GATEWAY_TOKEN` are set in Space Settings → Secrets |
| Telegram bot not responding | Verify `TELEGRAM_BOT_TOKEN`. Check Space logs for "📱 Enabling Telegram" |
| WhatsApp lost session | Make sure `HF_USERNAME` and `HF_TOKEN` are configured for session backup |
| Backup restore failing | Check `HF_USERNAME` and `HF_TOKEN` (token needs write access to your Dataset) |
| Space keeps sleeping | Set up keep-alive from the dashboard or add `UPTIMEROBOT_API_KEY` |
| Auth locked out | Wait for retry window to expire, then open in incognito or clear site storage |
| CORS errors | Set `ALLOWED_ORIGINS=https://your-space-name.hf.space` |
| Version mismatches | Pin a specific OpenClaw build with `OPENCLAW_VERSION` Variable |
| Proxy errors | Add logged IPs from Space logs under `TRUSTED_PROXIES` |

---

## 📚 Links

- [OpenClaw Docs](https://docs.openclaw.ai)
- [OpenClaw GitHub](https://github.com/openclaw/openclaw)
- [HuggingFace Spaces Docs](https://huggingface.co/docs/hub/spaces)
- [OpenRouter](https://openrouter.ai) — Access all LLM providers with one key
- [UptimeRobot](https://uptimerobot.com) — Keep your Space awake

---

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.

---

**⚡🦞 Made with love by NeoClaw — because your AI assistant should never sleep.**
