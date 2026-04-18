#!/usr/bin/env bash
# ============================================================
# 🦞⚡ NeoClaw — Smart Setup Wizard
# Validates env, generates config, handles multi-platform deploy
# ============================================================

set -euo pipefail

# ─── Colors & Formatting ─────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ─── Banner ──────────────────────────────────────────────────
print_banner() {
    echo -e "${PURPLE}${BOLD}"
    echo "  ███╗   ██╗███████╗ ██████╗  ██████╗██╗      █████╗ ██╗    ██╗"
    echo "  ████╗  ██║██╔════╝██╔═══██╗██╔════╝██║     ██╔══██╗██║    ██║"
    echo "  ██╔██╗ ██║█████╗  ██║   ██║██║     ██║     ███████║██║ █╗ ██║"
    echo "  ██║╚██╗██║██╔══╝  ██║   ██║██║     ██║     ██╔══██║██║███╗██║"
    echo "  ██║ ╚████║███████╗╚██████╔╝╚██████╗███████╗██║  ██║╚███╔███╔╝"
    echo "  ╚═╝  ╚═══╝╚══════╝ ╚═════╝  ╚═════╝╚══════╝╚═╝  ╚═╝ ╚══╝╚══╝"
    echo -e "${NC}"
    echo -e "  ${CYAN}⚡🦞 NeoClaw Setup Wizard — Let's get you running!${NC}"
    echo ""
}

log_info()    { echo -e "${BLUE}[INFO]${NC}    $1"; }
log_success() { echo -e "${GREEN}[✓]${NC}      $1"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC}    $1"; }
log_error()   { echo -e "${RED}[ERROR]${NC}   $1"; }
log_step()    { echo -e "${PURPLE}[STEP]${NC}   $1"; }

# ─── Platform Detection ──────────────────────────────────────
detect_platform() {
    if [ -n "${SPACE_ID:-}" ]; then
        PLATFORM="huggingface"
        log_info "Platform: HuggingFace Spaces 🤗"
    elif [ -n "${RAILWAY_ENVIRONMENT:-}" ]; then
        PLATFORM="railway"
        log_info "Platform: Railway 🚂"
    elif [ -n "${RENDER:-}" ]; then
        PLATFORM="render"
        log_info "Platform: Render 🎨"
    elif [ -n "${FLY_APP_NAME:-}" ]; then
        PLATFORM="flyio"
        log_info "Platform: Fly.io 🪰"
    elif [ -n "${HEROKU_APP_NAME:-}" ]; then
        PLATFORM="heroku"
        log_info "Platform: Heroku 💜"
    else
        PLATFORM="local"
        log_info "Platform: Local / Docker 🐳"
    fi
    export NEOCLAW_PLATFORM="$PLATFORM"
}

# ─── Required Secrets Validation ─────────────────────────────
validate_secrets() {
    log_step "Validating required secrets..."
    local missing=0

    # Required
    if [ -z "${LLM_API_KEY:-}" ]; then
        log_error "LLM_API_KEY is required! Set your provider API key."
        missing=1
    else
        log_success "LLM_API_KEY set (${#LLM_API_KEY} chars)"
    fi

    if [ -z "${LLM_MODEL:-}" ]; then
        log_error "LLM_MODEL is required! E.g., openai/gpt-4o"
        missing=1
    else
        log_success "LLM_MODEL set: $LLM_MODEL"
    fi

    if [ -z "${GATEWAY_TOKEN:-}" ]; then
        log_error "GATEWAY_TOKEN is required! Set a strong password."
        missing=1
    else
        log_success "GATEWAY_TOKEN set (${#GATEWAY_TOKEN} chars)"
    fi

    # Optional warnings
    if [ -z "${HF_USERNAME:-}" ] || [ -z "${HF_TOKEN:-}" ]; then
        log_warn "HF_USERNAME/HF_TOKEN not set — workspace backup disabled"
        export BACKUP_ENABLED="false"
    else
        log_success "HuggingFace backup credentials set"
        export BACKUP_ENABLED="true"
    fi

    if [ -z "${TELEGRAM_BOT_TOKEN:-}" ]; then
        log_info "Telegram not configured (optional)"
    else
        log_success "Telegram bot token set 📱"
    fi

    if [ "${WHATSAPP_ENABLED:-false}" = "true" ]; then
        log_success "WhatsApp enabled 📲"
    fi

    if [ "$missing" -eq 1 ]; then
        log_error "Missing required secrets! Check your environment variables."
        exit 1
    fi
}

