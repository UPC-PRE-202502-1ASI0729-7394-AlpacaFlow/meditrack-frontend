import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { OrganizationStore } from '../../../application/organization.store';
import { Patient } from '../../../domain/model/patient.entity';
import { DeletePatientDialog } from '../../components/delete-patient-dialog/delete-patient-dialog';
import {PatientItem} from "../../components/patient-item/patient-item";
import {PatientForm} from "../patient-form/patient-form";
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    TranslatePipe,
    PatientForm,
    PatientItem
  ],
  templateUrl: './patient-list.html',
  styleUrls: ['./patient-list.css']
})
export class PatientListComponent implements OnInit, OnDestroy {
  showForm = false;
  editingPatient: Patient | null = null;
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
        console.log(`🔄 PatientList: Detected organization change, reloading patients for userId: ${userId}, organizationId: ${organizationId}`);
        this.organizationStore.loadPatientsByOrganization(organizationId);
      }
    });

    // También verificar la ruta actual al inicializar
    const parentParams = this.route.parent?.snapshot.paramMap;
    if (parentParams) {
      const userIdStr = parentParams.get('id');
      if (userIdStr) {
        const userId = parseInt(userIdStr, 10);
        const organizationId = this.organizationStore.getOrganizationIdByUserId(userId);
        console.log(`🔄 PatientList: Initial load for userId: ${userId}, organizationId: ${organizationId}`);
        this.organizationStore.loadPatientsByOrganization(organizationId);
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

  openAddPatientForm(): void {
    this.editingPatient = null;
    this.showForm = true;
  }

  openEditPatientForm(patient: Patient): void {
    this.editingPatient = patient;
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
  }

  onPatientSaved(patient: Patient): void {
    // El store ya fue actualizado en el formulario
    // Solo necesitamos cerrar el formulario
    this.showForm = false;
  }
  onPatientRemoved(patient: Patient): void {
    const dialogRef = this.dialog.open(DeletePatientDialog, {
      width: '400px',
      data: {
        patient: patient
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.organizationStore.deletePatient(patient.id);
      }
    });
  }

  trackById(index: number, patient: Patient): number {
    return patient.id;
  }
}
