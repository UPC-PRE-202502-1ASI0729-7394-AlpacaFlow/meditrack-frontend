import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageSwitcher } from '../language-switcher/language-switcher';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { TimeEntity } from '../../../domain/model/time.entity';
import {TimeApiService} from "../../../infrastructure/time-api.service";

@Component({
  selector: 'app-layout',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    TranslatePipe,
    LanguageSwitcher
  ],
  templateUrl: './layout.html',
  standalone: true,
  styleUrls: ['./layout.css']
})
export class Layout implements OnInit, OnDestroy {
  isSidenavOpen = false;
  currentTime: string = '';
  private timeSubscription?: Subscription;

  userRole: string = 'admin-clinica';

  navigationItems: { link: string; icon: string; label: string; roles: string[] }[] = [
    { link: '/doctor-list', label: 'navigation.doctor-list', icon: 'person_add', roles: ['admin-clinica'] },
    { link: '/patient-list', label: 'navigation.patient-list', icon: 'people', roles: ['admin-clinica', 'admin-casa-reposo', 'doctors', 'cuidadores'] },
    { link: '/support', label: 'navigation.support', icon: 'headset_mic', roles: ['admin-clinica', 'admin-casa-reposo', 'doctors', 'cuidadores', 'allegado-premium'] }
  ];

  constructor(private timeApiService: TimeApiService) {}

  ngOnInit(): void {
    this.timeSubscription = interval(1000).subscribe(() => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      this.currentTime = `${hours}:${minutes}:${seconds}`;
    });
  }


  ngOnDestroy(): void {
    if (this.timeSubscription) {
      this.timeSubscription.unsubscribe();
    }
  }

  get filteredNavigationItems() {
    return this.navigationItems.filter(item => item.roles.includes(this.userRole));
  }

  trackByLabel(index: number, item: { link: string; icon: string; label: string }): string {
    return item.label;
  }

  toggleSidenav(): void {
    this.isSidenavOpen = !this.isSidenavOpen;
  }

  closeSidenav(): void {
    this.isSidenavOpen = false;
  }

  // Formatea el objeto TimeEntity a string HH:mm:ss
  private formatTime(time: TimeEntity): string {
    if (time?.datetime) {
      const date = new Date(time.datetime);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${hours}:${minutes}:${seconds}`;
    }
    return '00:00:00';
  }
}
