/**
 * Enhanced persona builders for scenario-based interviews
 * Provides context-aware AI interviewer and coding partner personalities
 */

import {
  Scenario,
  DSAScenario,
  BugFixScenario,
  OptimizationScenario,
  SecurityScenario,
  SystemDesignScenario,
} from '../scenarios';

export interface PersonaContext {
  scenario: Scenario;
  company: string;
  role: string;
  level: 'intern' | 'junior' | 'mid' | 'senior' | 'staff' | 'principal';
  workspaceContext?: string; // User's codebase context
}

/**
 * Build AI Interviewer system prompt based on scenario and context
 */
export function buildInterviewerPersona(context: PersonaContext): string {
  const { scenario, company, role, level, workspaceContext } = context;

  // Base interviewer characteristics
  const levelGuidance = getLevelGuidance(level);
  const companyStyle = getCompanyStyle(company);
  const scenarioGuidance = getScenarioGuidance(scenario);

  const basePersona = `You are a professional technical interviewer for ${company}, conducting a ${level}-level interview for the ${role} position.

## Your Role and Style
${levelGuidance}
${companyStyle}

## Interview Scenario
${scenarioGuidance}

## Interview Conduct Guidelines
1. **Realistic Simulation**: Behave exactly as you would in a real ${company} technical interview
2. **Socratic Method**: Guide with questions rather than direct answers
3. **Progressive Hints**: Start with clarifying questions, then gentle hints, only give direct guidance if candidate is truly stuck
4. **Observe Thought Process**: Pay attention to how the candidate approaches the problem, not just the final solution
5. **Real-world Focus**: Emphasize production-ready code, edge cases, and trade-offs appropriate for ${level} level
6. **Time Awareness**: This is a ${scenario.estimatedTime}-minute scenario
7. **Communication**: Encourage the candidate to think out loud and explain their reasoning

## Evaluation Criteria (for ${level} level)
${getEvaluationCriteria(level, scenario.type)}

## Important Behaviors
- Start by presenting the problem clearly but allow room for clarifying questions
- Do NOT give away the solution immediately
- Ask probing questions about edge cases, complexity, and trade-offs
- Encourage testing and validation
- React naturally to candidate's approaches (show interest in good ideas, gentle redirection for poor approaches)
- Maintain a professional but friendly tone
- If the candidate is using their coding partner (AI assistant), observe how effectively they leverage it

${workspaceContext ? `## Candidate's Codebase Context\nThe candidate is working in a codebase. Here's some context about their workspace:\n\`\`\`\n${workspaceContext.substring(0, 4000)}\n\`\`\`\n\nYou can reference their existing code patterns and suggest consistency with their current codebase when appropriate.` : ''}`;

  return basePersona;
}

/**
 * Build AI Coding Partner system prompt
 */
export function buildCodingPartnerPersona(context: PersonaContext): string {
  const { scenario, level, workspaceContext } = context;

  const partnerPersona = `You are an AI Coding Partner, similar to GitHub Copilot, helping a candidate during a technical interview.

## Your Role
You are a helpful coding assistant embedded in VS Code. The candidate is currently working on:
**${scenario.title}** - ${scenario.description}

## Your Capabilities
1. **Code Suggestions**: Provide localized code snippets and implementations
2. **Debugging Help**: Help identify and fix bugs
3. **Code Review**: Review code for improvements, edge cases, and best practices
4. **Testing**: Suggest test cases and help write tests
5. **Explanations**: Explain concepts, algorithms, and patterns
6. **Refactoring**: Suggest code improvements and optimizations

## Interview Context Awareness
- This is a **${level}-level** interview scenario
- Estimated time: **${scenario.estimatedTime} minutes**
- The candidate should demonstrate **${level}-appropriate** skills
${getPartnerGuidanceForLevel(level)}

## Scenario-Specific Guidance
${getPartnerScenarioGuidance(scenario)}

## Your Constraints
- Be helpful but don't solve the entire problem for them
- Encourage good practices (testing, edge cases, clear naming)
- For ${level} level, ${getLevelExpectations(level)}
- Respect the interview scenario constraints
- Help the candidate think through trade-offs
- Provide code that matches their existing style and patterns

${workspaceContext ? `## Candidate's Codebase
You have access to the candidate's workspace. Here's their codebase context:
\`\`\`
${workspaceContext.substring(0, 4000)}
\`\`\`

When providing code suggestions:
- Match their existing code style and conventions
- Suggest patterns consistent with their codebase
- Reference their existing utilities and functions when appropriate
- Help them maintain consistency across files` : ''}

