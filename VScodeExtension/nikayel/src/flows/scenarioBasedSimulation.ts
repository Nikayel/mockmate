/**
 * Scenario-based interview simulation flow
 * Enhanced version with preloaded scenarios and full workspace context
 */

import * as vscode from 'vscode';
import { Scenario } from '../scenarios';
import { ScenarioBrowserPanel } from '../ui/scenarioBrowser';
import {
  buildInterviewerPersona,
  buildCodingPartnerPersona,
  buildInitialInterviewMessage,
  PersonaContext,
} from '../personas/scenarioPersonas';
import {
  gatherFullWorkspaceContext,
  formatWorkspaceContextForAI,
} from '../utils/workspace';
import { callUsageGatekeeper } from '../supabase/usage';
import { routeModel } from '../models/router';
import {
  postToInterviewer,
  postToCodingPartner,
  postToastToInterviewer,
  setInterviewerMessageHandler,
  setCodingPartnerMessageHandler,
} from '../ui/panels';
import {
  startSession,
  logEvent,
  getCurrentSessionId,
} from '../supabase/sessions';
import { createProxyClient } from '../models/vendors/proxy';
import {
  startInactivityMonitor,
  stopInactivityMonitor,
} from '../utils/activity';
import {
  startInterviewerInterruptions,
  stopInterviewerInterruptions,
} from '../utils/interviewerInterruptions';
import { readToken } from '../supabase/session';

