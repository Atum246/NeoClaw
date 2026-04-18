#!/usr/bin/env bash
# ============================================================
# 🧪 NeoClaw Test Suite
# Validates all components before shipping
# ============================================================

set -uo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

PASS=0
FAIL=0
WARN=0

pass() { echo -e "  ${GREEN}✓${NC} $1"; PASS=$((PASS+1)); }
fail() { echo -e "  ${RED}✗${NC} $1"; FAIL=$((FAIL+1)); }
warn() { echo -e "  ${YELLOW}⚠${NC} $1"; WARN=$((WARN+1)); }
section() { echo -e "\n${BOLD}$1${NC}"; }

# ─── File Structure ─────────────────────────────────────────
section "📁 File Structure"
for f in Dockerfile start.sh workspace-sync.py health-server.js keepalive.js .env.example docker-compose.yml README.md LICENSE; do
    if [ -f "/root/.openclaw/workspace/NeoClaw/$f" ]; then
        pass "$f exists"
    else
        fail "$f missing"
    fi
done

# ─── Shell Scripts ──────────────────────────────────────────
section "🐚 Shell Scripts"

# Check start.sh is valid bash
if bash -n /root/.openclaw/workspace/NeoClaw/start.sh 2>/dev/null; then
    pass "start.sh — valid syntax"
else
    fail "start.sh — syntax error"
fi

# Check start.sh has main function
if grep -q "^main" /root/.openclaw/workspace/NeoClaw/start.sh; then
    pass "start.sh — has main() entry point"
else
    fail "start.sh — missing main()"
fi

# Check platform detection
if grep -q "detect_platform" /root/.openclaw/workspace/NeoClaw/start.sh; then
    pass "start.sh — platform detection"
else
    fail "start.sh — no platform detection"
fi

# ─── Python ─────────────────────────────────────────────────
section "🐍 Python"

if python3 -c "import ast; ast.parse(open('/root/.openclaw/workspace/NeoClaw/workspace-sync.py').read())" 2>/dev/null; then
    pass "workspace-sync.py — valid syntax"
else
    fail "workspace-sync.py — syntax error"
fi

if grep -q "class.*Backend" /root/.openclaw/workspace/NeoClaw/workspace-sync.py; then
    pass "workspace-sync.py — has backend classes"
else
    fail "workspace-sync.py — no backend classes"
fi

BACKEND_COUNT=$(grep -c "class.*Backend" /root/.openclaw/workspace/NeoClaw/workspace-sync.py 2>/dev/null || echo 0)
if [ "$BACKEND_COUNT" -ge 3 ]; then
    pass "workspace-sync.py — $BACKEND_COUNT backends (HF, Gist, Git)"
else
    warn "workspace-sync.py — only $BACKEND_COUNT backend(s)"
fi

# ─── Node.js ────────────────────────────────────────────────
section "🟢 Node.js"

if node --check /root/.openclaw/workspace/NeoClaw/health-server.js 2>/dev/null; then
    pass "health-server.js — valid syntax"
else
    fail "health-server.js — syntax error"
fi

if node --check /root/.openclaw/workspace/NeoClaw/keepalive.js 2>/dev/null; then
    pass "keepalive.js — valid syntax"
else
    fail "keepalive.js — syntax error"
fi

# ─── Docker ─────────────────────────────────────────────────
section "🐳 Docker"

if grep -q "FROM" /root/.openclaw/workspace/NeoClaw/Dockerfile; then
    pass "Dockerfile — has FROM instruction"
else
    fail "Dockerfile — no FROM instruction"
fi

if grep -q "COPY" /root/.openclaw/workspace/NeoClaw/Dockerfile; then
    pass "Dockerfile — has COPY instructions"
else
    fail "Dockerfile — no COPY instructions"
fi

if grep -q "EXPOSE" /root/.openclaw/workspace/NeoClaw/Dockerfile; then
    pass "Dockerfile — exposes ports"
else
    warn "Dockerfile — no EXPOSE instruction"
fi

# ─── Docker Compose ─────────────────────────────────────────
section "🐋 Docker Compose"

if grep -q "services:" /root/.openclaw/workspace/NeoClaw/docker-compose.yml; then
    pass "docker-compose.yml — has services"
else
    fail "docker-compose.yml — no services"
fi

if grep -q "7861:7861" /root/.openclaw/workspace/NeoClaw/docker-compose.yml; then
    pass "docker-compose.yml — exposes gateway port"
else
    warn "docker-compose.yml — gateway port not mapped"
fi

# ─── Environment ────────────────────────────────────────────
section "🔧 Environment"

REQUIRED_VARS=("LLM_API_KEY" "LLM_MODEL" "GATEWAY_TOKEN")
for var in "${REQUIRED_VARS[@]}"; do
    if grep -q "$var" /root/.openclaw/workspace/NeoClaw/.env.example; then
        pass ".env.example — has $var"
    else
        fail ".env.example — missing $var"
    fi
done

# ─── Dashboard ──────────────────────────────────────────────
section "📊 Dashboard"

if grep -q "dashboard" /root/.openclaw/workspace/NeoClaw/health-server.js; then
    pass "health-server.js — has dashboard"
else
    warn "health-server.js — no dashboard found"
fi

if grep -q "/health" /root/.openclaw/workspace/NeoClaw/health-server.js; then
    pass "health-server.js — health endpoint"
else
    fail "health-server.js — no health endpoint"
fi

if grep -q "/api/status" /root/.openclaw/workspace/NeoClaw/health-server.js; then
    pass "health-server.js — status API"
else
    warn "health-server.js — no status API"
fi

# ─── README ─────────────────────────────────────────────────
section "📖 Documentation"

README_LINES=$(wc -l < /root/.openclaw/workspace/NeoClaw/README.md)
if [ "$README_LINES" -gt 50 ]; then
    pass "README.md — $README_LINES lines (comprehensive)"
else
    warn "README.md — only $README_LINES lines"
fi

for section_name in "Features" "Quick Start" "Channel" "Backup" "Keep-Alive" "LLM" "Troubleshoot"; do
    if grep -qi "$section_name" /root/.openclaw/workspace/NeoClaw/README.md; then
        pass "README.md — covers $section_name"
    else
        warn "README.md — missing $section_name section"
    fi
done

# ─── Security ───────────────────────────────────────────────
section "🔐 Security"

if grep -q "GATEWAY_TOKEN" /root/.openclaw/workspace/NeoClaw/start.sh; then
    pass "start.sh — validates GATEWAY_TOKEN"
else
    fail "start.sh — doesn't validate GATEWAY_TOKEN"
fi

if grep -q "CORS\|cors\|allowedOrigins" /root/.openclaw/workspace/NeoClaw/health-server.js; then
    pass "health-server.js — CORS support"
else
    warn "health-server.js — no CORS headers"
fi

# ─── Summary ────────────────────────────────────────────────
section "═══════════════════════════════════════"
echo -e "${BOLD}Results:${NC}"
echo -e "  ${GREEN}Passed: $PASS${NC}"
echo -e "  ${RED}Failed: $FAIL${NC}"
echo -e "  ${YELLOW}Warnings: $WARN${NC}"
section "═══════════════════════════════════════"

if [ "$FAIL" -eq 0 ]; then
    echo -e "\n${GREEN}${BOLD}✅ All critical tests passed!${NC}"
    exit 0
else
    echo -e "\n${RED}${BOLD}❌ $FAIL test(s) failed!${NC}"
    exit 1
fi
