import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { TranslatePipe } from '@ngx-translate/core';
import { Subscription, interval } from 'rxjs';
import { TimeService } from '../../../infrastructure/time.service';
import { LanguageSwitcher } from '../language-switcher/language-switcher';

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
  styleUrl: './layout.css'
})
export class Layout implements OnInit, OnDestroy {
  isSidenavOpen = false;
  currentTime: string = '';
  private timeSubscription?: Subscription;

  /*
  Aca uso userRole como variable fija a admin-clinica, cambiar con un metodo de auth
  para que funcione para otros, por ahora solo funcionara para mostrar admin-clinica
   */
  userRole: string = 'admin-clinica';

  navigationItems: { link: string; icon: string; label: string; roles: string[] }[] = [
    { link: '/doctor-list', label: 'navigation.doctor-list', icon: 'person_add', roles: ['admin-clinica'] },
    { link: '/patients-list', label: 'navigation.patients-list', icon: 'people', roles: ['admin-clinica', 'admin-casa-reposo', 'doctors', 'cuidadores'] },
    { link: '/support', label: 'navigation.support', icon: 'headset_mic', roles: ['admin-clinica', 'admin-casa-reposo', 'doctors', 'cuidadores', 'allegado-premium'] }
  ];



  trackByLabel(index: number, item: { link: string; icon: string; label: string }): string {
    return item.label;
  }


  constructor(private timeService: TimeService) {}

  ngOnInit(): void {
    this.startTimeUpdate();
  }

  ngOnDestroy(): void {
    if (this.timeSubscription) {
      this.timeSubscription.unsubscribe();
    }
  }

  get filteredNavigationItems() {
    return this.navigationItems.filter(item => item.roles.includes(this.userRole));
  }


  private startTimeUpdate(): void {
    this.timeSubscription = this.timeService.getCurrentTime().subscribe(timeData => {
      let serverDate = new Date(timeData.datetime);

      this.timeSubscription = interval(1000).subscribe(() => {
        serverDate = new Date(serverDate.getTime() + 1000);
        this.currentTime = serverDate.toLocaleTimeString('es-PE', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      });
    });
  }


  toggleSidenav(): void {
    this.isSidenavOpen = !this.isSidenavOpen;
  }

  closeSidenav(): void {
    this.isSidenavOpen = false;
  }
}
