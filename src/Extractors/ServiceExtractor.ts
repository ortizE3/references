import * as path from "path";
import { Component } from "../Component";
import { FileHelper } from "../FileHelper";
import { Project } from "ts-morph";
import { TreeItemCollapsibleState } from "vscode";

export class ServiceExtractor {
    private rootPath: string;
    private services: Component[] = [];

    constructor(rootPath: string) {
        this.rootPath = rootPath;
    }

    public FindAllServices(): Component[] {
        const project = new Project();
        const files = FileHelper.GetComponentFiles(this.rootPath, 'ts');

        for (const file of files) {
            const filePath = path.join(this.rootPath, file);
            const normalizedPath = FileHelper.normalizePath(filePath);
            const sourceFile = project.addSourceFileAtPath(normalizedPath);
            const classes = sourceFile.getClasses();
            
            for (const sourceClass of classes) {
                const decorator = sourceClass.getDecorator('Injectable');
                if (decorator) {
                    //TODO we need to figure out how to get references from constructor
                    // const constructors = sourceClass.getConstructors();
                    // for (const constructor of constructors) {
                    //     const parameters = constructor.getParameters();
                    //     for (const parameter of parameters) {
                    //         let constructorParamName = parameter.getName();
                    //     }
                    // }

                    const className = sourceClass.getName();
                    const fileName = path.basename(file);

                    if (className) {
                        this.services.push(new Component(
                            "",
                            className,
                            TreeItemCollapsibleState.Collapsed,
                            normalizedPath,
                            fileName,
                            "",
                            "",
                            []
                        ));
                    }
                }
            }
        }

        return this.services;
    }
}