/**
 * Device Control Hub — Smart TV, Phone, IoT, and all connected devices
 * Control your entire smart home from OpenClaw
 */
import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

export interface Device {
  id: string;
  name: string;
  type: "tv" | "phone" | "speaker" | "light" | "thermostat" | "camera" | "lock" | "plug" | "router" | "computer" | "watch" | "car" | "unknown";
  room?: string;
  status: "online" | "offline" | "standby" | "error";
  capabilities: string[];
  state?: Record<string, unknown>;
  lastSeen?: number;
  manufacturer?: string;
  model?: string;
}

export interface DeviceCommand {
  deviceId: string;
  action: string;
  params?: Record<string, unknown>;
}

@customElement("device-control-hub")
export class DeviceControlHub extends LitElement {
  @property({ type: Array }) devices: Device[] = [];
  @state() private selectedDeviceId: string | null = null;
  @state() private viewMode: "grid" | "list" | "rooms" = "grid";
  @state() private filterType: string | null = null;
  @state() private searchQuery = "";
  @state() private scanning = false;

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--panel, #0e1015);
      border-left: 1px solid var(--border, #1e2028);
      overflow: hidden;
    }

    .hub-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid var(--border, #1e2028);
      background: var(--panel-strong, #191c24);
      flex-shrink: 0;
    }

    .hub-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-strong, #f4f4f5);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .online-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 9999px;
      background: rgba(251, 191, 36, 0.15);
      color: #fbbf24;
      font-size: 11px;
      font-weight: 600;
    }

