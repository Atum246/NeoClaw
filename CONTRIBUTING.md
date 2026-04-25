# 🤝 Contributing to NeoClaw

Thank you for your interest in contributing to NeoClaw! This guide will help you get started.

---

## How to Contribute

### 1. Reporting Bugs

Found a bug? Please create an issue with:

- **Title**: Clear, concise description
- **Steps to reproduce**: What you did
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happened
- **Screenshots**: If applicable
- **Environment**: OS, Node.js version, browser

### 2. Suggesting Features

Have an idea? Create a discussion with:

- **Problem**: What problem does this solve?
- **Solution**: Your proposed solution
- **Alternatives**: Other solutions you considered
- **Context**: Additional information

### 3. Submitting Code

Ready to code? Follow these steps:

```bash
# 1. Fork the repository
# Click "Fork" on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR-USERNAME/NeoClaw.git
cd NeoClaw

# 3. Create a branch
git checkout -b feature/amazing-feature

# 4. Make your changes
# Edit files, add features, fix bugs

# 5. Test your changes
pnpm test
cd ui && npm test

# 6. Commit your changes
git add .
git commit -m "feat: Add amazing feature"

# 7. Push to your fork
git push origin feature/amazing-feature

# 8. Create a Pull Request
# Go to GitHub and create a PR
```

---

## Development Setup

### Prerequisites

- Node.js 20+
- pnpm 8+
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/Atum246/NeoClaw.git
cd NeoClaw

# Install dependencies
pnpm install

# Start development mode
cd ui
npm run dev

# In another terminal, start the gateway
node openclaw.mjs gateway start --dev
```

### Project Structure

```
NeoClaw/
├── src/                    # Backend source code
│   ├── cli/                # CLI commands
│   ├── terminal/           # Terminal colors
│   ├── agents/             # AI agent logic
│   └── gateway/            # Gateway server
│
├── ui/                     # Frontend source code
│   └── src/
│       ├── styles/         # CSS themes
│       └── ui/
│           ├── components/ # Web components
│           └── views/      # View renderers
│
├── docs/                   # Documentation
├── skills/                 # AI skills
├── extensions/             # Extensions
└── scripts/                # Build scripts
```

---

## Code Style

### TypeScript

- Use TypeScript for all new code
- Follow the existing code style
- Use meaningful variable names
- Add JSDoc comments for public APIs

### CSS

- Use CSS custom properties (variables)
- Follow BEM naming convention
- Keep styles modular and reusable
- Support dark and light themes

### Git Commits

Use conventional commits:

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Update dependencies
```

---

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run UI tests
cd ui && npm test

# Run specific test file
pnpm test -- path/to/test.ts

# Run with coverage
pnpm test --coverage
```

### Writing Tests

- Write tests for all new features
- Test both success and error cases
- Use descriptive test names
- Mock external dependencies

---

## Pull Request Guidelines

### Before Submitting

- [ ] Code follows the project style
- [ ] Tests pass locally
- [ ] Documentation is updated
- [ ] No lint errors
- [ ] Commit messages are clear

### PR Description

Include:

- **What**: What does this PR do?
- **Why**: Why is this change needed?
- **How**: How does it work?
- **Testing**: How was it tested?
- **Screenshots**: If UI changes

### Review Process

1. Automated checks run
2. Code review by maintainers
3. Feedback and iterations
4. Approval and merge

---

## Community

### Getting Help

- 💬 [Discord](https://discord.gg/neoclaw)
- 📖 [Documentation](docs/)
- 🐛 [Issues](https://github.com/Atum246/NeoClaw/issues)

### Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Follow the project guidelines

---

## Recognition

Contributors are recognized in:

- README.md contributors section
- Release notes
- Discord community
- GitHub contributors page

Thank you for making NeoClaw better! ⚡🟡
