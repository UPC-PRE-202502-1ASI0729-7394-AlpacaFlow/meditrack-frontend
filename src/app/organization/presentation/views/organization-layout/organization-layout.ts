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
import {Organization} from "../../../domain/model/organization.entity";

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
  private organizationTypeSignal = signal<'clinica' | 'resident' | null>(null);
  
  userRole: string = '';
  currentUserId: number | null = null;

  private navigationItemsConfig: { 
    route: string; 
    icon: string; 
    label: string; 
    organizationTypes: ('clinica' | 'resident')[];
    roles?: string[]; // Roles que pueden ver esta opción (undefined = todos los roles)
  }[] = [
    { route: '/doctors', label: 'navigation.doctor-list', icon: 'person_add', organizationTypes: ['clinica'], roles: ['admin'] }, // Solo admins pueden ver doctor list
    { route: '/senior-citizens', label: 'navigation.senior-citizen-list', icon: 'people', organizationTypes: ['clinica', 'resident']},
    { route: '/caregivers', label: 'navigation.caregiver-list', icon: 'people', organizationTypes: ['resident'], roles: ['admin'] }, // Solo admins pueden ver caregiver list
    { route: '/support', label: 'navigation.support', icon: 'headset_mic', organizationTypes: ['clinica', 'resident'] }
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
    const organizationType = this.organizationTypeSignal();
    const role = this.userRoleSignal();
    const userId = this.currentUserIdSignal();
    const currentRoute = this.currentRouteSignal(); // Leer el signal para reactividad
    const items = this.navigationItems();
    
    if (!organizationType) {
      console.warn('⚠️ No organization type set yet, returning empty navigation items');
      return [];
    }
    
    // Filter by organization type and role
    let filtered = items.filter(item => {
      // Primero verificar que coincida con el tipo de organización
      if (!item.organizationTypes.includes(organizationType)) {
        return false;
      }
      
      // Si el item tiene roles definidos, verificar que el rol del usuario esté incluido
      if (item.roles && item.roles.length > 0) {
        return item.roles.includes(role);
      }
      
      // Si no tiene roles definidos, está disponible para todos los roles
      return true;
    });
    
    // Si estamos en una ruta de senior citizen, agregar las opciones del senior citizen al sidenav
    const seniorCitizenId = this.getSeniorCitizenIdFromRoute();
    if (seniorCitizenId && userId) {
      const basePath = `/organization/${userId}/senior-citizens/${seniorCitizenId}`;
      const seniorCitizenNavItems: { link: string; icon: string; label: string; organizationTypes: ('clinica' | 'resident')[] }[] = [];
      
      // Todos los usuarios pueden ver el perfil del senior citizen
      seniorCitizenNavItems.push(
        { link: `${basePath}/profile`, icon: 'person', label: 'navigation.seniorCitizenProfile', organizationTypes: ['clinica', 'resident'] }
      );
      
      // Doctors and caregivers can see statistics and alerts when viewing a senior citizen
      if (role === 'caregiver' || role === 'doctor') {
        seniorCitizenNavItems.push(
          { link: `${basePath}/alerts`, icon: 'notifications', label: 'navigation.alerts', organizationTypes: ['clinica', 'resident'] },
          { link: `${basePath}/statistics`, icon: 'bar_chart', label: 'navigation.statistics', organizationTypes: ['clinica', 'resident'] }
        );
      }
      
      const seniorCitizenItems = seniorCitizenNavItems
        .filter(item => item.organizationTypes.includes(organizationType))
        .map(item => ({ ...item, route: '', organizationTypes: item.organizationTypes } as typeof filtered[0]));
      filtered = [...filtered, ...seniorCitizenItems];
    }
    
    console.log(`Filtering navigation for organization type "${organizationType}", role "${role}", seniorCitizenId: ${seniorCitizenId || 'none'}, route: ${currentRoute}:`, {
      totalItems: items.length,
      filteredCount: filtered.length,
      filteredItems: filtered.map(i => i.label)
    });
    return filtered;
  });
  
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
        
        // Use effect to watch organization changes and update type
        // Check organization type periodically or use a computed
        const checkOrgType = () => {
          const orgType = this.organizationStore.getCurrentOrganizationType();
          if (orgType) {
            this.organizationTypeSignal.set(orgType);
            console.log(`Layout: userId=${userId}, role=${this.userRole}, organizationId=${this.organizationStore.getCurrentOrganizationId()}, organizationType=${orgType}`);
            console.log(`Navigation items for organization type "${orgType}":`, this.filteredNavigationItems().map(item => item.label));
          }
        };
        
        // Check immediately
        checkOrgType();
        
        // Check periodically (every 500ms) until we have the type
        const checkInterval = setInterval(() => {
          const orgType = this.organizationStore.getCurrentOrganizationType();
          if (orgType) {
            this.organizationTypeSignal.set(orgType);
            clearInterval(checkInterval);
          }
        }, 500);
        
        // Clean up interval on destroy
        if (this.userContextSubscription) {
          this.userContextSubscription.unsubscribe();
        }
        this.userContextSubscription = new Subscription(() => clearInterval(checkInterval));
        
        const childRoute = this.route.firstChild;
        if (!childRoute || childRoute.snapshot.url.length === 0) {
          // Wait a bit for organization to load before redirecting
          setTimeout(() => {
            this.redirectBasedOnOrganizationType(userId);
          }, 100);
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
             
             const organizationType = this.organizationTypeSignal();
             const userId = this.currentUserIdSignal();
             if (userId && organizationType) {
               const currentUrl = event.url;
               const isValidRoute = this.isValidRouteForOrganizationType(currentUrl, organizationType);
               
               if (!isValidRoute) {
                 this.redirectBasedOnOrganizationType(userId);
                 return;
               }
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
   * Verifica si la ruta actual es válida para el tipo de organización
   */
  private isValidRouteForOrganizationType(url: string, organizationType: 'clinica' | 'resident'): boolean {
    // Rutas permitidas por tipo de organización
    const organizationTypeRoutes: Record<'clinica' | 'resident', string[]> = {
      'clinica': ['doctors', 'senior-citizens', 'support'],
      'resident': ['caregivers', 'senior-citizens', 'support']
    };
    
    const allowedRoutes = organizationTypeRoutes[organizationType] || [];
    
    const baseRouteMatch = url.match(/^\/organization\/(\d+)\/?$/);
    if (baseRouteMatch) {
      return false;
    }
    
    return allowedRoutes.some(route => url.includes(`/${route}`));
  }

  /**
   * Redirige según el tipo de organización al llegar a la ruta base.
   * clinica → /doctors
   * resident → /caregivers
   * También considera el rol del usuario para doctors y caregivers
   */
  private redirectBasedOnOrganizationType(userId: number): void {
    const organizationType = this.organizationTypeSignal();
    const role = this.organizationStore.getCurrentUserRole();
    let redirectPath = '/doctors';
    
    if (organizationType === 'resident') {
      // Para residencias, redirigir a caregivers
      redirectPath = '/caregivers';
    } else if (organizationType === 'clinica') {
      // Para clínicas, redirigir a doctors
      redirectPath = '/doctors';
    } else {
      // Si no hay tipo de organización, usar el rol como fallback
      if (role === 'admin-casa-reposo' || role === 'caregiver') {
        redirectPath = '/caregivers';
      } else if (role === 'admin-clinica' || role === 'doctor') {
        redirectPath = '/doctors';
      }
    }
    
    // Para doctors y caregivers, siempre redirigir a senior-citizens
    if (role === 'doctor' || role === 'caregiver') {
      redirectPath = '/senior-citizens';
    }
    
    const fullPath = `/organization/${userId}${redirectPath}`;
    this.router.navigate([fullPath], { replaceUrl: true });
  }
}