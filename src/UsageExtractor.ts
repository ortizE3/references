import { Component } from "./Component";
import { FileHelper } from "./FileHelper";
import * as path from 'path';
import { TreeItemCollapsibleState } from "vscode";
import vscode from "vscode";
export class UsageExtractor {
    components: Component[] = [];
    rootPath: string;
    constructor(rootPath: string, components: Component[]) {
        this.rootPath = rootPath;
        this.components = components;
    }

    public async findUsedSelectors(): Promise<Component[]> {
        const files = FileHelper.GetComponentFiles(this.rootPath, 'ts,html');
        for (const file of files) {
            
            const content = await FileHelper.GetFileContent(path.join(this.rootPath, file));
            const lines = content.split('\n');
            
            for (const component of this.components) {
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    const fileName = path.basename(file);

                    if (component.fileName !== fileName && !line.includes('import') && !fileName.includes('module')) {
                        const html = new RegExp(`<${component.selector}[\\s/>]`);
                        const ts = new RegExp(`\\b${component.className}\\b`);
                        if (html.test(line) || ts.test(line)) {
                            component.uses.push(new Component(
                                '',
                                '',
                                TreeItemCollapsibleState.None,
                                path.join(this.rootPath, file),
                                fileName,
                                line,
                                (i + 1).toString(),
                                []
                            ));
                        }
                    }
                }
            }
        }
        return this.components.filter(component => component.uses.length === 0);
    }

}