export class Category {
    constructor(id: string, name: string, description: string, techniques: string[]) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.techniques = techniques;
    }

    public id: string;
    public name: string;
    public description: string;
    public techniques: string[];
}