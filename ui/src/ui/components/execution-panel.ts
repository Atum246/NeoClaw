/**
 * Execution Panel — Manus-style live task progress
 * Shows real-time step-by-step execution with status indicators
 */
import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

export interface ExecutionStep {
  id: string;
  label: string;
  status: "pending" | "active" | "done" | "error" | "skipped";
  detail?: string;
  startedAt?: number;
  completedAt?: number;
  icon?: string;
  substeps?: ExecutionStep[];
}

export interface ExecutionTask {
  id: string;
  title: string;
  status: "running" | "completed" | "error" | "paused";
  steps: ExecutionStep[];
  startedAt: number;
  completedAt?: number;
  output?: string;
  artifactType?: "code" | "document" | "diagram" | "webpage" | "data" | "file";
  artifactUrl?: string;
}

@customElement("execution-panel")
export class ExecutionPanel extends LitElement {
  @property({ type: Array }) tasks: ExecutionTask[] = [];
  @property({ type: Boolean }) expanded = true;
  @property({ type: Boolean }) compact = false;
  @state() private selectedTaskId: string | null = null;
  @state() private autoScroll = true;

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--panel, #0e1015);
      border-left: 1px solid var(--border, #1e2028);
      overflow: hidden;
    }

    .execution-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid var(--border, #1e2028);
      background: var(--panel-strong, #191c24);
      flex-shrink: 0;
    }

    .execution-header h3 {
      margin: 0;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-strong, #f4f4f5);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .execution-header .live-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 9999px;
      background: rgba(34, 197, 94, 0.15);
      color: #22c55e;
      font-size: 11px;
      font-weight: 600;
      animation: pulse-live 2s ease-in-out infinite;
    }

    .live-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #22c55e;
      animation: blink 1.5s ease-in-out infinite;
    }

    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    @keyframes pulse-live {
      0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.2); }
      50% { box-shadow: 0 0 0 4px rgba(34, 197, 94, 0); }
    }

    .execution-body {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      scrollbar-width: thin;
      scrollbar-color: var(--border-strong, #2e3040) transparent;
    }

    .task-card {
      background: var(--card, #161920);
      border: 1px solid var(--border, #1e2028);
      border-radius: var(--radius-md, 10px);
      margin-bottom: 12px;
      overflow: hidden;
      transition: border-color 0.2s ease;
    }

    .task-card:hover {
      border-color: var(--border-hover, #3e4050);
    }

    .task-card--active {
      border-color: var(--accent, #fbbf24);
      box-shadow: 0 0 0 1px var(--accent-subtle, rgba(251, 191, 36, 0.1));
    }

    .task-card--completed {
      border-color: var(--ok-muted, rgba(34, 197, 94, 0.75));
    }

    .task-card--error {
      border-color: var(--destructive, #ef4444);
    }

    .task-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 14px;
      cursor: pointer;
      user-select: none;
    }

    .task-icon {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 14px;
    }

    .task-icon--running {
      background: rgba(251, 191, 36, 0.12);
      color: var(--accent, #fbbf24);
      animation: spin 2s linear infinite;
    }

    .task-icon--completed {
      background: rgba(34, 197, 94, 0.12);
      color: #22c55e;
    }

    .task-icon--error {
      background: rgba(239, 68, 68, 0.12);
      color: #ef4444;
    }

    .task-icon--paused {
      background: rgba(245, 158, 11, 0.12);
      color: #f59e0b;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .task-info {
      flex: 1;
      min-width: 0;
    }

    .task-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-strong, #f4f4f5);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .task-meta {
      font-size: 11px;
      color: var(--muted, #838387);
      margin-top: 2px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .task-duration {
      font-variant-numeric: tabular-nums;
    }

    .task-chevron {
      color: var(--muted, #838387);
      transition: transform 0.2s ease;
      flex-shrink: 0;
    }

    .task-chevron--expanded {
      transform: rotate(90deg);
    }

    .steps-container {
      padding: 0 14px 14px 14px;
    }

    .step {
      display: flex;
      gap: 10px;
      padding: 6px 0;
      position: relative;
    }

    .step-line {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 20px;
      flex-shrink: 0;
    }

    .step-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 2px solid var(--border-strong, #2e3040);
      background: var(--panel, #0e1015);
      flex-shrink: 0;
      z-index: 1;
      transition: all 0.3s ease;
    }

    .step-dot--active {
      border-color: var(--accent, #fbbf24);
      background: var(--accent, #fbbf24);
      box-shadow: 0 0 8px var(--accent-glow, rgba(251, 191, 36, 0.2));
      animation: pulse-dot 1.5s ease-in-out infinite;
    }

    .step-dot--done {
      border-color: #22c55e;
      background: #22c55e;
    }

    .step-dot--error {
      border-color: #ef4444;
      background: #ef4444;
    }

    .step-dot--skipped {
      border-color: var(--muted, #838387);
      background: var(--muted, #838387);
      opacity: 0.5;
    }

    @keyframes pulse-dot {
      0%, 100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.4); }
      50% { box-shadow: 0 0 0 4px rgba(251, 191, 36, 0); }
    }

    .step-connector {
      width: 2px;
      flex: 1;
      min-height: 12px;
      background: var(--border, #1e2028);
      transition: background 0.3s ease;
    }

    .step-connector--done {
      background: #22c55e;
    }

    .step-content {
      flex: 1;
      min-width: 0;
      padding-bottom: 4px;
    }

    .step-label {
      font-size: 12px;
      color: var(--text, #d4d4d8);
      font-weight: 500;
      line-height: 1.4;
    }

    .step-label--active {
      color: var(--text-strong, #f4f4f5);
      font-weight: 600;
    }

    .step-label--done {
      color: var(--muted, #838387);
    }

    .step-detail {
      font-size: 11px;
      color: var(--muted, #838387);
      margin-top: 2px;
      line-height: 1.4;
    }

    .step-time {
      font-size: 10px;
      color: var(--muted, #838387);
      opacity: 0.7;
      font-variant-numeric: tabular-nums;
      margin-top: 2px;
    }

    .task-output {
      margin: 0 14px 14px 14px;
      padding: 10px 12px;
      background: var(--bg, #0e1015);
      border-radius: var(--radius-sm, 6px);
      border: 1px solid var(--border, #1e2028);
      font-family: var(--mono, monospace);
      font-size: 11px;
      color: var(--text, #d4d4d8);
      max-height: 120px;
      overflow-y: auto;
      white-space: pre-wrap;
      word-break: break-all;
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

    .execution-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 16px;
      border-top: 1px solid var(--border, #1e2028);
      background: var(--panel-strong, #191c24);
      flex-shrink: 0;
    }

    .footer-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border: none;
      background: none;
      color: var(--muted, #838387);
      font-size: 11px;
      cursor: pointer;
      border-radius: var(--radius-sm, 6px);
      transition: all 0.15s ease;
    }

    .footer-btn:hover {
      background: var(--bg-hover, #1f2330);
      color: var(--text, #d4d4d8);
    }

    .task-count {
      font-size: 11px;
      color: var(--muted, #838387);
    }

    /* Artifact preview inside execution panel */
    .artifact-preview {
      margin: 0 14px 14px 14px;
      border-radius: var(--radius-md, 10px);
      border: 1px solid var(--border, #1e2028);
      overflow: hidden;
    }

    .artifact-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      background: var(--bg-accent, #13151b);
      border-bottom: 1px solid var(--border, #1e2028);
    }

    .artifact-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-strong, #f4f4f5);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .artifact-actions {
      display: flex;
      gap: 4px;
    }

    .artifact-action-btn {
      padding: 4px 8px;
      border: none;
      background: var(--bg-hover, #1f2330);
      color: var(--muted, #838387);
      font-size: 10px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .artifact-action-btn:hover {
      background: var(--accent, #fbbf24);
      color: white;
    }

    .artifact-body {
      background: var(--bg, #0e1015);
      min-height: 80px;
      max-height: 200px;
      overflow: auto;
    }

    .artifact-body iframe {
      width: 100%;
      height: 100%;
      border: none;
      min-height: 160px;
    }

    .artifact-body pre {
      margin: 0;
      padding: 12px;
      font-family: var(--mono, monospace);
      font-size: 11px;
      line-height: 1.5;
      color: var(--text, #d4d4d8);
      white-space: pre-wrap;
      word-break: break-all;
    }
  `;

  private get selectedTask(): ExecutionTask | null {
    return this.tasks.find((t) => t.id === this.selectedTaskId) ?? null;
  }

  private formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return `${mins}m ${secs}s`;
  }

  private getElapsed(task: ExecutionTask): number {
    const end = task.completedAt ?? Date.now();
    return end - task.startedAt;
  }

  private getStepIcon(status: ExecutionStep["status"]): string {
    switch (status) {
      case "done": return "✓";
      case "active": return "⟳";
      case "error": return "✕";
      case "skipped": return "⊘";
      default: return "";
    }
  }

  private renderStep(step: ExecutionStep, isLast: boolean): unknown {
    const isActive = step.status === "active";
    const isDone = step.status === "done";
    const isError = step.status === "error";

    return html`
      <div class="step">
        <div class="step-line">
          <div class="step-dot step-dot--${step.status}"></div>
          ${!isLast ? html`<div class="step-connector ${isDone ? 'step-connector--done' : ''}"></div>` : nothing}
        </div>
        <div class="step-content">
          <div class="step-label step-label--${step.status}">
            ${this.getStepIcon(step.status)} ${step.label}
          </div>
          ${step.detail ? html`<div class="step-detail">${step.detail}</div>` : nothing}
          ${step.startedAt ? html`
            <div class="step-time">
              ${step.completedAt
                ? this.formatDuration(step.completedAt - step.startedAt)
                : isActive
                  ? html`<span style="color: var(--accent, #fbbf24)">running...</span>`
                  : ""}
            </div>
          ` : nothing}
        </div>
      </div>
    `;
  }

  private renderTask(task: ExecutionTask): unknown {
    const isExpanded = this.selectedTaskId === task.id;
    const isRunning = task.status === "running";
    const isCompleted = task.status === "completed";
    const isError = task.status === "error";

    return html`
      <div class="task-card task-card--${task.status}">
        <div class="task-header" @click=${() => {
          this.selectedTaskId = this.selectedTaskId === task.id ? null : task.id;
        }}>
          <div class="task-icon task-icon--${task.status}">
            ${isRunning ? "⟳" : isCompleted ? "✓" : isError ? "✕" : "⏸"}
          </div>
          <div class="task-info">
            <div class="task-title">${task.title}</div>
            <div class="task-meta">
              <span class="task-duration">${this.formatDuration(this.getElapsed(task))}</span>
              <span>${task.steps.filter(s => s.status === "done").length}/${task.steps.length} steps</span>
            </div>
          </div>
          <div class="task-chevron ${isExpanded ? 'task-chevron--expanded' : ''}">▸</div>
        </div>

        ${isExpanded ? html`
          <div class="steps-container">
            ${repeat(
              task.steps,
              (s) => s.id,
              (s, i) => this.renderStep(s, i === task.steps.length - 1)
            )}
          </div>

          ${task.output ? html`
            <div class="task-output">${task.output}</div>
          ` : nothing}

          ${task.artifactType ? html`
            <div class="artifact-preview">
              <div class="artifact-header">
                <span class="artifact-label">
                  ${task.artifactType === "code" ? "💻" : task.artifactType === "document" ? "📄" : task.artifactType === "diagram" ? "📊" : task.artifactType === "webpage" ? "🌐" : "📁"}
                  ${task.artifactType.charAt(0).toUpperCase() + task.artifactType.slice(1)} Output
                </span>
                <div class="artifact-actions">
                  <button class="artifact-action-btn" @click=${(e: Event) => {
                    e.stopPropagation();
                    this.dispatchEvent(new CustomEvent("copy-artifact", { detail: { taskId: task.id } }));
                  }}>Copy</button>
                  <button class="artifact-action-btn" @click=${(e: Event) => {
                    e.stopPropagation();
                    this.dispatchEvent(new CustomEvent("download-artifact", { detail: { taskId: task.id } }));
                  }}>Download</button>
                  <button class="artifact-action-btn" @click=${(e: Event) => {
                    e.stopPropagation();
                    this.dispatchEvent(new CustomEvent("expand-artifact", { detail: { taskId: task.id } }));
                  }}>Expand</button>
                </div>
              </div>
              <div class="artifact-body">
                ${task.artifactUrl
                  ? html`<iframe src=${task.artifactUrl}></iframe>`
                  : html`<pre>${task.output ?? "Generating..."}</pre>`
                }
              </div>
            </div>
          ` : nothing}
        ` : nothing}
      </div>
    `;
  }

  render() {
    const hasTasks = this.tasks.length > 0;
    const runningCount = this.tasks.filter(t => t.status === "running").length;

    return html`
      <div class="execution-header">
        <h3>
          ⚡ Execution
          ${runningCount > 0 ? html`
            <span class="live-badge">
              <span class="live-dot"></span>
              ${runningCount} running
            </span>
          ` : nothing}
        </h3>
      </div>

      <div class="execution-body">
        ${hasTasks ? repeat(
          this.tasks,
          (t) => t.id,
          (t) => this.renderTask(t)
        ) : html`
          <div class="empty-state">
            <div class="empty-icon">⚡</div>
            <div class="empty-text">
              No tasks running yet.<br>
              Send a message to see the AI work in real-time!
            </div>
          </div>
        `}
      </div>

      ${hasTasks ? html`
        <div class="execution-footer">
          <span class="task-count">${this.tasks.length} task${this.tasks.length !== 1 ? 's' : ''}</span>
          <button class="footer-btn" @click=${() => {
            this.dispatchEvent(new CustomEvent("clear-tasks"));
          }}>Clear All</button>
        </div>
      ` : nothing}
    `;
  }
}
