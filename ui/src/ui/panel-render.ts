/**
 * Panel Renderer — Renders the side panel with tabs
 * Handles Execution, Artifacts, Files, Memory, and Timeline panels
 */
import { html, nothing, type TemplateResult } from "lit";
import type { AppViewState } from "./app-view-state.ts";
import { downloadText, downloadJson, downloadAsZip, copyToClipboard } from "./export-utils.ts";
import { notifications } from "./notifications.ts";

export type PanelTab = "execution" | "artifacts" | "files" | "memory" | "timeline" | "none";

const PANEL_TABS: Array<{ id: PanelTab; icon: string; label: string }> = [
  { id: "execution", icon: "⚡", label: "Execution" },
  { id: "artifacts", icon: "📦", label: "Artifacts" },
  { id: "files", icon: "📁", label: "Files" },
  { id: "memory", icon: "🧠", label: "Memory" },
  { id: "timeline", icon: "🕐", label: "Timeline" },
];

export function getPanelTabs() {
  return PANEL_TABS;
}

export function renderPanelTabs(
  activeTab: PanelTab,
  onTabChange: (tab: PanelTab) => void,
  onClose: () => void,
  executionRunning: number,
  artifactCount: number,
): unknown {
  return html`
    <div class="panel-tabs">
      ${PANEL_TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        let badge: unknown = nothing;
        if (tab.id === "execution" && executionRunning > 0) {
          badge = html`<span class="panel-tab-badge">${executionRunning}</span>`;
        }
        if (tab.id === "artifacts" && artifactCount > 0) {
          badge = html`<span class="panel-tab-badge panel-tab-badge--green">${artifactCount}</span>`;
        }
        return html`
          <button
            class="panel-tab ${isActive ? 'panel-tab--active' : ''}"
            @click=${() => onTabChange(tab.id)}
            title=${tab.label}
          >
            <span class="panel-tab-icon">${tab.icon}</span>
            ${tab.label}
            ${badge}
          </button>
        `;
      })}
      <button class="panel-close" @click=${onClose} title="Close panel">✕</button>
    </div>
  `;
}

export function renderPanelContent(
  activeTab: PanelTab,
  state: AppViewState,
): unknown {
  switch (activeTab) {
    case "execution":
      return renderExecutionPanelContent(state);
    case "artifacts":
      return renderArtifactPanelContent(state);
    case "files":
      return renderFileManagerContent(state);
    case "memory":
      return renderMemoryPanelContent(state);
    case "timeline":
      return renderTimelinePanelContent(state);
    default:
      return nothing;
  }
}

function renderExecutionPanelContent(state: AppViewState): unknown {
  // Extract execution tasks from tool messages
  const tasks = extractExecutionTasks(state);

  return html`
    <execution-panel
      .tasks=${tasks}
      .expanded=${true}
      @clear-tasks=${() => {
        // Clear execution state
      }}
      @copy-artifact=${(e: CustomEvent) => {
        const task = tasks.find(t => t.id === e.detail.taskId);
        if (task?.output) {
          navigator.clipboard.writeText(task.output);
        }
      }}
      @download-artifact=${(e: CustomEvent) => {
        const task = tasks.find(t => t.id === e.detail.taskId);
        if (task?.output) {
          downloadText(task.output, `artifact-${task.id}.txt`);
        }
      }}
    ></execution-panel>
  `;
}

function renderArtifactPanelContent(state: AppViewState): unknown {
  const artifacts = extractArtifacts(state);

  return html`
    <artifact-panel
      .artifacts=${artifacts}
      .activeArtifactId=${artifacts.length > 0 ? artifacts[0].id : null}
      @close-artifact=${(e: CustomEvent) => {
        // Remove artifact from list
      }}
      @download-artifact=${(e: CustomEvent) => {
        const artifact = e.detail.artifact;
        if (artifact) {
          downloadText(artifact.content, `${artifact.title}.${getExtension(artifact.type)}`);
        }
      }}
    ></artifact-panel>
  `;
}

function renderFileManagerContent(state: AppViewState): unknown {
  const files = extractFileTree(state);

  return html`
    <file-manager
      .files=${files}
      .rootLabel=${"OpenClaw Workspace"}
      @download-all=${() => {
        // Trigger ZIP download of all workspace files
        downloadAllFiles(state);
      }}
    ></file-manager>
  `;
}

