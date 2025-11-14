import * as vscode from 'vscode';

export type SimulationParams = {
    company: string;
    role: string;
    level: 'intern' | 'junior' | 'mid' | 'senior' | 'staff' | 'principal';
    taskTypes: Array<'bugfix' | 'optimization' | 'security' | 'prompt-engineering'>;
};

export async function collectSimulationParams(): Promise<SimulationParams | undefined> {
    const company = await vscode.window.showInputBox({ prompt: 'Target company (e.g., Google, Stripe)', placeHolder: 'Company', ignoreFocusOut: true });
    if (company === undefined) { return undefined; }
    const role = await vscode.window.showInputBox({ prompt: 'Target role (e.g., Backend Engineer, Fullstack)', placeHolder: 'Role', ignoreFocusOut: true });
    if (role === undefined) { return undefined; }
    const levelPick = await vscode.window.showQuickPick(['intern', 'junior', 'mid', 'senior', 'staff', 'principal'], { title: 'Seniority level', canPickMany: false, ignoreFocusOut: true });
    if (!levelPick) { return undefined; }
    const taskPick = await vscode.window.showQuickPick([
        { label: 'Bug Fix', picked: true, key: 'bugfix' },
        { label: 'Optimization', picked: true, key: 'optimization' },
        { label: 'Security', picked: true, key: 'security' },
        { label: 'Prompt Engineering (LLM Partner)', picked: true, key: 'prompt-engineering' },
    ], { title: 'Select task types to include', canPickMany: true, ignoreFocusOut: true });
    if (!taskPick || taskPick.length === 0) { return undefined; }
    return {
        company: company.trim(),
        role: (role ?? '').trim(),
        level: levelPick as SimulationParams['level'],
        taskTypes: taskPick.map(p => (p as any).key),
    };
}

export function buildPersonaPrompts(params: SimulationParams) {
    const levelStyles = {
        intern: 'focus on fundamentals and clarity of thought',
        junior: 'focus on fundamentals, readability, and testing basics',
        mid: 'focus on production readiness, testing, and trade-offs',
        senior: 'focus on system design considerations, edge cases, and performance',
        staff: 'focus on cross-team impact, scalability, reliability, and observability',
        principal: 'focus on strategy, high-level trade-offs, and risk mitigation',
    } as const;

    const companyStyles: Record<string, string> = {
        google: 'emphasize algorithmic complexity at large scale, distributed systems, and rigorous trade-off analysis with what-if follow ups',
        netflix: 'emphasize resilience, microservices, and operational excellence including testing, monitoring, and chaos scenarios',
        startup: 'favor practical bug fixing and feature implementation on a small messy codebase, prioritize pragmatism and speed',
        meta: 'emphasize multi-file codebases with subtle bugs and optimization opportunities, encourage careful reasoning and iteration',
    };

    const key = params.company.trim().toLowerCase();
    const companyStyle = companyStyles[key] ?? 'adapt to the company culture and role expectations with realistic constraints';
    const levelStyle = levelStyles[params.level];

    const tasks = params.taskTypes.map(t => ({
        'bugfix': 'Provide a buggy code snippet relevant to the role; ask the candidate to identify and fix defects with tests.',
        'optimization': 'Provide a working but slow solution; ask the candidate to optimize and explain trade-offs and complexity.',
        'security': 'Provide a vulnerable code snippet; ask the candidate to identify vulnerabilities (e.g., injection, auth, secrets) and harden it.',
        'prompt-engineering': 'Ask the candidate to write effective prompts for their coding assistant to solve a subtask, reflect and iterate on the assistant output.',
    } as any)[t]).join('\n- ');

    const interviewerSystem = `You are a professional technical interviewer for ${params.company} hiring a ${params.role} at ${params.level} level. Your style: ${levelStyle}. Company flavor: ${companyStyle}. Do not provide direct solutions unless explicitly asked. Keep responses concise.`;
    const interviewerUser = `Start the interview by selecting ONE task from the pool below that best fits this candidate profile. Make the initial description slightly ambiguous to encourage clarifying questions. After the candidate proposes an approach, use Socratic hints before directive hints.
Task pool:
- ${tasks}
Then wait for the candidate's approach before giving hints.`;

    const partnerSystem = `You are a helpful AI coding partner embedded in VS Code. Provide localized code edits, tests, debugging help, and concise suggestions. Do not reveal full solutions unless asked. Align with the interview's constraints and company flavor.`;

    return { interviewerSystem, interviewerUser, partnerSystem };
}


