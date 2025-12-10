export class Mitigation {
    constructor(id: string, name: string, technique: string, references: string[]) {
        this.id = id;
        this.name = name;
        this.technique = technique;
        this.references = references;
    }

    public id: string;
    public name: string;
    public technique: string;
    public references: string[];
}