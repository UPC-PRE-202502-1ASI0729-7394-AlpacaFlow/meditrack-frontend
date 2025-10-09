import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-relative-layout',
    standalone: true,
    imports: [
        CommonModule,
        RouterOutlet,
        RouterLink,
        RouterLinkActive,
        MatSidenavModule,
        MatListModule,
        MatIconModule,
        MatButtonModule
    ],
    templateUrl: 'relative-layout.html',
    styleUrls: ['relative-layout.css']
})
export class RelativeLayoutComponent implements OnInit, OnDestroy {
    isSidenavOpen = true;
    relativeId!: string;
    private routeSub!: Subscription;

    navigationItems: { link: string; icon: string; label: string }[] = [];

    constructor(private route: ActivatedRoute) {}

    ngOnInit() {
         this.routeSub = this.route.params.subscribe(params => {
            this.relativeId = params['id'];
            this.updateNavigationItems();
        });
    }

    ngOnDestroy() {
         if (this.routeSub) {
            this.routeSub.unsubscribe();
        }
    }

    private updateNavigationItems() {
        this.navigationItems = [
            { link: `/relative/${this.relativeId}/profile`, icon: 'person', label: 'Profile' }, // Orthographe cohérente
            { link: `/relative/${this.relativeId}/statistics`, icon: 'bar_chart', label: 'Statistics' },
            { link: `/relative/${this.relativeId}/alerts`, icon: 'notifications', label: 'Alerts' },
            { link: `/relative/${this.relativeId}/support`, icon: 'headset_mic', label: 'Support' },
        ];
    }

    toggleSidenav() {
        this.isSidenavOpen = !this.isSidenavOpen;
    }

    closeSidenav() {
        this.isSidenavOpen = false;
    }
}