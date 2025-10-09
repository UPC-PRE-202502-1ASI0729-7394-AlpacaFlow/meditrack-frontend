import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { NgIf } from "@angular/common";
import { TranslatePipe } from '@ngx-translate/core';
import { DoctorsApiEndpoint } from '../../../infrastructure/doctor-api-endpoint';
import { Doctor } from "../../../domain/model/doctor.entity";

@Component({
  selector: 'app-doctor-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatInputModule, NgIf, TranslatePipe],
  templateUrl: './doctor-form.html',
  styleUrls: ['./doctor-form.css']
})
export class DoctorFormComponent implements OnChanges {
  @Input() doctor: Doctor | null = null;   // 👈 ahora acepta doctor como input
  @Output() saved = new EventEmitter<Doctor>();
  @Output() cancel = new EventEmitter<void>();
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  form: FormGroup;

  constructor(private fb: FormBuilder, private doctorsApi: DoctorsApiEndpoint) {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      age: [null, [Validators.required, Validators.min(18)]],
      email: ['', [Validators.required, Validators.email]],
      specialty: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      imageUrl: ['', Validators.required],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['doctor'] && this.doctor) {
      // precargar el form si estoy editando
      this.form.patchValue({
        firstName: this.doctor.firstName,
        lastName: this.doctor.lastName,
        age: this.doctor.age,
        email: this.doctor.email,
        specialty: this.doctor.specialty,
        phoneNumber: this.doctor.phoneNumber,
        imageUrl: this.doctor.imageUrl,
        organizationId: this.doctor.organizationId
      });
    }
  }

  onSubmit(): void {
    console.log('Form submitted, valid:', this.form.valid);
    console.log('Form values:', this.form.value);
    
    if (this.form.invalid) {
      console.log('Form is invalid, not submitting');
      return;
    }

    const doctor = new Doctor({
      id: this.doctor ? this.doctor.id : 0,
      firstName: this.form.value.firstName!,
      lastName: this.form.value.lastName!,
      age: Number(this.form.value.age),
      email: this.form.value.email!,
      specialty: this.form.value.specialty!,
      phoneNumber: this.form.value.phoneNumber!,
      imageUrl: this.form.value.imageUrl || 'https://via.placeholder.com/150x150/0C7BB5/FFFFFF?text=Dr',
      organizationId: this.form.value.organizationId
    });

    console.log('Creating/updating doctor:', doctor);

    if (this.doctor) {
      // update
      console.log('Updating doctor with ID:', this.doctor.id);
      this.doctorsApi.update(doctor, this.doctor.id).subscribe({
        next: (updated) => {
          console.log('Doctor updated successfully:', updated);
          this.saved.emit(updated);
        },
        error: (error) => {
          console.error('Error updating doctor:', error);
        }
      });
    } else {
      // create
      console.log('Creating new doctor');
      this.doctorsApi.create(doctor).subscribe({
        next: (created) => {
          console.log('Doctor created successfully:', created);
          this.saved.emit(created);
        },
        error: (error) => {
          console.error('Error creating doctor:', error);
        }
      });
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.processFile(input.files[0]);
    }
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.processFile(event.dataTransfer.files[0]);
    }
  }

  private processFile(file: File): void {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        this.form.patchValue({ imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  }
}
