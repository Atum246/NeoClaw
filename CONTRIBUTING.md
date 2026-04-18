# 🤝 Contributing to NeoClaw

Thanks for wanting to help! Here's how:

## 🐛 Bug Reports

Open an issue with:
- Platform (HF Spaces, Railway, etc.)
- Steps to reproduce
- Expected vs actual behavior
- Logs if possible

## ✨ Feature Requests

Open an issue describing:
- What you want
- Why it's useful
- How it should work

## 🔧 Pull Requests

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/amazing`
3. Make your changes
4. Test locally with Docker
5. Commit: `git commit -m "Add amazing feature"`
6. Push: `git push origin feature/amazing`
7. Open a PR

## 📝 Code Style

- Bash scripts: use `shellcheck`
- Python: follow PEP 8
- JavaScript: use semicolons, 2-space indent

## 🧪 Testing

Before submitting:
```bash
# Build and test Docker image
docker build -t neoclaw-test .
docker run --rm neoclaw-test bash -c "echo 'Build OK'"

# Test health endpoint
curl http://localhost:7862/health
```

## 💬 Questions?

Open a discussion or reach out!
