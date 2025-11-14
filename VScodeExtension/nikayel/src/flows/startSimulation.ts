import * as vscode from 'vscode';
import { readAllOpenEditors } from '../utils/workspace';
import { callUsageGatekeeper } from '../supabase/usage';
import { routeModel } from '../models/router';
import { postToInterviewer, postToCodingPartner, setInterviewerMessageHandler, setCodingPartnerMessageHandler } from '../ui/panels';
import { collectSimulationParams, buildPersonaPrompts } from './collectParams';
import { showStartWizard } from '../ui/wizard';
import { startSession, logEvent, getCurrentSessionId } from '../supabase/sessions';
import { createProxyClient } from '../models/vendors/proxy';
import { startInactivityMonitor, stopInactivityMonitor } from '../utils/activity';
import { readToken } from '../supabase/session';

export async function startSimulationFlow(context: vscode.ExtensionContext, output: vscode.OutputChannel): Promise<void> {
    const config = vscode.workspace.getConfiguration('mockmate');
    const supabaseUrl = config.get<string>('supabaseUrl') || process.env.SUPABASE_URL || '';
    const supabaseAnonKey = config.get<string>('supabaseAnonKey') || process.env.SUPABASE_ANON_KEY || '';
    const debug = config.get<boolean>('debugLogging') ?? false;

    if (!supabaseUrl || !supabaseAnonKey) {
        vscode.window.showWarningMessage('Supabase is not configured. You can still try the local simulation, but usage limiting is disabled.');
    } else {
        // Enforce sign-in if required
        if (config.get<boolean>('requireSignIn')) {
            const token = await readToken();
            if (!token) {
                vscode.window.showWarningMessage('Please sign in to continue.');
                await vscode.commands.executeCommand('mockmate.signIn');
                const t2 = await readToken();
                if (!t2) { return; }
            }
        }
        try {
            const gate = await callUsageGatekeeper(supabaseUrl, supabaseAnonKey);
            if (gate && gate.ok && typeof gate.simulations_used === 'number' && typeof gate.limit === 'number') {
                // If this is the user's first simulation, router will pick top models
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            vscode.window.showErrorMessage(`Usage limit reached or auth issue: ${message}`);
            return;
        }
    }

    // Collect parameters from user
    const useWizard = config.get<boolean>('useWizard') ?? true;
    const simParams = useWizard ? await showStartWizard(context) : await collectSimulationParams();
    if (!simParams) { return; }

    const { interviewerSystem, interviewerUser, partnerSystem } = buildPersonaPrompts(simParams);

    // Read open editors to build context
    const contextFiles = await readAllOpenEditors(100_000); // cap to 100k chars
    if (debug) {
        output.appendLine(`Collected context from ${contextFiles.length} open editors`);
    }

    const interviewerSystemPrompt = interviewerSystem;
    const initialUserPrompt = interviewerUser;

    const policy = config.get<any>('modelPolicy');
    const tier = 'free'; // TODO: query profile via edge to get real tier
    const persona = 'interviewer';
    const useProxy = !config.get<boolean>('devDirectLLM');
    const route = routeModel(policy, tier, persona, config);

    // Start session on server
    const sessionId = await startSession({
        company: simParams.company,
        role: simParams.role,
        level: simParams.level,
        task_types: simParams.taskTypes,
        interviewer_persona: { system: interviewerSystem },
        partner_persona: { system: partnerSystem },
        routing_policy: policy
    });

    const response = useProxy
        ? await createProxyClient().chat({
            persona: 'interviewer',
            system: interviewerSystemPrompt,
            user: buildUserPromptWithContext(initialUserPrompt, contextFiles),
            contextFiles,
            sessionId
        })
        : await safeChat(route, {
            system: interviewerSystemPrompt,
            user: buildUserPromptWithContext(initialUserPrompt, contextFiles),
            model: route.model,
            maxTokens: config.get<number>('maxResponseTokens') ?? 1024,
            stream: config.get<boolean>('enableStreaming') ?? true,
        });

    postToInterviewer(response);
    await logEvent({ event_type: 'assistant_message', payload: { panel: 'interviewer', text: response } });
    startInactivityMonitor();

    // Wire message handlers
    setInterviewerMessageHandler(async (text: string) => {
        await logEvent({ event_type: 'user_message', payload: { panel: 'interviewer', text } });
        const p = 'interviewer' as const;
        const r = routeModel(policy, tier, p, config);
        const reply = useProxy
            ? await createProxyClient().chat({ persona: 'interviewer', system: interviewerSystemPrompt, user: buildUserPromptWithContext(text, contextFiles), contextFiles, sessionId: getCurrentSessionId() })
            : await safeChat(r, { system: interviewerSystemPrompt, user: buildUserPromptWithContext(text, contextFiles), model: r.model, maxTokens: config.get<number>('maxResponseTokens') ?? 1024, stream: config.get<boolean>('enableStreaming') ?? true });
        postToInterviewer(reply);
        await logEvent({ event_type: 'assistant_message', payload: { panel: 'interviewer', text: reply } });
    });

    const partnerSystemPrompt = partnerSystem;
    setCodingPartnerMessageHandler(async (text: string) => {
        await logEvent({ event_type: 'user_message', payload: { panel: 'codingPartner', text } });
        const p = 'codingPartner' as const;
        const r = routeModel(policy, tier, p, config);
        const reply = useProxy
            ? await createProxyClient().chat({ persona: 'codingPartner', system: partnerSystemPrompt, user: buildUserPromptWithContext(text, contextFiles), contextFiles, sessionId: getCurrentSessionId() })
            : await safeChat(r, { system: partnerSystemPrompt, user: buildUserPromptWithContext(text, contextFiles), model: r.model, maxTokens: config.get<number>('maxResponseTokens') ?? 1024, stream: config.get<boolean>('enableStreaming') ?? true });
        postToCodingPartner(reply);
        await logEvent({ event_type: 'assistant_message', payload: { panel: 'codingPartner', text: reply } });
    });
}

async function safeChat(route: ReturnType<typeof routeModel>, input: { system?: string; user: string; model: string; maxTokens: number; stream: boolean; }): Promise<string> {
    try {
        return await route.client.chat(input);
    } catch (err) {
        // Fallback across providers if first call fails
        const fallbackProvider = route.provider === 'openai' ? 'gemini' : 'openai';
        const fallbackModel = fallbackProvider === 'openai' ? 'gpt-3.5-turbo' : 'gemini-1.5-flash';
        const fallbackRoute = {
            provider: fallbackProvider,
            model: fallbackModel,
            client: fallbackProvider === 'openai' ? (await import('../models/vendors/openai.js')).createOpenAIClient() : (await import('../models/vendors/gemini.js')).createGeminiClient(),
        };
        try {
            return await fallbackRoute.client.chat({ ...input, model: fallbackModel });
        } catch {
            const msg = err instanceof Error ? err.message : String(err);
            return `Sorry, I could not fetch a response at the moment. Error: ${msg}`;
        }
    }
}

function buildUserPromptWithContext(user: string, files: { uri: string; content: string; }[]): string {
    const parts: string[] = [user, '\n\nContext:\n'];
    for (const f of files) {
        parts.push(`File: ${f.uri}\n\n${truncate(f.content, 4000)}\n---\n`);
    }
    return parts.join('');
}

function truncate(text: string, max: number): string {
    return text.length > max ? text.slice(0, max) + '\n... [truncated]' : text;
}


