import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { OrganizationStore } from '../../../application/organization.store';
import { Keeper } from '../../../domain/model/keeper.entity';
import { SeniorCitizen } from '../../../domain/model/senior-citizen.entity';
import { MatIconModule } from '@angular/material/icon';
import { UnassignSeniorCitizenDialog } from '../../components/unassign-senior-citizen-dialog/unassign-senior-citizen-dialog';

@Component({
  selector: 'app-keeper-detail',
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
  templateUrl: './keeper-detail.html',
  styleUrls: ['./keeper-detail.css']
})
export class KeeperDetail implements OnInit {
  keeper: Keeper | null = null;
  assignedSeniorCitizens: SeniorCitizen[] = [];
  availableSeniorCitizens: SeniorCitizen[] = [];
  selectedSeniorCitizenId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private organizationStore: OrganizationStore,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const keeperId = this.route.snapshot.paramMap.get('id');
    if (keeperId) {
      this.loadKeeper(parseInt(keeperId));
    }
  }

  loadKeeper(id: number): void {
    // Get keeper from store
    const keeper = this.organizationStore.keepers().find(k => k.id === id);
    if (keeper) {
      this.keeper = keeper;
      this.loadAssignedSeniorCitizens(id);
      this.loadAvailableSeniorCitizens(keeper.organizationId);
    }
  }

  loadAssignedSeniorCitizens(keeperId: number): void {
    // Get senior citizens assigned to this keeper from store
    this.assignedSeniorCitizens = this.organizationStore.seniorCitizens().filter(
      sc => sc.keeperId === keeperId
    );
  }

  loadAvailableSeniorCitizens(organizationId: number): void {
    // Get senior citizens from the same organization that are not assigned to any keeper
    this.availableSeniorCitizens = this.organizationStore.seniorCitizens().filter(sc => 
      sc.organizationId === organizationId && !sc.keeperId
    );
  }

  onSeniorCitizenSelect(seniorCitizenId: string): void {
    this.selectedSeniorCitizenId = seniorCitizenId ? parseInt(seniorCitizenId) : null;
  }

  onAssignSeniorCitizen(): void {
    if (this.selectedSeniorCitizenId && this.keeper) {
      try {
        // Use the organization store to assign senior citizen to keeper
        this.organizationStore.assignSeniorCitizenToKeeper(this.keeper.id, this.selectedSeniorCitizenId);
        
        // Refresh the lists
        this.loadAssignedSeniorCitizens(this.keeper.id);
        this.loadAvailableSeniorCitizens(this.keeper.organizationId);
        this.selectedSeniorCitizenId = null;
      } catch (error) {
        console.error('Error assigning senior citizen:', error);
        // You could show an error message to the user here
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
      this.router.navigate(['/organization', userId, 'keepers']);
    } else {
      console.error('❌ KeeperDetail: Could not find userId in route, navigating to default');
      this.router.navigate(['/organization/2/keepers']); // Fallback
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
      if (result && this.keeper) {
        try {
          // Use the organization store to unassign senior citizen from keeper
          this.organizationStore.unassignSeniorCitizenFromKeeper(this.keeper.id, seniorCitizen.id);
          
          // Refresh the lists
          this.loadAssignedSeniorCitizens(this.keeper.id);
          this.loadAvailableSeniorCitizens(this.keeper.organizationId);
        } catch (error) {
          console.error('Error unassigning senior citizen:', error);
          // You could show an error message to the user here
        }
      }
    });
  }
}
