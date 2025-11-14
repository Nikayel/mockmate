import * as vscode from 'vscode';

export async function showPricing(): Promise<void> {
    const cfg = vscode.workspace.getConfiguration('mockmate');
    const free = cfg.get<number>('freeMonthlyLimit') ?? 3;
    const pro = cfg.get<number>('proMonthlyLimit') ?? 30;
    const panel = vscode.window.createWebviewPanel('mockmatePricing', 'MockMate: Pricing & Limits', vscode.ViewColumn.One, { enableScripts: true });
    const styles = `body{font-family:var(--vscode-font-family);color:var(--vscode-foreground);background:var(--vscode-editor-background);padding:16px}`;
    const script = `const vscode = acquireVsCodeApi();
    document.getElementById('upgrade').addEventListener('click',()=>vscode.postMessage({type:'upgrade'}));`;
    panel.webview.onDidReceiveMessage(async (msg) => {
        if (msg?.type === 'upgrade') {
            await vscode.commands.executeCommand('vscode.open', vscode.Uri.parse('https://your-site.example.com/upgrade'));
        }
    });
    panel.webview.html = `<!doctype html><html><head><style>${styles}</style></head><body>
    <h2>Pricing & Limits</h2>
    <p><b>Free</b>: up to ${free} simulations per month. Uses cost-optimized models and smaller token budgets.</p>
    <p><b>Pro</b>: up to ${pro} simulations per month. Unlocks higher-quality models, larger budgets, and priority routing.</p>
    <p>All LLM calls are routed via our secure edge functions with cost-aware policies.</p>
    <p><button id="upgrade">Upgrade to Pro</button></p>
    <script>${script}</script></body></html>`;
}
