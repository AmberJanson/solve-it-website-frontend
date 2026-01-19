import { Injectable } from "@angular/core";
import { environment } from "../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Category } from "../models/category.model";

@Injectable({
    providedIn: 'root'
})
export class CategoryService {
    private baseUrl: string = `${environment.base_url}/api/categories`

    constructor(private http: HttpClient) { }

    public getAllCategories(): Observable<Category[]> {
        return this.http.get<Category[]>(this.baseUrl);
    }

    public getCategoryById(id: string): Observable<Category> {
        return this.http.get<Category>(this.baseUrl, {params: {"categoryId": id}});
    }
}