# ─── HF Token Validation ─────────────────────────────────────
check_hf_token() {
    if [ -z "${HF_TOKEN:-}" ]; then
        return 0
    fi
    log_step "Checking HuggingFace token..."
    local response
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Authorization: Bearer $HF_TOKEN" \
        "https://huggingface.co/api/whoami-v2" 2>/dev/null || echo "000")

    if [ "$response" = "200" ]; then
        local username
        username=$(curl -s -H "Authorization: Bearer $HF_TOKEN" \
            "https://huggingface.co/api/whoami-v2" 2>/dev/null | \
            grep -o '"name":"[^"]*"' | head -1 | cut -d'"' -f4)
        log_success "HF token valid — logged in as: $username"
    elif [ "$response" = "401" ]; then
        log_warn "HF token expired or invalid — backup may fail"
    else
        log_warn "Could not verify HF token (HTTP $response)"
    fi
}

# ─── Auto-Create Backup Dataset ──────────────────────────────
setup_backup_dataset() {
    if [ "$BACKUP_ENABLED" != "true" ]; then
        return 0
    fi

    log_step "Setting up backup dataset..."
    local dataset_name="${BACKUP_DATASET_NAME:-neoclaw-backup}"
    local repo_id="${HF_USERNAME}/${dataset_name}"

    local check_response
    check_response=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Authorization: Bearer $HF_TOKEN" \
        "https://huggingface.co/api/datasets/$repo_id" 2>/dev/null || echo "000")

    if [ "$check_response" = "200" ]; then
        log_success "Backup dataset exists: $repo_id"
    elif [ "$check_response" = "404" ]; then
        log_info "Creating backup dataset: $repo_id"
        local create_response
        create_response=$(curl -s -o /dev/null -w "%{http_code}" \
            -X POST \
            -H "Authorization: Bearer $HF_TOKEN" \
            -H "Content-Type: application/json" \
            "https://huggingface.co/api/repos/create" \
            -d "{\"type\":\"dataset\",\"name\":\"$dataset_name\",\"private\":true}" 2>/dev/null || echo "000")

        if [ "$create_response" = "200" ]; then
            log_success "Backup dataset created! 📦"
        else
            log_warn "Could not create dataset (HTTP $create_response) — will use Git fallback"
        fi
    else
        log_warn "Could not check dataset (HTTP $check_response)"
    fi
}

# ─── Restore Workspace ───────────────────────────────────────
restore_workspace() {
    if [ "$BACKUP_ENABLED" != "true" ]; then
        log_info "Skipping workspace restore (no backup configured)"
        return 0
    fi

    log_step "Restoring workspace from backup..."
    if python3 /app/workspace-sync.py --restore 2>/dev/null; then
        log_success "Workspace restored from backup! 💾"
    else
        log_warn "No previous backup found — starting fresh"
    fi
}

