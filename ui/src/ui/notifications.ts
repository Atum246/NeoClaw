/**
 * Notification System — Alert users when tasks complete
 * Browser notifications + in-app toast notifications
 */

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  silent?: boolean;
  onClick?: () => void;
}

class NotificationManager {
  private permission: NotificationPermission = "default";
  private toastContainer: HTMLElement | null = null;

  constructor() {
    if ("Notification" in window) {
      this.permission = Notification.permission;
    }
    this.createToastContainer();
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      console.warn("Browser notifications not supported");
      return "denied";
    }

    if (this.permission === "granted") {
      return "granted";
    }

    const result = await Notification.requestPermission();
    this.permission = result;
    return result;
  }

  async send(opts: NotificationOptions): Promise<void> {
    // Always show in-app toast
    this.showToast(opts);

    // Send browser notification if permitted
    if (this.permission === "granted") {
      try {
        const notification = new Notification(opts.title, {
          body: opts.body,
          icon: opts.icon ?? "/favicon.ico",
          tag: opts.tag,
          silent: opts.silent,
        });

        if (opts.onClick) {
          notification.onclick = () => {
            opts.onClick!();
            notification.close();
            window.focus();
          };
        }

        // Auto-close after 5 seconds
        setTimeout(() => notification.close(), 5000);
      } catch (err) {
        console.warn("Failed to send notification:", err);
      }
    }
  }

  private createToastContainer() {
    if (this.toastContainer) return;

    const container = document.createElement("div");
    container.id = "openclaw-toast-container";
    container.style.cssText = `
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 8px;
      pointer-events: none;
    `;
    document.body.appendChild(container);
    this.toastContainer = container;
  }

  private showToast(opts: NotificationOptions) {
    if (!this.toastContainer) {
      this.createToastContainer();
    }

    const toast = document.createElement("div");
    toast.style.cssText = `
      pointer-events: auto;
      background: var(--card, #161920);
      border: 1px solid var(--border, #1e2028);
      border-left: 3px solid var(--accent, #ff5c5c);
      border-radius: 10px;
      padding: 12px 16px;
      max-width: 360px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
      animation: toast-slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      cursor: pointer;
      transition: all 0.2s ease;
    `;

    toast.innerHTML = `
      <div style="font-size: 13px; font-weight: 600; color: var(--text-strong, #f4f4f5); margin-bottom: 4px;">
        ${this.escapeHtml(opts.title)}
      </div>
      <div style="font-size: 12px; color: var(--muted, #838387); line-height: 1.4;">
        ${this.escapeHtml(opts.body)}
      </div>
    `;

    // Add animation keyframes if not already added
    if (!document.getElementById("toast-animations")) {
      const style = document.createElement("style");
      style.id = "toast-animations";
      style.textContent = `
        @keyframes toast-slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes toast-slide-out {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    // Click handler
    if (opts.onClick) {
      toast.addEventListener("click", () => {
        opts.onClick!();
        this.removeToast(toast);
      });
    }

    // Hover effects
    toast.addEventListener("mouseenter", () => {
      toast.style.borderLeftColor = "var(--accent-hover, #ff7070)";
      toast.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.4)";
    });

    toast.addEventListener("mouseleave", () => {
      toast.style.borderLeftColor = "var(--accent, #ff5c5c)";
      toast.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.3)";
    });

    this.toastContainer!.appendChild(toast);

    // Auto-remove after 4 seconds
    setTimeout(() => this.removeToast(toast), 4000);
  }

  private removeToast(toast: HTMLElement) {
    toast.style.animation = "toast-slide-out 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards";
    setTimeout(() => toast.remove(), 300);
  }

  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Convenience methods for different notification types
  taskComplete(taskName: string, duration?: number) {
    const durationStr = duration ? ` (${this.formatDuration(duration)})` : "";
    this.send({
      title: "✅ Task Complete",
      body: `${taskName}${durationStr}`,
      tag: "task-complete",
    });
  }

  taskError(taskName: string, error?: string) {
    this.send({
      title: "❌ Task Failed",
      body: `${taskName}${error ? `: ${error}` : ""}`,
      tag: "task-error",
    });
  }

  fileReady(filename: string) {
    this.send({
      title: "📁 File Ready",
      body: `${filename} is ready to download`,
      tag: "file-ready",
    });
  }

  memoryUpdated(content: string) {
    this.send({
      title: "🧠 Memory Updated",
      body: content.slice(0, 100),
      tag: "memory-update",
      silent: true,
    });
  }

  private formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  }
}

// Singleton instance
export const notifications = new NotificationManager();
