import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { OrganizationStore } from '../../../application/organization.store';
import { Caregiver } from '../../../domain/model/caregiver.entity';
import { SeniorCitizen } from '../../../domain/model/senior-citizen.entity';
import { MatIconModule } from '@angular/material/icon';
import { UnassignSeniorCitizenDialog } from '../../components/unassign-senior-citizen-dialog/unassign-senior-citizen-dialog';

@Component({
  selector: 'app-caregiver-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatSelectModule,
    MatDialogModule,
    TranslatePipe,
    MatIconModule
  ],
  templateUrl: './caregiver-detail.html',
  styleUrls: ['./caregiver-detail.css']
})
export class CaregiverDetail implements OnInit {
  caregiver: Caregiver | null = null;
  assignedSeniorCitizens: SeniorCitizen[] = [];
  availableSeniorCitizens: SeniorCitizen[] = [];
  selectedSeniorCitizenId: number | null = null;
  doctorTitle: string = 'Dr.'; // Default, will be updated from translation

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private organizationStore: OrganizationStore,
    private dialog: MatDialog,
    private translateService: TranslateService
  ) {
    // Load doctor title translation
    this.translateService.get('doctor.title').subscribe(title => {
      this.doctorTitle = title;
    });
  }

  ngOnInit(): void {
    const caregiverId = this.route.snapshot.paramMap.get('id');
    if (caregiverId) {
      this.loadCaregiver(parseInt(caregiverId));
    }
  }

  loadCaregiver(id: number): void {
    // Get caregiver from store
    const caregiver = this.organizationStore.caregivers().find(k => k.id === id);
    if (caregiver) {
      this.caregiver = caregiver;
      this.loadAssignedSeniorCitizens(id);
      this.loadAvailableSeniorCitizens(caregiver.organizationId);
    }
  }

  loadAssignedSeniorCitizens(caregiverId: number): void {
    // Get senior citizens assigned to this caregiver using senior citizen's assignedCaregiverId
    const allSeniorCitizens = this.organizationStore.seniorCitizens();
    this.assignedSeniorCitizens = allSeniorCitizens.filter(sc => 
      sc.assignedCaregiverId === caregiverId
    );
  }

  loadAvailableSeniorCitizens(organizationId: number): void {
    // Get all senior citizens from the same organization
    // Show all of them, but display if they're already assigned to another doctor or caregiver
    const allSeniorCitizens = this.organizationStore.seniorCitizens();
    if (!this.caregiver) {
      this.availableSeniorCitizens = [];
      return;
    }
    // Filter: same organization, exclude only those already assigned to THIS caregiver (they appear in assigned list)
    this.availableSeniorCitizens = allSeniorCitizens.filter(sc => 
      sc.organizationId === organizationId && 
      sc.assignedCaregiverId !== this.caregiver!.id // Not assigned to this caregiver (they're in the assigned list)
    );
  }

  /**
   * Gets the name of the doctor or caregiver assigned to a senior citizen
   * @param seniorCitizen - The senior citizen to check
   * @returns The name of the assigned doctor or caregiver, or null if not assigned
   */
  getAssignedPersonName(seniorCitizen: SeniorCitizen): string | null {
    if (seniorCitizen.assignedDoctorId) {
      const assignedDoctor = this.organizationStore.doctors().find(d => d.id === seniorCitizen.assignedDoctorId);
      if (assignedDoctor) {
        return `${this.doctorTitle} ${assignedDoctor.fullName}`;
      }
    }
    if (seniorCitizen.assignedCaregiverId) {
      const assignedCaregiver = this.organizationStore.caregivers().find(c => c.id === seniorCitizen.assignedCaregiverId);
      if (assignedCaregiver) {
        return assignedCaregiver.fullName;
      }
    }
    return null;
  }

  /**
   * Checks if a senior citizen is already assigned to another doctor or caregiver
   * @param seniorCitizen - The senior citizen to check
   * @returns true if assigned to another doctor or caregiver
   */
  isAssignedToAnother(seniorCitizen: SeniorCitizen): boolean {
    if (!this.caregiver) return false;
    return (seniorCitizen.assignedCaregiverId !== null && seniorCitizen.assignedCaregiverId !== this.caregiver.id) ||
           seniorCitizen.assignedDoctorId !== null;
  }

  /**
   * Checks if the currently selected senior citizen can be assigned
   * @returns true if assignment is blocked (assigned to doctor - exclusión mutua)
   */
  canAssignSelectedSeniorCitizen(): boolean {
    if (!this.selectedSeniorCitizenId) return false;
    const selectedSenior = this.availableSeniorCitizens.find(sc => sc.id === this.selectedSeniorCitizenId);
    if (!selectedSenior) return false;
    // Block if assigned to doctor (exclusión mutua)
    return selectedSenior.assignedDoctorId === null;
  }

  onSeniorCitizenSelect(seniorCitizenId: string): void {
    this.selectedSeniorCitizenId = seniorCitizenId ? parseInt(seniorCitizenId) : null;
  }

  onAssignSeniorCitizen(): void {
    if (this.selectedSeniorCitizenId && this.caregiver) {
      // Check if the selected senior citizen is already assigned to another
      const selectedSenior = this.organizationStore.seniorCitizens().find(sc => sc.id === this.selectedSeniorCitizenId);
      if (selectedSenior && this.isAssignedToAnother(selectedSenior)) {
        // If assigned to another caregiver, allow reassignment (store will handle it)
        // If assigned to a doctor, show error (exclusión mutua)
        if (selectedSenior.assignedDoctorId !== null) {
          this.translateService.get('caregiver.errors.cannotAssignToDoctor').subscribe(message => {
            alert(message);
          });
          return;
        }
      }
      
      try {
        // Use the organization store to assign senior citizen to caregiver
        // This will automatically unassign from previous caregiver if needed
        this.organizationStore.assignSeniorCitizenToCaregiver(this.caregiver.id, this.selectedSeniorCitizenId);
        
        // Refresh the lists after a short delay to allow store to update
        setTimeout(() => {
          this.loadAssignedSeniorCitizens(this.caregiver!.id);
          this.loadAvailableSeniorCitizens(this.caregiver!.organizationId);
        }, 100);
        this.selectedSeniorCitizenId = null;
      } catch (error) {
        console.error('Error assigning senior citizen:', error);
        this.translateService.get('caregiver.errors.assignError').subscribe(message => {
          alert(error instanceof Error ? error.message : message);
        });
      }
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
      this.router.navigate(['/organization', userId, 'caregivers']);
    } else {
      console.error(' CaregiverDetail: Could not find userId in route, navigating to default');
      this.router.navigate(['/organization/2/caregivers']); // Fallback
    }
  }

  getSeniorCitizenFullName(seniorCitizen: SeniorCitizen): string {
    return seniorCitizen.fullName;
  }

  onUnassignSeniorCitizen(seniorCitizen: SeniorCitizen, event: Event): void {
    event.stopPropagation();
    
    const dialogRef = this.dialog.open(UnassignSeniorCitizenDialog, {
      width: '400px',
      data: {
        seniorCitizen: seniorCitizen
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.caregiver) {
        try {
          // Use the organization store to unassign senior citizen from caregiver
          this.organizationStore.unassignSeniorCitizenFromCaregiver(this.caregiver.id, seniorCitizen.id);
          
          // Refresh the lists after a short delay to allow store to update
          setTimeout(() => {
            this.loadAssignedSeniorCitizens(this.caregiver!.id);
            this.loadAvailableSeniorCitizens(this.caregiver!.organizationId);
          }, 100);
        } catch (error) {
          console.error('Error unassigning senior citizen:', error);
          // You could show an error message to the user here
        }
      }
    });
  }
}

