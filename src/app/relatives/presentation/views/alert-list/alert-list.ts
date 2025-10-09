import {Component, computed, inject} from '@angular/core';
import {RelativesStore} from "../../../application/relatives.store";
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";

@Component({
  selector: 'app-alert-list',
    imports: [
        MatCardContent,
        MatCardTitle,
        MatCardHeader,
        MatCard
    ],
  templateUrl: './alert-list.html',
  styleUrl: './alert-list.css'
})
export class AlertList {

    private relativesStore = inject(RelativesStore);

    relative = computed(() => this.relativesStore.selectedRelative());

    ngOnInit() {
        this.relativesStore.loadRelativeById();
    }

    formatDate(date: string) {
        return new Date(date).toLocaleDateString();
    }
}
