# CalendarTask for Visual Studio Code

将 [CalendarTask](https://www.xdiarys.com/) 日历任务管理网页应用无缝嵌入到 Visual Studio Code 中，无需离开编辑器即可管理日程和任务。

Seamlessly embed the [CalendarTask](https://www.xdiarys.com/) web app inside Visual Studio Code — manage your calendar and tasks without ever leaving your editor.

---

## Features / 功能

| Feature | Description |
|---------|-------------|
| **Sidebar panel** | CalendarTask appears in the Activity Bar as a dedicated sidebar view. |
| **Editor panel** | Open CalendarTask as a full-width editor tab via the Command Palette. |
| **Status bar shortcut** | A `$(calendar) CalendarTask` button in the status bar opens the panel with one click. |
| **Graceful fallback** | If the site cannot be framed (X-Frame-Options), an "Open in Browser" button is shown. |

---

## Installation / 安装

### Option A — Install the pre-built VSIX (recommended / 推荐)

1. Download the latest `.vsix` file from the [Releases](https://github.com/xdiarys/download-linux/releases) page.
2. In VS Code, open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and run:
   ```
   Extensions: Install from VSIX…
   ```
3. Select the downloaded `.vsix` file.
4. Reload VS Code when prompted.

### Option B — Build from source / 从源码构建

Requirements: Node.js ≥ 18 and npm.

```bash
# Clone the repository
git clone https://github.com/xdiarys/download-linux.git
cd download-linux/vscode-extension

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Package as VSIX (requires @vscode/vsce)
npm run package
```

Then install the generated `calendartask-vscode-*.vsix` file as described in Option A.

---

## Usage / 使用方法

### Open in sidebar / 侧边栏打开

Click the **calendar icon** (📅) in the Activity Bar on the left to toggle the CalendarTask sidebar.

### Open in editor / 编辑器面板打开

1. Open the Command Palette (`Ctrl+Shift+P`).
2. Type **CalendarTask: Open CalendarTask** and press `Enter`.

### Status bar / 状态栏

Click the **`$(calendar) CalendarTask`** button in the bottom-right status bar.

---

## Requirements / 系统要求

- Visual Studio Code **1.80.0** or newer
- An active internet connection (the extension loads the CalendarTask web app)

---

## Extension Settings

This extension does not contribute any configurable settings at this time.

---

## Known Issues / 已知问题

- If CalendarTask sets `X-Frame-Options: DENY` or a restrictive CSP, the embedded iframe will be replaced by a fallback "Open in Browser" button.  
  如果 CalendarTask 设置了 `X-Frame-Options: DENY`，嵌入视图将显示"在浏览器中打开"按钮作为备用方案。

---

## License

See the repository root for license information.
