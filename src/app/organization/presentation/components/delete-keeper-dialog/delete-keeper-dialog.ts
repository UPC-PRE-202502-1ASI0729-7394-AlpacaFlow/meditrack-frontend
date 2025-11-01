import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { Keeper } from '../../../domain/model/keeper.entity';

export interface DeleteKeeperDialogData {
  keeper: Keeper;
}

@Component({
  selector: 'app-delete-keeper-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    TranslatePipe
  ],
  templateUrl: './delete-keeper-dialog.html',
  styleUrls: ['./delete-keeper-dialog.css']
})
export class DeleteKeeperDialog {
  constructor(
    public dialogRef: MatDialogRef<DeleteKeeperDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DeleteKeeperDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
