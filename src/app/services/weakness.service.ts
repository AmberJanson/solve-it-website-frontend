import { Injectable } from "@angular/core";
import { environment } from "../environments/environment.development";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Weakness } from "../models/weakness.model";

@Injectable({
    providedIn: 'root'
})
export class WeaknessService {
    private baseUrl: string = environment.base_url + "/weaknesses"

    constructor(private http: HttpClient) { }

    public getAllWeaknesses(): Observable<Weakness[]> {
        return this.http.get<Weakness[]>(this.baseUrl);
    }

    public getWeaknessById(id: string): Observable<Weakness> {
        return this.http.get<Weakness>(this.baseUrl, {params: {"weaknessId": id}});
    }
}