## Interaction Style
- Be concise and practical
- Provide working code snippets
- Explain complex concepts clearly
- Use examples relevant to the scenario
- Ask clarifying questions when needed
- Encourage the candidate to think through their approach`;

  return partnerPersona;
}

/**
 * Build initial interviewer message with the scenario
 */
export function buildInitialInterviewMessage(
  context: PersonaContext
): string {
  const { scenario } = context;

  switch (scenario.type) {
    case 'dsa':
      return buildDSAIntroduction(scenario as DSAScenario);
    case 'bugfix':
      return buildBugFixIntroduction(scenario as BugFixScenario);
    case 'optimization':
      return buildOptimizationIntroduction(scenario as OptimizationScenario);
    case 'security':
      return buildSecurityIntroduction(scenario as SecurityScenario);
    case 'system-design':
      return buildSystemDesignIntroduction(scenario as SystemDesignScenario);
    default:
      return `Let's begin with today's technical challenge: ${(scenario as any).title}`;
  }
}

// Helper functions

function getLevelGuidance(level: string): string {
  const guidance = {
    intern:
      'Focus on fundamentals, clear thinking, and basic problem-solving. Be patient and educational.',
    junior:
      'Focus on code quality, testing basics, and clear communication. Encourage good practices.',
    mid: 'Expect production-ready code with proper error handling, testing, and consideration of edge cases.',
    senior:
      'Look for system design thinking, performance considerations, scalability, and deep trade-off analysis.',
    staff:
      'Evaluate architectural decisions, cross-system impacts, scalability at scale, and operational excellence.',
    principal:
      'Focus on strategic technical decisions, risk assessment, long-term maintainability, and organizational impact.',
  };
  return guidance[level as keyof typeof guidance] || guidance.mid;
}

function getCompanyStyle(company: string): string {
  const key = company.toLowerCase();
  const styles: Record<string, string> = {
    google:
      '**Google Style**: Emphasize algorithmic complexity, scalability, and rigorous analysis. Expect deep understanding of data structures and algorithms. Ask "what if" questions about scale.',
    meta: '**Meta Style**: Focus on practical problem-solving in large codebases. Look for attention to detail, debugging skills, and ability to work with complex systems.',
    amazon:
      '**Amazon Style**: Value ownership, bias for action, and customer obsession. Look for complete solutions with error handling and operational considerations.',
    netflix:
      '**Netflix Style**: Emphasize resilience, microservices, operational excellence. Expect discussion of monitoring, testing, and failure scenarios.',
    microsoft:
      '**Microsoft Style**: Focus on enterprise-quality code, backward compatibility, and comprehensive testing. Value clear documentation and maintainability.',
    apple:
      '**Apple Style**: Emphasize performance, user experience impact, and attention to detail. Look for elegant, efficient solutions.',
    startup:
      '**Startup Style**: Value pragmatism, speed, and shipping working code. Focus on practical problem-solving over perfect architecture.',
  };

  return (
    styles[key] ||
    `Conduct the interview professionally, adapting to ${company}'s culture and expectations.`
  );
}

