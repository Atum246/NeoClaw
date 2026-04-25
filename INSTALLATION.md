# 📖 Installation Guide

Complete guide to installing and setting up NeoClaw on your system.

---

## System Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| **OS** | Linux, macOS, Windows | Linux (Ubuntu 22.04+) |
| **Node.js** | 18.0+ | 20.0+ |
| **RAM** | 2GB | 4GB+ |
| **Disk** | 500MB | 2GB+ |
| **pnpm** | 8.0+ | Latest |
| **Git** | 2.0+ | Latest |

---

## Installation Methods

### Method 1: From Source (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/Atum246/NeoClaw.git
cd NeoClaw

# 2. Install Node.js dependencies
pnpm install

# 3. Build the UI
cd ui
npm install
npx vite build
cd ..

# 4. Configure NeoClaw
cp .env.example .env
# Edit .env with your settings

# 5. Start NeoClaw
node openclaw.mjs gateway start
```

### Method 2: Using npm

```bash
# Install globally
npm install -g neoclaw

# Start NeoClaw
neoclaw gateway start
```

### Method 3: Docker

```bash
# Pull the image
docker pull atum246/neoclaw:latest

# Run the container
docker run -d \
  --name neoclaw \
  -p 3000:3000 \
  -v neoclaw-data:/app/data \
  atum246/neoclaw:latest

# Check logs
docker logs -f neoclaw
```

### Method 4: Docker Compose

```yaml
# docker-compose.yml
version: '3.8'
services:
  neoclaw:
    image: atum246/neoclaw:latest
    ports:
      - "3000:3000"
    volumes:
      - neoclaw-data:/app/data
    environment:
      - NODE_ENV=production
    restart: unless-stopped

volumes:
  neoclaw-data:
```

```bash
docker-compose up -d
```

---

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Gateway
GATEWAY_PORT=3000
GATEWAY_HOST=localhost
GATEWAY_PASSWORD=your-secure-password

# AI Models
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# Theme
NEOCLAW_THEME=neoclaw
NEOCLAW_THEME_MODE=dark

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/neoclaw.log
```

### Configuration File

NeoClaw uses `openclaw.json` for advanced configuration:

```json
{
  "gateway": {
    "port": 3000,
    "host": "localhost",
    "password": "your-password"
  },
  "ui": {
    "theme": "neoclaw",
    "themeMode": "dark",
    "chatFocusMode": false,
    "panelOpen": false,
    "panelTab": "execution",
    "splitRatio": 0.6
  },
  "agents": {
    "main": {
      "model": "gpt-4",
      "thinking": "low",
      "systemPrompt": "You are NeoClaw, a helpful AI assistant."
    }
  },
  "channels": {
    "webchat": {
      "enabled": true
    }
  }
}
```

---

## Post-Installation Setup

### 1. Start the Gateway

```bash
node openclaw.mjs gateway start
```

### 2. Open the Web UI

Open your browser and navigate to:
```
http://localhost:3000
```

### 3. Complete Setup Wizard

Follow the on-screen instructions to:
- Set your password
- Configure AI model API keys
- Choose your theme
- Set up channels (optional)

### 4. Start Using NeoClaw!

Type your first message and explore the panels using the toolbar buttons or keyboard shortcuts.

---

## Updating

### From Source

```bash
cd NeoClaw
git pull origin main
pnpm install
cd ui && npm install && npx vite build && cd ..
node openclaw.mjs gateway restart
```

### Using npm

```bash
npm update -g neoclaw
neoclaw gateway restart
```

### Using Docker

```bash
docker pull atum246/neoclaw:latest
docker-compose down
docker-compose up -d
```

---

## Troubleshooting

### Common Issues

**Port already in use**
```bash
# Find process using port 3000
lsof -i :3000
# Kill it
kill -9 <PID>
```

**Build fails**
```bash
# Clear cache and rebuild
rm -rf node_modules ui/node_modules
pnpm install
cd ui && npm install && npx vite build
```

**UI not loading**
```bash
# Check if gateway is running
node openclaw.mjs gateway status
# Check logs
tail -f logs/neoclaw.log
```

### Getting Help

- 📖 [Documentation](docs/)
- 🐛 [Report a Bug](https://github.com/Atum246/NeoClaw/issues)
- 💬 [Discord Community](https://discord.gg/neoclaw)

---

## Uninstalling

### From Source

```bash
rm -rf NeoClaw
```

### Using npm

```bash
npm uninstall -g neoclaw
```

### Using Docker

```bash
docker-compose down -v
docker rmi atum246/neoclaw:latest
```
