/**
 * File Manager — Browse and download all workspace files
 * Lets users see everything OpenClaw has created and download it
 */
import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

export interface FileEntry {
  name: string;
  path: string;
  type: "file" | "directory";
  size?: number;
  modified?: number;
  extension?: string;
  children?: FileEntry[];
  isExpanded?: boolean;
}

@customElement("file-manager")
export class FileManager extends LitElement {
  @property({ type: Array }) files: FileEntry[] = [];
  @property({ type: String }) rootLabel = "Workspace";
  @state() private selectedPath: string | null = null;
  @state() private viewMode: "tree" | "grid" | "list" = "tree";
  @state() private searchQuery = "";
  @state() private sortBy: "name" | "date" | "size" | "type" = "name";
  @state() private showHidden = false;

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--panel, #0e1015);
      border-left: 1px solid var(--border, #1e2028);
      overflow: hidden;
    }

    .fm-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid var(--border, #1e2028);
      background: var(--panel-strong, #191c24);
      flex-shrink: 0;
    }

    .fm-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-strong, #f4f4f5);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .fm-actions {
      display: flex;
      gap: 4px;
    }

    .fm-btn {
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

    .fm-btn:hover {
      background: var(--bg-hover, #1f2330);
      color: var(--text, #d4d4d8);
      border-color: var(--border-hover, #3e4050);
    }

    .fm-btn--primary {
      background: var(--accent, #ff5c5c);
      color: white;
      border-color: var(--accent, #ff5c5c);
    }

    .fm-btn--primary:hover {
      background: var(--accent-hover, #ff7070);
    }

    .fm-search {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-bottom: 1px solid var(--border, #1e2028);
      background: var(--bg-accent, #13151b);
      flex-shrink: 0;
    }

    .fm-search input {
      flex: 1;
      padding: 6px 10px;
      border: 1px solid var(--border, #1e2028);
      background: var(--card, #161920);
      color: var(--text, #d4d4d8);
      font-size: 12px;
      border-radius: var(--radius-sm, 6px);
      outline: none;
      transition: border-color 0.15s ease;
    }

    .fm-search input:focus {
      border-color: var(--accent, #ff5c5c);
    }

    .fm-search input::placeholder {
      color: var(--muted, #838387);
    }

    .fm-sort {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 16px;
      border-bottom: 1px solid var(--border, #1e2028);
      background: var(--panel-strong, #191c24);
      flex-shrink: 0;
    }

    .fm-sort label {
      font-size: 11px;
      color: var(--muted, #838387);
    }

    .fm-sort select {
      padding: 3px 6px;
      border: 1px solid var(--border, #1e2028);
      background: var(--card, #161920);
      color: var(--text, #d4d4d8);
      font-size: 11px;
      border-radius: 4px;
      outline: none;
    }

    .fm-body {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
      scrollbar-width: thin;
      scrollbar-color: var(--border-strong, #2e3040) transparent;
    }

    .file-tree {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .file-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      border-radius: var(--radius-sm, 6px);
      cursor: pointer;
      transition: all 0.12s ease;
      user-select: none;
    }

    .file-item:hover {
      background: var(--bg-hover, #1f2330);
    }

    .file-item--selected {
      background: var(--accent-subtle, rgba(255, 92, 92, 0.08));
      color: var(--accent, #ff5c5c);
    }

    .file-icon {
      width: 18px;
      text-align: center;
      font-size: 14px;
      flex-shrink: 0;
    }

    .file-name {
      flex: 1;
      font-size: 12px;
      color: var(--text, #d4d4d8);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .file-item--selected .file-name {
      color: var(--accent, #ff5c5c);
    }

    .file-name--dir {
      font-weight: 600;
    }

    .file-meta {
      font-size: 10px;
      color: var(--muted, #838387);
      white-space: nowrap;
      flex-shrink: 0;
    }

    .file-expand {
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--muted, #838387);
      transition: transform 0.15s ease;
      flex-shrink: 0;
      font-size: 10px;
    }

    .file-expand--expanded {
      transform: rotate(90deg);
    }

    .file-children {
      padding-left: 20px;
      list-style: none;
      margin: 0;
    }

    .file-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 8px;
      padding: 8px;
    }

    .file-grid-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 12px 8px;
      border-radius: var(--radius-md, 10px);
      cursor: pointer;
      transition: all 0.15s ease;
      text-align: center;
    }

    .file-grid-item:hover {
      background: var(--bg-hover, #1f2330);
    }

    .file-grid-item--selected {
      background: var(--accent-subtle, rgba(255, 92, 92, 0.08));
    }

    .file-grid-icon {
      font-size: 28px;
    }

    .file-grid-name {
      font-size: 11px;
      color: var(--text, #d4d4d8);
      word-break: break-all;
      line-height: 1.3;
    }

    .file-grid-size {
      font-size: 10px;
      color: var(--muted, #838387);
    }

    .fm-statusbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 16px;
      border-top: 1px solid var(--border, #1e2028);
      background: var(--panel-strong, #191c24);
      flex-shrink: 0;
    }

    .fm-status {
      font-size: 11px;
      color: var(--muted, #838387);
    }

    .fm-status strong {
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

    .file-checkbox {
      width: 14px;
      height: 14px;
      accent-color: var(--accent, #ff5c5c);
      flex-shrink: 0;
    }
  `;

  private getFileIcon(entry: FileEntry): string {
    if (entry.type === "directory") return entry.isExpanded ? "📂" : "📁";
    const ext = entry.extension?.toLowerCase() ?? "";
    const iconMap: Record<string, string> = {
      ".ts": "🟦", ".tsx": "🟦", ".js": "🟨", ".jsx": "🟨",
      ".css": "🎨", ".scss": "🎨", ".html": "🌐",
      ".md": "📝", ".txt": "📄", ".json": "📋",
      ".py": "🐍", ".rs": "🦀", ".go": "🔵",
      ".png": "🖼️", ".jpg": "🖼️", ".svg": "🎨", ".gif": "🖼️",
      ".pdf": "📕", ".doc": "📘", ".docx": "📘", ".xlsx": "📊",
      ".wav": "🔊", ".mp3": "🎵", ".mp4": "🎬",
      ".zip": "📦", ".tar": "📦", ".gz": "📦",
      ".yaml": "⚙️", ".yml": "⚙️", ".toml": "⚙️", ".env": "🔐",
    };
    return iconMap[ext] ?? "📄";
  }

  private formatSize(bytes?: number): string {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }

  private formatDate(timestamp?: number): string {
    if (!timestamp) return "";
    const d = new Date(timestamp);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  private toggleExpand(entry: FileEntry) {
    entry.isExpanded = !entry.isExpanded;
    this.requestUpdate();
  }

  private filterFiles(files: FileEntry[]): FileEntry[] {
    let filtered = files;
    if (!this.showHidden) {
      filtered = filtered.filter(f => !f.name.startsWith("."));
    }
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(f =>
        f.name.toLowerCase().includes(q) ||
        f.path.toLowerCase().includes(q)
      );
    }
    return filtered.sort((a, b) => {
      if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
      switch (this.sortBy) {
        case "name": return a.name.localeCompare(b.name);
        case "date": return (b.modified ?? 0) - (a.modified ?? 0);
        case "size": return (b.size ?? 0) - (a.size ?? 0);
        case "type": return (a.extension ?? "").localeCompare(b.extension ?? "");
        default: return 0;
      }
    });
  }

  private renderTreeItem(entry: FileEntry): unknown {
    const isDir = entry.type === "directory";
    const isSelected = this.selectedPath === entry.path;

    return html`
      <li>
        <div
          class="file-item ${isSelected ? 'file-item--selected' : ''}"
          @click=${() => {
            if (isDir) {
              this.toggleExpand(entry);
            } else {
              this.selectedPath = entry.path;
            }
          }}
        >
          ${isDir ? html`
            <span class="file-expand ${entry.isExpanded ? 'file-expand--expanded' : ''}">▸</span>
          ` : html`
            <span class="file-expand"></span>
          `}
          <span class="file-icon">${this.getFileIcon(entry)}</span>
          <span class="file-name ${isDir ? 'file-name--dir' : ''}">${entry.name}</span>
          ${!isDir ? html`
            <span class="file-meta">${this.formatSize(entry.size)}</span>
          ` : nothing}
        </div>
        ${isDir && entry.isExpanded && entry.children ? html`
          <ul class="file-children">
            ${this.filterFiles(entry.children).map(child => this.renderTreeItem(child))}
          </ul>
        ` : nothing}
      </li>
    `;
  }

  private renderGridItem(entry: FileEntry): unknown {
    const isSelected = this.selectedPath === entry.path;
    return html`
      <div
        class="file-grid-item ${isSelected ? 'file-grid-item--selected' : ''}"
        @click=${() => {
          if (entry.type === "directory") {
            this.toggleExpand(entry);
          } else {
            this.selectedPath = entry.path;
          }
        }}
      >
        <span class="file-grid-icon">${this.getFileIcon(entry)}</span>
        <span class="file-grid-name">${entry.name}</span>
        ${entry.type !== "directory" ? html`
          <span class="file-grid-size">${this.formatSize(entry.size)}</span>
        ` : nothing}
      </div>
    `;
  }

  private getTotalSize(files: FileEntry[]): number {
    let total = 0;
    for (const f of files) {
      if (f.type === "file") total += f.size ?? 0;
      if (f.children) total += this.getTotalSize(f.children);
    }
    return total;
  }

  private getFileCount(files: FileEntry[]): number {
    let count = 0;
    for (const f of files) {
      if (f.type === "file") count++;
      if (f.children) count += this.getFileCount(f.children);
    }
    return count;
  }

  render() {
    const filtered = this.filterFiles(this.files);
    const totalSize = this.getTotalSize(this.files);
    const fileCount = this.getFileCount(this.files);
    const dirCount = this.files.filter(f => f.type === "directory").length;

    return html`
      <div class="fm-header">
        <span class="fm-title">📁 File Manager</span>
        <div class="fm-actions">
          <button class="fm-btn" @click=${() => this.showHidden = !this.showHidden}>
            ${this.showHidden ? "🙈 Hide Hidden" : "👁 Show Hidden"}
          </button>
          <button class="fm-btn fm-btn--primary" @click=${() => {
            this.dispatchEvent(new CustomEvent("download-all"));
          }}>
            📥 Download All
          </button>
        </div>
      </div>

      <div class="fm-search">
        <input
          type="text"
          placeholder="Search files..."
          .value=${this.searchQuery}
          @input=${(e: Event) => this.searchQuery = (e.target as HTMLInputElement).value}
        />
      </div>

      <div class="fm-sort">
        <label>Sort:</label>
        <select @change=${(e: Event) => this.sortBy = (e.target as HTMLSelectElement).value as any}>
          <option value="name" ?selected=${this.sortBy === "name"}>Name</option>
          <option value="date" ?selected=${this.sortBy === "date"}>Date Modified</option>
          <option value="size" ?selected=${this.sortBy === "size"}>Size</option>
          <option value="type" ?selected=${this.sortBy === "type"}>Type</option>
        </select>
        <span style="flex: 1"></span>
        <button class="fm-btn ${this.viewMode === 'tree' ? 'fm-btn--active' : ''}" @click=${() => this.viewMode = 'tree'}>🌳</button>
        <button class="fm-btn ${this.viewMode === 'grid' ? 'fm-btn--active' : ''}" @click=${() => this.viewMode = 'grid'}>⊞</button>
      </div>

      <div class="fm-body">
        ${filtered.length > 0 ? html`
          ${this.viewMode === 'tree' ? html`
            <ul class="file-tree">
              ${filtered.map(entry => this.renderTreeItem(entry))}
            </ul>
          ` : html`
            <div class="file-grid">
              ${filtered.map(entry => this.renderGridItem(entry))}
            </div>
          `}
        ` : html`
          <div class="empty-state">
            <div class="empty-icon">📁</div>
            <div class="empty-text">
              ${this.searchQuery ? "No files match your search." : "No files in workspace yet."}
            </div>
          </div>
        `}
      </div>

      <div class="fm-statusbar">
        <span class="fm-status">
          <strong>${fileCount}</strong> files, <strong>${dirCount}</strong> folders · ${this.formatSize(totalSize)}
        </span>
        <span class="fm-status">${this.rootLabel}</span>
      </div>
    `;
  }
}
