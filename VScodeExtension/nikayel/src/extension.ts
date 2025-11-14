import * as dotenv from 'dotenv';
import * as path from 'path';
import * as vscode from 'vscode';
import { ensurePanels, showCodingPartnerPanel, showInterviewerPanel, registerCodingPartnerView } from './ui/panels';
import { maybeShowOnboarding } from './ui/onboarding';
import { showPricing } from './ui/pricing';
import { showContextPicker } from './ui/workspaceContext';
import { showSummary } from './ui/summary';
import { startSimulationFlow } from './flows/startSimulation';
import { signIn, signOut, initializeSession } from './supabase/session.js';
import { finalizeSession } from './supabase/sessions.js';
import { stopInactivityMonitor } from './utils/activity.js';
// Try local .env in multiple locations (dev and packaged)
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') }); // nikayel/.env (if running from src)
dotenv.config({ path: path.resolve(__dirname, '..', '..', '..', '.env') }); // VScodeExtension/.env (workspace root)

export function activate(context: vscode.ExtensionContext) {
	const output = vscode.window.createOutputChannel('MockMate');
	output.appendLine('MockMate activated');
	initializeSession(context);
	registerCodingPartnerView(context);
	maybeShowOnboarding(context).catch(() => { });

	// Handle OAuth callback via VS Code URI Handler
	context.subscriptions.push(vscode.window.registerUriHandler({
		handleUri: async (uri) => {
			if (uri.path !== '/auth-callback') { return; }
			const params = new URLSearchParams(uri.query ?? '');
			const token = params.get('token');
			if (token) {
				await context.secrets.store('mockmate.session.jwt', decodeURIComponent(token));
				vscode.window.showInformationMessage('Signed in successfully.');
			}
		}
	}));

	context.subscriptions.push(
		vscode.commands.registerCommand('nikayel.helloWorld', async () => {
			vscode.window.showInformationMessage('Hello from SimuView!');
		}),
		vscode.commands.registerCommand('mockmate.signIn', async () => {
			await signIn();
		}),
		vscode.commands.registerCommand('mockmate.signOut', async () => {
			await signOut();
		}),
		vscode.commands.registerCommand('mockmate.startSimulation', async () => {
			try {
				await ensurePanels(context);
				await startSimulationFlow(context, output);
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				vscode.window.showErrorMessage(`Failed to start simulation: ${message}`);
				output.appendLine(`Error: ${message}`);
			}
		}),
		vscode.commands.registerCommand('mockmate.endSimulation', async () => {
			try {
				await finalizeSession();
				stopInactivityMonitor();
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				vscode.window.showErrorMessage(`Failed to end simulation: ${message}`);
			}
		}),
		vscode.commands.registerCommand('mockmate.showPricing', async () => {
			await showPricing();
		}),
		vscode.commands.registerCommand('mockmate.configureContext', async () => {
			await showContextPicker();
		}),
		vscode.commands.registerCommand('mockmate.openInterviewer', async () => {
			await showInterviewerPanel(context);
		}),
		vscode.commands.registerCommand('mockmate.openCodingPartner', async () => {
			await showCodingPartnerPanel(context);
		}),
		vscode.commands.registerCommand('mockmate.submitSolution', async () => {
			// TODO: compute metrics server-side; for now show a stub
			await showSummary({ notes: 'Thanks for completing your simulation. Server-side metrics coming next.' });
		}),
	);
}

export function deactivate() { }