    .online-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #fbbf24;
    }

    .hub-actions {
      display: flex;
      gap: 4px;
    }

    .hub-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 5px 10px;
      border: 1px solid var(--border, #1e2028);
      background: var(--card, #161920);
      color: var(--muted, #838387);
      font-size: 11px;
      border-radius: var(--radius-sm, 6px);
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .hub-btn:hover {
      background: var(--bg-hover, #1f2330);
      color: var(--text, #d4d4d8);
    }

    .hub-btn--scanning {
      background: rgba(251, 191, 36, 0.1);
      color: #fbbf24;
      animation: pulse-scan 1.5s ease-in-out infinite;
    }

    @keyframes pulse-scan {
      0%, 100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.3); }
      50% { box-shadow: 0 0 0 6px rgba(251, 191, 36, 0); }
    }

    .hub-filters {
      display: flex;
      gap: 4px;
      padding: 8px 16px;
      overflow-x: auto;
      border-bottom: 1px solid var(--border, #1e2028);
      background: var(--bg-accent, #13151b);
      flex-shrink: 0;
      scrollbar-width: none;
    }

    .hub-filters::-webkit-scrollbar { display: none; }

    .filter-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border: 1px solid var(--border, #1e2028);
      background: var(--card, #161920);
      color: var(--muted, #838387);
      font-size: 11px;
      border-radius: 9999px;
      cursor: pointer;
      transition: all 0.15s ease;
      white-space: nowrap;
    }

    .filter-chip:hover {
      background: var(--bg-hover, #1f2330);
      color: var(--text, #d4d4d8);
    }

    .filter-chip--active {
      background: rgba(251, 191, 36, 0.1);
      color: #fbbf24;
      border-color: #fbbf24;
    }

    .hub-search {
      padding: 8px 16px;
      border-bottom: 1px solid var(--border, #1e2028);
      background: var(--panel-strong, #191c24);
      flex-shrink: 0;
    }

    .hub-search input {
      width: 100%;
      padding: 6px 10px;
      border: 1px solid var(--border, #1e2028);
      background: var(--card, #161920);
      color: var(--text, #d4d4d8);
      font-size: 12px;
      border-radius: var(--radius-sm, 6px);
      outline: none;
      box-sizing: border-box;
    }

    .hub-search input:focus {
      border-color: #fbbf24;
    }

    .hub-body {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      scrollbar-width: thin;
    }

    .device-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 10px;
    }

    .device-card {
      background: var(--card, #161920);
      border: 1px solid var(--border, #1e2028);
      border-radius: var(--radius-md, 10px);
      padding: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .device-card:hover {
      border-color: var(--border-hover, #3e4050);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md, 0 4px 16px rgba(0, 0, 0, 0.3));
    }

    .device-card--online {
      border-color: rgba(251, 191, 36, 0.3);
    }

    .device-card--online::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, #fbbf24, transparent);
    }

    .device-card--offline {
      opacity: 0.5;
    }

    .device-card--selected {
      border-color: #fbbf24;
      box-shadow: 0 0 0 1px rgba(251, 191, 36, 0.2);
    }

    .device-icon {
      font-size: 32px;
      margin-bottom: 8px;
      display: block;
    }

    .device-name {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-strong, #f4f4f5);
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .device-room {
      font-size: 10px;
      color: var(--muted, #838387);
    }

    .device-status {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 9px;
      font-weight: 600;
      text-transform: uppercase;
      margin-top: 6px;
    }

    .device-status--online {
      background: rgba(251, 191, 36, 0.1);
      color: #fbbf24;
    }

    .device-status--offline {
      background: rgba(131, 131, 135, 0.1);
      color: #838387;
    }

    .device-status--standby {
      background: rgba(59, 130, 246, 0.1);
      color: #3b82f6;
    }

    .device-status--error {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }

    /* Device Detail Panel */
    .device-detail {
      padding: 16px;
    }

    .detail-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .detail-icon {
      font-size: 40px;
    }

    .detail-info h3 {
      margin: 0;
      font-size: 16px;
      color: var(--text-strong, #f4f4f5);
    }

    .detail-info p {
      margin: 4px 0 0;
      font-size: 12px;
      color: var(--muted, #838387);
    }

    .detail-controls {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .control-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      background: var(--card, #161920);
      border: 1px solid var(--border, #1e2028);
      border-radius: var(--radius-sm, 6px);
    }

    .control-label {
      font-size: 12px;
      color: var(--text, #d4d4d8);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .control-value {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-strong, #f4f4f5);
    }

    .control-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: 1px solid var(--border, #1e2028);
      background: var(--card, #161920);
      color: var(--muted, #838387);
      border-radius: var(--radius-sm, 6px);
      cursor: pointer;
      transition: all 0.15s ease;
      font-size: 16px;
    }

    .control-btn:hover {
      background: rgba(251, 191, 36, 0.1);
      color: #fbbf24;
      border-color: #fbbf24;
    }

    .control-btn--active {
      background: #fbbf24;
      color: #1a1a1e;
      border-color: #fbbf24;
    }

    .slider-container {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
    }

    .slider-container input[type="range"] {
      flex: 1;
      height: 4px;
      -webkit-appearance: none;
      appearance: none;
      background: var(--border, #1e2028);
      border-radius: 2px;
      outline: none;
    }

    .slider-container input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #fbbf24;
      cursor: pointer;
    }

    .quick-actions {
      display: flex;
      gap: 8px;
      margin-top: 16px;
      flex-wrap: wrap;
    }

    .quick-action {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border: 1px solid var(--border, #1e2028);
      background: var(--card, #161920);
      color: var(--text, #d4d4d8);
      font-size: 12px;
      border-radius: var(--radius-md, 10px);
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .quick-action:hover {
      background: rgba(251, 191, 36, 0.1);
      color: #fbbf24;
      border-color: #fbbf24;
    }

    .hub-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 16px;
      border-top: 1px solid var(--border, #1e2028);
      background: var(--panel-strong, #191c24);
      flex-shrink: 0;
    }

    .footer-stats {
      font-size: 11px;
      color: var(--muted, #838387);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 32px;
      text-align: center;
      color: var(--muted, #838387);
    }

    .empty-icon {
      font-size: 48px;
      margin-bottom: 12px;
      opacity: 0.4;
    }

    .empty-text {
      font-size: 13px;
      line-height: 1.5;
    }

    .empty-actions {
      margin-top: 16px;
    }

    /* Scene cards */
    .scene-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 8px;
      margin-top: 12px;
    }

    .scene-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 12px;
      background: var(--card, #161920);
      border: 1px solid var(--border, #1e2028);
      border-radius: var(--radius-md, 10px);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .scene-card:hover {
      background: rgba(251, 191, 36, 0.05);
      border-color: rgba(251, 191, 36, 0.3);
      transform: translateY(-1px);
    }

    .scene-icon {
      font-size: 24px;
    }

    .scene-name {
      font-size: 11px;
      color: var(--text, #d4d4d8);
      font-weight: 500;
    }
  `;

  private getDeviceIcon(type: Device["type"]): string {
    const icons: Record<string, string> = {
      tv: "📺", phone: "📱", speaker: "🔊", light: "💡",
      thermostat: "🌡️", camera: "📷", lock: "🔒", plug: "🔌",
      router: "📡", computer: "💻", watch: "⌚", car: "🚗",
    };
    return icons[type] ?? "📱";
  }

  private getFilteredDevices(): Device[] {
    let filtered = this.devices;
    if (this.filterType) {
      filtered = filtered.filter(d => d.type === this.filterType);
    }
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.room?.toLowerCase().includes(q) ||
        d.type.toLowerCase().includes(q)
      );
    }
    return filtered.sort((a, b) => {
      if (a.status !== b.status) {
        const order = { online: 0, standby: 1, error: 2, offline: 3 };
        return (order[a.status] ?? 3) - (order[b.status] ?? 3);
      }
      return a.name.localeCompare(b.name);
    });
  }

  private renderDeviceCard(device: Device): unknown {
    const isSelected = this.selectedDeviceId === device.id;
    return html`
      <div
        class="device-card device-card--${device.status} ${isSelected ? 'device-card--selected' : ''}"
        @click=${() => this.selectedDeviceId = this.selectedDeviceId === device.id ? null : device.id}
      >
        <span class="device-icon">${this.getDeviceIcon(device.type)}</span>
        <div class="device-name">${device.name}</div>
        ${device.room ? html`<div class="device-room">${device.room}</div>` : nothing}
        <div class="device-status device-status--${device.status}">
          ${device.status === "online" ? "●" : device.status === "standby" ? "◐" : device.status === "error" ? "✕" : "○"}
          ${device.status}
        </div>
      </div>
    `;
  }

  private renderDeviceDetail(device: Device): unknown {
    return html`
      <div class="device-detail">
        <div class="detail-header">
          <span class="detail-icon">${this.getDeviceIcon(device.type)}</span>
          <div class="detail-info">
            <h3>${device.name}</h3>
            <p>${device.manufacturer ?? ""} ${device.model ?? ""} · ${device.room ?? device.type}</p>
          </div>
        </div>

        <div class="detail-controls">
          <div class="control-row">
            <span class="control-label">🔌 Power</span>
            <button class="control-btn ${device.status === "online" ? "control-btn--active" : ""}"
              @click=${() => this.sendCommand(device.id, "power", { on: device.status !== "online" })}>
              ⏻
            </button>
          </div>

          ${device.type === "tv" ? html`
            <div class="control-row">
              <span class="control-label">🔊 Volume</span>
              <div class="slider-container">
                <input type="range" min="0" max="100"
                  .value=${String(device.state?.volume ?? 50)}
                  @input=${(e: Event) => this.sendCommand(device.id, "volume", { level: (e.target as HTMLInputElement).value })}
                />
                <span class="control-value">${device.state?.volume ?? 50}%</span>
              </div>
            </div>
            <div class="control-row">
              <span class="control-label">📺 Channel</span>
              <div style="display: flex; gap: 4px;">
                <button class="control-btn" @click=${() => this.sendCommand(device.id, "channel", { direction: "down" })}>▼</button>
                <span class="control-value" style="padding: 0 8px;">${device.state?.channel ?? "1"}</span>
                <button class="control-btn" @click=${() => this.sendCommand(device.id, "channel", { direction: "up" })}>▲</button>
              </div>
            </div>
          ` : nothing}

          ${device.type === "light" ? html`
            <div class="control-row">
              <span class="control-label">☀️ Brightness</span>
              <div class="slider-container">
                <input type="range" min="0" max="100"
                  .value=${String(device.state?.brightness ?? 100)}
                  @input=${(e: Event) => this.sendCommand(device.id, "brightness", { level: (e.target as HTMLInputElement).value })}
                />
                <span class="control-value">${device.state?.brightness ?? 100}%</span>
              </div>
            </div>
            <div class="control-row">
              <span class="control-label">🎨 Color</span>
              <input type="color" .value=${device.state?.color ?? "#fbbf24"}
                @input=${(e: Event) => this.sendCommand(device.id, "color", { hex: (e.target as HTMLInputElement).value })}
                style="width: 36px; height: 28px; border: none; border-radius: 4px; cursor: pointer;"
              />
            </div>
          ` : nothing}

          ${device.type === "thermostat" ? html`
            <div class="control-row">
              <span class="control-label">🌡️ Temperature</span>
              <div style="display: flex; align-items: center; gap: 8px;">
                <button class="control-btn" @click=${() => this.sendCommand(device.id, "temperature", { delta: -1 })}>−</button>
                <span class="control-value" style="font-size: 18px;">${device.state?.temperature ?? 22}°C</span>
                <button class="control-btn" @click=${() => this.sendCommand(device.id, "temperature", { delta: 1 })}>+</button>
              </div>
            </div>
            <div class="control-row">
              <span class="control-label">❄️ Mode</span>
              <div style="display: flex; gap: 4px;">
                ${["cool", "heat", "auto", "off"].map(mode => html`
                  <button class="control-btn ${device.state?.mode === mode ? "control-btn--active" : ""}"
                    @click=${() => this.sendCommand(device.id, "mode", { mode })}
                    style="font-size: 10px; width: auto; padding: 0 8px;"
                  >${mode}</button>
                `)}
              </div>
            </div>
          ` : nothing}

          ${device.type === "speaker" ? html`
            <div class="control-row">
              <span class="control-label">🎵 Now Playing</span>
              <span class="control-value">${device.state?.track ?? "Nothing playing"}</span>
            </div>
            <div class="control-row">
              <span class="control-label">🔊 Volume</span>
              <div class="slider-container">
                <input type="range" min="0" max="100"
                  .value=${String(device.state?.volume ?? 50)}
                  @input=${(e: Event) => this.sendCommand(device.id, "volume", { level: (e.target as HTMLInputElement).value })}
                />
                <span class="control-value">${device.state?.volume ?? 50}%</span>
              </div>
            </div>
            <div style="display: flex; gap: 8px; justify-content: center; margin-top: 8px;">
              <button class="control-btn" @click=${() => this.sendCommand(device.id, "play", { action: "prev" })}>⏮</button>
              <button class="control-btn control-btn--active" @click=${() => this.sendCommand(device.id, "play", { action: "toggle" })}>⏯</button>
              <button class="control-btn" @click=${() => this.sendCommand(device.id, "play", { action: "next" })}>⏭</button>
            </div>
          ` : nothing}

          ${device.type === "lock" ? html`
            <div class="control-row">
              <span class="control-label">🔒 Status</span>
              <button class="control-btn ${device.state?.locked ? "control-btn--active" : ""}"
                @click=${() => this.sendCommand(device.id, "lock", { locked: !device.state?.locked })}>
                ${device.state?.locked ? "🔒 Locked" : "🔓 Unlocked"}
              </button>
            </div>
          ` : nothing}

          ${device.type === "camera" ? html`
            <div class="control-row">
              <span class="control-label">📷 Live View</span>
              <button class="control-btn" @click=${() => this.sendCommand(device.id, "stream", { start: true })}>
                ▶ View
              </button>
            </div>
            <div class="control-row">
              <span class="control-label">🔴 Recording</span>
              <button class="control-btn ${device.state?.recording ? "control-btn--active" : ""}"
                @click=${() => this.sendCommand(device.id, "record", { on: !device.state?.recording })}>
                ${device.state?.recording ? "● REC" : "○ Off"}
              </button>
            </div>
          ` : nothing}

          ${device.type === "computer" ? html`
            <div class="control-row">
              <span class="control-label">💻 Screen</span>
              <button class="control-btn" @click=${() => this.sendCommand(device.id, "screen", { action: "mirror" })}>
                🖥 Mirror
              </button>
            </div>
            <div class="control-row">
              <span class="control-label">📂 Files</span>
              <button class="control-btn" @click=${() => this.sendCommand(device.id, "files", { action: "browse" })}>
                📁 Browse
              </button>
            </div>
          ` : nothing}
        </div>

        <div class="quick-actions">
          <button class="quick-action" @click=${() => this.sendCommand(device.id, "info")}>
            ℹ️ Info
          </button>
          <button class="quick-action" @click=${() => this.sendCommand(device.id, "restart")}>
            🔄 Restart
          </button>
          <button class="quick-action" @click=${() => {
            this.dispatchEvent(new CustomEvent("remove-device", { detail: { id: device.id } }));
          }}>
            🗑️ Remove
          </button>
        </div>
      </div>
    `;
  }

  private sendCommand(deviceId: string, action: string, params?: Record<string, unknown>) {
    this.dispatchEvent(new CustomEvent("device-command", {
      detail: { deviceId, action, params } as DeviceCommand,
    }));
  }

  render() {
    const filtered = this.getFilteredDevices();
    const onlineCount = this.devices.filter(d => d.status === "online").length;
    const types = [...new Set(this.devices.map(d => d.type))];
    const selectedDevice = this.devices.find(d => d.id === this.selectedDeviceId);

    return html`
      <div class="hub-header">
        <span class="hub-title">
          🏠 Device Hub
          ${onlineCount > 0 ? html`<span class="online-badge"><span class="online-dot"></span>${onlineCount} online</span>` : nothing}
        </span>
        <div class="hub-actions">
          <button class="hub-btn ${this.scanning ? "hub-btn--scanning" : ""}"
            @click=${() => {
              this.scanning = !this.scanning;
              if (this.scanning) {
                this.dispatchEvent(new CustomEvent("scan-devices"));
                setTimeout(() => this.scanning = false, 5000);
              }
            }}>
            ${this.scanning ? "🔄 Scanning..." : "🔍 Scan"}
          </button>
          <button class="hub-btn" @click=${() => this.viewMode = this.viewMode === "grid" ? "list" : "grid"}>
            ${this.viewMode === "grid" ? "📋" : "⊞"}
          </button>
        </div>
      </div>

      <div class="hub-filters">
        <button class="filter-chip ${!this.filterType ? "filter-chip--active" : ""}"
          @click=${() => this.filterType = null}>All</button>
        ${types.map(type => html`
          <button class="filter-chip ${this.filterType === type ? "filter-chip--active" : ""}"
            @click=${() => this.filterType = this.filterType === type ? null : type}>
            ${this.getDeviceIcon(type)} ${type}
          </button>
        `)}
      </div>

      <div class="hub-search">
        <input type="text" placeholder="Search devices..."
          .value=${this.searchQuery}
          @input=${(e: Event) => this.searchQuery = (e.target as HTMLInputElement).value}
        />
      </div>

      <div class="hub-body">
        ${selectedDevice ? this.renderDeviceDetail(selectedDevice) : html`
          ${filtered.length > 0 ? html`
            <div class="device-grid">
              ${filtered.map(d => this.renderDeviceCard(d))}
            </div>

            <h4 style="font-size: 12px; color: var(--muted); margin: 16px 0 8px; text-transform: uppercase; letter-spacing: 0.5px;">⚡ Quick Scenes</h4>
            <div class="scene-grid">
              <div class="scene-card" @click=${() => this.dispatchEvent(new CustomEvent("activate-scene", { detail: { scene: "movie-night" } }))}>
                <span class="scene-icon">🎬</span>
                <span class="scene-name">Movie Night</span>
              </div>
              <div class="scene-card" @click=${() => this.dispatchEvent(new CustomEvent("activate-scene", { detail: { scene: "good-morning" } }))}>
                <span class="scene-icon">🌅</span>
                <span class="scene-name">Good Morning</span>
              </div>
              <div class="scene-card" @click=${() => this.dispatchEvent(new CustomEvent("activate-scene", { detail: { scene: "goodnight" } }))}>
                <span class="scene-icon">🌙</span>
                <span class="scene-name">Goodnight</span>
              </div>
              <div class="scene-card" @click=${() => this.dispatchEvent(new CustomEvent("activate-scene", { detail: { scene: "away" } }))}>
                <span class="scene-icon">🏃</span>
                <span class="scene-name">Away Mode</span>
              </div>
              <div class="scene-card" @click=${() => this.dispatchEvent(new CustomEvent("activate-scene", { detail: { scene: "party" } }))}>
                <span class="scene-icon">🎉</span>
                <span class="scene-name">Party Mode</span>
              </div>
              <div class="scene-card" @click=${() => this.dispatchEvent(new CustomEvent("activate-scene", { detail: { scene: "focus" } }))}>
                <span class="scene-icon">🎯</span>
                <span class="scene-name">Focus Mode</span>
              </div>
            </div>
          ` : html`
            <div class="empty-state">
              <div class="empty-icon">🏠</div>
              <div class="empty-text">
                No devices found.<br>
                Click "Scan" to discover devices on your network!
              </div>
              <div class="empty-actions">
                <button class="hub-btn" @click=${() => this.dispatchEvent(new CustomEvent("scan-devices"))}>
                  🔍 Scan for Devices
                </button>
              </div>
            </div>
          `}
        `}
      </div>

      <div class="hub-footer">
        <span class="footer-stats">${this.devices.length} devices · ${onlineCount} online</span>
        <button class="hub-btn" @click=${() => {
          this.dispatchEvent(new CustomEvent("export-devices"));
        }}>📤 Export</button>
      </div>
    `;
  }
}
