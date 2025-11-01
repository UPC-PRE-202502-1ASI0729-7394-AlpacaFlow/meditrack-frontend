import {Component, OnDestroy, OnInit, inject, ChangeDetectorRef, signal, computed} from '@angular/core';
import {MatSidenav, MatSidenavContainer, MatSidenavContent} from "@angular/material/sidenav";
import {TranslatePipe} from "@ngx-translate/core";
import {MatToolbar} from "@angular/material/toolbar";
import {MatIconButton} from "@angular/material/button";
import {MatListItem, MatNavList} from "@angular/material/list";
import {RouterLink, RouterLinkActive, RouterOutlet, Router, NavigationEnd, ActivatedRoute} from "@angular/router";
import {MatIconModule} from "@angular/material/icon";
import {interval, Subscription, filter} from "rxjs";
import {TimeApiService} from "../../../../shared/infrastructure/time-api.service";
import {TimeEntity} from "../../../../shared/domain/model/time.entity";
import {LanguageSwitcher} from "../../../../shared/presentation/components/language-switcher/language-switcher";
import {OrganizationStore} from "../../../application/organization.store";

@Component({
  selector: 'app-organization-layout',
  imports: [
    MatSidenavContent,
    TranslatePipe,
    MatToolbar,
    MatIconButton,
    MatIconModule,
    MatSidenavContainer,
    MatNavList,
    MatListItem,
    RouterLink,
    RouterLinkActive,
    MatSidenav,
    RouterOutlet,
    LanguageSwitcher
  ],
  templateUrl: './organization-layout.html',
  standalone: true,
  styleUrl: './organization-layout.css'
})
export class OrganizationLayout implements OnInit, OnDestroy {
  isSidenavOpen = true; // Abrir el sidenav por defecto
  currentTime: string = '';
  private currentRouteSignal = signal<string>('');
  private timeSubscription?: Subscription;
  private routerSubscription?: Subscription;
  private userContextSubscription?: Subscription;
  private paramMapSubscription?: Subscription;

  private userRoleSignal = signal<string>('');
  private currentUserIdSignal = signal<number | null>(null);
  
  userRole: string = '';
  currentUserId: number | null = null;

  private navigationItemsConfig: { route: string; icon: string; label: string; roles: string[] }[] = [
    { route: '/doctors', label: 'navigation.doctor-list', icon: 'person_add', roles: ['admin-clinica'] },
    { route: '/patients', label: 'navigation.patient-list', icon: 'people', roles: ['admin-clinica', 'doctor'] },
    { route: '/senior-citizens', label: 'navigation.senior-citizen-list', icon: 'people_add', roles: ['admin-casa-reposo', 'keeper']},
    { route: '/keepers', label: 'navigation.keeper-list', icon: 'people', roles: ['admin-casa-reposo']},
    { route: '/support', label: 'navigation.support', icon: 'headset_mic', roles: ['admin-clinica', 'admin-casa-reposo', 'doctor', 'keeper', 'allegado-premium'] }
  ];

  navigationItems = computed(() => {
    const userId = this.currentUserIdSignal();
    const basePath = userId ? `/organization/${userId}` : '/organization';
    return this.navigationItemsConfig.map(item => ({
      ...item,
      link: `${basePath}${item.route}`
    }));
  });

