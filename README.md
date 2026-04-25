<div align="center">

# ⚡ NeoClaw

### The Ultimate AI Assistant Platform

<p>
  <img src="https://img.shields.io/badge/version-1.0.0-FBBF24?style=for-the-badge&labelColor=0e1015" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-FBBF24?style=for-the-badge&labelColor=0e1015" alt="License">
  <img src="https://img.shields.io/badge/build-passing-2FBF71?style=for-the-badge&labelColor=0e1015" alt="Build">
  <img src="https://img.shields.io/badge/UI-Lit_3.x-FBBF24?style=for-the-badge&labelColor=0e1015" alt="Lit">
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&labelColor=0e1015" alt="TypeScript">
</p>

<p>
  <strong>A next-generation fork of OpenClaw with a revolutionary chat UI, smart home integration, and groundbreaking features that redefine what an AI assistant can do.</strong>
</p>

<p>
  <a href="#-features">Features</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-documentation">Documentation</a> •
  <a href="#-contributing">Contributing</a>
</p>

---

<img src="https://raw.githubusercontent.com/Atum246/NeoClaw/main/docs/preview.png" alt="NeoClaw Preview" width="100%">

</div>

## 🌟 What is NeoClaw?

NeoClaw is a **groundbreaking AI assistant platform** that combines the power of large language models with a revolutionary user interface, smart home control, and unprecedented levels of transparency into AI operations.

Built on top of the robust OpenClaw foundation, NeoClaw adds:

- 🎨 **A stunning modern chat UI** inspired by ChatGPT, Claude, DeepSeek, Grok, and Manus AI
- 🏠 **Full smart home control** — TV, lights, thermostat, cameras, locks, speakers, and more
- ⚡ **Live execution panel** — Watch the AI work in real-time, step by step
- 📦 **Artifact viewer** — Code, documents, and diagrams in a dedicated panel
- 🧠 **Memory visualizer** — See and edit what the AI remembers about you
- 📁 **File manager** — Browse and download everything the AI creates
- 🕐 **Task timeline** — Complete history of all AI actions
- 🟡 **Golden yellow theme** — A bold, distinctive identity
- ⌨️ **Power user shortcuts** — Ctrl+1 through Ctrl+6 for instant panel access

---

## ✨ Features

### 💬 Modern Chat Interface

| Feature | Description |
|---------|-------------|
| 🫧 Chat Bubbles | iMessage-style layout with user messages on right, AI on left |
| 🎭 Avatars | Customizable avatars for both user and assistant |
| ✨ Animations | Smooth message slide-in, typing indicators, status transitions |
| 💻 Code Blocks | Syntax highlighting, language labels, one-click copy |
| 📎 File Upload | Drag & drop files directly into the chat |
| 🔍 Search | Find any message across all conversations |
| 📌 Pin Messages | Bookmark important responses |
| 📤 Export | Download chats as Markdown or JSON |

### ⚡ Live Execution Panel (Manus AI Style)

Watch the AI work in real-time with a step-by-step execution panel:

```
┌─────────────────────────────────┐
│ ⚡ Execution    🟢 2 running    │
├─────────────────────────────────┤
│ ⟳ Building website...    3.2s  │
│   ✓ Analyzing request    0.5s  │
│   ✓ Creating files       1.1s  │
│   ⟳ Writing HTML...      1.6s  │
│   ⬜ Testing             --    │
│                                 │
│ 💻 Code Preview                 │
│ [Copy] [Download] [Expand]      │
└─────────────────────────────────┘
```

### 📦 Artifact Panel (Claude Style)

View generated code, documents, and diagrams in a dedicated panel:

- **3 view modes**: Preview, Code, Split
- **Tab interface** for multiple artifacts
- **Syntax highlighting** with line numbers
- **Font size controls** (A- / A+)
- **Version tracking** (v1, v2, v3...)
- **Copy & Save** buttons

### 🏠 Device Control Hub

Control your entire smart home from one place:

