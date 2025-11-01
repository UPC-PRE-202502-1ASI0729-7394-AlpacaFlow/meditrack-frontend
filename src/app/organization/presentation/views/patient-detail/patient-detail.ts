import { Component, OnInit, OnDestroy, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { OrganizationStore } from '../../../application/organization.store';
import { Patient } from '../../../domain/model/patient.entity';
import { Doctor } from '../../../domain/model/doctor.entity';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [CommonModule, MatButtonModule, TranslatePipe],
  templateUrl: './patient-detail.html',
  styleUrls: ['./patient-detail.css']
})
export class PatientDetail implements OnInit, OnDestroy {
  patient = computed(() => this.organizationStore.selectedPatient());
  doctor = computed(() => {
    const patient = this.patient();
    if (patient && patient.doctorId) {
      return this.organizationStore.doctors().find(d => d.id === patient.doctorId) || null;
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
    // Load patient on init
    this.loadPatient();
    
    // Subscribe to route changes to reload patient when navigating between different patients
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const patientId = params.get('patientId');
      if (patientId) {
        this.loadPatient();
      }
    });
  }

  private loadPatient(): void {
    // Get patientId from current route (patients/:patientId/profile)
    const patientId = this.route.snapshot.paramMap.get('patientId');
    if (patientId) {
      const id = Number(patientId);
      console.log(`👤 PatientDetail: Loading patient ${id}`);
      // Load patient by ID (this will set selectedPatient in store)
      this.organizationStore.loadPatientById(id);
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
    // Navigate up the route tree to find userId (organization/:id)
    let currentRoute: ActivatedRoute | null | undefined = this.route.parent;
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
    // Get userId from the parent route (organization/:id)
    const userId = this.getUserIdFromRoute();
    if (userId) {
      this.router.navigate(['/organization', userId, 'patients']);
    } else {
      console.error('❌ PatientDetail: Could not find userId in route, navigating to default');
      this.router.navigate(['/organization/1/patients']);
    }
  }
}
