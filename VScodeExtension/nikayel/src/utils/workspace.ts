import * as vscode from 'vscode';
import * as path from 'path';

export async function readAllOpenEditors(maxCharsPerFile: number): Promise<{ uri: string; content: string; }[]> {
    const texts: { uri: string; content: string; }[] = [];
    const editors = vscode.window.visibleTextEditors;
    for (const editor of editors) {
        const doc = editor.document;
        // Skip binary/large
        if (doc.languageId === 'binary') { continue; }
        const content = doc.getText();
        texts.push({ uri: doc.uri.toString(), content: content.slice(0, maxCharsPerFile) });
    }
    return texts;
}

export interface WorkspaceContext {
    openFiles: { uri: string; content: string; language: string }[];
    projectStructure: string;
    dependencies: { [key: string]: string } | null;
    totalFiles: number;
    languages: string[];
}

/**
 * Gather comprehensive workspace context for AI awareness
 */
export async function gatherFullWorkspaceContext(
    maxCharsPerFile: number = 4000,
    maxTotalChars: number = 100000
): Promise<WorkspaceContext> {
    const context: WorkspaceContext = {
        openFiles: [],
        projectStructure: '',
        dependencies: null,
        totalFiles: 0,
        languages: [],
    };

    let totalChars = 0;
    const languagesSet = new Set<string>();

    // 1. Read all open/visible editors
    const editors = vscode.window.visibleTextEditors;
    for (const editor of editors) {
        const doc = editor.document;
        if (doc.languageId === 'binary') {
            continue;
        }

        const content = doc.getText();
        const truncatedContent = content.slice(0, maxCharsPerFile);

        if (totalChars + truncatedContent.length <= maxTotalChars) {
            context.openFiles.push({
                uri: doc.uri.toString(),
                content: truncatedContent,
                language: doc.languageId,
            });
            totalChars += truncatedContent.length;
            languagesSet.add(doc.languageId);
        }
    }

    // 2. Get workspace folders and build project structure
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
        const rootFolder = workspaceFolders[0];
        context.projectStructure = await buildProjectStructure(rootFolder.uri);

        // 3. Read package.json or other dependency files
        context.dependencies = await readDependencies(rootFolder.uri);

        // 4. Count total files
        const allFiles = await vscode.workspace.findFiles(
            '**/*',
            '**/node_modules/**'
        );
        context.totalFiles = allFiles.length;
    }

    context.languages = Array.from(languagesSet);

    return context;
}

/**
 * Build a tree structure of the project
 */
async function buildProjectStructure(rootUri: vscode.Uri): Promise<string> {
    try {
        // Get important files and directories (exclude common noise)
        const files = await vscode.workspace.findFiles(
            '**/*',
            '{**/node_modules/**,**/.git/**,**/dist/**,**/build/**,**/.next/**,**/out/**,**/__pycache__/**,**/.pytest_cache/**,**/.venv/**,**/venv/**}'
        );

        // Limit to first 200 files to avoid overwhelming context
        const limitedFiles = files.slice(0, 200);

        // Build tree structure
        const tree: { [key: string]: any } = {};

        for (const file of limitedFiles) {
            const relativePath = vscode.workspace.asRelativePath(file);
            const parts = relativePath.split(path.sep);

            let current = tree;
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                if (i === parts.length - 1) {
                    // File
                    if (!current._files) {
                        current._files = [];
                    }
                    current._files.push(part);
                } else {
                    // Directory
                    if (!current[part]) {
                        current[part] = {};
                    }
                    current = current[part];
                }
            }
        }

        // Convert tree to string representation
        return formatTree(tree, '', true);
    } catch (error) {
        return 'Unable to read project structure';
    }
}

