export class Technique {
    constructor(id: string, name: string, description: string, synonyms: string[], details: string, subtechniques: string[], examples: string[],
                weaknesses: string[], CASE_output_classes: string[], references: string[]) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.synonyms = synonyms;
        this.details = details;
        this.subtechniques = subtechniques;
        this.examples = examples;
        this.weaknesses = weaknesses;
        this.CASE_output_classes = CASE_output_classes;
        this.references = references;
    }

    public id: string;
    public name: string;
    public description: string;
    public synonyms: string[];
    public details: string;
    public subtechniques: string[];
    public examples: string[];
    public weaknesses: string[];
    public CASE_output_classes: string[];
    public references: string[];
}