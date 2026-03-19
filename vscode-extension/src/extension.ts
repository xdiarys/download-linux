import * as vscode from 'vscode';

const CALENDARTASK_URL = 'https://www.xdiarys.com/';

export function activate(context: vscode.ExtensionContext): void {
    // Register the sidebar webview provider
    const sidebarProvider = new CalendarTaskSidebarProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('calendartask.sidebarView', sidebarProvider)
    );

    // Register the command to open CalendarTask in a full editor panel
    const openCommand = vscode.commands.registerCommand('calendartask.open', () => {
        CalendarTaskPanel.createOrShow(context.extensionUri);
    });
    context.subscriptions.push(openCommand);

    // Add a status bar item for quick access
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'calendartask.open';
    statusBarItem.text = '$(calendar) CalendarTask';
    statusBarItem.tooltip = 'Open CalendarTask';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
}

export function deactivate(): void {}

// ---------------------------------------------------------------------------
// Full-panel webview
// ---------------------------------------------------------------------------

class CalendarTaskPanel {
    public static currentPanel: CalendarTaskPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionUri: vscode.Uri): void {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (CalendarTaskPanel.currentPanel) {
            CalendarTaskPanel.currentPanel._panel.reveal(column);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'calendartask',
            'CalendarTask',
            column ?? vscode.ViewColumn.One,
            getWebviewOptions()
        );

        CalendarTaskPanel.currentPanel = new CalendarTaskPanel(panel);
    }

    private constructor(panel: vscode.WebviewPanel) {
        this._panel = panel;
        this._panel.webview.html = getWebviewContent(this._panel.webview);
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._panel.webview.onDidReceiveMessage(
            (message: { command: string; url?: string }) => {
                if (message.command === 'openExternal' && message.url) {
                    vscode.env.openExternal(vscode.Uri.parse(message.url));
                }
            },
            null,
            this._disposables
        );
    }

    public dispose(): void {
        CalendarTaskPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const d = this._disposables.pop();
            if (d) {
                d.dispose();
            }
        }
    }
}

// ---------------------------------------------------------------------------
// Sidebar webview provider
// ---------------------------------------------------------------------------

class CalendarTaskSidebarProvider implements vscode.WebviewViewProvider {
    constructor(private readonly _extensionUri: vscode.Uri) {}

    public resolveWebviewView(webviewView: vscode.WebviewView): void {
        webviewView.webview.options = getWebviewOptions();
        webviewView.webview.html = getWebviewContent(webviewView.webview);
        webviewView.webview.onDidReceiveMessage(
            (message: { command: string; url?: string }) => {
                if (message.command === 'openExternal' && message.url) {
                    vscode.env.openExternal(vscode.Uri.parse(message.url));
                }
            }
        );
    }
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function getWebviewOptions(): vscode.WebviewOptions {
    return {
        enableScripts: true,
        enableForms: true,
    };
}

function getWebviewContent(webview: vscode.Webview): string {
    // Build a nonce for the inline script
    const nonce = getNonce();

    return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!--
    Allow the CalendarTask website to be framed, allow inline styles/scripts
    with the nonce, and load images/fonts from any HTTPS source.
  -->
  <meta http-equiv="Content-Security-Policy"
        content="default-src 'none';
                 frame-src https://www.xdiarys.com;
                 script-src 'nonce-${nonce}';
                 style-src 'unsafe-inline';
                 img-src https: data:;">
  <title>CalendarTask</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: transparent;
    }
    #frame-container {
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
    }
    iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    #fallback {
      display: none;
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      font-family: var(--vscode-font-family, sans-serif);
      color: var(--vscode-foreground, #ccc);
      background: var(--vscode-editor-background, #1e1e1e);
      text-align: center;
      padding: 24px;
      box-sizing: border-box;
    }
    #fallback.visible { display: flex; }
    #fallback h2 { margin: 0; font-size: 1.2rem; }
    #fallback p  { margin: 0; font-size: 0.9rem; opacity: 0.75; max-width: 340px; }
    #open-btn {
      margin-top: 8px;
      padding: 8px 20px;
      border: none;
      border-radius: 4px;
      background: var(--vscode-button-background, #0e639c);
      color: var(--vscode-button-foreground, #fff);
      font-size: 0.95rem;
      cursor: pointer;
    }
    #open-btn:hover {
      background: var(--vscode-button-hoverBackground, #1177bb);
    }
  </style>
</head>
<body>
  <div id="frame-container">
    <iframe id="app-frame"
            src="${CALENDARTASK_URL}"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            allow="clipboard-read; clipboard-write">
    </iframe>
  </div>

  <div id="fallback">
    <h2>CalendarTask</h2>
    <p>
      The embedded view could not load — the site may have blocked framing.
      Click the button below to open CalendarTask in your default browser.
    </p>
    <button id="open-btn">Open in Browser</button>
  </div>

  <script nonce="${nonce}">
    (function () {
      const vscode = acquireVsCodeApi();
      const frame = document.getElementById('app-frame');
      const fallback = document.getElementById('fallback');
      const btn = document.getElementById('open-btn');

      // If the iframe fails to load (e.g. X-Frame-Options: DENY), show fallback
      frame.addEventListener('error', showFallback);

      // Heuristic: if the frame loads but the URL changed to about:blank due to
      // CSP / X-Frame-Options, switch to fallback after a short delay.
      frame.addEventListener('load', function () {
        try {
          // Same-origin check — will throw if cross-origin and blocked
          var href = frame.contentWindow && frame.contentWindow.location.href;
          if (!href || href === 'about:blank') {
            showFallback();
          }
        } catch (_) {
          // Cross-origin means the page did load — this is fine
        }
      });

      btn.addEventListener('click', function () {
        vscode.postMessage({ command: 'openExternal', url: '${CALENDARTASK_URL}' });
      });

      function showFallback() {
        document.getElementById('frame-container').style.display = 'none';
        fallback.classList.add('visible');
      }

      // Handle messages from the extension host
      window.addEventListener('message', function (event) {
        // Reserved for future use
      });
    }());
  </script>
</body>
</html>`;
}

function getNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
