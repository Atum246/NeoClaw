/**
 * Artifact Panel — Claude-style side panel for code, documents, diagrams
 * Renders artifacts in a dedicated panel alongside the chat
 */
import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

export interface Artifact {
  id: string;
  type: "code" | "document" | "diagram" | "webpage" | "data" | "svg" | "markdown";
  title: string;
  language?: string;
  content: string;
  version: number;
  createdAt: number;
  updatedAt: number;
  previewUrl?: string;
}

@customElement("artifact-panel")
export class ArtifactPanel extends LitElement {
  @property({ type: Array }) artifacts: Artifact[] = [];
  @property({ type: String }) activeArtifactId: string | null = null;
  @property({ type: Boolean }) expanded = true;
  @state() private viewMode: "preview" | "code" | "split" = "preview";
  @state() private fontSize = 13;

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--panel, #0e1015);
      border-left: 1px solid var(--border, #1e2028);
      overflow: hidden;
    }

    .artifact-panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      border-bottom: 1px solid var(--border, #1e2028);
      background: var(--panel-strong, #191c24);
      flex-shrink: 0;
    }

    .artifact-panel-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-strong, #f4f4f5);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .artifact-tabs {
      display: flex;
      gap: 2px;
      padding: 8px 14px 0;
      background: var(--panel-strong, #191c24);
      overflow-x: auto;
      flex-shrink: 0;
      scrollbar-width: none;
    }

    .artifact-tabs::-webkit-scrollbar { display: none; }

    .artifact-tab {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      border: none;
      background: none;
      color: var(--muted, #838387);
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.15s ease;
      white-space: nowrap;
      position: relative;
    }

    .artifact-tab:hover {
      color: var(--text, #d4d4d8);
      background: var(--bg-hover, #1f2330);
    }

    .artifact-tab--active {
      color: var(--accent, #ff5c5c);
      border-bottom-color: var(--accent, #ff5c5c);
    }

    .artifact-tab-icon {
      font-size: 14px;
    }

    .artifact-tab-close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      border: none;
      background: none;
      color: var(--muted, #838387);
      font-size: 10px;
      cursor: pointer;
      border-radius: 3px;
      margin-left: 2px;
      opacity: 0;
      transition: all 0.15s ease;
    }

    .artifact-tab:hover .artifact-tab-close {
      opacity: 1;
    }

    .artifact-tab-close:hover {
      background: var(--destructive, #ef4444);
      color: white;
    }

    .artifact-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 14px;
      border-bottom: 1px solid var(--border, #1e2028);
      background: var(--bg-accent, #13151b);
      flex-shrink: 0;
    }

    .toolbar-group {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .toolbar-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 4px 8px;
      border: 1px solid var(--border, #1e2028);
      background: var(--card, #161920);
      color: var(--muted, #838387);
      font-size: 11px;
      border-radius: var(--radius-sm, 6px);
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .toolbar-btn:hover {
      background: var(--bg-hover, #1f2330);
      color: var(--text, #d4d4d8);
      border-color: var(--border-hover, #3e4050);
    }

    .toolbar-btn--active {
      background: var(--accent-subtle, rgba(255, 92, 92, 0.1));
      color: var(--accent, #ff5c5c);
      border-color: var(--accent, #ff5c5c);
    }

    .toolbar-btn svg {
      width: 14px;
      height: 14px;
    }

    .version-badge {
      display: inline-flex;
      align-items: center;
      padding: 2px 6px;
      border-radius: 4px;
      background: var(--bg-hover, #1f2330);
      color: var(--muted, #838387);
      font-size: 10px;
      font-weight: 600;
    }

    .artifact-body {
      flex: 1;
      overflow: auto;
      position: relative;
    }

    .artifact-body--preview {
      background: var(--bg, #0e1015);
    }

    .artifact-body--code {
      background: var(--bg, #0e1015);
    }

    .artifact-body--split {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }

    .code-view {
      height: 100%;
      overflow: auto;
      padding: 16px;
    }

    .code-view pre {
      margin: 0;
      font-family: var(--mono, monospace);
      font-size: var(--code-font-size, 13px);
      line-height: 1.6;
      color: var(--text, #d4d4d8);
      tab-size: 2;
      white-space: pre;
    }

    .code-view .line-number {
      display: inline-block;
      width: 3em;
      text-align: right;
      padding-right: 1em;
      color: var(--muted, #838387);
      opacity: 0.5;
      user-select: none;
    }

    .code-view .line-highlight {
      background: var(--accent-subtle, rgba(255, 92, 92, 0.08));
      margin: 0 -16px;
      padding: 0 16px;
    }

    .preview-view {
      height: 100%;
      overflow: auto;
      padding: 16px;
    }

    .preview-view iframe {
      width: 100%;
      height: 100%;
      border: none;
      border-radius: var(--radius-sm, 6px);
    }

    .preview-view .markdown-preview {
      font-family: var(--font-body, sans-serif);
      font-size: 14px;
      line-height: 1.7;
      color: var(--text, #d4d4d8);
    }

    .preview-view .markdown-preview h1,
    .preview-view .markdown-preview h2,
    .preview-view .markdown-preview h3 {
      color: var(--text-strong, #f4f4f5);
      margin: 1.5em 0 0.5em;
    }

    .preview-view .markdown-preview h1 { font-size: 1.5em; }
    .preview-view .markdown-preview h2 { font-size: 1.3em; }
    .preview-view .markdown-preview h3 { font-size: 1.1em; }

    .preview-view .markdown-preview code {
      background: var(--bg-hover, #1f2330);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: var(--mono, monospace);
      font-size: 0.9em;
    }

    .preview-view .markdown-preview pre {
      background: var(--bg-accent, #13151b);
      padding: 14px 16px;
      border-radius: var(--radius-sm, 6px);
      overflow-x: auto;
      border: 1px solid var(--border, #1e2028);
    }

    .preview-view .markdown-preview pre code {
      background: none;
      padding: 0;
    }

    .preview-view .markdown-preview blockquote {
      border-left: 3px solid var(--accent, #ff5c5c);
      padding-left: 14px;
      margin: 1em 0;
      color: var(--muted, #838387);
    }

    .preview-view .markdown-preview table {
      width: 100%;
      border-collapse: collapse;
      margin: 1em 0;
    }

    .preview-view .markdown-preview th,
    .preview-view .markdown-preview td {
      padding: 8px 12px;
      border: 1px solid var(--border, #1e2028);
      text-align: left;
    }

    .preview-view .markdown-preview th {
      background: var(--bg-accent, #13151b);
      font-weight: 600;
    }

    .preview-view .markdown-preview img {
      max-width: 100%;
      border-radius: var(--radius-sm, 6px);
    }

    .preview-view .markdown-preview a {
      color: var(--accent, #ff5c5c);
      text-decoration: none;
    }

    .preview-view .markdown-preview a:hover {
      text-decoration: underline;
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

    .artifact-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 14px;
      border-top: 1px solid var(--border, #1e2028);
      background: var(--panel-strong, #191c24);
      flex-shrink: 0;
    }

    .footer-info {
      font-size: 11px;
      color: var(--muted, #838387);
    }

    .footer-actions {
      display: flex;
      gap: 4px;
    }
  `;

  private get activeArtifact(): Artifact | null {
    return this.artifacts.find((a) => a.id === this.activeArtifactId) ?? null;
  }

  private getTypeIcon(type: Artifact["type"]): string {
    switch (type) {
      case "code": return "💻";
      case "document": return "📄";
      case "diagram": return "📊";
      case "webpage": return "🌐";
      case "data": return "📁";
      case "svg": return "🎨";
      case "markdown": return "📝";
      default: return "📎";
    }
  }

  private renderCodeLines(content: string): unknown {
    const lines = content.split("\n");
    return html`
      <pre>${lines.map((line, i) => html`
<span class="line-number">${i + 1}</span>${line}
`)}</pre>
    `;
  }

  private renderPreview(artifact: Artifact): unknown {
    switch (artifact.type) {
      case "code":
        return html`<div class="markdown-preview"><pre><code>${artifact.content}</code></pre></div>`;
      case "markdown":
      case "document":
        return html`<div class="markdown-preview">${artifact.content}</div>`;
      case "webpage":
      case "svg":
        return html`<iframe srcdoc=${artifact.content}></iframe>`;
      case "diagram":
        return html`<div class="markdown-preview"><pre>${artifact.content}</pre></div>`;
      default:
        return html`<div class="markdown-preview"><pre>${artifact.content}</pre></div>`;
    }
  }

  render() {
    const active = this.activeArtifact;
    const hasArtifacts = this.artifacts.length > 0;

    return html`
      <div class="artifact-panel-header">
        <span class="artifact-panel-title">
          📦 Artifacts
        </span>
        ${active ? html`
          <span class="version-badge">v${active.version}</span>
        ` : nothing}
      </div>

      ${hasArtifacts ? html`
        <div class="artifact-tabs">
          ${this.artifacts.map((a) => html`
            <button
              class="artifact-tab ${a.id === this.activeArtifactId ? 'artifact-tab--active' : ''}"
              @click=${() => this.activeArtifactId = a.id}
            >
              <span class="artifact-tab-icon">${this.getTypeIcon(a.type)}</span>
              ${a.title}
              <button
                class="artifact-tab-close"
                @click=${(e: Event) => {
                  e.stopPropagation();
                  this.dispatchEvent(new CustomEvent("close-artifact", { detail: { id: a.id } }));
                }}
              >✕</button>
            </button>
          `)}
        </div>
      ` : nothing}

      ${active ? html`
        <div class="artifact-toolbar">
          <div class="toolbar-group">
            <button
              class="toolbar-btn ${this.viewMode === 'preview' ? 'toolbar-btn--active' : ''}"
              @click=${() => this.viewMode = 'preview'}
              title="Preview"
            >👁 Preview</button>
            <button
              class="toolbar-btn ${this.viewMode === 'code' ? 'toolbar-btn--active' : ''}"
              @click=${() => this.viewMode = 'code'}
              title="Code"
            >{ } Code</button>
            <button
              class="toolbar-btn ${this.viewMode === 'split' ? 'toolbar-btn--active' : ''}"
              @click=${() => this.viewMode = 'split'}
              title="Split View"
            >⊞ Split</button>
          </div>
          <div class="toolbar-group">
            <button class="toolbar-btn" @click=${() => this.fontSize = Math.max(10, this.fontSize - 1)} title="Decrease font">A-</button>
            <button class="toolbar-btn" @click=${() => this.fontSize = Math.min(20, this.fontSize + 1)} title="Increase font">A+</button>
          </div>
        </div>
      ` : nothing}

      <div class="artifact-body artifact-body--${this.viewMode}">
        ${active ? html`
          ${this.viewMode === 'preview' ? html`
            <div class="preview-view">${this.renderPreview(active)}</div>
          ` : nothing}
          ${this.viewMode === 'code' ? html`
            <div class="code-view" style="--code-font-size: ${this.fontSize}px">
              ${this.renderCodeLines(active.content)}
            </div>
          ` : nothing}
          ${this.viewMode === 'split' ? html`
            <div class="code-view" style="--code-font-size: ${this.fontSize}px">
              ${this.renderCodeLines(active.content)}
            </div>
            <div class="preview-view">${this.renderPreview(active)}</div>
          ` : nothing}
        ` : html`
          <div class="empty-state">
            <div class="empty-icon">📦</div>
            <div class="empty-text">
              No artifacts yet.<br>
              Ask the AI to create code, documents, or diagrams!
            </div>
          </div>
        `}
      </div>

      ${active ? html`
        <div class="artifact-footer">
          <span class="footer-info">
            ${active.language ? `${active.language} · ` : ""}${active.content.split("\n").length} lines · ${this.getTypeIcon(active.type)} ${active.type}
          </span>
          <div class="footer-actions">
            <button class="toolbar-btn" @click=${() => {
              navigator.clipboard.writeText(active.content);
            }}>📋 Copy</button>
            <button class="toolbar-btn" @click=${() => {
              this.dispatchEvent(new CustomEvent("download-artifact", { detail: { artifact: active } }));
            }}>💾 Save</button>
          </div>
        </div>
      ` : nothing}
    `;
  }
}
