import * as vscode from 'vscode';

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


