import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';
import { OrganizationStore } from '../../../application/organization.store';
import { Patient } from "../../../domain/model/patient.entity";

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatInputModule, TranslatePipe],
  templateUrl: './patient-form.html',
  styleUrls: ['./patient-form.css']
})
export class PatientForm implements OnChanges {
  @Input() patient: Patient | null = null;
  @Output() saved = new EventEmitter<Patient>();
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup;

  constructor(private fb: FormBuilder, private organizationStore: OrganizationStore) {
    // Get organizationId from store (patrón de relatives)
    const organizationId = this.organizationStore.getCurrentOrganizationId() || 0;
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      age: [null, [Validators.required, Validators.min(0)]],
      gender: ['', Validators.required],
      weight: [null, [Validators.required, Validators.min(0)]],
      height: [null, [Validators.required, Validators.min(0)]],
      dni: ['', Validators.required],
      imageUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i)]],
      organizationId: [organizationId] // Get from store (patrón de relatives)
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
        imageUrl: this.patient.imageUrl,
        organizationId: this.patient.organizationId
      });
    } else if (changes['patient'] && !this.patient) {
      // Limpiar el form si estamos creando un nuevo paciente
      // Set organizationId from store (patrón de relatives)
      const organizationId = this.organizationStore.getCurrentOrganizationId() || 0;
      this.form.reset();
      this.form.patchValue({ organizationId });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      // Marcar todos los campos como touched para mostrar errores
      this.form.markAllAsTouched();
      return;
    }

    // Get organizationId from store at submit time to ensure it's always correct
    // Patrón de relatives: userId → organizationId (a través del store)
    const organizationId = this.organizationStore.getCurrentOrganizationId();
    if (!organizationId || organizationId === 0) {
      console.error('Cannot create/update patient: No user selected or invalid organizationId');
      return;
    }

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
      organizationId: organizationId, // Use from store, not form value
      doctorId: this.patient?.doctorId
    });

    if (this.patient) {
      this.organizationStore.updatePatient(patient);
    } else {
      // Crear paciente
      this.organizationStore.addPatient(patient);
    }
    
    // Emitir el evento para cerrar el formulario
    this.saved.emit(patient);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
