import * as path from "path";
import { Component } from "../Models/Component";
import { FileHelper } from "../FileHelper";
import { Project } from "ts-morph";
import { TreeItemCollapsibleState } from "vscode";
import { ServiceClasses } from "../Models/ServiceExtracted";

export class ServiceExtractor {
    private rootPath: string;
    private services = new Map<string, Component>();

    constructor(rootPath: string) {
        this.rootPath = rootPath;
    }

    public FindAllServices(): ServiceClasses {
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
                    const className = sourceClass.getName();
                    const fileName = path.basename(file);

                    if (className) {
                        this.services.set(
                            className,
                            new Component(
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
        return new ServiceClasses(this.services, project);
    }
}