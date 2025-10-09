import { Injectable } from "@angular/core";
import { RelativesApiEndpoint } from "./relatives-api-endpoint";
import { Observable } from "rxjs";
import { Relative } from "../domain/model/relative.entity";

@Injectable({
    providedIn: "root",
})
export class RelativesApi {
    private readonly relativesEndpoint: RelativesApiEndpoint;

    constructor(relativesEndpoint: RelativesApiEndpoint) {
        this.relativesEndpoint = relativesEndpoint;
    }

    getAllRelatives(): Observable<Relative[]> {
        return this.relativesEndpoint.getAll();
    }

    getRelativeById(id: number): Observable<Relative> {
        return this.relativesEndpoint.getById(id);
    }
}