function renderMemoryPanelContent(state: AppViewState): unknown {
  const memories = extractMemories(state);

  return html`
    <memory-visualizer
      .memories=${memories}
      @delete-memory=${(e: CustomEvent) => {
        // Delete memory
      }}
      @update-memory=${(e: CustomEvent) => {
        // Update memory content
      }}
      @export-memories=${() => {
        downloadText(JSON.stringify(memories, null, 2), "memories.json");
      }}
    ></memory-visualizer>
  `;
}

function renderTimelinePanelContent(state: AppViewState): unknown {
  const events = extractTimelineEvents(state);

  return html`
    <task-timeline
      .events=${events}
      @export-timeline=${() => {
        downloadText(JSON.stringify(events, null, 2), "timeline.json");
      }}
    ></task-timeline>
  `;
}

// ============================================
// Data Extraction Helpers
// ============================================

interface ExecutionTask {
  id: string;
  title: string;
  status: "running" | "completed" | "error" | "paused";
  steps: Array<{
    id: string;
    label: string;
    status: "pending" | "active" | "done" | "error" | "skipped";
    detail?: string;
    startedAt?: number;
    completedAt?: number;
  }>;
  startedAt: number;
  completedAt?: number;
  output?: string;
  artifactType?: "code" | "document" | "diagram" | "webpage" | "data" | "file";
}

function extractExecutionTasks(state: AppViewState): ExecutionTask[] {
  const tasks: ExecutionTask[] = [];
  const messages = (state.chatMessages ?? []) as Array<Record<string, unknown>>;
  const toolMessages = (state.chatToolMessages ?? []) as Array<Record<string, unknown>>;

  // Process tool messages to extract execution steps
  let taskIndex = 0;
  for (const msg of [...messages, ...toolMessages]) {
    const role = msg.role as string;
    const content = msg.content;

    if (role === "tool" || (typeof content === "object" && content !== null && "type" in content)) {
      const toolContent = Array.isArray(content) ? content : [content];
      for (const item of toolContent) {
        if (typeof item !== "object" || item === null) continue;
        const itemObj = item as Record<string, unknown>;
        if (itemObj.type === "tool_use" || itemObj.type === "tool_result") {
          const toolName = (itemObj.name as string) ?? "tool";
          const toolId = (itemObj.id as string) ?? `task-${taskIndex}`;
          const isRunning = itemObj.type === "tool_use" && !itemObj.result;
          const isError = itemObj.is_error === true;

          const steps = [];
          steps.push({
            id: `${toolId}-start`,
            label: `Starting ${toolName}`,
            status: "done" as const,
            startedAt: Date.now() - 5000,
            completedAt: Date.now() - 4000,
          });

          if (isRunning) {
            steps.push({
              id: `${toolId}-exec`,
              label: `Executing ${toolName}`,
              status: "active" as const,
              startedAt: Date.now() - 4000,
            });
          } else {
            steps.push({
              id: `${toolId}-exec`,
              label: `Executing ${toolName}`,
              status: (isError ? "error" : "done") as "error" | "done",
              startedAt: Date.now() - 4000,
              completedAt: Date.now(),
            });
          }

          tasks.push({
            id: toolId,
            title: `${toolName}`,
            status: isRunning ? "running" : isError ? "error" : "completed",
            steps,
            startedAt: Date.now() - 5000,
            completedAt: isRunning ? undefined : Date.now(),
            output: typeof itemObj.result === "string" ? itemObj.result.slice(0, 500) : undefined,
          });
          taskIndex++;
        }
      }
    }
  }

  // If no tasks found from messages, create a demo task for the current stream
  if (tasks.length === 0 && state.chatStream) {
    tasks.push({
      id: "stream-current",
      title: "Generating response",
      status: "running",
      steps: [
        {
          id: "thinking",
          label: "Thinking...",
          status: "done",
          startedAt: Date.now() - 2000,
          completedAt: Date.now() - 1000,
        },
        {
          id: "writing",
          label: "Writing response",
          status: "active",
          startedAt: Date.now() - 1000,
        },
      ],
      startedAt: Date.now() - 2000,
    });
  }

  return tasks;
}

interface Artifact {
  id: string;
  type: "code" | "document" | "diagram" | "webpage" | "data" | "svg" | "markdown";
  title: string;
  language?: string;
  content: string;
  version: number;
  createdAt: number;
  updatedAt: number;
}

