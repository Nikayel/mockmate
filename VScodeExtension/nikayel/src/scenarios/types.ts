/**
 * Scenario types for MockMate interview simulations
 */

export type ScenarioType = 'dsa' | 'bugfix' | 'optimization' | 'security' | 'system-design';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export type Company =
  | 'Google'
  | 'Meta'
  | 'Amazon'
  | 'Netflix'
  | 'Apple'
  | 'Microsoft'
  | 'Startup'
  | 'Generic';

export interface BaseScenario {
  id: string;
  title: string;
  type: ScenarioType;
  difficulty: DifficultyLevel;
  companies: Company[]; // Companies known to ask this question
  description: string;
  tags: string[];
  estimatedTime: number; // in minutes
}

export interface DSAScenario extends BaseScenario {
  type: 'dsa';
  problemStatement: string;
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints: string[];
  hints: string[];
  starterCode?: {
    [language: string]: string; // Language -> starter code template
  };
  optimalComplexity: {
    time: string;
    space: string;
  };
}

export interface BugFixScenario extends BaseScenario {
  type: 'bugfix';
  buggyCode: string;
  language: string;
  bugDescription: string;
  expectedBehavior: string;
  testCases: {
    input: string;
    expectedOutput: string;
    actualOutput?: string;
  }[];
  hints: string[];
}

export interface OptimizationScenario extends BaseScenario {
  type: 'optimization';
  slowCode: string;
  language: string;
  performanceIssue: string;
  currentComplexity: {
    time: string;
    space: string;
  };
  targetComplexity: {
    time: string;
    space: string;
  };
  hints: string[];
}

export interface SecurityScenario extends BaseScenario {
  type: 'security';
  vulnerableCode: string;
  language: string;
  vulnerabilityType: string;
  attackVector: string;
  hints: string[];
}

export interface SystemDesignScenario extends BaseScenario {
  type: 'system-design';
  designPrompt: string;
  requirements: {
    functional: string[];
    nonFunctional: string[];
  };
  constraints: string[];
  hints: string[];
}

export type Scenario =
  | DSAScenario
  | BugFixScenario
  | OptimizationScenario
  | SecurityScenario
  | SystemDesignScenario;

export interface ScenarioFilter {
  type?: ScenarioType[];
  difficulty?: DifficultyLevel[];
  companies?: Company[];
  tags?: string[];
  searchQuery?: string;
}
