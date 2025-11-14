import * as vscode from 'vscode';

export async function showContextPicker(): Promise<void> {
    const folders = vscode.workspace.workspaceFolders ?? [];
    const picks = await vscode.window.showQuickPick(
        folders.map(f => ({ label: f.name, description: f.uri.fsPath })),
        { canPickMany: true, title: 'Select workspace folders to include as context' }
    );
    if (!picks) return;
    const selected = picks.map(p => p.description ?? '').filter(Boolean);
    await vscode.workspace.getConfiguration('mockmate').update('workspaceContextRoots', selected, vscode.ConfigurationTarget.Workspace);
    vscode.window.showInformationMessage(`Context roots set (${selected.length})`);
}
