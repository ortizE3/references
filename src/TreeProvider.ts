import * as vscode from 'vscode';
import { Component } from './Models/Component';

export class TreeProvider implements vscode.TreeDataProvider<Component> {
    components: Component[];
    constructor(components: Component[]) {
        this.components = components;
    }
    getTreeItem(element: Component): vscode.TreeItem | Thenable<vscode.TreeItem> {
        element.command = {
            command: 'component.openFile',
            title: 'Open File',
            arguments: [element.filePath, element.lineNumber]
        };
        return element;
    }
    getChildren(element?: Component | undefined): vscode.ProviderResult<Component[]> {
        if (element === undefined) {
            return this.components;
        }
        return element.uses;
    }

    

}