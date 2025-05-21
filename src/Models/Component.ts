import { ClassDeclaration, SourceFile } from "ts-morph";
import vscode, { IconPath } from "vscode";
export class Component extends vscode.TreeItem {
    constructor(
        public selector: string = '',
        public className: string = '',
        public collapsibleState: vscode.TreeItemCollapsibleState,
        public filePath: string = '',
        public fileName: string = '',
        public line: string,
        public lineNumber: string,
        public uses: Component[] = []
    ) {
        
        let name = [selector, className, fileName, line.toString(), lineNumber];
        
        super(name.join(" "), collapsibleState);
    }
}