import { Injectable } from "@angular/core";
import { environment } from "../environments/environment.development";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Technique } from "../models/technique.model";

@Injectable({
    providedIn: 'root'
})
export class TechniqueService {
    private baseUrl: string = environment.base_url + "/techniques"

    constructor(private http: HttpClient) { }

    public getAllTechniques(): Observable<Technique[]> {
        return this.http.get<Technique[]>(this.baseUrl);
    }

    public getTechniquesById(id: string): Observable<Technique> {
        return this.http.get<Technique>(this.baseUrl, {params: {"techniqueId": id}});
    }
}