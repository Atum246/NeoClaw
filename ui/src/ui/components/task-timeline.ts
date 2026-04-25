/**
 * Task Timeline — Visual history of all AI tasks and sessions
 * Shows a chronological timeline with replay capability
 */
import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

export interface TimelineEvent {
  id: string;
  type: "message" | "tool" | "file" | "search" | "code" | "error" | "system";
  title: string;
  detail?: string;
  timestamp: number;
  duration?: number;
  status: "success" | "error" | "warning" | "info";
  sessionId?: string;
  metadata?: Record<string, unknown>;
}

@customElement("task-timeline")
export class TaskTimeline extends LitElement {
  @property({ type: Array }) events: TimelineEvent[] = [];
  @property({ type: String }) sessionFilter: string | null = null;
  @state() private selectedEventId: string | null = null;
  @state() private filterType: string | null = null;
  @state() private viewMode: "compact" | "detailed" = "detailed";

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--panel, #0e1015);
      border-left: 1px solid var(--border, #1e2028);
      overflow: hidden;
    }

    .timeline-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid var(--border, #1e2028);
      background: var(--panel-strong, #191c24);
      flex-shrink: 0;
    }

    .timeline-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-strong, #f4f4f5);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .timeline-filters {
      display: flex;
      gap: 4px;
      padding: 8px 16px;
      overflow-x: auto;
      border-bottom: 1px solid var(--border, #1e2028);
      background: var(--bg-accent, #13151b);
      flex-shrink: 0;
      scrollbar-width: none;
    }

    .timeline-filters::-webkit-scrollbar { display: none; }

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
      background: var(--accent-subtle, rgba(251, 191, 36, 0.1));
      color: var(--accent, #fbbf24);
      border-color: var(--accent, #fbbf24);
    }

    .timeline-body {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      scrollbar-width: thin;
    }

    .timeline-list {
      position: relative;
      padding-left: 24px;
    }

    .timeline-list::before {
      content: "";
      position: absolute;
      left: 8px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: var(--border, #1e2028);
    }

    .timeline-item {
      position: relative;
      padding: 0 0 20px 0;
      animation: fade-in 0.2s ease;
    }

    @keyframes fade-in {
      from { opacity: 0; transform: translateX(-8px); }
      to { opacity: 1; transform: translateX(0); }
    }

    .timeline-dot {
      position: absolute;
      left: -20px;
      top: 4px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid var(--border, #1e2028);
      background: var(--panel, #0e1015);
      z-index: 1;
    }

    .timeline-dot--success {
      border-color: var(--ok, #22c55e);
      background: var(--ok, #22c55e);
    }

    .timeline-dot--error {
      border-color: var(--destructive, #ef4444);
      background: var(--destructive, #ef4444);
    }

    .timeline-dot--warning {
      border-color: var(--warn, #f59e0b);
      background: var(--warn, #f59e0b);
    }

    .timeline-dot--info {
      border-color: var(--info, #3b82f6);
      background: var(--info, #3b82f6);
    }

    .timeline-card {
      background: var(--card, #161920);
      border: 1px solid var(--border, #1e2028);
      border-radius: var(--radius-md, 10px);
      padding: 10px 14px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .timeline-card:hover {
      border-color: var(--border-hover, #3e4050);
      background: var(--card-highlight, rgba(255, 255, 255, 0.04));
    }

    .timeline-card--selected {
      border-color: var(--accent, #fbbf24);
      box-shadow: 0 0 0 1px var(--accent-subtle, rgba(251, 191, 36, 0.1));
    }

    .timeline-card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }

    .timeline-card-icon {
      font-size: 14px;
      flex-shrink: 0;
    }

    .timeline-card-title {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-strong, #f4f4f5);
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .timeline-card-time {
      font-size: 10px;
      color: var(--muted, #838387);
      white-space: nowrap;
      flex-shrink: 0;
    }

    .timeline-card-detail {
      font-size: 11px;
      color: var(--muted, #838387);
      line-height: 1.4;
      margin-top: 4px;
    }

    .timeline-card-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 6px;
      font-size: 10px;
      color: var(--muted, #838387);
    }

    .timeline-card-duration {
      display: inline-flex;
      align-items: center;
      gap: 3px;
    }

    .timeline-card-type {
      display: inline-flex;
      padding: 1px 6px;
      border-radius: 3px;
      background: var(--bg-hover, #1f2330);
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    /* Date separator */
    .timeline-date {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
      font-size: 11px;
      font-weight: 600;
      color: var(--muted, #838387);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .timeline-date::after {
      content: "";
      flex: 1;
      height: 1px;
      background: var(--border, #1e2028);
    }

    .timeline-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 16px;
      border-top: 1px solid var(--border, #1e2028);
      background: var(--panel-strong, #191c24);
      flex-shrink: 0;
    }

    .footer-info {
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
      font-size: 40px;
      margin-bottom: 12px;
      opacity: 0.4;
    }

    .empty-text {
      font-size: 13px;
      line-height: 1.5;
    }

    /* Compact mode */
    .timeline-item--compact {
      padding-bottom: 8px;
    }

    .timeline-item--compact .timeline-card {
      padding: 6px 10px;
    }

    .timeline-item--compact .timeline-card-title {
      font-size: 11px;
    }
  `;

  private getTypeIcon(type: TimelineEvent["type"]): string {
    const icons: Record<string, string> = {
      message: "💬", tool: "🔧", file: "📁",
      search: "🔍", code: "💻", error: "❌", system: "⚙️"
    };
    return icons[type] ?? "📌";
  }

  private formatTime(timestamp: number): string {
    const d = new Date(timestamp);
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  }

  private formatDate(timestamp: number): string {
    const d = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000 && d.getDate() === now.getDate()) return "Today";
    if (diff < 172800000) return "Yesterday";
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }

  private formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  }

  private getFilteredEvents(): TimelineEvent[] {
    let filtered = this.events;
    if (this.filterType) {
      filtered = filtered.filter(e => e.type === this.filterType);
    }
    if (this.sessionFilter) {
      filtered = filtered.filter(e => e.sessionId === this.sessionFilter);
    }
    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }

  private renderEvent(event: TimelineEvent): unknown {
    const isSelected = this.selectedEventId === event.id;
    const isCompact = this.viewMode === "compact";

    return html`
      <div class="timeline-item ${isCompact ? 'timeline-item--compact' : ''}">
        <div class="timeline-dot timeline-dot--${event.status}"></div>
        <div
          class="timeline-card ${isSelected ? 'timeline-card--selected' : ''}"
          @click=${() => this.selectedEventId = this.selectedEventId === event.id ? null : event.id}
        >
          <div class="timeline-card-header">
            <span class="timeline-card-icon">${this.getTypeIcon(event.type)}</span>
            <span class="timeline-card-title">${event.title}</span>
            <span class="timeline-card-time">${this.formatTime(event.timestamp)}</span>
          </div>
          ${!isCompact && event.detail ? html`
            <div class="timeline-card-detail">${event.detail}</div>
          ` : nothing}
          ${!isCompact ? html`
            <div class="timeline-card-meta">
              <span class="timeline-card-type">${event.type}</span>
              ${event.duration ? html`
                <span class="timeline-card-duration">⏱ ${this.formatDuration(event.duration)}</span>
              ` : nothing}
            </div>
          ` : nothing}
        </div>
      </div>
    `;
  }

  render() {
    const filtered = this.getFilteredEvents();
    const types = [...new Set(this.events.map(e => e.type))];

    // Group by date
    const grouped: Map<string, TimelineEvent[]> = new Map();
    for (const event of filtered) {
      const date = this.formatDate(event.timestamp);
      if (!grouped.has(date)) grouped.set(date, []);
      grouped.get(date)!.push(event);
    }

    return html`
      <div class="timeline-header">
        <span class="timeline-title">🕐 Timeline</span>
        <button
          class="filter-chip ${this.viewMode === 'compact' ? 'filter-chip--active' : ''}"
          @click=${() => this.viewMode = this.viewMode === 'compact' ? 'detailed' : 'compact'}
        >
          ${this.viewMode === 'compact' ? '📋 Detailed' : '📌 Compact'}
        </button>
      </div>

      <div class="timeline-filters">
        <button
          class="filter-chip ${!this.filterType ? 'filter-chip--active' : ''}"
          @click=${() => this.filterType = null}
        >All</button>
        ${types.map(type => html`
          <button
            class="filter-chip ${this.filterType === type ? 'filter-chip--active' : ''}"
            @click=${() => this.filterType = this.filterType === type ? null : type}
          >${this.getTypeIcon(type)} ${type}</button>
        `)}
      </div>

      <div class="timeline-body">
        ${filtered.length > 0 ? html`
          <div class="timeline-list">
            ${[...grouped.entries()].map(([date, events]) => html`
              <div class="timeline-date">${date}</div>
              ${events.map(e => this.renderEvent(e))}
            `)}
          </div>
        ` : html`
          <div class="empty-state">
            <div class="empty-icon">🕐</div>
            <div class="empty-text">
              No events yet.<br>
              Start a conversation to see the timeline!
            </div>
          </div>
        `}
      </div>

      <div class="timeline-footer">
        <span class="footer-info">${filtered.length} events</span>
        <button class="filter-chip" @click=${() => {
          this.dispatchEvent(new CustomEvent("export-timeline"));
        }}>📤 Export</button>
      </div>
    `;
  }
}
