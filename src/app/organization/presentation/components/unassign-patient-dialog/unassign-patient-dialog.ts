import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { Patient } from '../../../domain/model/patient.entity';

export interface UnassignPatientDialogData {
  patient: Patient;
}

@Component({
  selector: 'app-unassign-patient-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    TranslatePipe
  ],
  templateUrl: './unassign-patient-dialog.html',
  styleUrls: ['./unassign-patient-dialog.css']
})
export class UnassignPatientDialog {
  constructor(
    public dialogRef: MatDialogRef<UnassignPatientDialog>,
    @Inject(MAT_DIALOG_DATA) public data: UnassignPatientDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
