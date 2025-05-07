import { Component } from "./Component";
import { FileHelper } from "./FileHelper";
import { Project } from 'ts-morph';
import * as path from 'path';
export class UsageExtractor {
    components: Component[] = [];
    rootPath: string;
    constructor(rootPath: string, components: Component[]) {
        this.rootPath = rootPath;
        this.components = components;
    }

    public async findComponentUsagesInFiles(): Promise<void> {

        
    }
}