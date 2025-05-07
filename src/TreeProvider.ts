import * as vscode from 'vscode';

export class TreeProvider {
    getTreeItem(element: any): vscode.TreeItem {
        return element;
    }
}