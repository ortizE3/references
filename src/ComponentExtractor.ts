import * as path from "path";
import vscode from "vscode";
import { glob } from 'glob';
import { Component } from "./Component";
import { FileHelper } from "./FileHelper";
import { ObjectLiteralExpression, Project, SyntaxKind } from "ts-morph";
export class ComponentExtractor {
    private rootPath: string;
    private components: Component[] = [];
    constructor(rootPath: string) {
        this.rootPath = rootPath;
    }

    public async FindAllSelectors(): Promise<Component[]> {
        const project = new Project();
        const componentFiles = await FileHelper.GetComponentFiles(this.rootPath);
        for (const file of componentFiles) {
            if (file.endsWith('.ts')) {
                const filePath = path.join(this.rootPath, file);
                const normalizePath = FileHelper.normalizePath(filePath);
                const tsMorphSourceFile = project.addSourceFileAtPath(normalizePath);
                const classes = tsMorphSourceFile.getClasses();
                for (const sourceClass of classes) {
                    const decorator = sourceClass.getDecorator('Component');
                    if (decorator) {
                        const content = tsMorphSourceFile.getSourceFile();
                        const selector = this.extractComponentSelector(content.getText());
                        this.components.push(new Component(
                            selector, 
                            tsMorphSourceFile,
                            sourceClass,
                            normalizePath));
                    }
                }
            }
        }
        return this.components;
    }

    extractComponentSelector(fileContent: string): string {
        const regex = /@Component\(\s*{[^}]*?\bselector:\s*'([^']*)'/;
        const match = fileContent.match(regex);
        return match ? ("<" + match[1]) : "";
    }

}