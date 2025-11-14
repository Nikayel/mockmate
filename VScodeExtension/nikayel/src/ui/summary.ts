import * as vscode from 'vscode';

export async function showSummary(summary: {
    totalDuration?: number;
    timeToFirstCode?: number;
    correctnessScore?: number;
    efficiencyScore?: number;
    communicationScore?: number;
    aiUsageScore?: number;
    strengths?: string[];
    weaknesses?: string[];
    notes?: string;
}) {
    const panel = vscode.window.createWebviewPanel('mockmateSummary', 'MockMate: Interview Summary', vscode.ViewColumn.One, { enableScripts: false });
    const fmt = (v?: number) => v == null ? '-' : Math.round(v * 100) + '%';
    const list = (arr?: string[]) => arr && arr.length ? '<ul>' + arr.map(s=>`<li>${s}</li>`).join('') + '</ul>' : '-';
    panel.webview.html = `<!doctype html><html><body style=\"font-family:var(--vscode-font-family);color:var(--vscode-foreground);background:var(--vscode-editor-background);padding:16px\">\n    <h2>Interview Summary</h2>\n    <p><b>Total Duration</b>: ${summary.totalDuration ?? '-'}s | <b>Time to First Code</b>: ${summary.timeToFirstCode ?? '-'}s</p>\n    <p><b>Correctness</b>: ${fmt(summary.correctnessScore)} | <b>Efficiency</b>: ${fmt(summary.efficiencyScore)} | <b>Communication</b>: ${fmt(summary.communicationScore)} | <b>AI Usage</b>: ${fmt(summary.aiUsageScore)}</p>\n    <h3>Strengths</h3>${list(summary.strengths)}\n    <h3>Areas to Improve</h3>${list(summary.weaknesses)}\n    ${summary.notes ? `<h3>Notes</h3><p>${summary.notes}</p>` : ''}\n    </body></html>`;
}
