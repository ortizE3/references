import * as path from "path";
import { Component } from "../Component";
import { FileHelper } from "../FileHelper";
import { ObjectLiteralExpression, Project, SyntaxKind } from "ts-morph";
import { TreeItemCollapsibleState } from "vscode";
export class ComponentExtractor {
    private rootPath: string;
    private components: Component[] = [];
    constructor(rootPath: string) {
        this.rootPath = rootPath;
    }

    public FindAllSelectors(): Component[] {
        const project = new Project();
        const componentFiles = FileHelper.GetComponentFiles(this.rootPath, '{ts,html}');
        for (const file of componentFiles) {
            if (file.endsWith('.ts')) {
                const filePath = path.join(this.rootPath, file);
                const normalizePath = FileHelper.normalizePath(filePath);
                const tsMorphSourceFile = project.addSourceFileAtPath(normalizePath);
                const classes = tsMorphSourceFile.getClasses();
                for (const sourceClass of classes) {
                    const decorator = sourceClass.getDecorator('Component');
                    if (decorator) {
                        const args = decorator.getArguments();
                        for (const arg of args) {
                            const objLiteral = arg.asKind(SyntaxKind.ObjectLiteralExpression);
                            if (objLiteral) {
                                const selector = objLiteral.getProperty('selector');
                                if (selector) {
                                    const selectorPropertyAssignment = selector.asKind(SyntaxKind.PropertyAssignment);
                                    if (selectorPropertyAssignment) {
                                        const selectorValue = selectorPropertyAssignment.getInitializer()?.getText().replace(/'/g, '').replace(/"/g, '');
                                        const className = sourceClass.getName();
                                        const fileName = path.basename(file);
                                        if (selectorValue && className) {
                                            this.components.push(new Component(
                                                selectorValue,
                                                className,
                                                TreeItemCollapsibleState.Collapsed,
                                                normalizePath,
                                                fileName,
                                                "",
                                                "",
                                                []
                                            ));
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return this.components;
    }
}