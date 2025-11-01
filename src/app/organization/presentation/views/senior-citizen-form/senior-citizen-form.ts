import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';
import { OrganizationStore } from '../../../application/organization.store';
import { SeniorCitizen } from "../../../domain/model/senior-citizen.entity";

@Component({
  selector: 'app-senior-citizen-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatInputModule, TranslatePipe],
  templateUrl: './senior-citizen-form.html',
  styleUrls: ['./senior-citizen-form.css']
})
export class SeniorCitizenForm implements OnChanges {
  @Input() seniorCitizen: SeniorCitizen | null = null;
  @Output() saved = new EventEmitter<SeniorCitizen>();
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup;

  constructor(
    private fb: FormBuilder, 
    public organizationStore: OrganizationStore
  ) {
    // Get organizationId from store (patrón de relatives)
    const organizationId = this.organizationStore.getCurrentOrganizationId() || 0;
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      age: [null, [Validators.required, Validators.min(0)]],
      gender: ['', Validators.required],
      weight: [null, [Validators.required, Validators.min(0)]],
      height: [null, [Validators.required, Validators.min(0)]],
      dni: ['', Validators.required],
      imageUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i)]],
      deviceIot: ['', Validators.required],
      organizationId: [organizationId] // Get from store (patrón de relatives)
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['seniorCitizen'] && this.seniorCitizen) {
      // Precargar form si estamos editando
      this.form.patchValue({
        fullName: this.seniorCitizen.fullName,
        age: this.seniorCitizen.age,
        gender: this.seniorCitizen.gender,
        weight: this.seniorCitizen.weight,
        height: this.seniorCitizen.height,
        dni: this.seniorCitizen.dni,
        imageUrl: this.seniorCitizen.imageUrl,
        deviceIot: this.seniorCitizen.deviceIot,
        organizationId: this.seniorCitizen.organizationId
      });
    } else if (changes['seniorCitizen'] && !this.seniorCitizen) {
      // Limpiar el form si estamos creando un nuevo senior citizen
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
      console.error('Cannot create senior citizen: No user selected or invalid organizationId');
      return;
    }

    const seniorCitizen = new SeniorCitizen({
      id: this.seniorCitizen ? this.seniorCitizen.id : 0,
      fullName: this.form.value.fullName,
      age: Number(this.form.value.age),
      gender: this.form.value.gender,
      weight: Number(this.form.value.weight),
      height: Number(this.form.value.height),
      dni: this.form.value.dni,
      imageUrl: this.form.value.imageUrl || '/assets/default-senior-citizen.png',
      deviceIot: this.form.value.deviceIot,
      organizationId: organizationId // Use from user context, not form value
    });

    if (this.seniorCitizen) {
      this.organizationStore.updateSeniorCitizen(seniorCitizen);
    } else {
      // Crear senior citizen
      this.organizationStore.addSeniorCitizen(seniorCitizen);
    }
    
    // Emitir el evento para cerrar el formulario
    this.saved.emit(seniorCitizen);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
