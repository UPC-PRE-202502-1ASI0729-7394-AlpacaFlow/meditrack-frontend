import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { TranslatePipe } from '@ngx-translate/core';
import { DoctorsApiEndpoint } from '../../../infrastructure/doctor-api-endpoint';
import { PatientsApiEndpoint } from '../../../infrastructure/patient-api-endpoint';
import { Doctor } from '../../../domain/model/doctor.entity';
import { Patient } from '../../../domain/model/patient.entity';

@Component({
  selector: 'app-doctor-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatSelectModule,
    TranslatePipe
  ],
  templateUrl: './doctor-detail.html',
  styleUrls: ['./doctor-detail.css']
})
export class DoctorDetail implements OnInit {
  doctor: Doctor | null = null;
  assignedPatients: Patient[] = []; // Now using Patient entity
  availablePatients: Patient[] = []; // Now using Patient entity
  selectedPatientId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorsApi: DoctorsApiEndpoint,
    private patientsApi: PatientsApiEndpoint // Injecting PatientsApiEndpoint
  ) {}

  ngOnInit(): void {
    const doctorId = this.route.snapshot.paramMap.get('id');
    if (doctorId) {
      this.loadDoctor(parseInt(doctorId));
    }
  }

  loadDoctor(id: number): void {
    this.doctorsApi.getById(id).subscribe(doctor => {
      this.doctor = doctor;
      this.loadAssignedPatients(id);
      this.loadAvailablePatients();
    });
  }

  loadAssignedPatients(doctorId: number): void {
    this.patientsApi.getByDoctorId(doctorId).subscribe((patients) => {
      this.assignedPatients = patients as Patient[];
    });
  }

  loadAvailablePatients(): void {
    // TEMP: Force organizationId to 1 for assignment testing
    const orgId = 1;
    this.patientsApi.getByOrganizationId(orgId).subscribe((patients) => {
      this.availablePatients = (patients as Patient[]).filter((p: Patient) => !p.doctorId);
    });
  }

  onPatientSelect(patientId: string): void {
    this.selectedPatientId = patientId ? parseInt(patientId) : null;
  }

  onAssignPatient(): void {
    if (this.selectedPatientId && this.doctor) {
      const patient = this.availablePatients.find(p => p.id === this.selectedPatientId);
      if (patient) {
        const updatedPatient = new Patient({
          id: patient.id,
          firstName: patient.firstName,
          lastName: patient.lastName,
          age: patient.age,
          gender: patient.gender,
          weight: patient.weight,
          dni: patient.dni,
          height: patient.height,
          imageUrl: patient.imageUrl,
          organizationId: patient.organizationId,
          doctorId: this.doctor.id
        });
        this.patientsApi.update(updatedPatient, updatedPatient.id).subscribe(() => {
          this.loadAssignedPatients(this.doctor!.id);
          this.loadAvailablePatients();
          this.selectedPatientId = null;
        });
      }
    }
  }

  onBackToList(): void {
    this.router.navigate(['/doctor-list']);
  }

  getPatientFullName(patient: Patient): string {
    return `${patient.firstName} ${patient.lastName}`;
  }

}