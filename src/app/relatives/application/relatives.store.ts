import {Injectable, signal} from '@angular/core';
import {Relative} from "../domain/model/relative.entity";
import {RelativesApi} from "../infrastructure/relatives-api";

@Injectable({
  providedIn: 'root'
})
export class RelativesStore {

    // const entityId = authStore.currentUser()?.entityId;

    private USER_EXAMPLE_DATA_1 = {
        "id": 1,
        "email": "valeria@gmail.com",
        "password": "valeria123",
        "role": "relative",
        "entityId": 1
    }

    private USER_EXAMPLE_DATA_2 = {
        "id": 1,
        "email": "juan@gmail.com",
        "password": "juan123",
        "role": "relative",
        "entityId": 2
    }

    private _selectedRelative = signal<Relative | null>(null);

    constructor(private relativesApi: RelativesApi) {}

    loadRelativeById() {
        this.relativesApi.getRelativeById(this.USER_EXAMPLE_DATA_1.entityId).subscribe({
            next: (relative) => {
                console.log('✅ Relative loaded:', relative);
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
