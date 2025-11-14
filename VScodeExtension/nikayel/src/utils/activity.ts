import * as vscode from 'vscode';
import { logEvent } from '../supabase/sessions';
import { postToInterviewer } from '../ui/panels';

let inactivityTimer: NodeJS.Timeout | undefined;
let lastEditTime = Date.now();

export function startInactivityMonitor(): void {
    stopInactivityMonitor();
    const onChange = vscode.workspace.onDidChangeTextDocument(() => { lastEditTime = Date.now(); });
    const onSave = vscode.workspace.onDidSaveTextDocument(() => { lastEditTime = Date.now(); });
    inactivityTimer = setInterval(async () => {
        const elapsed = Date.now() - lastEditTime;
        if (elapsed > 2 * 60 * 1000) { // 2 minutes
            await logEvent({ event_type: 'hint_level_1', payload: { seconds_idle: Math.floor(elapsed / 1000) } });
            postToInterviewer('Hint: Consider what data structure or approach could simplify the problem.');
            lastEditTime = Date.now();
        }
    }, 15_000);
    disposables.push(onChange, onSave);
}

export function stopInactivityMonitor(): void {
    if (inactivityTimer) { clearInterval(inactivityTimer); inactivityTimer = undefined; }
    disposables.forEach(d => d.dispose());
    disposables = [];
}

let disposables: vscode.Disposable[] = [];


