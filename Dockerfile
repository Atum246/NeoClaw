# ============================================================
# 🦞⚡ NeoClaw Dockerfile
# Multi-stage build for HuggingFace Spaces, Railway, Fly.io, etc.
# ============================================================

# ─── Stage 1: Build ─────────────────────────────────────────
FROM node:20-slim AS builder

ARG OPENCLAW_VERSION=latest

WORKDIR /build

# Install OpenClaw globally
RUN npm install -g openclaw@${OPENCLAW_VERSION} 2>/dev/null || \
    npm install -g openclaw@latest

# ─── Stage 2: Runtime ──────────────────────────────────────
FROM node:20-slim AS runtime

ARG OPENCLAW_VERSION=latest

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    curl \
    git \
    chromium \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    procps \
    && rm -rf /var/lib/apt/lists/*

# Copy OpenClaw from builder
COPY --from=builder /usr/local/lib/node_modules/openclaw /usr/local/lib/node_modules/openclaw
COPY --from=builder /usr/local/bin/openclaw /usr/local/bin/openclaw

# Install Python dependencies for workspace sync
RUN pip3 install --no-cache-dir huggingface_hub --break-system-packages 2>/dev/null || \
    pip3 install --no-cache-dir huggingface_hub

# Create directory structure
RUN mkdir -p /root/.openclaw/workspace /app

WORKDIR /app

# Copy NeoClaw files
COPY start.sh /app/start.sh
COPY workspace-sync.py /app/workspace-sync.py
COPY health-server.js /app/health-server.js
COPY keepalive.js /app/keepalive.js
COPY banner.txt /app/banner.txt

# Make scripts executable
RUN chmod +x /app/start.sh

# Environment defaults
ENV NEOCLAW_VERSION=1.0.0
ENV HEALTH_PORT=7862
ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Expose ports
# 7861 = OpenClaw Gateway
# 7862 = NeoClaw Health Dashboard
EXPOSE 7861 7862

# ─── Startup ────────────────────────────────────────────────
CMD ["/bin/bash", "-c", "\
    cat /app/banner.txt && \
    bash /app/start.sh & \
    node /app/health-server.js & \
    sleep 2 && \
    python3 /app/workspace-sync.py --restore 2>/dev/null; \
    python3 /app/workspace-sync.py --daemon & \
    node /app/keepalive.js & \
    exec openclaw gateway start --foreground \
"]