| Device | Controls |
|--------|----------|
| 📺 Smart TV | Power, Volume, Channel, Input |
| 🔊 Speakers | Play/Pause, Volume, Now Playing |
| 💡 Lights | Brightness, Color, On/Off |
| 🌡️ Thermostat | Temperature, Modes (Cool/Heat/Auto) |
| 📷 Cameras | Live View, Recording, Snapshots |
| 🔒 Locks | Lock/Unlock, Status |
| 💻 Computers | Screen Mirror, File Browse |
| 📱 Phones | Notifications, Ring |
| ⌚ Watches | Health Data, Notifications |
| 🚗 Cars | Status, Location |
| 📡 Routers | Restart, Connected Devices |

**Quick Scenes:**
- 🎬 Movie Night — Dim lights, TV on, speakers up
- 🌅 Good Morning — Lights on, thermostat up, news briefing
- 🌙 Goodnight — All lights off, doors locked, thermostat down
- 🏃 Away Mode — Security cameras on, lights random
- 🎉 Party Mode — Lights colorful, music on, ambiance set
- 🎯 Focus Mode — Minimal distractions, productivity setup

### 🧠 Memory Visualizer

See and manage what the AI remembers:

- **7 categories**: Facts, Preferences, Context, Decisions, People, Projects, Todos
- **Confidence indicators**: Visual dots showing certainty level (1-5)
- **Inline editing**: Click to edit any memory
- **Delete**: Remove memories you want forgotten
- **Search**: Find any memory instantly
- **Tags**: Organize memories with custom tags
- **Export**: Download all memories as JSON

### 📁 File Manager

Browse and download everything the AI creates:

- **Tree view** with expandable directories
- **Grid view** for visual browsing
- **Search** across all files
- **Sort** by name, date, size, or type
- **30+ file type icons** for instant recognition
- **Show/hidden files** toggle
- **📥 Download All** — Export entire workspace

### 🕐 Task Timeline

Visual history of everything the AI has done:

- **Chronological view** with status indicators
- **Type filters**: Messages, Tools, Files, Search, Code, Errors
- **Date grouping**: Today, Yesterday, specific dates
- **Compact/Detailed** toggle
- **Duration tracking** for each event
- **Export** timeline data

---

## 📦 Installation

### Prerequisites

- **Node.js** 18+ (recommended: 20+)
- **pnpm** (recommended) or npm
- **Git**

### Option 1: Install from Source

```bash
# Clone the repository
git clone https://github.com/Atum246/NeoClaw.git
cd NeoClaw

# Install dependencies
pnpm install

# Build the UI
cd ui
npm install
npx vite build
cd ..

# Start NeoClaw
node openclaw.mjs
```

### Option 2: Install via npm (Coming Soon)

```bash
npm install -g neoclaw
neoclaw start
```

### Option 3: Docker

```bash
docker pull atum246/neoclaw:latest
docker run -p 3000:3000 atum246/neoclaw
```

---

## 🚀 Quick Start

### 1. Start the Gateway

```bash
node openclaw.mjs gateway start
```

### 2. Open the Web UI

Navigate to `http://localhost:3000` in your browser.

### 3. Start Chatting!

Type your first message and watch NeoClaw work its magic! ✨

### 4. Explore the Panels

Use the toolbar buttons or keyboard shortcuts:

| Shortcut | Panel |
|----------|-------|
| `Ctrl+1` | ⚡ Execution |
| `Ctrl+2` | 📦 Artifacts |
| `Ctrl+3` | 📁 Files |
| `Ctrl+4` | 🧠 Memory |
| `Ctrl+5` | 🕐 Timeline |
| `Ctrl+6` | 🏠 Devices |

---

## 🎨 Theming

NeoClaw features a bold **golden yellow** theme by default, with full dark/light mode support.

### Color Palette

```css
/* Dark Mode */
--accent: #FBBF24;        /* Golden Yellow */
--accent-hover: #FCD34D;  /* Light Gold */
--accent-dim: #D97706;    /* Deep Gold */

/* Light Mode */
--accent: #D97706;        /* Amber */
--accent-hover: #F59E0B;  /* Bright Amber */
```