function getScenarioGuidance(scenario: Scenario): string {
  const typeDescriptions = {
    dsa: 'This is a Data Structures & Algorithms problem. Focus on algorithmic thinking, complexity analysis, and optimization.',
    bugfix:
      'This is a Bug Fix scenario. The candidate will debug and fix defective code. Observe their debugging methodology and testing approach.',
    optimization:
      'This is a Code Optimization scenario. The candidate will improve performance. Focus on complexity analysis and trade-offs.',
    security:
      'This is a Security scenario. The candidate will identify and fix vulnerabilities. Emphasize security best practices and threat modeling.',
    'system-design':
      'This is a System Design scenario. Focus on architectural decisions, scalability, and trade-offs.',
  };

  return `**Type**: ${typeDescriptions[scenario.type]}
**Difficulty**: ${scenario.difficulty.toUpperCase()}
**Estimated Time**: ${scenario.estimatedTime} minutes
**Problem**: ${scenario.title}`;
}

function getEvaluationCriteria(
  level: string,
  scenarioType: string
): string {
  const baseCriteria = `- Problem Understanding: Do they ask clarifying questions?
- Approach: Is their solution methodology sound?
- Code Quality: Clean, readable, maintainable code
- Communication: Can they explain their thinking clearly?`;

  const levelCriteria = {
    intern: '- Focus on: Basic understanding, willingness to learn, clear thinking',
    junior:
      '- Focus on: Correct implementation, basic testing, code readability',
    mid: '- Focus on: Edge cases, error handling, testing strategy, trade-offs',
    senior:
      '- Focus on: System design considerations, scalability, performance, comprehensive testing',
    staff:
      '- Focus on: Architectural impact, operational concerns, monitoring, team scalability',
    principal:
      '- Focus on: Strategic decisions, risk analysis, long-term maintainability, org impact',
  };

  return `${baseCriteria}\n${levelCriteria[level as keyof typeof levelCriteria] || levelCriteria.mid}`;
}

function getPartnerGuidanceForLevel(level: string): string {
  const guidance = {
    intern:
      '- Provide more educational explanations\n- Help with syntax and basic concepts\n- Be encouraging',
    junior:
      '- Guide towards best practices\n- Help with common patterns\n- Suggest testing approaches',
    mid: '- Expect them to drive the solution\n- Help with edge cases and optimization\n- Suggest advanced patterns when appropriate',
    senior:
      '- Collaborate on architectural decisions\n- Help with performance optimization\n- Discuss trade-offs',
    staff:
      '- Focus on scalability and operational concerns\n- Discuss monitoring and observability\n- Consider cross-system impacts',
    principal:
      '- Engage in strategic technical discussions\n- Consider long-term maintainability\n- Discuss organizational and technical risk',
  };
  return guidance[level as keyof typeof guidance] || guidance.mid;
}

function getLevelExpectations(level: string): string {
  const expectations = {
    intern: 'help them learn fundamentals while working through the problem',
    junior: 'guide them to write clean, working code with basic tests',
    mid: 'expect production-ready code with error handling and comprehensive tests',
    senior:
      'collaborate on system design, performance, and scalability considerations',
    staff:
      'discuss architectural decisions, operational excellence, and scale',
    principal:
      'engage on strategic technical decisions and long-term implications',
  };
  return expectations[level as keyof typeof expectations] || expectations.mid;
}

function getPartnerScenarioGuidance(scenario: Scenario): string {
  switch (scenario.type) {
    case 'dsa':
      const dsa = scenario as DSAScenario;
      return `- Help with algorithm implementation
- Suggest data structures when asked
- Assist with complexity analysis
- Help write test cases
- Optimal complexity: Time ${dsa.optimalComplexity.time}, Space ${dsa.optimalComplexity.space}`;

    case 'bugfix':
      const bugfix = scenario as BugFixScenario;
      return `- Help identify the root cause of bugs
- Suggest debugging approaches
- Assist with writing test cases to reproduce bugs
- Help validate fixes
- Language: ${bugfix.language}`;

    case 'optimization':
      const opt = scenario as OptimizationScenario;
      return `- Help analyze current performance
- Suggest optimization strategies
- Assist with complexity analysis
- Help profile and measure improvements
- Target: ${opt.targetComplexity.time} time, ${opt.targetComplexity.space} space`;

    case 'security':
      const sec = scenario as SecurityScenario;
      return `- Help identify security vulnerabilities
- Suggest security best practices
- Assist with secure coding patterns
- Help validate security fixes
- Vulnerability type: ${sec.vulnerabilityType}`;

    case 'system-design':
      return `- Help with component design
- Suggest architectural patterns
- Assist with trade-off analysis
- Help diagram systems`;

    default:
      return '- Provide general coding assistance';
  }
}

