import * as vscode from 'vscode';
import { createOpenAIClient } from './vendors/openai.js';
import { createGeminiClient } from './vendors/gemini.js';

export type ChatClient = {
    chat(input: { system?: string; user: string; model: string; maxTokens: number; stream: boolean; }): Promise<string>;
};

export function routeModel(policy: any, tier: string, persona: 'interviewer' | 'codingPartner', config: vscode.WorkspaceConfiguration): { provider: 'openai' | 'gemini'; model: string; client: ChatClient; } {
    const defaultProvider = (config.get<string>('defaultProvider') ?? 'auto') as 'auto' | 'openai' | 'gemini';
    const selection = policy?.[tier]?.[persona];
    let provider: 'openai' | 'gemini' = selection?.provider ?? 'openai';
    let model: string = selection?.model ?? 'gpt-3.5-turbo';

    if (defaultProvider !== 'auto') {
        provider = defaultProvider;
        if (provider === 'openai' && model.startsWith('gemini')) { model = 'gpt-3.5-turbo'; }
        if (provider === 'gemini' && model.startsWith('gpt')) { model = 'gemini-1.5-pro'; }
    }

    // Heuristics: free tier uses top model for first simulation, then cheaper
    const firstSimTopModel = (config.get<number>('freeMonthlyLimit') ?? 3) > 0; // presence of limit indicates policy

    if (tier === 'free') {
        if (persona === 'interviewer') {
            if (firstSimTopModel) {
                provider = provider === 'gemini' ? 'gemini' : 'openai';
                model = provider === 'gemini' ? 'gemini-1.5-pro' : 'gpt-4o';
            } else {
                provider = provider === 'gemini' ? 'gemini' : 'openai';
                model = provider === 'gemini' ? 'gemini-1.5-flash' : 'gpt-3.5-turbo';
            }
        } else {
            if (firstSimTopModel) {
                provider = provider === 'gemini' ? 'gemini' : 'openai';
                model = provider === 'gemini' ? 'gemini-1.5-pro' : 'gpt-4o';
            } else {
                provider = provider === 'gemini' ? 'gemini' : 'openai';
                model = provider === 'gemini' ? 'gemini-1.5-flash' : 'gpt-3.5-turbo';
            }
        }
    } else {
        if (persona === 'codingPartner') {
            provider = provider === 'gemini' ? 'gemini' : 'openai';
            model = provider === 'gemini' ? 'gemini-1.5-pro' : 'gpt-4o';
        }
    }

    const client = provider === 'openai' ? createOpenAIClient() : createGeminiClient();
    return { provider, model, client };
}


