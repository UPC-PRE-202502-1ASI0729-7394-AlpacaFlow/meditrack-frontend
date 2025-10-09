import {Component, computed, inject} from '@angular/core';
import {RelativesStore} from "../../../application/relatives.store";
import {MatList, MatListItem} from "@angular/material/list";
import {MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle} from "@angular/material/card";

@Component({
  selector: 'app-profile',
    standalone: true,
    imports: [
        MatListItem,
        MatList,
        MatCardContent,
        MatCardSubtitle,
        MatCardTitle,
        MatCardHeader,
        MatCard,
    ],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile {
    private relativesStore = inject(RelativesStore);

    relative = computed(() => this.relativesStore.selectedRelative());

    ngOnInit() {
        this.relativesStore.loadRelativeById();
    }
}
