import { Component } from "../Component";
import { FileHelper } from "../FileHelper";
import * as path from 'path';
import { TreeItemCollapsibleState } from "vscode";

export class UsageExtractor {
    components: Component[] = [];
    services: Component[] = [];
    rootPath: string;
    constructor(rootPath: string, components: Component[], services: Component[]) {
        this.rootPath = rootPath;
        this.components = components;
        this.services = services;
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

                    if (component.fileName !== fileName && !line.trim().startsWith('import') && !fileName.includes('module')) {
                        const html = new RegExp(`<${component.selector}(\\s|>|\\n)`);
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

    public async findUsedServices(): Promise<Component[]> {
        const files = FileHelper.GetComponentFiles(this.rootPath, 'ts');
        for (const file of files) {

            const content = await FileHelper.GetFileContent(path.join(this.rootPath, file));
            const lines = content.split('\n');

            for (const service of this.services) {
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    const fileName = path.basename(file);

                    if (service.fileName !== fileName && !line.trim().startsWith('import') && !fileName.includes('module')) {
                        // Look for usage in constructor (injection)
                        const tsServiceUsage = new RegExp(`this.${service.className}`, 'g');
                        // Check if the service is being instantiated directly
                        const newServiceUsage = new RegExp(`new ${service.className}\\(`, 'g');

                        if (tsServiceUsage.test(line) || newServiceUsage.test(line)) {
                            service.uses.push(new Component(
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

        return this.services.filter(service => service.uses.length === 0);
    }
}
