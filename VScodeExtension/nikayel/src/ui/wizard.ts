import * as vscode from 'vscode';

export type WizardResult = {
    company: string;
    role: string;
    level: 'intern' | 'junior' | 'mid' | 'senior' | 'staff' | 'principal';
    taskTypes: Array<'bugfix' | 'optimization' | 'security' | 'prompt-engineering'>;
};

export async function showStartWizard(context: vscode.ExtensionContext): Promise<WizardResult | undefined> {
    const panel = vscode.window.createWebviewPanel('mockmateWizard', 'MockMate: Start Wizard', vscode.ViewColumn.One, { enableScripts: true });
    panel.webview.html = getHtml();

    return await new Promise<WizardResult | undefined>((resolve) => {
        const sub = panel.webview.onDidReceiveMessage((msg) => {
            if (msg?.type === 'submit') {
                const { company, role, level, taskTypes } = msg.payload || {};
                resolve({ company, role, level, taskTypes });
                sub.dispose();
                panel.dispose();
            }
            if (msg?.type === 'cancel') {
                resolve(undefined);
                sub.dispose();
                panel.dispose();
            }
        });
    });
}

function getHtml(): string {
    const styles = `body{font-family:var(--vscode-font-family);color:var(--vscode-foreground);background:var(--vscode-editor-background);margin:0;padding:0}
    .wrap{max-width:820px;margin:0 auto;padding:16px}
    h1{font-size:18px;margin:8px 0}
    .row{display:flex;gap:8px;margin:8px 0}
    input,select,button{padding:6px 8px}
    .tasks{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
    .card{border:1px solid var(--vscode-editorWidget-border);padding:8px;border-radius:6px;cursor:pointer}
    .card.selected{outline:2px solid var(--vscode-focusBorder)}
    footer{display:flex;gap:8px;justify-content:flex-end;margin-top:16px}
    `;
    const script = `const vscode = acquireVsCodeApi();
    const company = document.getElementById('company');
    const role = document.getElementById('role');
    const level = document.getElementById('level');
    const tasks = Array.from(document.querySelectorAll('.task'));
    tasks.forEach(t=>t.addEventListener('click',()=>t.classList.toggle('selected')));
    document.getElementById('google').addEventListener('click',()=>company.value='Google');
    document.getElementById('netflix').addEventListener('click',()=>company.value='Netflix');
    document.getElementById('startup').addEventListener('click',()=>company.value='Startup');
    document.getElementById('meta').addEventListener('click',()=>company.value='Meta');
    document.getElementById('submit').addEventListener('click',()=>{
        const taskTypes = tasks.filter(t=>t.classList.contains('selected')).map(t=>t.dataset.key);
        vscode.postMessage({type:'submit',payload:{company:company.value.trim(),role:role.value.trim(),level:level.value,taskTypes}});
    });
    document.getElementById('cancel').addEventListener('click',()=>vscode.postMessage({type:'cancel'}));`;
    const html = `<!doctype html><html><head><meta charset="utf-8" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';" />
    <style>${styles}</style></head><body><div class="wrap">
    <h1>Configure your simulation</h1>
    <div class="row">
      <input id="company" placeholder="Company (Google, Netflix, Startup, Meta)" style="flex:1" />
      <input id="role" placeholder="Role (e.g., Backend Engineer)" style="flex:1" />
      <select id="level">
        <option value="intern">Intern</option>
        <option value="junior">Junior</option>
        <option value="mid">Mid</option>
        <option value="senior">Senior</option>
        <option value="staff">Staff</option>
        <option value="principal">Principal</option>
      </select>
    </div>
    <div class="row">
      <div class="card" id="google">Google</div>
      <div class="card" id="netflix">Netflix</div>
      <div class="card" id="startup">Startup</div>
      <div class="card" id="meta">Meta</div>
    </div>
    <div class="tasks">
      <div class="card task" data-key="bugfix">Bug Fix</div>
      <div class="card task" data-key="optimization">Optimization</div>
      <div class="card task" data-key="security">Security</div>
      <div class="card task" data-key="prompt-engineering">Prompt Engineering</div>
    </div>
    <footer>
      <button id="cancel">Cancel</button>
      <button id="submit">Start</button>
    </footer>
    </div><script>${script}</script></body></html>`;
    return html;
}
