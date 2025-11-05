import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { OrganizationStore } from '../../../application/organization.store';
import { Caregiver } from '../../../domain/model/caregiver.entity';
import { DeleteCaregiverDialog } from '../../components/delete-caregiver-dialog/delete-caregiver-dialog';
import { CaregiverItem } from '../../components/caregiver-item/caregiver-item';
import { CaregiverForm } from '../caregiver-form/caregiver-form';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-caregiver-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    TranslatePipe,
    CaregiverForm,
    CaregiverItem
  ],
  templateUrl: './caregiver-list.html',
  styleUrls: ['./caregiver-list.css']
})
export class CaregiverListComponent implements OnInit, OnDestroy {
  showForm = false;
  editingCaregiver: Caregiver | null = null;
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
        console.log(`🔄 CaregiverList: Detected organization change, reloading caregivers for userId: ${userId}, organizationId: ${organizationId}`);
        this.organizationStore.loadCaregiversByOrganization(organizationId);
      }
    });

    // También verificar la ruta actual al inicializar
    const parentParams = this.route.parent?.snapshot.paramMap;
    if (parentParams) {
      const userIdStr = parentParams.get('id');
      if (userIdStr) {
        const userId = parseInt(userIdStr, 10);
        const organizationId = this.organizationStore.getOrganizationIdByUserId(userId);
        console.log(`🔄 CaregiverList: Initial load for userId: ${userId}, organizationId: ${organizationId}`);
        this.organizationStore.loadCaregiversByOrganization(organizationId);
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

  openAddCaregiverForm(): void {
    this.editingCaregiver = null;
    this.showForm = true;
  }

  openEditCaregiverForm(caregiver: Caregiver): void {
    this.editingCaregiver = caregiver;
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
  }

  onCaregiverSaved(caregiver: Caregiver): void {
    // El store ya fue actualizado en el formulario
    // Recargar la lista de caregivers para asegurar que solo se muestren los de la organización actual
    const userIdStr = this.route.parent?.snapshot.paramMap.get('id');
    if (userIdStr) {
      const userId = parseInt(userIdStr, 10);
      const organizationId = this.organizationStore.getOrganizationIdByUserId(userId);
      if (organizationId > 0) {
        this.organizationStore.loadCaregiversByOrganization(organizationId);
      }
    }
    // Cerrar el formulario
    this.showForm = false;
  }

  onCaregiverRemoved(caregiver: Caregiver): void {
    const dialogRef = this.dialog.open(DeleteCaregiverDialog, {
      width: '400px',
      data: {
        caregiver: caregiver
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.organizationStore.deleteCaregiver(caregiver.id);
      }
    });
  }

  trackById(index: number, caregiver: Caregiver): number {
    return caregiver.id;
  }
}

