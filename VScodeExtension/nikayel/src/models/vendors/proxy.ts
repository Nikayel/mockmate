import * as vscode from 'vscode';
import fetch from 'node-fetch';
import { readToken } from '../../supabase/session';

export function createProxyClient() {
    return {
        async chat(input: { system?: string; user: string; model?: string; maxTokens?: number; stream?: boolean; persona: 'interviewer' | 'codingPartner'; contextFiles?: { uri: string; content: string; }[], sessionId?: string; }): Promise<string> {
            const config = vscode.workspace.getConfiguration('mockmate');
            const supabaseUrl = (config.get<string>('supabaseUrl') ?? process.env.SUPABASE_URL ?? '').replace(/\/$/, '');
            const token = await readToken();
            const anon = config.get<string>('supabaseAnonKey') ?? process.env.SUPABASE_ANON_KEY ?? '';
            const authHeader = token ? `Bearer ${token}` : `Bearer ${anon}`;
            const url = `${supabaseUrl}/functions/v1/chat-proxy`;
            const res = await fetch(url, { method: 'POST', headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `HTTP ${res.status}`);
            }
            const data = await res.json();
            return data.text ?? '';
        }
    };
}