# ─── Generate OpenClaw Config ────────────────────────────────
generate_config() {
    log_step "Generating OpenClaw configuration..."

    # Determine gateway port based on platform
    local gateway_port="7861"
    if [ "$PLATFORM" = "railway" ]; then
        gateway_port="${PORT:-7861}"
    elif [ "$PLATFORM" = "render" ]; then
        gateway_port="${PORT:-7861}"
    elif [ "$PLATFORM" = "flyio" ]; then
        gateway_port="7861"
    fi

    # Build channel config
    local channels_config="{}"

    if [ -n "${TELEGRAM_BOT_TOKEN:-}" ]; then
        local user_ids="${TELEGRAM_USER_IDS:-${TELEGRAM_USER_ID:-}}"
        channels_config=$(cat <<EOF
{
  "telegram": {
    "token": "$TELEGRAM_BOT_TOKEN",
    "allowedUsers": [$(
        if [ -n "$user_ids" ]; then
            echo "$user_ids" | tr ',' '\n' | sed 's/^/"/;s/$/"/' | paste -sd',' -
        fi
    )]
  }
}
EOF
)
    fi

    if [ "${WHATSAPP_ENABLED:-false}" = "true" ]; then
        channels_config=$(echo "$channels_config" | python3 -c "
import sys, json
cfg = json.load(sys.stdin)
cfg['whatsapp'] = {'enabled': True}
print(json.dumps(cfg, indent=2))
" 2>/dev/null || echo "$channels_config")
    fi

    # Write config
    cat > /root/.openclaw/openclaw.json <<CONFIGEOF
{
  "gateway": {
    "port": $gateway_port,
    "token": "$GATEWAY_TOKEN",
    "cors": {
      "allowedOrigins": [${ALLOWED_ORIGINS:-}]
    },
    "trustedProxies": [${TRUSTED_PROXIES:-}]
  },
  "models": {
    "default": "$LLM_MODEL",
    "apiKey": "$LLM_API_KEY"
  },
  "channels": $channels_config,
  "workspace": {
    "path": "/root/.openclaw/workspace"
  },
  "heartbeat": {
    "enabled": true,
    "intervalMinutes": 30
  }
}
CONFIGEOF

    log_success "Config generated! ⚙️"

    # Set webhook if configured
    if [ -n "${WEBHOOK_URL:-}" ]; then
        log_info "Webhook notifications enabled 🔔"
    fi
}

# ─── Print Startup Summary ──────────────────────────────────
print_summary() {
    echo ""
    echo -e "${GREEN}${BOLD}═══════════════════════════════════════════════${NC}"
    echo -e "${GREEN}${BOLD}  ⚡🦞 NeoClaw is ready!${NC}"
    echo -e "${GREEN}${BOLD}═══════════════════════════════════════════════${NC}"
    echo ""
    echo -e "  ${CYAN}Platform:${NC}     $PLATFORM"
    echo -e "  ${CYAN}Model:${NC}        $LLM_MODEL"
    echo -e "  ${CYAN}Backup:${NC}       $BACKUP_ENABLED"
    echo -e "  ${CYAN}Telegram:${NC}     $([ -n "${TELEGRAM_BOT_TOKEN:-}" ] && echo '✅ Enabled' || echo '❌ Disabled')"
    echo -e "  ${CYAN}WhatsApp:${NC}     $([ "${WHATSAPP_ENABLED:-false}" = "true" ] && echo '✅ Enabled' || echo '❌ Disabled')"
    echo -e "  ${CYAN}Voice:${NC}        $([ "${VOICE_ENABLED:-false}" = "true" ] && echo '✅ Enabled' || echo '❌ Disabled')"
    echo -e "  ${CYAN}Local Models:${NC} $([ "${OLLAMA_ENABLED:-false}" = "true" ] && echo '✅ Enabled' || echo '❌ Disabled')"
    echo -e "  ${CYAN}Webhooks:${NC}     $([ -n "${WEBHOOK_URL:-}" ] && echo '🔔 Active' || echo '—')"
    echo ""
    echo -e "  ${YELLOW}Starting gateway...${NC}"
    echo ""
}

# ─── Notification on Restart ────────────────────────────────
send_restart_notification() {
    if [ -n "${WEBHOOK_URL:-}" ]; then
        curl -s -X POST "$WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{
                \"event\": \"neoclaw_restart\",
                \"platform\": \"$PLATFORM\",
                \"model\": \"$LLM_MODEL\",
                \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
            }" >/dev/null 2>&1 || true
    fi
}

# ─── Main ────────────────────────────────────────────────────
main() {
    print_banner
    detect_platform
    validate_secrets
    check_hf_token
    setup_backup_dataset
    restore_workspace
    generate_config
    send_restart_notification
    print_summary
}

main "$@"
