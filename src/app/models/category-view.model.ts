export class CategoryView {
    constructor(id: string, name: string, short_description: string, long_description: string, categories: string[]) {
        this.id = id;
        this.name = name;
        this.short_description = short_description;
        this.long_description = long_description;
        this.categories = categories;
    }

    public id: string;
    public name: string;
    public short_description: string;
    public long_description: string;
    public categories: string[];
}