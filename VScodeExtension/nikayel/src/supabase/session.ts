import * as vscode from 'vscode';

const SECRET_KEY = 'mockmate.session.jwt';
let extensionContext: vscode.ExtensionContext | undefined;

export function initializeSession(context: vscode.ExtensionContext): void {
    extensionContext = context;
}

export async function signIn(): Promise<void> {
    if (!extensionContext) { vscode.window.showErrorMessage('Session not initialized'); return; }
    const cfg = vscode.workspace.getConfiguration('mockmate');
    const websiteUrl = cfg.get<string>('websiteUrl')?.replace(/\/$/, '') ?? '';
    const redirect = cfg.get<string>('oauthRedirectUri') ?? '';
    // Open website login which will start Supabase GitHub OAuth and send token back to vscode redirect
    const url = `${websiteUrl}/login?from=vscode&redirect=${encodeURIComponent(redirect)}`;
    await vscode.env.openExternal(vscode.Uri.parse(url));
}

export async function signOut(): Promise<void> {
    if (!extensionContext) { return; }
    await extensionContext.secrets.delete(SECRET_KEY);
    vscode.window.showInformationMessage('Signed out.');
}

export async function readToken(): Promise<string | undefined> {
    if (!extensionContext) { return undefined; }
    return extensionContext.secrets.get(SECRET_KEY);
}


