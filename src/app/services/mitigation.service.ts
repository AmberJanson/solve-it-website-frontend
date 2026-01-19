import { Injectable } from "@angular/core";
import { environment } from "../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Mitigation } from "../models/mitigation.model";

@Injectable({
    providedIn: 'root'
})
export class MitigationService {
    private baseUrl: string = `${environment.base_url}/api/mitigations`

    constructor(private http: HttpClient) { }

    public getAllMitigations(): Observable<Mitigation[]> {
        return this.http.get<Mitigation[]>(this.baseUrl);
    }

    public getMitigationById(id: string): Observable<Mitigation> {
        return this.http.get<Mitigation>(this.baseUrl, {params: {"mitigationId": id}});
    }
}