export class Weakness {
    constructor(id: string, name: string, details: string, risks: string[], mitigations: string[], references: string[]) {
        this.id = id;
        this.name = name;
        this.details = details;
        this.risks = risks;
        this.mitigations = mitigations
        this.references = references;
    }

    public id: string;
    public name: string;
    public details: string;
    public risks: string[];
    public mitigations: string[];
    public references: string[];
}