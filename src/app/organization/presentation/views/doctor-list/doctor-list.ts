import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { DoctorFormComponent } from '../doctor-form/doctor-form';
import { DoctorItem } from '../doctor-item/doctor-item';
import { DoctorsApiEndpoint } from '../../../infrastructure/doctor-api-endpoint';
import { Doctor } from '../../../domain/model/doctor.entity';
import {ConfirmationDialogComponent} from "../confirmation-dialog.component/confirmation-dialog.component";

@Component({
  selector: 'app-doctor-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    TranslatePipe,
    DoctorFormComponent,
    DoctorItem
  ],
  templateUrl: './doctor-list.html',
  styleUrls: ['./doctor-list.css']
})
export class DoctorList implements OnInit {
  doctors: Doctor[] = [];
  showForm = false;
  editingDoctor: Doctor | null = null;

  constructor(
      private doctorsApi: DoctorsApiEndpoint,
      private dialog: MatDialog
  ) {}

  ngOnInit(): void {
  // Cuando haya sesión, pasar organizationId de la sesión aquí
  // Por ahora, puedes pasar un valor fijo o null
  this.loadDoctors();
  }

  loadDoctors(organizationId?: number): void {
    if (organizationId) {
      this.doctorsApi.getByOrganizationId(organizationId).subscribe(doctors => this.doctors = doctors as Doctor[]);
    } else {
      this.doctorsApi.getAll().subscribe(doctors => this.doctors = doctors as Doctor[]);
    }
  }

  openAddDoctorForm(): void {
    this.editingDoctor = null;
    this.showForm = true;
  }

  openEditDoctorForm(doctor: Doctor): void {
    this.editingDoctor = doctor;
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
  }

  onDoctorSaved(doctor: Doctor): void {
    if (this.editingDoctor) {
      this.doctors = this.doctors.map(d => d.id === doctor.id ? doctor : d);
    } else {
      this.doctors = [...this.doctors, doctor];
    }
    this.showForm = false;
  }

  onDoctorRemoved(doctor: Doctor): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmar eliminación',
        message: '¿Desea eliminar este registro?',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.doctorsApi.delete(doctor.id).subscribe(() => {
          this.doctors = this.doctors.filter(d => d.id !== doctor.id);
        });
      }
    });
  }

  trackById(index: number, doctor: Doctor): number {
    return doctor.id;
  }
}
