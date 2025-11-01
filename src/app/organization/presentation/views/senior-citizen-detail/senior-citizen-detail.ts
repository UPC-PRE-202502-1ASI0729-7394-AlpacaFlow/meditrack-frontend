import { Component, OnInit, OnDestroy, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { OrganizationStore } from '../../../application/organization.store';
import { SeniorCitizen } from '../../../domain/model/senior-citizen.entity';
import { Keeper } from '../../../domain/model/keeper.entity';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-senior-citizen-detail',
  standalone: true,
  imports: [CommonModule, MatButtonModule, TranslatePipe],
  templateUrl: './senior-citizen-detail.html',
  styleUrls: ['./senior-citizen-detail.css']
})
export class SeniorCitizenDetail implements OnInit, OnDestroy {
  seniorCitizen = computed(() => this.organizationStore.selectedSeniorCitizen());
  keeper = computed(() => {
    const sc = this.seniorCitizen();
    if (sc && sc.keeperId) {
      return this.organizationStore.keepers().find(k => k.id === sc.keeperId) || null;
    }
    return null;
  });

  private routeSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private organizationStore: OrganizationStore
  ) {}

  ngOnInit(): void {
    // Load senior citizen on init
    this.loadSeniorCitizen();
    
    // Subscribe to route changes to reload senior citizen when navigating between different senior citizens
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const seniorCitizenId = params.get('id');
      if (seniorCitizenId) {
        this.loadSeniorCitizen();
      }
    });
  }

  private loadSeniorCitizen(): void {
    // Get seniorCitizenId from current route (senior-citizens/:id/profile)
    const seniorCitizenId = this.route.snapshot.paramMap.get('id');
    if (seniorCitizenId) {
      const id = Number(seniorCitizenId);
      console.log(`👤 SeniorCitizenDetail: Loading senior citizen ${id}`);
      // Load senior citizen by ID (this will set selectedSeniorCitizen in store)
      this.organizationStore.loadSeniorCitizenById(id);
    }
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  /**
   * Obtiene el userId de la ruta padre (organization/:id)
   */
  private getUserIdFromRoute(): number | null {
    // Intentar obtener el userId de la ruta padre
    let currentRoute: ActivatedRoute | null = this.route.parent;
    while (currentRoute) {
      const params = currentRoute.snapshot.paramMap;
      const userId = params.get('id');
      if (userId) {
        return parseInt(userId, 10);
      }
      currentRoute = currentRoute.parent;
    }
    return null;
  }

  onBackToList(): void {
    const userId = this.getUserIdFromRoute();
    if (userId) {
      this.router.navigate(['/organization', userId, 'senior-citizens']);
    } else {
      console.error('❌ SeniorCitizenDetail: Could not find userId in route');
      // No hardcoded fallback - let the router handle it or show an error
    }
  }
}