### Custom Themes

NeoClaw supports custom themes via CSS variables. Create your own:

```css
:root {
  --accent: #your-color;
  --accent-hover: #your-hover-color;
  /* ... more variables */
}
```

---

## 📁 Project Structure

```
NeoClaw/
├── src/
│   ├── cli/                    # CLI commands and banner
│   ├── terminal/               # Terminal colors and palette
│   ├── agents/                 # AI agent logic
│   ├── channels/               # Chat channel integrations
│   ├── config/                 # Configuration management
│   └── gateway/                # Gateway server
│
├── ui/
│   ├── src/
│   │   ├── styles/             # CSS themes and layouts
│   │   │   ├── base.css        # Color variables
│   │   │   ├── chat-redesign.css
│   │   │   └── layout-redesign.css
│   │   │
│   │   └── ui/
│   │       ├── components/     # Web components
│   │       │   ├── execution-panel.ts
│   │       │   ├── artifact-panel.ts
│   │       │   ├── file-manager.ts
│   │       │   ├── memory-visualizer.ts
│   │       │   ├── task-timeline.ts
│   │       │   └── device-control-hub.ts
│   │       │
│   │       ├── panel-render.ts # Panel tab system
│   │       ├── notifications.ts
│   │       └── export-utils.ts
│   │
│   └── dist/control-ui/        # Built UI assets
│
├── docs/                       # Documentation
├── skills/                     # AI skills/plugins
├── extensions/                 # Extensions
└── scripts/                    # Build scripts
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Open Command Palette |
| `Ctrl+1` | Toggle Execution Panel |
| `Ctrl+2` | Toggle Artifacts Panel |
| `Ctrl+3` | Toggle File Manager |
| `Ctrl+4` | Toggle Memory Panel |
| `Ctrl+5` | Toggle Timeline |
| `Ctrl+6` | Toggle Device Hub |
| `Ctrl+0` | Close Panel |
| `Escape` | Close Panel |
| `Enter` | Send Message |
| `Shift+Enter` | New Line |
| `Ctrl+F` | Search Messages |
| `↑/↓` | Navigate Input History |

---

## 🔧 Configuration

NeoClaw is configured via `openclaw.json`:

```json
{
  "gateway": {
    "port": 3000,
    "host": "localhost"
  },
  "ui": {
    "theme": "neoclaw",
    "themeMode": "dark",
    "chatFocusMode": false,
    "panelOpen": false,
    "panelTab": "execution"
  },
  "agents": {
    "main": {
      "model": "gpt-4",
      "thinking": "low"
    }
  }
}
```

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/NeoClaw.git
cd NeoClaw

# Install dependencies
pnpm install

# Start development mode
cd ui
npm run dev

# Run tests
npm test
```

---

## 📄 License

NeoClaw is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- **OpenClaw** — The foundation this project is built on
- **Lit** — Web components framework
- **ChatGPT, Claude, DeepSeek, Grok** — UI inspiration
- **Manus AI** — Execution panel inspiration
- **The Open Source Community** — For making this possible

---

## 📞 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/Atum246/NeoClaw/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/Atum246/NeoClaw/discussions)
- 📖 **Documentation**: [docs/](docs/)
- 💬 **Discord**: [Join our community](https://discord.gg/neoclaw)

---

<div align="center">

**Built with ⚡ and 🟡 by [Atum246](https://github.com/Atum246)**

<p>
  <img src="https://img.shields.io/github/stars/Atum246/NeoClaw?style=social" alt="Stars">
  <img src="https://img.shields.io/github/forks/Atum246/NeoClaw?style=social" alt="Forks">
  <img src="https://img.shields.io/github/watchers/Atum246/NeoClaw?style=social" alt="Watchers">
</p>

**⭐ Star this repo if you find it useful! ⭐**

</div>
