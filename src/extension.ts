import * as vscode from 'vscode';
import { ComponentExtractor } from './ComponentExtractor';

import { UsageExtractor } from './UsageExtractor';
import { TreeProvider } from './TreeProvider';

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('component_element_usage.findComponentUsage', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showInformationMessage('No active editor');
			return;
		}

		vscode.commands.registerCommand('component.openFile', async (uri: vscode.Uri, line: number) => {
			const doc = await vscode.workspace.openTextDocument(uri);
			const editor = await vscode.window.showTextDocument(doc, { preview: false });
			const position = new vscode.Position(line, 0);
			editor.selection = new vscode.Selection(position, position);
			editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
		})

		const document = editor.document;
		const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
		if (!workspaceFolder) {
			vscode.window.showInformationMessage('No workspace folder found');
			return;
		}
		console.log('[Angular Components Finder] finding components and processing them');
		const fileExtractor = new ComponentExtractor(workspaceFolder.uri.fsPath);
		var components = fileExtractor.FindAllSelectors();

		console.log(`[Angular Components Finder] found ${components.length}`);
		const usageExtractor = new UsageExtractor(workspaceFolder.uri.fsPath, components);
		var componentsWithUsages = await usageExtractor.findUsedSelectors();
		
		console.log(`[Angular Components Finder] found ${componentsWithUsages.length} with no references`);
		const fileTreeDataProvider = new TreeProvider(componentsWithUsages);
		vscode.window.createTreeView(
			"elementUsageExplorer",
			{
				treeDataProvider: fileTreeDataProvider,
				showCollapseAll: true,
				
			}
		);


	});
	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
