import fetch from 'node-fetch';
import { readToken } from './session';
import * as vscode from 'vscode';

export async function callUsageGatekeeper(supabaseUrl: string, anonKey: string): Promise<{ ok: boolean; simulations_used?: number; limit?: number;[k: string]: any; }> {
    const token = await readToken();
    const config = vscode.workspace.getConfiguration('mockmate');
    const url = `${supabaseUrl}/functions/v1/usage-gate`;
    const res = await fetch(url, { method: 'POST', headers: { 'Authorization': `Bearer ${token ?? anonKey}` } });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
    }
    try {
        const data = await res.json();
        return data;
    } catch {
        return { ok: true } as any;
    }
}


