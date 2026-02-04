import { Injectable } from "@angular/core";
import { environment } from "../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { CategoryView } from "../models/category-view.model";

@Injectable({
    providedIn: 'root'
})
export class CategoryViewService {
    private baseUrl: string = `${environment.base_url}/api/categoryViews`

    constructor(private http: HttpClient) { }

    public getAllCategoryViews(): Observable<CategoryView[]> {
        return this.http.get<CategoryView[]>(this.baseUrl);
    }

    public getCategoryViewById(id: string): Observable<CategoryView> {
        return this.http.get<CategoryView>(this.baseUrl, {params: {"categoryViewId": id}});
    }
}