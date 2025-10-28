import {Component, OnInit, OnDestroy, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {interval, Subscription} from 'rxjs';
import {ActivatedRoute, RouterLink, RouterOutlet} from "@angular/router";
import {MatToolbar} from "@angular/material/toolbar";
import {LanguageSwitcher} from "../../../../shared/presentation/components/language-switcher/language-switcher";
import {RelativesStore} from "../../../application/relatives.store";

@Component({
    selector: 'app-relative-layout',
    standalone: true,
    imports: [
        CommonModule,
        MatSidenavModule,
        MatListModule,
        MatIconModule,
        MatButtonModule,
        RouterLink,
        RouterOutlet,
        MatToolbar,
        LanguageSwitcher
    ],
    templateUrl: 'relative-layout.html',
    styleUrls: ['relative-layout.css']
})
export class RelativeLayoutComponent implements OnInit, OnDestroy {

    relativeId!: number;
    currentTime: string = '';
    isSidenavOpen = true;

    navigationItems: { link: string; icon: string; label: string }[] = [];

    private routeSub!: Subscription;
    private relativesStore = inject(RelativesStore);

    constructor(private route: ActivatedRoute) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe(params => {
            this.relativeId = params['id'];

            if (this.relativeId) {
                this.relativesStore.loadRelativeById(Number(this.relativeId));
            }

            this.updateNavigationItems();
        });
    }

    private updateNavigationItems() {
        this.navigationItems = [
            { link: `/relative/${this.relativeId}/profile`, icon: 'person', label: 'Profile' },
            { link: `/relative/${this.relativeId}/statistics`, icon: 'bar_chart', label: 'Statistics' },
            { link: `/relative/${this.relativeId}/alerts`, icon: 'notifications', label: 'Alerts' },
            { link: `/relative/${this.relativeId}/support`, icon: 'headset_mic', label: 'Support' }
        ];

    }

    toggleSidenav() {
        this.isSidenavOpen = !this.isSidenavOpen;
    }

    closeSidenav() {
        this.isSidenavOpen = false;
    }

    ngOnDestroy() {
        this.routeSub?.unsubscribe();
    }
}