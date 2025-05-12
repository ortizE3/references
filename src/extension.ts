import * as vscode from 'vscode';
import { ComponentExtractor } from './Extractors/ComponentExtractor';

import { UsageExtractor } from './Extractors/UsageExtractor';
import { TreeProvider } from './TreeProvider';
import { ServiceExtractor } from './Extractors/ServiceExtractor';

export function activate(context: vscode.ExtensionContext) {

	vscode.commands.registerCommand('component.openFile', async (uri: vscode.Uri, line: number) => {
		const doc = await vscode.workspace.openTextDocument(uri);
		const editor = await vscode.window.showTextDocument(doc, { preview: false });
		const position = new vscode.Position(line, 0);
		editor.selection = new vscode.Selection(position, position);
		editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
	});

	let disposableComponent = vscode.commands.registerCommand('component_element_usage.findComponentUsage', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showInformationMessage('No active editor');
			return;
		}

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
		const usageExtractor = new UsageExtractor(workspaceFolder.uri.fsPath, components, []);
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

	let disposableService = vscode.commands.registerCommand('service_element_usage.findServiceUsage', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showInformationMessage('No active editor');
			return;
		}

		const document = editor.document;
		const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
		if (!workspaceFolder) {
			vscode.window.showInformationMessage('No workspace folder found');
			return;
		}
		console.log('[Angular Service Finder] finding components and processing them');
		const fileExtractor = new ServiceExtractor(workspaceFolder.uri.fsPath);
		var services = fileExtractor.FindAllServices();

		console.log(`[Angular Service Finder] found ${services.length}`);
		const usageExtractor = new UsageExtractor(workspaceFolder.uri.fsPath, [], services);
		var serviceWithUsages = await usageExtractor.findUsedServices();

		console.log(`[Angular Service Finder] found ${serviceWithUsages.length} with no references`);
		const fileTreeDataProvider = new TreeProvider(serviceWithUsages);
		vscode.window.createTreeView(
			"elementUsageExplorer",
			{
				treeDataProvider: fileTreeDataProvider,
				showCollapseAll: true,
			}
		);
	});
	context.subscriptions.push(disposableComponent);
	context.subscriptions.push(disposableService);
}

// This method is called when your extension is deactivated
export function deactivate() { }
