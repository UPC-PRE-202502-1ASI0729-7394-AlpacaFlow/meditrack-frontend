import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';
import { OrganizationStore } from '../../../application/organization.store';
import { Keeper } from "../../../domain/model/keeper.entity";

@Component({
  selector: 'app-keeper-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatInputModule, TranslatePipe],
  templateUrl: './keeper-form.html',
  styleUrls: ['./keeper-form.css']
})
export class KeeperForm implements OnChanges {
  @Input() keeper: Keeper | null = null;
  @Output() saved = new EventEmitter<Keeper>();
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup;
  institutionEmailDomain: string = '';

  constructor(
    private fb: FormBuilder, 
    public organizationStore: OrganizationStore,
  ) {
    // Get organizationId from store (patrón de relatives)
    const organizationId = this.organizationStore.getCurrentOrganizationId() || 0;
    // Get institution email domain for automatic email generation
    this.institutionEmailDomain = this.organizationStore.getInstitutionEmailDomain();
    
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      age: [null, [Validators.required, Validators.min(18)]],
      email: ['', [Validators.required, Validators.email]],
      specialty: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      imageUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i)]],
      organizationId: [organizationId] // Get from store (patrón de relatives)
    });

    // Generate email automatically when firstName or lastName changes (only for new keepers)
    this.form.get('firstName')?.valueChanges.subscribe(() => {
      if (!this.keeper) {
        this.generateInstitutionalEmail();
      }
    });

    this.form.get('lastName')?.valueChanges.subscribe(() => {
      if (!this.keeper) {
        this.generateInstitutionalEmail();
      }
    });
  }

  /**
   * Genera automáticamente el correo institucional basado en el nombre y apellido del keeper.
   * Formato: nombre.apellido@dominio-institucional
   */
  private generateInstitutionalEmail(): void {
    if (!this.institutionEmailDomain) {
      return; // No hay dominio institucional configurado
    }

    const firstName = this.form.get('firstName')?.value?.toLowerCase().trim() || '';
    const lastName = this.form.get('lastName')?.value?.toLowerCase().trim() || '';
    const currentEmail = this.form.get('email')?.value || '';

    // Solo generar el email si hay nombre y apellido, y el email actual no contiene el dominio institucional
    if (firstName && lastName) {
      // Si el usuario ya escribió un email completo que contiene el dominio, no lo sobrescribir
      if (currentEmail && currentEmail.includes('@') && !currentEmail.endsWith(this.institutionEmailDomain)) {
        return; // El usuario está escribiendo un email diferente
      }

      // Generar email: nombre.apellido@dominio-institucional
      const normalizedFirstName = firstName.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Remover acentos
      const normalizedLastName = lastName.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Remover acentos
      const generatedEmail = `${normalizedFirstName}.${normalizedLastName}${this.institutionEmailDomain}`;

      // Solo actualizar si el email actual está vacío o es el generado anteriormente
      if (!currentEmail || currentEmail === this.form.get('email')?.value) {
        this.form.patchValue({ email: generatedEmail }, { emitEvent: false });
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Update institution email domain when organization changes
    if (changes['keeper'] || changes['organizationStore']) {
      this.institutionEmailDomain = this.organizationStore.getInstitutionEmailDomain();
    }

    if (changes['keeper'] && this.keeper) {
      // Precargar form si estamos editando
      this.form.patchValue({
        firstName: this.keeper.firstName,
        lastName: this.keeper.lastName,
        age: this.keeper.age,
        email: this.keeper.email,
        specialty: this.keeper.specialty,
        phoneNumber: this.keeper.phoneNumber,
        imageUrl: this.keeper.imageUrl,
        organizationId: this.keeper.organizationId
      });
    } else if (changes['keeper'] && !this.keeper) {
      // Limpiar el form si estamos creando un nuevo keeper
      // Set organizationId from store (patrón de relatives)
      const organizationId = this.organizationStore.getCurrentOrganizationId() || 0;
      this.institutionEmailDomain = this.organizationStore.getInstitutionEmailDomain();
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
    const userRole = this.organizationStore.getCurrentUserRole();
    console.log('[KeeperForm] Creating keeper with:', { organizationId, userRole });
    if (!organizationId || organizationId === 0) {
      console.error('Cannot create keeper: No user selected or invalid organizationId');
      return;
    }

    // Ensure email has the institutional domain if it doesn't already have one
    let email = this.form.value.email!.trim();
    if (this.institutionEmailDomain && email) {
      // Si el email no contiene @, significa que solo escribió la parte local, agregar el dominio
      if (!email.includes('@')) {
        email = `${email}${this.institutionEmailDomain}`;
      }
      // Si el email contiene @ pero no termina con el dominio institucional, 
      // se respeta el email que el usuario escribió (puede ser un email personal o de otra institución)
    }

    const keeper = new Keeper({
      id: this.keeper ? this.keeper.id : 0,
      firstName: this.form.value.firstName,
      lastName: this.form.value.lastName,
      age: Number(this.form.value.age),
      email: email,
      specialty: this.form.value.specialty,
      phoneNumber: this.form.value.phoneNumber,
      imageUrl: this.form.value.imageUrl || 'https://via.placeholder.com/150x150/CCCCCC/FFFFFF?text=Keeper',
      organizationId: organizationId // Use from user context, not form value
    });

    if (this.keeper) {
      this.organizationStore.updateKeeper(keeper);
    } else {
      // Crear keeper
      this.organizationStore.addKeeper(keeper);
    }
    
    // Emitir el evento para cerrar el formulario
    this.saved.emit(keeper);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