function formatTree(node: any, prefix: string, isRoot: boolean): string {
    let result = '';
    const entries = Object.entries(node);

    // Separate directories and files
    const dirs = entries.filter(([key]) => key !== '_files');
    const files = node._files || [];

    // Add directories
    dirs.forEach(([name, subtree], index) => {
        const isLast = index === dirs.length - 1 && files.length === 0;
        const connector = isLast ? '└── ' : '├── ';
        const newPrefix = isLast ? '    ' : '│   ';

        result += `${prefix}${connector}${name}/\n`;
        result += formatTree(
            subtree,
            prefix + newPrefix,
            false
        );
    });

    // Add files
    files.forEach((file: string, index: number) => {
        const isLast = index === files.length - 1;
        const connector = isLast ? '└── ' : '├── ';
        result += `${prefix}${connector}${file}\n`;
    });

    return result;
}

/**
 * Read dependencies from package.json, requirements.txt, go.mod, etc.
 */
async function readDependencies(
    rootUri: vscode.Uri
): Promise<{ [key: string]: string } | null> {
    try {
        // Try package.json first
        const packageJsonUri = vscode.Uri.joinPath(rootUri, 'package.json');
        try {
            const packageJsonContent = await vscode.workspace.fs.readFile(
                packageJsonUri
            );
            const packageJson = JSON.parse(packageJsonContent.toString());
            return {
                ...packageJson.dependencies,
                ...packageJson.devDependencies,
            };
        } catch (e) {
            // package.json doesn't exist, try others
        }

        // Try requirements.txt for Python
        const requirementsUri = vscode.Uri.joinPath(
            rootUri,
            'requirements.txt'
        );
        try {
            const requirementsContent = await vscode.workspace.fs.readFile(
                requirementsUri
            );
            const lines = requirementsContent.toString().split('\n');
            const deps: { [key: string]: string } = {};
            lines.forEach((line) => {
                const match = line.match(/^([a-zA-Z0-9-_]+)(==|>=|<=)(.+)$/);
                if (match) {
                    deps[match[1]] = match[3];
                }
            });
            return deps;
        } catch (e) {
            // requirements.txt doesn't exist
        }

        // Try go.mod for Go
        const goModUri = vscode.Uri.joinPath(rootUri, 'go.mod');
        try {
            const goModContent = await vscode.workspace.fs.readFile(goModUri);
            // Simple parsing - just extract module lines
            const deps: { [key: string]: string } = {};
            const lines = goModContent.toString().split('\n');
            lines.forEach((line) => {
                const match = line.match(/^\s+(.+)\s+v(.+)$/);
                if (match) {
                    deps[match[1]] = match[2];
                }
            });
            return deps;
        } catch (e) {
            // go.mod doesn't exist
        }

        return null;
    } catch (error) {
        return null;
    }
}

/**
 * Format workspace context for AI prompt
 */
export function formatWorkspaceContextForAI(
    context: WorkspaceContext
): string {
    let formatted = '# Workspace Context\n\n';

    // Project overview
    formatted += `## Project Overview\n`;
    formatted += `- Total files: ${context.totalFiles}\n`;
    formatted += `- Languages: ${context.languages.join(', ') || 'Unknown'}\n\n`;

    // Dependencies
    if (context.dependencies && Object.keys(context.dependencies).length > 0) {
        formatted += `## Dependencies\n`;
        const depEntries = Object.entries(context.dependencies).slice(0, 20);
        depEntries.forEach(([name, version]) => {
            formatted += `- ${name}: ${version}\n`;
        });
        if (Object.keys(context.dependencies).length > 20) {
            formatted += `... and ${Object.keys(context.dependencies).length - 20} more\n`;
        }
        formatted += '\n';
    }

    // Project structure
    if (context.projectStructure) {
        formatted += `## Project Structure\n\`\`\`\n${context.projectStructure.slice(0, 2000)}\`\`\`\n\n`;
    }

    // Open files
    if (context.openFiles.length > 0) {
        formatted += `## Open Files (${context.openFiles.length})\n\n`;
        context.openFiles.forEach((file) => {
            const fileName = file.uri.split('/').pop() || file.uri;
            formatted += `### ${fileName} (${file.language})\n\`\`\`${file.language}\n${file.content}\n\`\`\`\n\n`;
        });
    }

    return formatted;
}