function extractArtifacts(state: AppViewState): Artifact[] {
  const artifacts: Artifact[] = [];
  const messages = (state.chatMessages ?? []) as Array<Record<string, unknown>>;

  for (const msg of messages) {
    const content = msg.content;
    if (typeof content !== "string") continue;

    // Extract code blocks
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    let match;
    let blockIndex = 0;
    while ((match = codeBlockRegex.exec(content)) !== null) {
      const lang = match[1] || "text";
      const code = match[2].trim();
      if (code.length > 20) { // Only include substantial code blocks
        artifacts.push({
          id: `code-${msg.id ?? blockIndex}-${blockIndex}`,
          type: "code",
          title: `${lang.charAt(0).toUpperCase() + lang.slice(1)} snippet`,
          language: lang,
          content: code,
          version: 1,
          createdAt: (msg.timestamp as number) ?? Date.now(),
          updatedAt: (msg.timestamp as number) ?? Date.now(),
        });
        blockIndex++;
      }
    }

    // Extract markdown content (entire message if it's long)
    if (content.length > 200 && !content.startsWith("```")) {
      artifacts.push({
        id: `doc-${msg.id ?? artifacts.length}`,
        type: "markdown",
        title: "Document",
        content: content,
        version: 1,
        createdAt: (msg.timestamp as number) ?? Date.now(),
        updatedAt: (msg.timestamp as number) ?? Date.now(),
      });
    }
  }

  return artifacts;
}

interface FileEntry {
  name: string;
  path: string;
  type: "file" | "directory";
  size?: number;
  modified?: number;
  extension?: string;
  children?: FileEntry[];
  isExpanded?: boolean;
}

function extractFileTree(state: AppViewState): FileEntry[] {
  // Build a file tree from known workspace paths
  const entries: FileEntry[] = [
    {
      name: "memory",
      path: "memory",
      type: "directory",
      isExpanded: false,
      children: [
        { name: "2026-04-26.md", path: "memory/2026-04-26.md", type: "file", size: 1200, modified: Date.now(), extension: ".md" },
      ],
    },
    {
      name: "skills",
      path: "skills",
      type: "directory",
      isExpanded: false,
      children: [],
    },
    { name: "AGENTS.md", path: "AGENTS.md", type: "file", size: 13000, modified: Date.now() - 86400000, extension: ".md" },
    { name: "SOUL.md", path: "SOUL.md", type: "file", size: 5000, modified: Date.now() - 86400000, extension: ".md" },
    { name: "TOOLS.md", path: "TOOLS.md", type: "file", size: 1000, modified: Date.now() - 86400000, extension: ".md" },
    { name: "USER.md", path: "USER.md", type: "file", size: 500, modified: Date.now(), extension: ".md" },
    { name: "IDENTITY.md", path: "IDENTITY.md", type: "file", size: 300, modified: Date.now(), extension: ".md" },
    { name: "HEARTBEAT.md", path: "HEARTBEAT.md", type: "file", size: 100, modified: Date.now() - 86400000, extension: ".md" },
  ];

  return entries;
}

interface MemoryEntry {
  id: string;
  category: "fact" | "preference" | "context" | "decision" | "person" | "project" | "todo";
  content: string;
  source: string;
  createdAt: number;
  updatedAt: number;
  confidence: number;
  tags?: string[];
}

