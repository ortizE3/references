
import { Project } from "ts-morph";
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

    public async findUsedServices(): Promise<{
        unusedServices: Map<string, Component>,
        injectedButUnused: Map<string, Component>
    }> {
        const usedServices = new Set<string>();
        const injectedButUnused = new Map<string, Component>();
        const files = this.project.getSourceFiles();

        for (const file of files) {
            const fileName = path.basename(file.getFilePath());
            if (fileName.includes('module')) continue;

            const classes = file.getClasses();
            for (const classDec of classes) {
                const constructors = classDec.getConstructors();
                for (const constructor of constructors) {
                    const parameters = constructor.getParameters();
                    for (const param of parameters) {
                        const paramSymbol = param.getType().getSymbol();
                        const paramType = paramSymbol?.getName() ?? param.getType().getText();

                        if (this.services.has(paramType)) {
                            const service = this.services.get(paramType);
                            const alias = param.getName();

                            // Check if the alias is used in the class body (excluding constructor)
                            const classBody = classDec.getDescendants();
                            const isUsed = classBody.some(node =>
                                node.getKindName() !== "Constructor" &&
                                node.getText().includes(alias)
                            );

                            if (isUsed) {
                                usedServices.add(paramType);

                                const content = await FileHelper.GetFileContent(file.getFilePath());
                                const lines = content.split('\n');

                                const references = param.findReferencesAsNodes();
                                for (const reference of references) {
                                    service?.uses.push(new Component(
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
                            } else {
                                injectedButUnused.set(paramType, service!);
                            }
                        }
                    }
                }
            }
        }

        // Services that were never injected at all
        const unusedServices = new Map<string, Component>();
        for (const [serviceName, service] of this.services.entries()) {
            if (!usedServices.has(serviceName) && !injectedButUnused.has(serviceName)) {
                unusedServices.set(serviceName, service);
            }
        }

        return {
            unusedServices,
            injectedButUnused
        };
    }
}
