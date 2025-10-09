import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { NgIf } from "@angular/common";
import { TranslatePipe } from '@ngx-translate/core';
import { PatientsApiEndpoint } from '../../../infrastructure/patient-api-endpoint';
import { Patient } from "../../../domain/model/patient.entity";

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatInputModule, NgIf, TranslatePipe],
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.css']
})
export class PatientFormComponent implements OnChanges {
  @Input() patient: Patient | null = null;
  @Output() saved = new EventEmitter<Patient>();
  @Output() cancel = new EventEmitter<void>();
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  form: FormGroup;

  constructor(private fb: FormBuilder, private patientsApi: PatientsApiEndpoint) {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      age: [null, [Validators.required, Validators.min(0)]],
      gender: ['', Validators.required],
      weight: [null, [Validators.required, Validators.min(0)]],
      height: [null, [Validators.required, Validators.min(0)]],
      dni: ['', Validators.required],
      imageUrl: ['', Validators.required]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['patient'] && this.patient) {
      // Precargar form si estamos editando
      this.form.patchValue({
        firstName: this.patient.firstName,
        lastName: this.patient.lastName,
        age: this.patient.age,
        gender: this.patient.gender,
        weight: this.patient.weight,
        height: this.patient.height,
        dni: this.patient.dni,
        imageUrl: this.patient.imageUrl
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const patient = new Patient({
      id: this.patient ? this.patient.id : 0,
      firstName: this.form.value.firstName,
      lastName: this.form.value.lastName,
      age: Number(this.form.value.age),
      gender: this.form.value.gender,
      weight: Number(this.form.value.weight),
      height: Number(this.form.value.height),
      dni: this.form.value.dni,
      imageUrl: this.form.value.imageUrl || 'https://via.placeholder.com/150x150/CCCCCC/FFFFFF?text=Patient',
      organizationId: 1, // TEMP: organizationId fijo
  doctorId: undefined
    });

    if (this.patient) {
      this.patientsApi.update(patient, this.patient.id).subscribe({

        next: (updated) => this.saved.emit(updated),
        error: (err) => console.error('Error updating patient:', err)
      });
    } else {
      // Crear paciente
      this.patientsApi.create(patient).subscribe({
        next: (created) => this.saved.emit(created),
        error: (err) => console.error('Error creating patient:', err)
      });
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  // Funciones para subir/arrastrar imagen
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) this.processFile(input.files[0]);
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onDragOver(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onFileDrop(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    const dragEvent = event as DragEvent; // casteo seguro
    const dt = dragEvent.dataTransfer;
    if (!dt) return;

    const files = dt.files;
    if (files.length > 0) {
      this.processFile(files[0]);
    }
  }




  private processFile(file: File): void {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => this.form.patchValue({ imageUrl: reader.result as string });
    reader.readAsDataURL(file);
  }
}