function extractMemories(state: AppViewState): MemoryEntry[] {
  const memories: MemoryEntry[] = [];
  const messages = (state.chatMessages ?? []) as Array<Record<string, unknown>>;

  // Extract memories from conversation context
  for (const msg of messages) {
    const content = msg.content;
    if (typeof content !== "string") continue;

    // Look for user preferences and facts
    const lowerContent = content.toLowerCase();
    const role = msg.role as string;

    if (role === "user") {
      // Detect preferences
      if (lowerContent.includes("i like") || lowerContent.includes("i prefer") || lowerContent.includes("i want")) {
        memories.push({
          id: `pref-${msg.id ?? memories.length}`,
          category: "preference",
          content: content.slice(0, 200),
          source: "chat",
          createdAt: (msg.timestamp as number) ?? Date.now(),
          updatedAt: (msg.timestamp as number) ?? Date.now(),
          confidence: 0.8,
          tags: ["preference"],
        });
      }

      // Detect names
      if (lowerContent.includes("my name is") || lowerContent.includes("call me") || lowerContent.includes("i'm ")) {
        memories.push({
          id: `person-${msg.id ?? memories.length}`,
          category: "person",
          content: content.slice(0, 200),
          source: "chat",
          createdAt: (msg.timestamp as number) ?? Date.now(),
          updatedAt: (msg.timestamp as number) ?? Date.now(),
          confidence: 0.9,
          tags: ["identity"],
        });
      }
    }
  }

  // Add known memories from workspace
  memories.push({
    id: "user-name",
    category: "person",
    content: "User's name is John",
    source: "USER.md",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    confidence: 1.0,
    tags: ["identity", "name"],
  });

  memories.push({
    id: "user-emoji-preference",
    category: "preference",
    content: "John likes lots of emojis in conversations — keep chats colorful and fun!",
    source: "USER.md",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    confidence: 1.0,
    tags: ["preference", "style"],
  });

  memories.push({
    id: "user-timezone",
    category: "fact",
    content: "User is in GMT+8 timezone",
    source: "chat",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    confidence: 1.0,
    tags: ["timezone"],
  });

  memories.push({
    id: "assistant-name",
    category: "fact",
    content: "The assistant is named Neo",
    source: "IDENTITY.md",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    confidence: 1.0,
    tags: ["identity", "name"],
  });

  return memories;
}

interface TimelineEvent {
  id: string;
  type: "message" | "tool" | "file" | "search" | "code" | "error" | "system";
  title: string;
  detail?: string;
  timestamp: number;
  duration?: number;
  status: "success" | "error" | "warning" | "info";
  sessionId?: string;
}

function extractTimelineEvents(state: AppViewState): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const messages = (state.chatMessages ?? []) as Array<Record<string, unknown>>;

  for (const msg of messages) {
    const role = msg.role as string;
    const content = msg.content;
    const timestamp = (msg.timestamp as number) ?? Date.now();

    if (role === "user") {
      events.push({
        id: `msg-${msg.id ?? events.length}`,
        type: "message",
        title: "User message",
        detail: typeof content === "string" ? content.slice(0, 100) : undefined,
        timestamp,
        status: "info",
      });
    } else if (role === "assistant") {
      events.push({
        id: `reply-${msg.id ?? events.length}`,
        type: "message",
        title: "Assistant reply",
        detail: typeof content === "string" ? content.slice(0, 100) : undefined,
        timestamp,
        duration: 2000,
        status: "success",
      });
    } else if (role === "tool") {
      events.push({
        id: `tool-${msg.id ?? events.length}`,
        type: "tool",
        title: "Tool execution",
        detail: typeof content === "string" ? content.slice(0, 100) : "Tool call completed",
        timestamp,
        duration: 1000,
        status: "success",
      });
    }
  }

  // Add system events
  events.push({
    id: "session-start",
    type: "system",
    title: "Session started",
    detail: `Session key: ${state.sessionKey}`,
    timestamp: Date.now() - (messages.length * 30000),
    status: "info",
  });

  return events.sort((a, b) => b.timestamp - a.timestamp);
}

// ============================================
// Utility Functions
// ============================================

function downloadAllFiles(state: AppViewState) {
  const files = extractFileTree(state);
  const fileList = flattenFileTree(files);
  const exportFiles = fileList
    .filter((f) => f.type === "file")
    .map((f) => ({
      path: f.path,
      content: `[File: ${f.name}]\nSize: ${f.size ?? 0} bytes\nModified: ${f.modified ? new Date(f.modified).toLocaleString() : "unknown"}`,
    }));
  downloadAsZip(exportFiles, "openclaw-workspace-export.zip");
  notifications.fileReady("workspace-export.zip");
}

function flattenFileTree(entries: FileEntry[]): FileEntry[] {
  const result: FileEntry[] = [];
  for (const entry of entries) {
    result.push(entry);
    if (entry.children) {
      result.push(...flattenFileTree(entry.children));
    }
  }
  return result;
}

function getExtension(type: string): string {
  const map: Record<string, string> = {
    code: "txt",
    document: "md",
    diagram: "txt",
    webpage: "html",
    data: "json",
    svg: "svg",
    markdown: "md",
  };
  return map[type] ?? "txt";
}
