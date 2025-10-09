import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { PatientsApiEndpoint } from '../../../infrastructure/patient-api-endpoint';
import { Patient } from '../../../domain/model/patient.entity';
import { ConfirmationDialogComponent } from '../confirmation-dialog.component/confirmation-dialog.component';
import {PatientItemComponent} from "../patient-item.component/patient-item.component";
import {PatientFormComponent} from "../patient-form.component/patient-form.component";

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    TranslatePipe,
    PatientFormComponent,
    PatientItemComponent
  ],
  templateUrl: './patient-list.html',
  styleUrls: ['./patient-list.css']
})
export class PatientListComponent implements OnInit {
  patients: Patient[] = [];
  showForm = false;
  editingPatient: Patient | null = null;

  constructor(
      private patientsApi: PatientsApiEndpoint,
      private dialog: MatDialog
  ) {}

  ngOnInit(): void {
  // Cuando haya sesión, pasar organizationId de la sesión aquí
  // Por ahora, puedes pasar un valor fijo o null
  this.loadPatients();
  }

  loadPatients(organizationId?: number): void {
    if (organizationId) {
      this.patientsApi.getByOrganizationId(organizationId).subscribe(patients => this.patients = patients as Patient[]);
    } else {
      this.patientsApi.getAll().subscribe(patients => this.patients = patients as Patient[]);
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
    if (this.editingPatient) {
      this.patients = this.patients.map(p => p.id === patient.id ? patient : p);
    } else {
      this.patients = [...this.patients, patient];
    }
    this.showForm = false;
  }

  onPatientRemoved(patient: Patient): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmar eliminación',
        message: '¿Desea eliminar este paciente?',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.patientsApi.delete(patient.id).subscribe(() => {
          this.patients = this.patients.filter(p => p.id !== patient.id);
        });
      }
    });
  }

  trackById(index: number, patient: Patient): number {
    return patient.id;
  }
}