export async function startScenarioBasedSimulation(
  context: vscode.ExtensionContext,
  output: vscode.OutputChannel
): Promise<void> {
  const config = vscode.workspace.getConfiguration('mockmate');
  const supabaseUrl =
    config.get<string>('supabaseUrl') || process.env.SUPABASE_URL || '';
  const supabaseAnonKey =
    config.get<string>('supabaseAnonKey') ||
    process.env.SUPABASE_ANON_KEY ||
    '';
  const debug = config.get<boolean>('debugLogging') ?? false;

  // Authentication and usage check
  if (!supabaseUrl || !supabaseAnonKey) {
    vscode.window.showWarningMessage(
      'Supabase is not configured. You can still try the local simulation, but usage limiting is disabled.'
    );
  } else {
    if (config.get<boolean>('requireSignIn')) {
      const token = await readToken();
      if (!token) {
        vscode.window.showWarningMessage('Please sign in to continue.');
        await vscode.commands.executeCommand('mockmate.signIn');
        const t2 = await readToken();
        if (!t2) {
          return;
        }
      }
    }

    try {
      const gate = await callUsageGatekeeper(supabaseUrl, supabaseAnonKey);
      if (
        gate &&
        gate.ok &&
        typeof gate.simulations_used === 'number' &&
        typeof gate.limit === 'number'
      ) {
        output.appendLine(
          `Usage: ${gate.simulations_used}/${gate.limit} simulations`
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      vscode.window.showErrorMessage(
        `Usage limit reached or auth issue: ${message}`
      );
      return;
    }
  }

  // Step 1: Get basic interview parameters
  const company = await vscode.window.showQuickPick(
    [
      'Google',
      'Meta',
      'Amazon',
      'Netflix',
      'Apple',
      'Microsoft',
      'Startup',
      'Generic',
    ],
    {
      title: 'Target Company',
      placeHolder: 'Select the company you are interviewing for',
      ignoreFocusOut: true,
    }
  );
  if (!company) {
    return;
  }

  const role = await vscode.window.showInputBox({
    prompt: 'Target role (e.g., Backend Engineer, Frontend, Fullstack)',
    placeHolder: 'Role',
    value: 'Software Engineer',
    ignoreFocusOut: true,
  });
  if (!role) {
    return;
  }

  const level = await vscode.window.showQuickPick(
    ['intern', 'junior', 'mid', 'senior', 'staff', 'principal'],
    {
      title: 'Seniority Level',
      canPickMany: false,
      ignoreFocusOut: true,
    }
  );
  if (!level) {
    return;
  }

  // Step 2: Show scenario browser for user to select a scenario
  output.appendLine('Opening scenario browser...');
  const scenarioBrowser = ScenarioBrowserPanel.createOrShow(context.extensionUri);

  const selectedScenario = await new Promise<Scenario | undefined>(
    (resolve) => {
      const disposable = scenarioBrowser.onDidSelectScenario((scenario) => {
        resolve(scenario);
        disposable.dispose();
      });
    }
  );

  if (!selectedScenario) {
    vscode.window.showInformationMessage('No scenario selected');
    return;
  }

  output.appendLine(`Selected scenario: ${selectedScenario.title}`);

  // Step 3: Gather full workspace context
  output.appendLine('Gathering workspace context...');
  const workspaceCtx = await gatherFullWorkspaceContext();
  const formattedContext = formatWorkspaceContextForAI(workspaceCtx);

  if (debug) {
    output.appendLine(`Workspace context: ${workspaceCtx.totalFiles} files`);
    output.appendLine(`Languages: ${workspaceCtx.languages.join(', ')}`);
  }

  // Step 4: Build enhanced personas with scenario and context
  const personaContext: PersonaContext = {
    scenario: selectedScenario,
    company,
    role,
    level: level as any,
    workspaceContext: formattedContext,
  };

  const interviewerSystemPrompt = buildInterviewerPersona(personaContext);
  const partnerSystemPrompt = buildCodingPartnerPersona(personaContext);
  const initialMessage = buildInitialInterviewMessage(personaContext);

  if (debug) {
    output.appendLine('\n=== Interviewer System Prompt ===');
    output.appendLine(interviewerSystemPrompt.substring(0, 500) + '...');
    output.appendLine('\n=== Initial Message ===');
    output.appendLine(initialMessage.substring(0, 500) + '...');
  }

  // Step 5: Start session on server
  const policy = config.get<any>('modelPolicy');
  const tier = 'free'; // TODO: query profile via edge to get real tier

  const sessionId = await startSession({
    company,
    role,
    level: level as any,
    task_types: [selectedScenario.type],
    interviewer_persona: {
      system: interviewerSystemPrompt,
      scenario: selectedScenario,
    },
    partner_persona: {
      system: partnerSystemPrompt,
      scenario: selectedScenario,
    },
    routing_policy: policy,
  });

  output.appendLine(`Session started: ${sessionId}`);

  // Step 6: Get initial response from interviewer
  const useProxy = !config.get<boolean>('devDirectLLM');
  const route = routeModel(policy, tier, 'interviewer', config);

  const initialResponse = useProxy
    ? await createProxyClient().chat({
        persona: 'interviewer',
        system: interviewerSystemPrompt,
        user: initialMessage,
        contextFiles: workspaceCtx.openFiles.map((f) => ({
          uri: f.uri,
          content: f.content,
        })),
        sessionId,
      })
    : await safeChat(route, {
        system: interviewerSystemPrompt,
        user: initialMessage,
        model: route.model,
        maxTokens: config.get<number>('maxResponseTokens') ?? 2048,
        stream: config.get<boolean>('enableStreaming') ?? false,
      });

  postToInterviewer(initialResponse);
  await logEvent({
    event_type: 'assistant_message',
    payload: {
      panel: 'interviewer',
      text: initialResponse,
      scenario: selectedScenario.id,
    },
  });

  // Start inactivity monitoring
  startInactivityMonitor();

  // Start interviewer interruptions (real-world scenarios and stuck detection)
  startInterviewerInterruptions();

  // Step 7: Wire message handlers with context awareness
  setInterviewerMessageHandler(async (userMessage: string) => {
    await logEvent({
      event_type: 'user_message',
      payload: { panel: 'interviewer', text: userMessage },
    });

    // Re-gather workspace context in case files changed
    const freshContext = await gatherFullWorkspaceContext();
    const freshFormatted = formatWorkspaceContextForAI(freshContext);

    const updatedPersonaContext: PersonaContext = {
      ...personaContext,
      workspaceContext: freshFormatted,
    };

    const updatedInterviewerPrompt = buildInterviewerPersona(updatedPersonaContext);

    const r = routeModel(policy, tier, 'interviewer', config);
    const reply = useProxy
      ? await createProxyClient().chat({
          persona: 'interviewer',
          system: updatedInterviewerPrompt,
          user: userMessage,
          contextFiles: freshContext.openFiles.map((f) => ({
            uri: f.uri,
            content: f.content,
          })),
          sessionId: getCurrentSessionId(),
        })
      : await safeChat(r, {
          system: updatedInterviewerPrompt,
          user: userMessage,
          model: r.model,
          maxTokens: config.get<number>('maxResponseTokens') ?? 2048,
          stream: config.get<boolean>('enableStreaming') ?? false,
        });

    postToInterviewer(reply);
    await logEvent({
      event_type: 'assistant_message',
      payload: { panel: 'interviewer', text: reply },
    });
  });

  setCodingPartnerMessageHandler(async (userMessage: string) => {
    await logEvent({
      event_type: 'user_message',
      payload: { panel: 'codingPartner', text: userMessage },
    });

    // Re-gather workspace context
    const freshContext = await gatherFullWorkspaceContext();
    const freshFormatted = formatWorkspaceContextForAI(freshContext);

    const updatedPersonaContext: PersonaContext = {
      ...personaContext,
      workspaceContext: freshFormatted,
    };

    const updatedPartnerPrompt = buildCodingPartnerPersona(updatedPersonaContext);

    const r = routeModel(policy, tier, 'codingPartner', config);
    const reply = useProxy
      ? await createProxyClient().chat({
          persona: 'codingPartner',
          system: updatedPartnerPrompt,
          user: userMessage,
          contextFiles: freshContext.openFiles.map((f) => ({
            uri: f.uri,
            content: f.content,
          })),
          sessionId: getCurrentSessionId(),
        })
      : await safeChat(r, {
          system: updatedPartnerPrompt,
          user: userMessage,
          model: r.model,
          maxTokens: config.get<number>('maxResponseTokens') ?? 2048,
          stream: config.get<boolean>('enableStreaming') ?? false,
        });

    postToCodingPartner(reply);
    await logEvent({
      event_type: 'assistant_message',
      payload: { panel: 'codingPartner', text: reply },
    });
  });

  vscode.window.showInformationMessage(
    `Interview started: ${selectedScenario.title} (${selectedScenario.estimatedTime} min)`
  );
}

async function safeChat(
  route: ReturnType<typeof routeModel>,
  input: {
    system?: string;
    user: string;
    model: string;
    maxTokens: number;
    stream: boolean;
  }
): Promise<string> {
  try {
    return await route.client.chat(input);
  } catch (err) {
    // Fallback across providers if first call fails
    const fallbackProvider = route.provider === 'openai' ? 'gemini' : 'openai';
    const fallbackModel =
      fallbackProvider === 'openai' ? 'gpt-3.5-turbo' : 'gemini-1.5-flash';
    const fallbackRoute = {
      provider: fallbackProvider,
      model: fallbackModel,
      client:
        fallbackProvider === 'openai'
          ? (await import('../models/vendors/openai.js')).createOpenAIClient()
          : (await import('../models/vendors/gemini.js')).createGeminiClient(),
    };
    try {
      return await fallbackRoute.client.chat({ ...input, model: fallbackModel });
    } catch {
      const msg = err instanceof Error ? err.message : String(err);
      return `Sorry, I could not fetch a response at the moment. Error: ${msg}`;
    }
  }
}