  filteredNavigationItems = computed(() => {
    const role = this.userRoleSignal();
    const userId = this.currentUserIdSignal();
    const currentRoute = this.currentRouteSignal(); // Leer el signal para reactividad
    const items = this.navigationItems();
    
    if (!role) {
      console.warn(' No user role set yet, returning empty navigation items');
      return [];
    }
    
    let filtered = items.filter(item => item.roles.includes(role));
    
    // Si estamos en una ruta de patient, agregar las opciones del patient al sidenav
    const patientId = this.getPatientIdFromRoute();
    if (patientId && userId) {
      const basePath = `/organization/${userId}/patients/${patientId}`;
      const patientNavItems: { link: string; icon: string; label: string; roles: string[] }[] = [
        { link: `${basePath}/profile`, icon: 'person', label: 'navigation.patientProfile', roles: ['admin-clinica', 'doctor'] }
      ];
      
      if (role === 'doctor') {
        patientNavItems.push(
          { link: `${basePath}/statistics`, icon: 'bar_chart', label: 'navigation.statistics', roles: ['doctor'] },
          { link: `${basePath}/alerts`, icon: 'notifications', label: 'navigation.alerts', roles: ['doctor'] }
        );
      }
      
      const patientItems = patientNavItems
        .filter(item => item.roles.includes(role))
        .map(item => ({ ...item, route: '' } as typeof filtered[0]));
      filtered = [...filtered, ...patientItems];
    }
    
    const seniorCitizenId = this.getSeniorCitizenIdFromRoute();
    if (seniorCitizenId && userId) {
      const basePath = `/organization/${userId}/senior-citizens/${seniorCitizenId}`;
      const seniorCitizenNavItems: { link: string; icon: string; label: string; roles: string[] }[] = [
        { link: `${basePath}/profile`, icon: 'person', label: 'navigation.seniorCitizenProfile', roles: ['admin-casa-reposo', 'keeper'] }
      ];
      
      if (role === 'keeper') {
        seniorCitizenNavItems.push(
          { link: `${basePath}/statistics`, icon: 'bar_chart', label: 'navigation.statistics', roles: ['keeper'] },
          { link: `${basePath}/alerts`, icon: 'notifications', label: 'navigation.alerts', roles: ['keeper'] }
        );
      }
      
      const seniorCitizenItems = seniorCitizenNavItems
        .filter(item => item.roles.includes(role))
        .map(item => ({ ...item, route: '' } as typeof filtered[0]));
      filtered = [...filtered, ...seniorCitizenItems];
    }
    
    console.log(`Filtering navigation for role "${role}", patientId: ${patientId || 'none'}, seniorCitizenId: ${seniorCitizenId || 'none'}, route: ${currentRoute}:`, {
      totalItems: items.length,
      filteredCount: filtered.length,
      filteredItems: filtered.map(i => i.label)
    });
    return filtered;
  });
  
       /**
        * Obtiene el patientId de la ruta actual si estamos en una ruta de patient
        */
       private getPatientIdFromRoute(): number | null {
         const url = this.currentRouteSignal() || this.router.url || '';
         const match = url.match(/\/patients\/(\d+)/);
         if (match && match[1]) {
           return parseInt(match[1], 10);
         }
         
         let currentRoute = this.route.firstChild;
         while (currentRoute) {
           const params = currentRoute.snapshot.paramMap;
           const patientId = params.get('patientId');
           if (patientId) {
             return parseInt(patientId, 10);
           }
           currentRoute = currentRoute.firstChild;
         }
         
         return null;
       }

       /**
        * Obtiene el seniorCitizenId de la ruta actual si estamos en una ruta de senior citizen
        */
       private getSeniorCitizenIdFromRoute(): number | null {
         // Usar el signal de la ruta actual
         const url = this.currentRouteSignal() || this.router.url || '';
         const match = url.match(/\/senior-citizens\/(\d+)/);
         if (match && match[1]) {
           return parseInt(match[1], 10);
         }
         
         let currentRoute = this.route.firstChild;
         while (currentRoute) {
           const params = currentRoute.snapshot.paramMap;
           const seniorCitizenId = params.get('id');
           const routePath = currentRoute.snapshot.routeConfig?.path;
           if (seniorCitizenId && routePath?.includes('senior-citizens')) {
             return parseInt(seniorCitizenId, 10);
           }
           currentRoute = currentRoute.firstChild;
         }
         
         return null;
       }

  private organizationStore = inject(OrganizationStore);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  constructor(
    private timeApiService: TimeApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.paramMapSubscription = this.route.paramMap.subscribe(params => {
      const userIdStr = params.get('id');
      if (userIdStr) {
        const userId = parseInt(userIdStr, 10);
        this.currentUserId = userId;
        this.currentUserIdSignal.set(userId);
        this.organizationStore.loadOrganizationData(userId);
        const role = this.organizationStore.getCurrentUserRole();
        this.userRole = role;
        this.userRoleSignal.set(role);
        console.log(`Layout: userId=${userId}, role=${this.userRole}, organizationId=${this.organizationStore.getCurrentOrganizationId()}`);
        console.log(`Navigation items for role "${this.userRole}":`, this.filteredNavigationItems().map(item => item.label));
        
        const childRoute = this.route.firstChild;
        if (!childRoute || childRoute.snapshot.url.length === 0) {
          this.redirectBasedOnRole(userId);
        }
      }
    });
    this.timeSubscription = interval(1000).subscribe(() => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      this.currentTime = `${hours}:${minutes}:${seconds}`;
    });

