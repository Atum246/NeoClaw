/**
 * Memory Visualizer — See and manage what the AI remembers
 * Shows memories, facts, and preferences with edit/delete capabilities
 */
import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

export interface MemoryEntry {
  id: string;
  category: "fact" | "preference" | "context" | "decision" | "person" | "project" | "todo";
  content: string;
  source: string;
  createdAt: number;
  updatedAt: number;
  confidence: number; // 0-1
  tags?: string[];
}

@customElement("memory-visualizer")
export class MemoryVisualizer extends LitElement {
  @property({ type: Array }) memories: MemoryEntry[] = [];
  @state() private selectedCategory: string | null = null;
  @state() private searchQuery = "";
  @state() private editingId: string | null = null;
  @state() private editContent = "";

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--panel, #0e1015);
      border-left: 1px solid var(--border, #1e2028);
      overflow: hidden;
    }

    .mem-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid var(--border, #1e2028);
      background: var(--panel-strong, #191c24);
      flex-shrink: 0;
    }

    .mem-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-strong, #f4f4f5);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .mem-count {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 9999px;
      background: var(--accent-subtle, rgba(255, 92, 92, 0.1));
      color: var(--accent, #ff5c5c);
      font-size: 11px;
      font-weight: 600;
    }

    .mem-search {
      padding: 8px 16px;
      border-bottom: 1px solid var(--border, #1e2028);
      background: var(--bg-accent, #13151b);
      flex-shrink: 0;
    }

    .mem-search input {
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

    .mem-search input:focus {
      border-color: var(--accent, #ff5c5c);
    }

    .mem-categories {
      display: flex;
      gap: 4px;
      padding: 8px 16px;
      overflow-x: auto;
      border-bottom: 1px solid var(--border, #1e2028);
      background: var(--panel-strong, #191c24);
      flex-shrink: 0;
      scrollbar-width: none;
    }

    .mem-categories::-webkit-scrollbar { display: none; }

    .cat-chip {
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

    .cat-chip:hover {
      background: var(--bg-hover, #1f2330);
      color: var(--text, #d4d4d8);
    }

    .cat-chip--active {
      background: var(--accent-subtle, rgba(255, 92, 92, 0.1));
      color: var(--accent, #ff5c5c);
      border-color: var(--accent, #ff5c5c);
    }

    .mem-body {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      scrollbar-width: thin;
    }

    .memory-card {
      background: var(--card, #161920);
      border: 1px solid var(--border, #1e2028);
      border-radius: var(--radius-md, 10px);
      padding: 12px;
      margin-bottom: 8px;
      transition: all 0.15s ease;
    }

    .memory-card:hover {
      border-color: var(--border-hover, #3e4050);
      background: var(--card-highlight, rgba(255, 255, 255, 0.04));
    }

    .memory-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
    }

    .memory-category {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .memory-category--fact { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
    .memory-category--preference { background: rgba(168, 85, 247, 0.1); color: #a855f7; }
    .memory-category--context { background: rgba(20, 184, 166, 0.1); color: #14b8a6; }
    .memory-category--decision { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
    .memory-category--person { background: rgba(236, 72, 153, 0.1); color: #ec4899; }
    .memory-category--project { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
    .memory-category--todo { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

    .memory-actions {
      display: flex;
      gap: 2px;
      opacity: 0;
      transition: opacity 0.15s ease;
    }

    .memory-card:hover .memory-actions {
      opacity: 1;
    }

    .mem-action-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border: none;
      background: none;
      color: var(--muted, #838387);
      font-size: 12px;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.12s ease;
    }

    .mem-action-btn:hover {
      background: var(--bg-hover, #1f2330);
      color: var(--text, #d4d4d8);
    }

    .mem-action-btn--delete:hover {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }

    .memory-content {
      font-size: 12px;
      color: var(--text, #d4d4d8);
      line-height: 1.5;
      margin-bottom: 6px;
    }

    .memory-content--editing textarea {
      width: 100%;
      min-height: 60px;
      padding: 8px;
      border: 1px solid var(--accent, #ff5c5c);
      background: var(--bg, #0e1015);
      color: var(--text, #d4d4d8);
      font-size: 12px;
      font-family: inherit;
      border-radius: var(--radius-sm, 6px);
      outline: none;
      resize: vertical;
      box-sizing: border-box;
    }

    .memory-edit-actions {
      display: flex;
      gap: 4px;
      margin-top: 6px;
    }

    .edit-btn {
      padding: 4px 10px;
      border: none;
      font-size: 11px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.12s ease;
    }

    .edit-btn--save {
      background: var(--accent, #ff5c5c);
      color: white;
    }

    .edit-btn--cancel {
      background: var(--bg-hover, #1f2330);
      color: var(--text, #d4d4d8);
    }

    .memory-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 10px;
      color: var(--muted, #838387);
    }

    .memory-source {
      font-style: italic;
    }

    .memory-confidence {
      display: inline-flex;
      align-items: center;
      gap: 2px;
    }

    .confidence-dot {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: var(--muted, #838387);
    }

    .confidence-dot--filled {
      background: var(--accent, #ff5c5c);
    }

    .memory-tags {
      display: flex;
      gap: 4px;
      margin-top: 6px;
      flex-wrap: wrap;
    }

    .memory-tag {
      padding: 1px 6px;
      border-radius: 3px;
      background: var(--bg-hover, #1f2330);
      color: var(--muted, #838387);
      font-size: 10px;
    }

    .mem-footer {
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

    .footer-btn {
      padding: 4px 10px;
      border: 1px solid var(--border, #1e2028);
      background: var(--card, #161920);
      color: var(--muted, #838387);
      font-size: 11px;
      border-radius: var(--radius-sm, 6px);
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .footer-btn:hover {
      background: var(--bg-hover, #1f2330);
      color: var(--text, #d4d4d8);
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
  `;

  private getCategoryIcon(cat: MemoryEntry["category"]): string {
    const icons: Record<string, string> = {
      fact: "📌", preference: "⭐", context: "📎",
      decision: "🎯", person: "👤", project: "📂", todo: "✅"
    };
    return icons[cat] ?? "📝";
  }

  private getFilteredMemories(): MemoryEntry[] {
    let filtered = this.memories;
    if (this.selectedCategory) {
      filtered = filtered.filter(m => m.category === this.selectedCategory);
    }
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.content.toLowerCase().includes(q) ||
        m.source.toLowerCase().includes(q) ||
        m.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    return filtered.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  private renderConfidence(level: number): unknown {
    const dots = [];
    for (let i = 0; i < 5; i++) {
      dots.push(html`
        <span class="confidence-dot ${i < Math.round(level * 5) ? 'confidence-dot--filled' : ''}"></span>
      `);
    }
    return html`<span class="memory-confidence">${dots}</span>`;
  }

  private renderMemory(memory: MemoryEntry): unknown {
    const isEditing = this.editingId === memory.id;

    return html`
      <div class="memory-card">
        <div class="memory-header">
          <span class="memory-category memory-category--${memory.category}">
            ${this.getCategoryIcon(memory.category)} ${memory.category}
          </span>
          <div class="memory-actions">
            <button class="mem-action-btn" @click=${() => {
              this.editingId = memory.id;
              this.editContent = memory.content;
            }} title="Edit">✏️</button>
            <button class="mem-action-btn mem-action-btn--delete" @click=${() => {
              this.dispatchEvent(new CustomEvent("delete-memory", { detail: { id: memory.id } }));
            }} title="Delete">🗑️</button>
          </div>
        </div>

        ${isEditing ? html`
          <div class="memory-content--editing">
            <textarea .value=${this.editContent} @input=${(e: Event) => {
              this.editContent = (e.target as HTMLTextAreaElement).value;
            }}></textarea>
            <div class="memory-edit-actions">
              <button class="edit-btn edit-btn--save" @click=${() => {
                this.dispatchEvent(new CustomEvent("update-memory", {
                  detail: { id: memory.id, content: this.editContent }
                }));
                this.editingId = null;
              }}>Save</button>
              <button class="edit-btn edit-btn--cancel" @click=${() => {
                this.editingId = null;
              }}>Cancel</button>
            </div>
          </div>
        ` : html`
          <div class="memory-content">${memory.content}</div>
        `}

        <div class="memory-meta">
          <span class="memory-source">from ${memory.source}</span>
          <span>·</span>
          <span>${new Date(memory.updatedAt).toLocaleDateString()}</span>
          <span>·</span>
          ${this.renderConfidence(memory.confidence)}
        </div>

        ${memory.tags?.length ? html`
          <div class="memory-tags">
            ${memory.tags.map(t => html`<span class="memory-tag">${t}</span>`)}
          </div>
        ` : nothing}
      </div>
    `;
  }

  render() {
    const filtered = this.getFilteredMemories();
    const categories = [...new Set(this.memories.map(m => m.category))];

    return html`
      <div class="mem-header">
        <span class="mem-title">
          🧠 Memory
          <span class="mem-count">${this.memories.length}</span>
        </span>
      </div>

      <div class="mem-search">
        <input
          type="text"
          placeholder="Search memories..."
          .value=${this.searchQuery}
          @input=${(e: Event) => this.searchQuery = (e.target as HTMLInputElement).value}
        />
      </div>

      <div class="mem-categories">
        <button
          class="cat-chip ${!this.selectedCategory ? 'cat-chip--active' : ''}"
          @click=${() => this.selectedCategory = null}
        >All</button>
        ${categories.map(cat => html`
          <button
            class="cat-chip ${this.selectedCategory === cat ? 'cat-chip--active' : ''}"
            @click=${() => this.selectedCategory = this.selectedCategory === cat ? null : cat}
          >${this.getCategoryIcon(cat)} ${cat}</button>
        `)}
      </div>

      <div class="mem-body">
        ${filtered.length > 0 ? filtered.map(m => this.renderMemory(m)) : html`
          <div class="empty-state">
            <div class="empty-icon">🧠</div>
            <div class="empty-text">
              ${this.searchQuery ? "No memories match your search." : "No memories stored yet."}
            </div>
          </div>
        `}
      </div>

      <div class="mem-footer">
        <span class="footer-stats">${filtered.length} of ${this.memories.length} memories</span>
        <button class="footer-btn" @click=${() => {
          this.dispatchEvent(new CustomEvent("export-memories"));
        }}>📤 Export</button>
      </div>
    `;
  }
}
