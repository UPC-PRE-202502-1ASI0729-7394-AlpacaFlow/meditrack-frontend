import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { OrganizationStore } from '../../../application/organization.store';
import { SeniorCitizen } from '../../../domain/model/senior-citizen.entity';
import { DeleteSeniorCitizenDialog } from '../../components/delete-senior-citizen-dialog/delete-senior-citizen-dialog';
import { SeniorCitizenItem } from '../../components/senior-citizen-item/senior-citizen-item';
import { SeniorCitizenForm } from '../senior-citizen-form/senior-citizen-form';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-senior-citizen-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    TranslatePipe,
    SeniorCitizenForm,
    SeniorCitizenItem
  ],
  templateUrl: './senior-citizen-list.html',
  styleUrls: ['./senior-citizen-list.css']
})
export class SeniorCitizenListComponent implements OnInit, OnDestroy {
  showForm = false;
  editingSeniorCitizen: SeniorCitizen | null = null;
  private routeSubscription?: Subscription;
  private parentRouteSubscription?: Subscription;

  constructor(
      public organizationStore: OrganizationStore,
      private dialog: MatDialog,
      private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Suscribirse a cambios en el parámetro de la ruta padre (:id en /organization/:id)
    // Esto asegura que cuando cambie la organización, los datos se recarguen
    this.parentRouteSubscription = this.route.parent?.paramMap.subscribe(params => {
      const userIdStr = params.get('id');
      if (userIdStr) {
        const userId = parseInt(userIdStr, 10);
        const organizationId = this.organizationStore.getOrganizationIdByUserId(userId);
        console.log(`🔄 SeniorCitizenList: Detected organization change, reloading senior citizens for userId: ${userId}, organizationId: ${organizationId}`);
        this.organizationStore.loadSeniorCitizensByOrganization(organizationId);
      }
    });

    // También verificar la ruta actual al inicializar
    const parentParams = this.route.parent?.snapshot.paramMap;
    if (parentParams) {
      const userIdStr = parentParams.get('id');
      if (userIdStr) {
        const userId = parseInt(userIdStr, 10);
        const organizationId = this.organizationStore.getOrganizationIdByUserId(userId);
        console.log(`🔄 SeniorCitizenList: Initial load for userId: ${userId}, organizationId: ${organizationId}`);
        this.organizationStore.loadSeniorCitizensByOrganization(organizationId);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.parentRouteSubscription) {
      this.parentRouteSubscription.unsubscribe();
    }
  }

  openAddSeniorCitizenForm(): void {
    this.editingSeniorCitizen = null;
    this.showForm = true;
  }

  openEditSeniorCitizenForm(seniorCitizen: SeniorCitizen): void {
    this.editingSeniorCitizen = seniorCitizen;
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
  }

  onSeniorCitizenSaved(seniorCitizen: SeniorCitizen): void {
    // El store ya fue actualizado en el formulario
    // Solo necesitamos cerrar el formulario
    this.showForm = false;
  }

  onSeniorCitizenRemoved(seniorCitizen: SeniorCitizen): void {
    const dialogRef = this.dialog.open(DeleteSeniorCitizenDialog, {
      width: '400px',
      data: {
        seniorCitizen: seniorCitizen
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.organizationStore.deleteSeniorCitizen(seniorCitizen.id);
      }
    });
  }

  trackById(index: number, seniorCitizen: SeniorCitizen): number {
    return seniorCitizen.id;
  }
}
