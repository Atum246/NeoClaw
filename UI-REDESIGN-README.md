# OpenClaw Chat UI Redesign 🚀

A complete redesign of the OpenClaw webchat interface, inspired by the best AI chat apps (ChatGPT, Claude, DeepSeek, Grok, Manus AI, Perplexity, Gemini).

## ✨ What's New

### 🎬 Manus-Style Live Execution Panel
**File:** `ui/src/ui/components/execution-panel.ts`

Watch the AI work in real-time with a step-by-step execution panel:
- **Live progress indicators** with animated status dots
- **Step-by-step task breakdown** with timing information
- **Artifact previews** inline (code, documents, diagrams)
- **Copy/Download/Expand** buttons for generated content
- **Duration tracking** for each step and overall task

### 📦 Claude-Style Artifact Panel
**File:** `ui/src/ui/components/artifact-panel.ts`

A dedicated side panel for viewing generated content:
- **Multi-tab interface** — switch between artifacts
- **Preview/Code/Split view modes** — see content your way
- **Syntax-highlighted code** with line numbers
- **Markdown rendering** with full formatting support
- **Font size controls** for comfortable reading
- **Copy and Download** actions built-in
- **Version tracking** for each artifact

### 📁 File Manager
**File:** `ui/src/ui/components/file-manager.ts`

Browse and download everything OpenClaw creates:
- **Tree view** with expandable directories
- **Grid view** for visual browsing
- **Search** across all files
- **Sort by name, date, size, or type**
- **Show/hidden files toggle**
- **Download All** button to ZIP everything
- **File type icons** for 30+ file types
- **Size and date metadata**

### 🧠 Memory Visualizer
**File:** `ui/src/ui/components/memory-visualizer.ts`

See and manage what the AI remembers about you:
- **Category filtering** — facts, preferences, context, decisions, people, projects, todos
- **Search** across all memories
- **Confidence indicators** — visual dots showing certainty level
- **Inline editing** — update memories directly
- **Delete** memories you want forgotten
- **Tag support** for organization
- **Source tracking** — where each memory came from

### 🕐 Task Timeline
**File:** `ui/src/ui/components/task-timeline.ts`

Visual history of all AI tasks and sessions:
- **Chronological timeline** with status indicators
- **Type filtering** — messages, tool calls, file operations, searches, code, errors
- **Compact/Detailed** view modes
- **Date grouping** — Today, Yesterday, specific dates
- **Duration tracking** for each event
- **Export** timeline data

### 💬 Modern Chat UI
**File:** `ui/src/styles/chat-redesign.css`

ChatGPT/Claude-style chat bubbles:
- **iMessage-style layout** — user messages right, AI messages left
- **Avatar support** for both user and assistant
- **Smooth message animations** — slide-in effect
- **Code block headers** with language labels and copy buttons
- **Typing indicator** with bouncing dots
- **Hover actions** on messages
- **Modern input bar** with rounded corners and focus glow

### 🎨 Theme System
**File:** `ui/src/styles/layout-redesign.css`

Enhanced layout with theme support:
- **Dark/Light mode** toggle
- **Split-view layout** — chat + side panel
- **Panel tabs** — switch between Execution, Artifacts, Files, Memory, Timeline
- **Responsive design** — works on desktop, tablet, mobile
- **Smooth transitions** between views
- **Resizable panels** with drag divider

---

## 🏗️ Architecture

### Component Structure
```
ui/src/ui/components/
├── index.ts                    # Component exports
├── execution-panel.ts          # Manus-style live execution
├── artifact-panel.ts           # Claude-style artifacts
├── file-manager.ts             # Workspace file browser
├── memory-visualizer.ts        # AI memory management
└── task-timeline.ts            # Event history timeline

ui/src/styles/
├── chat-redesign.css           # Modern chat bubbles
└── layout-redesign.css         # Split-view shell layout
```

### Tech Stack
- **Lit 3.x** — Web components framework
- **TypeScript** — Type-safe development
- **CSS Custom Properties** — Theme system
- **CSS Animations** — Smooth transitions
- **Shadow DOM** — Component encapsulation

### Integration Points
Each component emits custom events for integration:
- `execution-panel` → `copy-artifact`, `download-artifact`, `expand-artifact`, `clear-tasks`
- `artifact-panel` → `close-artifact`, `download-artifact`
- `file-manager` → `download-all`
- `memory-visualizer` → `delete-memory`, `update-memory`, `export-memories`
- `task-timeline` → `export-timeline`

---

## 🎯 Feature Parity with Top AI Apps

| Feature | ChatGPT | Claude | DeepSeek | Grok | Perplexity | Gemini | **OpenClaw** |
|---------|---------|--------|----------|------|------------|--------|-------------|
| Chat Bubbles | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Dark/Light Mode | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Sidebar History | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Code Highlighting | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Typing Indicator | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| File Upload | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Artifacts Panel | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Live Execution | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| File Manager | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Memory Viz | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Task Timeline | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Voice Input | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Export Chats | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended)

### Build
```bash
cd ui
pnpm install
pnpm build
```

### Development
```bash
cd ui
pnpm dev
```

---

## 📝 Next Steps

### Phase 1 (Current) ✅
- [x] Execution Panel component
- [x] Artifact Panel component
- [x] File Manager component
- [x] Memory Visualizer component
- [x] Task Timeline component
- [x] Modern chat styles
- [x] Layout redesign CSS

### Phase 2 (Next)
- [ ] Integrate components into main app-render.ts
- [ ] Connect execution panel to real tool call data
- [ ] Connect artifact panel to canvas/code generation
- [ ] Connect file manager to workspace filesystem
- [ ] Connect memory visualizer to MEMORY.md
- [ ] Add keyboard shortcuts
- [ ] Add notification system

### Phase 3 (Future)
- [ ] Projects system (group related chats)
- [ ] Collections & Threads (Perplexity-style)
- [ ] Focus Modes (Web, Academic, Writing, Math)
- [ ] Source Citations with footnotes
- [ ] Plugin/Skill Marketplace UI
- [ ] Multi-language support
- [ ] Custom themes
- [ ] SSO/Auth integration

---

## 🎨 Design Principles

1. **Same Soul, Fresh Paint** — Keep OpenClaw's identity while modernizing the UX
2. **Show, Don't Tell** — Live execution panel shows the AI working
3. **Everything Accessible** — Download, export, and manage all generated content
4. **Responsive First** — Works beautifully on any device
5. **Performance Matters** — Smooth animations, fast transitions
6. **Keyboard Friendly** — Power users get shortcuts

---

Built with ❤️ for the OpenClaw community
