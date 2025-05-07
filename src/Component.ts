import { ClassDeclaration, SourceFile } from "ts-morph";

export class Component {

    constructor(
        public selector: string,
        public file: SourceFile,
        public classDeclaration: ClassDeclaration,
        public path: string) { }
}