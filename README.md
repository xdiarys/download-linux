# CalendarTask — Linux & VS Code Downloads

[CalendarTask](https://www.xdiarys.com/) 是一款功能强大的日历与任务管理软件，支持多平台同步、桌面透明挂件、倒计时、提醒等功能。

This repository provides:

| Asset | Description |
|-------|-------------|
| `calendartask_linux_x86.deb` | Native Linux desktop app (x86 / amd64) |
| `calendartask_linux_arm64.deb` | Native Linux desktop app (ARM 64-bit) |
| `vscode-extension/` | **VS Code extension** — embed the CalendarTask web app inside VS Code |

---

## VS Code Integration / 集成到 VS Code

> **Q: 你是网页版本的，怎么把你集成到 VS Code 里？**  
> **A:** 使用本仓库提供的 VS Code 扩展即可！

### Quick Start

```bash
cd vscode-extension
npm install
npm run compile
npm run package          # produces calendartask-vscode-*.vsix
```

Then in VS Code:

1. `Ctrl+Shift+P` → **Extensions: Install from VSIX…**
2. Select the generated `.vsix` file.
3. Click the 📅 calendar icon in the Activity Bar — done!

For full documentation see [`vscode-extension/README.md`](vscode-extension/README.md).

---

## Linux Desktop App / Linux 桌面客户端

### x86 / amd64

```bash
sudo dpkg -i calendartask_linux_x86.deb
```

### ARM 64-bit

```bash
sudo dpkg -i calendartask_linux_arm64.deb
```

---

## License

See [https://www.xdiarys.com/](https://www.xdiarys.com/) for terms of service.
