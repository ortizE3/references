import { Project, SourceFile, SyntaxKind } from "ts-morph";
import { Component } from "../Models/Component";
import { FileHelper } from "../FileHelper";
import * as path from 'path';
import { TreeItemCollapsibleState } from "vscode";

export class ServiceUsageExtractor {
    services = new Map<string, Component>();
    rootPath: string;
    project: Project;
    constructor(rootPath: string, project: Project, services: Map<string, Component>) {
        this.rootPath = rootPath;
        this.project = project;
        this.services = services;
    }

    public async findUsedServices(): Promise<Map<string, Component>> {
        let content = '';
        let lines: string[] = [];
        const files = this.project.getSourceFiles();
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const fileName = path.basename(file.getFilePath());
                if (!fileName.includes('module')) {

                    const classes = file.getClasses();
                    classes.forEach(async(classDec) => {
                        classDec.getConstructors().forEach(async(constructor) => {
                            constructor.getParameters().forEach(async(param) => {
                                const paramType = param.getType().getText();
                                if (this.services.has(paramType)) {
                                    
                                    const references = param.findReferencesAsNodes();
                                    for (const reference of references) {
                                        const alias = param.getName();
                                        const service = this.services.get(paramType);
                                        if (service) {
                                            if (content.length === 0 && lines.length === 0) {
                                                content = await FileHelper.GetFileContent(file.getFilePath());
                                                lines = content.split('\n');
                                            }
                                            service.uses.push(new Component(
                                                '',
                                                alias,
                                                TreeItemCollapsibleState.None,
                                                file.getFilePath(),
                                                fileName,
                                                lines[reference.getStartLineNumber() - 1],
                                                reference.getStartLineNumber().toString(),
                                                []
                                            ));
                                        }
                                    }

                                }
                            });
                        });
                    });
                }
                content = '';
                lines = [];
            }
        return this.services;
    }
}