         this.routerSubscription = this.router.events
           .pipe(filter(event => event instanceof NavigationEnd))
           .subscribe((event: NavigationEnd) => {
             this.currentRouteSignal.set(event.url);
             
             const role = this.organizationStore.getCurrentUserRole();
             const userId = this.currentUserIdSignal();
             if (userId && role) {
               const currentUrl = event.url;
               const isValidRoute = this.isValidRouteForRole(currentUrl, role);
               
               if (!isValidRoute) {
                 this.redirectBasedOnRole(userId);
                 return;
               }
             }
             
             const patientId = this.getPatientIdFromRoute();
             if (patientId && patientId > 0) {
               this.organizationStore.loadPatientById(patientId);
             }
             const seniorCitizenId = this.getSeniorCitizenIdFromRoute();
             if (seniorCitizenId && seniorCitizenId > 0) {
               this.organizationStore.loadSeniorCitizenById(seniorCitizenId);
             }
             this.updateNavigationState();
           });

    this.currentRouteSignal.set(this.router.url);
    this.updateNavigationState();
  }

  ngOnDestroy(): void {
    if (this.timeSubscription) {
      this.timeSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.userContextSubscription) {
      this.userContextSubscription.unsubscribe();
    }
    if (this.paramMapSubscription) {
      this.paramMapSubscription.unsubscribe();
    }
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

  /**
   * Actualiza el estado de navegación basado en la ruta actual
   */
  private updateNavigationState(): void {
  }


  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.closeSidenav();
  }

  isRouteActive(route: string): boolean {
    return this.currentRouteSignal().startsWith(route);
  }

  /**
   * Obtiene el título de la página actual
   */
  getCurrentPageTitle(): string {
    const currentRoute = this.currentRouteSignal();
    const currentItem = this.navigationItems().find(item => 
      currentRoute.startsWith(item.link)
    );
    return currentItem ? currentItem.label : 'navigation.default';
  }

  /**
   * Cambia el rol del usuario
   */
  setUserRole(role: string): void {
    this.userRole = role;
  }

  /**
   * Verifica si la ruta actual es válida para el rol del usuario
   */
  private isValidRouteForRole(url: string, role: string): boolean {
    // Rutas permitidas por rol
    const roleRoutes: Record<string, string[]> = {
      'admin-clinica': ['doctors', 'patients', 'support'],
      'admin-casa-reposo': ['keepers', 'senior-citizens', 'support'],
      'doctor': ['patients', 'support'],
      'keeper': ['senior-citizens', 'support']
    };
    
    const allowedRoutes = roleRoutes[role] || [];
    
    const baseRouteMatch = url.match(/^\/organization\/(\d+)\/?$/);
    if (baseRouteMatch) {
      return false;
    }
    
    return allowedRoutes.some(route => url.includes(`/${route}`));
  }

  /**
   * Redirige según el rol del usuario al llegar a la ruta base.
   * admin-clinica → /doctors
   * admin-casa-reposo → /keepers
   * doctor → /patients
   * keeper → /senior-citizens
   */
  private redirectBasedOnRole(userId: number): void {
    const role = this.organizationStore.getCurrentUserRole();
    let redirectPath = '/doctors';
    
    if (role === 'admin-casa-reposo') {
      redirectPath = '/keepers';
    } else if (role === 'admin-clinica') {
      redirectPath = '/doctors';
    } else if (role === 'doctor') {
      redirectPath = '/patients';
    } else if (role === 'keeper') {
      redirectPath = '/senior-citizens';
    }
    
    const fullPath = `/organization/${userId}${redirectPath}`;
    this.router.navigate([fullPath], { replaceUrl: true });
  }
}