import { Injectable, signal } from '@angular/core';
import { Relative } from "../domain/model/relative.entity";
import { RelativesApi } from "../infrastructure/relatives-api";

@Injectable({
    providedIn: 'root'
})
export class RelativesStore {

    private USER_EXAMPLE_DATA_1 = {
        "id": 1,
        "email": "valeria@gmail.com",
        "password": "valeria123",
        "role": "relative",
        "entityId": 1
    };

    private USER_EXAMPLE_DATA_2 = {
        "id": 2,
        "email": "juan@gmail.com",
        "password": "juan123",
        "role": "relative",
        "entityId": 2
    };

    private _selectedRelative = signal<Relative | null>(null);

    constructor(private relativesApi: RelativesApi) {}

    loadRelativeById(userId?: number): void {
        // Escoge qué usuario usar según el parámetro o por defecto
        const user = userId === this.USER_EXAMPLE_DATA_1.id
            ? this.USER_EXAMPLE_DATA_1
            : userId === this.USER_EXAMPLE_DATA_2.id
                ? this.USER_EXAMPLE_DATA_2
                : this.USER_EXAMPLE_DATA_1; // por defecto Valeria

        // Usa el entityId correcto para cargar datos reales
        this.relativesApi.getRelativeById(user.entityId).subscribe({
            next: (relative) => {
                console.log(`✅ Relative loaded for ${user.email}:`, relative);
                this._selectedRelative.set(relative);
            },
            error: (err) => {
                console.error('❌ Error loading relative:', err);
            }
        });
    }

    get selectedRelative() {
        return this._selectedRelative.asReadonly();
    }
}
