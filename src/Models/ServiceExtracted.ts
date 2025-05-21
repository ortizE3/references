import { Project } from "ts-morph";
import { Component } from "./Component";

export class ServiceClasses {
    services: Map<string, Component>;
    project: Project;
    constructor(services: Map<string, Component>, project: Project) {
        this.services = services;
        this.project = project;
        
    }    
}