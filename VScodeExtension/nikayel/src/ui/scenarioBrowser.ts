/**
 * Scenario Browser UI
 * Allows users to browse and select coding scenarios
 */

import * as vscode from 'vscode';
import {
  Scenario,
  ScenarioType,
  DifficultyLevel,
  Company,
  filterScenarios,
  getAllCompanies,
  getAllTags,
} from '../scenarios';

export class ScenarioBrowserPanel {
  public static currentPanel: ScenarioBrowserPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];
  private _onDidSelectScenario = new vscode.EventEmitter<Scenario>();
  public readonly onDidSelectScenario = this._onDidSelectScenario.event;

  public static createOrShow(extensionUri: vscode.Uri): ScenarioBrowserPanel {
    const column = vscode.ViewColumn.One;

    // If we already have a panel, show it
    if (ScenarioBrowserPanel.currentPanel) {
      ScenarioBrowserPanel.currentPanel._panel.reveal(column);
      return ScenarioBrowserPanel.currentPanel;
    }

    // Otherwise, create a new panel
    const panel = vscode.window.createWebviewPanel(
      'mockmate.scenarioBrowser',
      'Select Interview Scenario',
      column,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    );

    ScenarioBrowserPanel.currentPanel = new ScenarioBrowserPanel(
      panel,
      extensionUri
    );
    return ScenarioBrowserPanel.currentPanel;
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    // Set the webview's initial html content
    this._update();

    // Listen for when the panel is disposed
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Handle messages from the webview
    this._panel.webview.onDidReceiveMessage(
      (message) => {
        switch (message.type) {
          case 'selectScenario':
            this._onDidSelectScenario.fire(message.scenario);
            return;
          case 'filterScenarios':
            this._handleFilter(message.filter);
            return;
        }
      },
      null,
      this._disposables
    );
  }

  public dispose() {
    ScenarioBrowserPanel.currentPanel = undefined;

    this._panel.dispose();

    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  private _handleFilter(filter: any) {
    const scenarios = filterScenarios(filter);
    this._panel.webview.postMessage({
      type: 'scenariosFiltered',
      scenarios,
    });
  }

  private _update() {
    this._panel.webview.html = this._getHtmlForWebview();

    // Send scenarios data to webview after HTML is loaded
    setTimeout(() => {
      const { allScenarios } = require('../scenarios');
      this._panel.webview.postMessage({
        type: 'loadScenarios',
        scenarios: allScenarios
      });
    }, 100);
  }

  private _getHtmlForWebview() {
    const companies = getAllCompanies();
    const tags = getAllTags();

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Select Interview Scenario</title>
    <style>
        * {
            box-sizing: border-box;
        }
        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 20px;
            margin: 0;
        }
        h1 {
            color: var(--vscode-foreground);
            border-bottom: 1px solid var(--vscode-panel-border);
            padding-bottom: 10px;
        }
        .filters {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
            padding: 15px;
            background-color: var(--vscode-editor-inactiveSelectionBackground);
            border-radius: 4px;
        }
        .filter-group {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        .filter-group label {
            font-weight: 600;
            font-size: 0.9em;
            color: var(--vscode-foreground);
        }
        select, input {
            padding: 6px 8px;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 2px;
            font-size: 0.9em;
        }
        select:focus, input:focus {
            outline: 1px solid var(--vscode-focusBorder);
        }
        .search-box {
            width: 100%;
            padding: 8px;
            margin-bottom: 15px;
            font-size: 1em;
        }
        .scenario-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 15px;
        }
        .scenario-card {
            border: 1px solid var(--vscode-panel-border);
            border-radius: 6px;
            padding: 15px;
            background-color: var(--vscode-editor-background);
            cursor: pointer;
            transition: all 0.2s;
        }
        .scenario-card:hover {
            background-color: var(--vscode-list-hoverBackground);
            border-color: var(--vscode-focusBorder);
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        .scenario-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 8px;
        }
        .scenario-title {
            font-weight: 600;
            font-size: 1.1em;
            color: var(--vscode-foreground);
            margin: 0 0 5px 0;
        }
        .scenario-type {
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 0.75em;
            font-weight: 600;
            text-transform: uppercase;
            white-space: nowrap;
        }
        .type-dsa {
            background-color: #0078d4;
            color: white;
        }
        .type-bugfix {
            background-color: #d13438;
            color: white;
        }
        .type-optimization {
            background-color: #ff8c00;
            color: white;
        }
        .type-security {
            background-color: #8b4000;
            color: white;
        }
        .type-system-design {
            background-color: #6a1b9a;
            color: white;
        }
        .difficulty-badge {
            padding: 2px 8px;
            border-radius: 3px;
            font-size: 0.8em;
            font-weight: 500;
            display: inline-block;
            margin-bottom: 8px;
        }
        .difficulty-easy {
            background-color: #107c10;
            color: white;
        }
        .difficulty-medium {
            background-color: #ff8c00;
            color: white;
        }
        .difficulty-hard {
            background-color: #d13438;
            color: white;
        }
        .scenario-description {
            color: var(--vscode-descriptionForeground);
            font-size: 0.9em;
            margin-bottom: 10px;
            line-height: 1.4;
        }
        .scenario-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid var(--vscode-panel-border);
        }
        .meta-item {
            font-size: 0.75em;
            color: var(--vscode-descriptionForeground);
            display: flex;
            align-items: center;
            gap: 4px;
        }
        .companies {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
        }
        .company-tag {
            background-color: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 0.7em;
        }
        .tags {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            margin-top: 8px;
        }
        .tag {
            background-color: var(--vscode-input-background);
            color: var(--vscode-foreground);
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 0.7em;
            border: 1px solid var(--vscode-panel-border);
        }
        .no-results {
            text-align: center;
            padding: 40px;
            color: var(--vscode-descriptionForeground);
            font-size: 1.1em;
        }
        .loading {
            text-align: center;
            padding: 40px;
            color: var(--vscode-descriptionForeground);
        }
    </style>
