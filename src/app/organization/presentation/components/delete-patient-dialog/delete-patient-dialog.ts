import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { Patient } from '../../../domain/model/patient.entity';

export interface DeletePatientDialogData {
  patient: Patient;
}

@Component({
  selector: 'app-delete-patient-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    TranslatePipe
  ],
  templateUrl: './delete-patient-dialog.html',
  styleUrls: ['./delete-patient-dialog.css']
})
export class DeletePatientDialog {
  constructor(
    public dialogRef: MatDialogRef<DeletePatientDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DeletePatientDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