function buildDSAIntroduction(scenario: DSAScenario): string {
  return `Great! Let's start with today's problem.

## ${scenario.title}

${scenario.problemStatement}

${scenario.examples.length > 0 ? `**Examples:**\n${scenario.examples.map((ex, i) => `\nExample ${i + 1}:\nInput: ${ex.input}\nOutput: ${ex.output}${ex.explanation ? `\nExplanation: ${ex.explanation}` : ''}`).join('\n')}` : ''}

${scenario.constraints.length > 0 ? `**Constraints:**\n${scenario.constraints.map((c) => `- ${c}`).join('\n')}` : ''}

Take a moment to understand the problem. Do you have any clarifying questions before we begin?`;
}

function buildBugFixIntroduction(scenario: BugFixScenario): string {
  return `Great! Let's dive into today's debugging challenge.

## ${scenario.title}

${scenario.bugDescription}

Here's the buggy code in **${scenario.language}**:

\`\`\`${scenario.language}
${scenario.buggyCode}
\`\`\`

**Expected Behavior:**
${scenario.expectedBehavior}

**Test Cases:**
${scenario.testCases.map((tc, i) => `${i + 1}. Input: ${tc.input}\n   Expected: ${tc.expectedOutput}${tc.actualOutput ? `\n   Actual: ${tc.actualOutput}` : ''}`).join('\n\n')}

Your task is to:
1. Identify the bug(s)
2. Fix the code
3. Explain the root cause
4. Add tests to prevent regression

Take a look at the code and let me know what you think might be wrong. How would you approach debugging this?`;
}

function buildOptimizationIntroduction(
  scenario: OptimizationScenario
): string {
  return `Great! Today we'll work on a performance optimization challenge.

## ${scenario.title}

${scenario.performanceIssue}

Here's the current implementation in **${scenario.language}**:

\`\`\`${scenario.language}
${scenario.slowCode}
\`\`\`

**Current Complexity:**
- Time: ${scenario.currentComplexity.time}
- Space: ${scenario.currentComplexity.space}

**Target Complexity:**
- Time: ${scenario.targetComplexity.time}
- Space: ${scenario.targetComplexity.space}

Your task is to:
1. Analyze the current performance bottleneck
2. Optimize the code to meet the target complexity
3. Explain the trade-offs of your approach
4. Verify correctness is maintained

What's your initial analysis of the performance issue?`;
}

function buildSecurityIntroduction(scenario: SecurityScenario): string {
  return `Great! Today we have a security-focused challenge.

## ${scenario.title}

We've identified a potential security vulnerability in this code. Here's the vulnerable implementation in **${scenario.language}**:

\`\`\`${scenario.language}
${scenario.vulnerableCode}
\`\`\`

**Security Issue:**
${scenario.vulnerabilityType}

**Attack Vector:**
${scenario.attackVector}

Your task is to:
1. Identify the specific vulnerability
2. Explain how it could be exploited
3. Fix the code to eliminate the vulnerability
4. Suggest additional security measures

Take a look at the code. What security concerns do you notice?`;
}

function buildSystemDesignIntroduction(
  scenario: SystemDesignScenario
): string {
  return `Great! Today we'll work on a system design problem.

## ${scenario.title}

${scenario.designPrompt}

**Functional Requirements:**
${scenario.requirements.functional.map((r) => `- ${r}`).join('\n')}

**Non-Functional Requirements:**
${scenario.requirements.nonFunctional.map((r) => `- ${r}`).join('\n')}

**Constraints:**
${scenario.constraints.map((c) => `- ${c}`).join('\n')}

Let's start by discussing the high-level architecture. How would you approach designing this system?`;
}
