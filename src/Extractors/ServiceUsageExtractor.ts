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

    public async findUsedServices(): Promise<Map<string, Component>> {
        const usedServices = new Set<string>();
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
                        const paramType = param.getType().getText();
                        if (this.services.has(paramType)) {
                            usedServices.add(paramType);

                            const references = param.findReferencesAsNodes();
                            if (references.length > 0) {
                                const service = this.services.get(paramType);
                                const alias = param.getName();
                                const content = await FileHelper.GetFileContent(file.getFilePath());
                                const lines = content.split('\n');

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
                            }
                        }
                    }
                }
            }
        }

        // this is a map that checks against the incoming services to see which one is used and which is  not used.
        const unusedServices = new Map<string, Component>();
        for (const [serviceName, service] of this.services.entries()) {
            if (!usedServices.has(serviceName)) {
                unusedServices.set(serviceName, service);
            }
        }

        return unusedServices;
    }
}
