import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { OrganizationStore } from '../../../application/organization.store';
import { Doctor } from '../../../domain/model/doctor.entity';
import { Patient } from '../../../domain/model/patient.entity';
import { UnassignPatientDialog } from '../../components/unassign-patient-dialog/unassign-patient-dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-doctor-detail',
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
  templateUrl: './doctor-detail.html',
  styleUrls: ['./doctor-detail.css']
})
export class DoctorDetail implements OnInit {
  doctor: Doctor | null = null;
  assignedPatients: Patient[] = [];
  availablePatients: Patient[] = [];
  selectedPatientId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private organizationStore: OrganizationStore,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const doctorId = this.route.snapshot.paramMap.get('id');
    if (doctorId) {
      this.loadDoctor(parseInt(doctorId));
    }
  }

  loadDoctor(id: number): void {
    // Get doctor from store
    const doctor = this.organizationStore.doctors().find(d => d.id === id);
    if (doctor) {
      this.doctor = doctor;
      this.loadAssignedPatients(id);
      this.loadAvailablePatients(doctor.organizationId);
    }
  }

  loadAssignedPatients(doctorId: number): void {
    // Get patients assigned to this doctor from store
    this.assignedPatients = this.organizationStore.patients().filter(p => p.doctorId === doctorId);
  }

  loadAvailablePatients(organizationId: number): void {
    // Get patients from the same organization that are not assigned to any doctor
    this.availablePatients = this.organizationStore.patients().filter(p => 
      p.organizationId === organizationId && !p.doctorId
    );
  }

  onPatientSelect(patientId: string): void {
    this.selectedPatientId = patientId ? parseInt(patientId) : null;
  }

  onAssignPatient(): void {
    if (this.selectedPatientId && this.doctor) {
      // Use the organization store to assign patient to doctor
      this.organizationStore.assignPatientToDoctor(this.doctor.id, this.selectedPatientId);
      
      // Refresh the lists
      this.loadAssignedPatients(this.doctor.id);
      this.loadAvailablePatients(this.doctor.organizationId);
      this.selectedPatientId = null;
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
      this.router.navigate(['/organization', userId, 'doctors']);
    } else {
      console.error('❌ DoctorDetail: Could not find userId in route, navigating to default');
      this.router.navigate(['/organization/1/doctors']);
    }
  }

  getPatientFullName(patient: Patient): string {
    return patient.fullName;
  }

  onUnassignPatient(patient: Patient, event: Event): void {
    event.stopPropagation();
    
    const dialogRef = this.dialog.open(UnassignPatientDialog, {
      width: '400px',
      data: {
        patient: patient
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.doctor) {
        // Use the organization store to unassign patient from doctor
        this.organizationStore.unassignPatientFromDoctor(this.doctor.id, patient.id);
        
        // Refresh the lists
        this.loadAssignedPatients(this.doctor.id);
        this.loadAvailablePatients(this.doctor.organizationId);
      }
    });
  }

}