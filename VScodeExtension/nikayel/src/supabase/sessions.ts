import * as vscode from 'vscode';
import fetch from 'node-fetch';
import { readToken } from './session';

let currentSessionId: string | undefined;

export function getCurrentSessionId(): string | undefined {
    return currentSessionId;
}

export async function startSession(payload: any): Promise<string> {
    const sessionId = await callEdge('session-start', payload);
    currentSessionId = sessionId;
    return sessionId;
}

export async function logEvent(event: { event_type: string; payload?: any; }): Promise<void> {
    if (!currentSessionId) { return; }
    await callEdge('session-event', { session_id: currentSessionId, ...event });
}

export async function finalizeSession(status: 'completed' | 'aborted' = 'completed'): Promise<void> {
    if (!currentSessionId) { return; }
    await callEdge('session-finalize', { session_id: currentSessionId, status });
    currentSessionId = undefined;
}

async function callEdge(functionName: string, body?: any): Promise<any> {
    const config = vscode.workspace.getConfiguration('mockmate');
    const supabaseUrl = (config.get<string>('supabaseUrl') ?? process.env.SUPABASE_URL ?? '').replace(/\/$/, '');
    const token = await readToken();
    const anon = config.get<string>('supabaseAnonKey') ?? process.env.SUPABASE_ANON_KEY ?? '';
    const authHeader = token ? `Bearer ${token}` : `Bearer ${anon}`;
    const url = `${supabaseUrl}/functions/v1/${functionName}`;
    const res = await fetch(url, { method: 'POST', headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
    }
    const text = await res.text();
    try { return JSON.parse(text); } catch { return text; }
}


