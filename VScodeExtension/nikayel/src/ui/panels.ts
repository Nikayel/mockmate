import * as vscode from 'vscode';

let interviewerPanel: vscode.WebviewPanel | undefined;
let codingPartnerPanel: vscode.WebviewPanel | undefined;
let codingPartnerView: vscode.WebviewView | undefined;
let interviewerMessageHandler: ((text: string) => void) | undefined;
let codingPartnerMessageHandler: ((text: string) => void) | undefined;

export async function ensurePanels(context: vscode.ExtensionContext): Promise<void> {
    await showInterviewerPanel(context);
    await showCodingPartnerPanel(context);
}

export async function showInterviewerPanel(context: vscode.ExtensionContext): Promise<void> {
    if (interviewerPanel) {
        interviewerPanel.reveal();
        return;
    }
    interviewerPanel = vscode.window.createWebviewPanel(
        'mockmateInterviewer',
        'MockMate: Interviewer',
        { viewColumn: vscode.ViewColumn.Two, preserveFocus: true },
        { enableScripts: true }
    );
    interviewerPanel.onDidDispose(() => { interviewerPanel = undefined; }, undefined, context.subscriptions);
    interviewerPanel.webview.html = getChatHtml('Interviewer');
    interviewerPanel.webview.onDidReceiveMessage((msg) => {
        if (msg?.type === 'userMessage' && typeof msg.text === 'string') {
            interviewerMessageHandler?.(msg.text);
        }
    }, undefined, context.subscriptions);
}

export async function showCodingPartnerPanel(context: vscode.ExtensionContext): Promise<void> {
    // Focus contributed Panel view if available; fallback to ad-hoc panel once
    if (codingPartnerView) {
        await vscode.commands.executeCommand('mockmate.codingPartnerView.focus');
        return;
    }
    if (codingPartnerPanel) {
        codingPartnerPanel.reveal();
        return;
    }
    codingPartnerPanel = vscode.window.createWebviewPanel('mockmateCodingPartner', 'MockMate: Coding Partner', { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true }, { enableScripts: true });
    codingPartnerPanel.onDidDispose(() => { codingPartnerPanel = undefined; }, undefined, context.subscriptions);
    codingPartnerPanel.webview.html = getChatHtml('Coding Partner');
    codingPartnerPanel.webview.onDidReceiveMessage((msg) => {
        if (msg?.type === 'userMessage' && typeof msg.text === 'string') {
            codingPartnerMessageHandler?.(msg.text);
        }
    }, undefined, context.subscriptions);
}

function getChatHtml(title: string): string {
    const styles = `
    body { font-family: var(--vscode-font-family); color: var(--vscode-foreground); background: var(--vscode-editor-background); margin: 0; }
    header { padding: 8px 12px; border-bottom: 1px solid var(--vscode-editorWidget-border); font-weight: 600; }
    .container { display: flex; flex-direction: column; height: 100vh; }
    .messages { flex: 1; overflow-y: auto; padding: 12px; }
    .input { display: flex; gap: 8px; padding: 12px; border-top: 1px solid var(--vscode-editorWidget-border); }
    textarea { flex: 1; resize: vertical; min-height: 48px; }
    button { padding: 6px 12px; }
    `;
    const script = `
    const vscode = acquireVsCodeApi();
    const form = document.getElementById('form');
    const textarea = document.getElementById('text');
    const messages = document.getElementById('messages');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = textarea.value.trim();
        if (!text) return;
        vscode.postMessage({ type: 'userMessage', text });
        addMessage('user', text);
        textarea.value = '';
    });
    window.addEventListener('message', (event) => {
        const { type, text } = event.data;
        if (type === 'assistantMessage') {
            addMessage('assistant', text);
        }
    });
    function addMessage(role, text) {
        const el = document.createElement('div');
        el.className = 'msg ' + role;
        el.textContent = text;
        messages.appendChild(el);
        messages.scrollTop = messages.scrollHeight;
    }
    `;
    return `<!DOCTYPE html>
    <html><head><meta charset="UTF-8" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' 'self'; script-src 'unsafe-inline' 'self'; img-src data:;" />
    <style>${styles}</style></head>
    <body>
      <div class="container">
        <header>${title}</header>
        <div id="messages" class="messages"></div>
        <form id="form" class="input">
            <textarea id="text" placeholder="Type a message..."></textarea>
            <button type="submit">Send</button>
        </form>
      </div>
      <script>${script}</script>
    </body></html>`;
}

export function postToInterviewer(text: string): void {
    interviewerPanel?.webview.postMessage({ type: 'assistantMessage', text });
}

export function postToCodingPartner(text: string): void {
    if (codingPartnerView) {
        codingPartnerView.webview.postMessage({ type: 'assistantMessage', text });
    } else {
        codingPartnerPanel?.webview.postMessage({ type: 'assistantMessage', text });
    }
}

export function setInterviewerMessageHandler(handler: (text: string) => void): void {
    interviewerMessageHandler = handler;
}

export function setCodingPartnerMessageHandler(handler: (text: string) => void): void {
    codingPartnerMessageHandler = handler;
}

export function registerCodingPartnerView(context: vscode.ExtensionContext): void {
    context.subscriptions.push(vscode.window.registerWebviewViewProvider('mockmate.codingPartnerView', {
        resolveWebviewView(view: vscode.WebviewView) {
            codingPartnerView = view;
            view.webview.options = { enableScripts: true };
            view.webview.html = getChatHtml('Coding Partner');
            view.webview.onDidReceiveMessage((msg) => {
                if (msg?.type === 'userMessage' && typeof msg.text === 'string') {
                    codingPartnerMessageHandler?.(msg.text);
                }
            }, undefined, context.subscriptions);
            view.onDidDispose(() => { codingPartnerView = undefined; });
        }
    }));
}