</head>
<body>
    <h1>🎯 Select Interview Scenario</h1>

    <input
        type="text"
        id="searchBox"
        class="search-box"
        placeholder="Search scenarios by title, description, or tags..."
    />

    <div class="filters">
        <div class="filter-group">
            <label for="typeFilter">Type</label>
            <select id="typeFilter" multiple size="3">
                <option value="">All Types</option>
                <option value="dsa">DSA</option>
                <option value="bugfix">Bug Fix</option>
                <option value="optimization">Optimization</option>
                <option value="security">Security</option>
                <option value="system-design">System Design</option>
            </select>
        </div>

        <div class="filter-group">
            <label for="difficultyFilter">Difficulty</label>
            <select id="difficultyFilter" multiple size="3">
                <option value="">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
            </select>
        </div>

        <div class="filter-group">
            <label for="companyFilter">Company</label>
            <select id="companyFilter" multiple size="3">
                <option value="">All Companies</option>
                ${companies.map((c) => `<option value="${c}">${c}</option>`).join('')}
            </select>
        </div>
    </div>

    <div id="scenarioGrid" class="scenario-grid">
        <div class="loading">Loading scenarios...</div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();

        // Scenarios data will be loaded from the extension
        let allScenarios = [];
        let currentScenarios = allScenarios;

        // Listen for messages from the extension
        window.addEventListener('message', event => {
            const message = event.data;
            if (message.type === 'loadScenarios') {
                allScenarios = message.scenarios;
                currentScenarios = allScenarios;
                renderScenarios(allScenarios);
            }
        });

        function renderScenarios(scenarios) {
            const grid = document.getElementById('scenarioGrid');

            if (scenarios.length === 0) {
                grid.innerHTML = '<div class="no-results">No scenarios match your filters</div>';
                return;
            }

            grid.innerHTML = scenarios.map(scenario => \`
                <div class="scenario-card" onclick="selectScenario('\${scenario.id}')">
                    <div class="scenario-header">
                        <div>
                            <h3 class="scenario-title">\${scenario.title}</h3>
                            <span class="difficulty-badge difficulty-\${scenario.difficulty}">
                                \${scenario.difficulty.toUpperCase()}
                            </span>
                        </div>
                        <span class="scenario-type type-\${scenario.type}">
                            \${scenario.type.toUpperCase()}
                        </span>
                    </div>
                    <p class="scenario-description">\${scenario.description}</p>
                    <div class="scenario-meta">
                        <div class="meta-item">
                            ⏱️ \${scenario.estimatedTime} min
                        </div>
                        <div class="companies">
                            \${scenario.companies.map(c => \`<span class="company-tag">\${c}</span>\`).join('')}
                        </div>
                    </div>
                    <div class="tags">
                        \${scenario.tags.map(tag => \`<span class="tag">#\${tag}</span>\`).join('')}
                    </div>
                </div>
            \`).join('');
        }

        function filterScenarios() {
            const searchQuery = document.getElementById('searchBox').value;
            const types = Array.from(document.getElementById('typeFilter').selectedOptions)
                .map(o => o.value)
                .filter(v => v !== '');
            const difficulties = Array.from(document.getElementById('difficultyFilter').selectedOptions)
                .map(o => o.value)
                .filter(v => v !== '');
            const companies = Array.from(document.getElementById('companyFilter').selectedOptions)
                .map(o => o.value)
                .filter(v => v !== '');

            const filtered = allScenarios.filter(scenario => {
                // Type filter
                if (types.length > 0 && !types.includes(scenario.type)) {
                    return false;
                }

                // Difficulty filter
                if (difficulties.length > 0 && !difficulties.includes(scenario.difficulty)) {
                    return false;
                }

                // Company filter
                if (companies.length > 0) {
                    const hasMatchingCompany = companies.some(c => scenario.companies.includes(c));
                    if (!hasMatchingCompany) {
                        return false;
                    }
                }

                // Search query
                if (searchQuery) {
                    const query = searchQuery.toLowerCase();
                    const matchesTitle = scenario.title.toLowerCase().includes(query);
                    const matchesDescription = scenario.description.toLowerCase().includes(query);
                    const matchesTags = scenario.tags.some(tag => tag.toLowerCase().includes(query));

                    if (!matchesTitle && !matchesDescription && !matchesTags) {
                        return false;
                    }
                }

                return true;
            });

            currentScenarios = filtered;
            renderScenarios(filtered);
        }

        function selectScenario(scenarioId) {
            const scenario = allScenarios.find(s => s.id === scenarioId);
            if (scenario) {
                vscode.postMessage({
                    type: 'selectScenario',
                    scenario: scenario
                });
            }
        }

        // Event listeners
        document.getElementById('searchBox').addEventListener('input', filterScenarios);
        document.getElementById('typeFilter').addEventListener('change', filterScenarios);
        document.getElementById('difficultyFilter').addEventListener('change', filterScenarios);
        document.getElementById('companyFilter').addEventListener('change', filterScenarios);

        // Initial render
        renderScenarios(allScenarios);
    </script>
</body>
</html>`;
  }
}
