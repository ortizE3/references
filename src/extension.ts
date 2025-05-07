// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ComponentExtractor } from './ComponentExtractor';
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	let disposable = vscode.commands.registerCommand('component_element_usage.findComponentUsage', async () => {
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
		const fileExtractor = new ComponentExtractor(workspaceFolder.uri.fsPath);
		var components = await fileExtractor.FindAllSelectors();

		

		// const fileTreeDataProvider = new FileTreeDataProvider();
		// vscode.window.createTreeView(
		// 	"elementUsageExplorer",
		// 	{
		// 		treeDataProvider: fileTreeDataProvider,
		// 		showCollapseAll: true
		// 	}
		// );

		// fileTreeDataProvider.showLoading();

		// setTimeout(() => {
		// 	fileTreeDataProvider.showResults(usages);
		// 	// Show the tree view in the explorer
		// 	vscode.commands.executeCommand('workbench.view.explorer');
		// 	// Move focus to the tree view
		// 	vscode.commands.executeCommand('elementUsageExplorer.focus');
		// }, 100);
	});
	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
