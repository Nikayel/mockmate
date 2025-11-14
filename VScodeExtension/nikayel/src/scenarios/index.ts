/**
 * Scenario management and filtering
 */

import { dsaScenarios } from './dsa-scenarios';
import { bugFixScenarios } from './bugfix-scenarios';
import {
  Scenario,
  ScenarioFilter,
  ScenarioType,
  DifficultyLevel,
  Company,
} from './types';

// Combine all scenarios
export const allScenarios: Scenario[] = [...dsaScenarios, ...bugFixScenarios];

/**
 * Filter scenarios based on criteria
 */
export function filterScenarios(filter: ScenarioFilter): Scenario[] {
  return allScenarios.filter((scenario) => {
    // Filter by type
    if (filter.type && filter.type.length > 0) {
      if (!filter.type.includes(scenario.type)) {
        return false;
      }
    }

    // Filter by difficulty
    if (filter.difficulty && filter.difficulty.length > 0) {
      if (!filter.difficulty.includes(scenario.difficulty)) {
        return false;
      }
    }

    // Filter by companies
    if (filter.companies && filter.companies.length > 0) {
      const hasMatchingCompany = filter.companies.some((company) =>
        scenario.companies.includes(company)
      );
      if (!hasMatchingCompany) {
        return false;
      }
    }

    // Filter by tags
    if (filter.tags && filter.tags.length > 0) {
      const hasMatchingTag = filter.tags.some((tag) =>
        scenario.tags.includes(tag)
      );
      if (!hasMatchingTag) {
        return false;
      }
    }

    // Search query (search in title and description)
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      const matchesTitle = scenario.title.toLowerCase().includes(query);
      const matchesDescription = scenario.description
        .toLowerCase()
        .includes(query);
      const matchesTags = scenario.tags.some((tag) =>
        tag.toLowerCase().includes(query)
      );

      if (!matchesTitle && !matchesDescription && !matchesTags) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Get scenario by ID
 */
export function getScenarioById(id: string): Scenario | undefined {
  return allScenarios.find((scenario) => scenario.id === id);
}

/**
 * Get all unique companies across scenarios
 */
export function getAllCompanies(): Company[] {
  const companiesSet = new Set<Company>();
  allScenarios.forEach((scenario) => {
    scenario.companies.forEach((company) => companiesSet.add(company));
  });
  return Array.from(companiesSet).sort();
}

/**
 * Get all unique tags across scenarios
 */
export function getAllTags(): string[] {
  const tagsSet = new Set<string>();
  allScenarios.forEach((scenario) => {
    scenario.tags.forEach((tag) => tagsSet.add(tag));
  });
  return Array.from(tagsSet).sort();
}

/**
 * Get scenarios grouped by type
 */
export function getScenariosByType(): Record<ScenarioType, Scenario[]> {
  const grouped: Record<string, Scenario[]> = {};

  allScenarios.forEach((scenario) => {
    if (!grouped[scenario.type]) {
      grouped[scenario.type] = [];
    }
    grouped[scenario.type].push(scenario);
  });

  return grouped as Record<ScenarioType, Scenario[]>;
}

/**
 * Get scenarios grouped by difficulty
 */
export function getScenariosByDifficulty(): Record<
  DifficultyLevel,
  Scenario[]
> {
  const grouped: Record<string, Scenario[]> = {
    easy: [],
    medium: [],
    hard: [],
  };

  allScenarios.forEach((scenario) => {
    grouped[scenario.difficulty].push(scenario);
  });

  return grouped as Record<DifficultyLevel, Scenario[]>;
}

/**
 * Get scenarios for a specific company
 */
export function getScenariosForCompany(company: Company): Scenario[] {
  return allScenarios.filter((scenario) =>
    scenario.companies.includes(company)
  );
}

// Re-export types
export * from './types';
export { dsaScenarios } from './dsa-scenarios';
export { bugFixScenarios } from './bugfix-scenarios';
