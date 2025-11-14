import * as vscode from 'vscode';

const SEEN_KEY = 'mockmate.onboarding.seen';

export async function maybeShowOnboarding(context: vscode.ExtensionContext): Promise<void> {
    const seen = context.globalState.get<boolean>(SEEN_KEY);
    if (seen) return;
    const panel = vscode.window.createWebviewPanel('mockmateOnboarding', 'Welcome to MockMate', vscode.ViewColumn.One, { enableScripts: true });
    panel.webview.html = getHtml();
    const sub = panel.webview.onDidReceiveMessage(async (msg) => {
        if (msg?.type === 'start') {
            await context.globalState.update(SEEN_KEY, true);
            panel.dispose();
            await vscode.commands.executeCommand('mockmate.startSimulation');
        }
    });
    panel.onDidDispose(() => sub.dispose());
}

function getHtml(): string {
    const styles = `body{font-family:var(--vscode-font-family);color:var(--vscode-foreground);background:var(--vscode-editor-background);margin:0}
    .wrap{max-width:820px;margin:0 auto;padding:16px}
    h1{font-size:18px;margin:8px 0}
    p{opacity:.9}
    footer{margin-top:16px}
    button{padding:6px 12px}`;
    const script = `const vscode = acquireVsCodeApi();
    document.getElementById('start').addEventListener('click',()=>vscode.postMessage({type:'start'}));`;
    return `<!doctype html><html><head><meta charset=\"utf-8\" />
    <meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';\" />
    <style>${styles}</style></head><body><div class=\"wrap\">\n    <h1>Welcome to MockMate</h1>\n    <p>MockMate simulates realistic technical interviews directly in VS Code with a company-tailored interviewer and a coding partner. You control the company, role, level, and task types.</p>\n    <p>Click Start to configure your first simulation using the guided wizard.</p>\n    <footer><button id=\"start\">Start</button></footer>\n    </div><script>${script}</script></body></html>`;
}
