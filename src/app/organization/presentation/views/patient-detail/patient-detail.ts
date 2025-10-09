import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { PatientsApiEndpoint } from '../../../infrastructure/patient-api-endpoint';
import { DoctorsApiEndpoint } from '../../../infrastructure/doctor-api-endpoint';
import { Patient } from '../../../domain/model/patient.entity';
import { Doctor } from '../../../domain/model/doctor.entity';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [CommonModule, MatButtonModule, TranslatePipe],
  templateUrl: './patient-detail.html',
  styleUrls: ['./patient-detail.css']
})
export class PatientDetail implements OnInit {
  patient: Patient | null = null;
  doctor: Doctor | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientsApi: PatientsApiEndpoint,
    private doctorsApi: DoctorsApiEndpoint
  ) {}

  ngOnInit(): void {
    const patientId = this.route.snapshot.paramMap.get('id');
    if (patientId) {
      this.patientsApi.getById(Number(patientId)).subscribe((patient: Patient) => {
        this.patient = patient;
        if (patient.doctorId) {
          this.doctorsApi.getById(patient.doctorId).subscribe((doctor: Doctor) => {
            this.doctor = doctor;
          });
        }
      });
    }
  }

  onBackToList(): void {
    this.router.navigate(['/patient-list']);
  }
}
