import * as vscode from 'vscode';
import { logEvent } from '../supabase/sessions';
import { postToastToInterviewer } from '../ui/panels';

let interruptionTimer: NodeJS.Timeout | undefined;
let lastEditTime = Date.now();
let lastInterruptionTime = Date.now();
let disposables: vscode.Disposable[] = [];

// Real-world scenario interruptions
const realWorldInterruptions = [
    "Just a heads up - the product manager wants to know if this will scale to 10M users.",
    "Quick question from the team: how would this handle network failures?",
    "FYI - we just got feedback that similar code caused a memory leak in production last week.",
    "The security team is asking about input validation here.",
    "A senior engineer just pinged - they're wondering about the time complexity of this approach.",
    "Quick interruption: the designer mentioned we need to handle edge cases for empty states.",
    "Just got a Slack message - QA is asking about test coverage for this feature.",
    "One of the users just reported a similar issue in production. Worth considering?",
    "The tech lead wants to know: have you considered the database performance here?",
    "Engineering manager checking in: what's your strategy for error handling?",
    "DevOps is asking: how will this behave under high load?",
    "Product team question: can we make this work for our enterprise customers too?",
    "Quick note: we had a similar bug last sprint. Have you checked for race conditions?",
    "The monitoring team asks: what metrics should we track for this feature?",
    "Legal is asking if we're handling user data properly here.",
    "Infrastructure team question: what's the caching strategy?",
];

// Stuck detection messages
const stuckHelpMessages = [
    "I notice you've been working on this for a while. Want to talk through your approach?",
    "Stuck? Sometimes it helps to explain what you're trying to do out loud.",
    "Taking a moment to think is good! What's the current blocker?",
    "It's okay to ask questions - what part is tripping you up?",
    "Consider: have you tested the simplest case first?",
    "Reminder: you can always start with a brute force solution and optimize later.",
];

export function startInterviewerInterruptions(): void {
    stopInterviewerInterruptions();

    const onChange = vscode.workspace.onDidChangeTextDocument(() => {
        lastEditTime = Date.now();
    });
    const onSave = vscode.workspace.onDidSaveTextDocument(() => {
        lastEditTime = Date.now();
    });

    interruptionTimer = setInterval(async () => {
        const elapsed = Date.now() - lastEditTime;
        const timeSinceLastInterruption = Date.now() - lastInterruptionTime;

        // User seems stuck (no activity for 2 minutes)
        if (elapsed > 2 * 60 * 1000 && timeSinceLastInterruption > 2 * 60 * 1000) {
            const message = stuckHelpMessages[Math.floor(Math.random() * stuckHelpMessages.length)];
            await logEvent({
                event_type: 'interviewer_interruption',
                payload: { type: 'stuck_detection', seconds_idle: Math.floor(elapsed / 1000) }
            });
            postToastToInterviewer(`💭 Interviewer: ${message}`);
            lastInterruptionTime = Date.now();
        }

        // Random real-world scenario interruptions (every 3-5 minutes of active work)
        const randomInterval = 3 * 60 * 1000 + Math.random() * 2 * 60 * 1000;
        if (timeSinceLastInterruption > randomInterval && elapsed < 30 * 1000) {
            // Only interrupt if they're actively working (edited within last 30 seconds)
            const message = realWorldInterruptions[Math.floor(Math.random() * realWorldInterruptions.length)];
            await logEvent({
                event_type: 'interviewer_interruption',
                payload: { type: 'real_world_scenario' }
            });
            postToastToInterviewer(`💬 ${message}`);
            lastInterruptionTime = Date.now();
        }
    }, 20_000); // Check every 20 seconds

    disposables.push(onChange, onSave);
}

export function stopInterviewerInterruptions(): void {
    if (interruptionTimer) {
        clearInterval(interruptionTimer);
        interruptionTimer = undefined;
    }
    disposables.forEach(d => d.dispose());
    disposables = [];
}
