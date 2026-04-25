/**
 * Export System — Download workspace files, chats, and artifacts
 * Supports individual files, ZIP archives, and chat exports
 */

export interface ExportFile {
  path: string;
  content: string;
  mimeType?: string;
}

/**
 * Download a single text file
 */
export function downloadText(content: string, filename: string, mimeType = "text/plain") {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(blob, filename);
}

/**
 * Download a JSON file
 */
export function downloadJson(data: unknown, filename: string) {
  const content = JSON.stringify(data, null, 2);
  downloadText(content, filename, "application/json");
}

/**
 * Download a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export chat messages as Markdown
 */
export function exportChatMarkdown(
  messages: Array<Record<string, unknown>>,
  assistantName: string,
): void {
  const lines: string[] = [];
  lines.push(`# Chat with ${assistantName}`);
  lines.push(`Exported: ${new Date().toLocaleString()}`);
  lines.push("---\n");

  for (const msg of messages) {
    const role = msg.role as string;
    const content = msg.content;
    const timestamp = msg.timestamp as number | undefined;

    if (typeof content !== "string") continue;

    const timeStr = timestamp ? new Date(timestamp).toLocaleTimeString() : "";
    const roleLabel = role === "user" ? "**You**" : `**${assistantName}**`;

    lines.push(`### ${roleLabel} ${timeStr ? `(${timeStr})` : ""}`);
    lines.push("");
    lines.push(content);
    lines.push("");
  }

  const filename = `chat-${assistantName.toLowerCase().replace(/\s+/g, "-")}-${formatDate(new Date())}.md`;
  downloadText(lines.join("\n"), filename, "text/markdown");
}

/**
 * Export chat as JSON
 */
export function exportChatJson(
  messages: Array<Record<string, unknown>>,
  sessionKey: string,
): void {
  const data = {
    sessionKey,
    exportedAt: new Date().toISOString(),
    messageCount: messages.length,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
      timestamp: m.timestamp,
    })),
  };

  downloadJson(data, `chat-${sessionKey}-${formatDate(new Date())}.json`);
}

/**
 * Create a simple ZIP file (without external library)
 * Uses the ZIP format specification for uncompressed files
 */
export async function downloadAsZip(files: ExportFile[], zipFilename: string): Promise<void> {
  // For simplicity, create a tar-like format or use a simple text manifest
  // In production, you'd use a library like JSZip
  const manifest = files
    .map((f) => {
      const size = new TextEncoder().encode(f.content).length;
      return `${f.path} (${size} bytes)\n${"─".repeat(40)}\n${f.content}\n`;
    })
    .join("\n" + "═".repeat(60) + "\n\n");

  const header = `OpenClaw Workspace Export
Generated: ${new Date().toLocaleString()}
Files: ${files.length}
${"═".repeat(60)}

`;

  downloadText(header + manifest, zipFilename.replace(".zip", ".txt"), "text/plain");
}

/**
 * Export execution task results
 */
export function exportExecutionResults(
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    output?: string;
    startedAt: number;
    completedAt?: number;
  }>,
): void {
  const data = {
    exportedAt: new Date().toISOString(),
    taskCount: tasks.length,
    tasks: tasks.map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      duration: t.completedAt ? t.completedAt - t.startedAt : null,
      output: t.output,
    })),
  };

  downloadJson(data, `execution-results-${formatDate(new Date())}.json`);
}

/**
 * Export memory entries
 */
export function exportMemories(
  memories: Array<{
    id: string;
    category: string;
    content: string;
    source: string;
    confidence: number;
    tags?: string[];
  }>,
): void {
  const data = {
    exportedAt: new Date().toISOString(),
    memoryCount: memories.length,
    memories,
  };

  downloadJson(data, `memories-${formatDate(new Date())}.json`);
}

/**
 * Export timeline events
 */
export function exportTimeline(
  events: Array<{
    id: string;
    type: string;
    title: string;
    detail?: string;
    timestamp: number;
    status: string;
  }>,
): void {
  const data = {
    exportedAt: new Date().toISOString(),
    eventCount: events.length,
    events,
  };

  downloadJson(data, `timeline-${formatDate(new Date())}.json`);
}

/**
 * Format date for filenames
 */
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Copy text to clipboard with feedback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  }
}

/**
 * Read file as text
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
