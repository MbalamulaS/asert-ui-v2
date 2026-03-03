import {Component, Inject,} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef,} from '@angular/material/dialog';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  styleUrls: ['./confirmation-dialog.scss'],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <h1 mat-dialog-title class="dialog-title">Are you sure?</h1>
    <!--<div mat-dialog-content>
      <p>You won't be able to revert this process!</p>
    </div>-->
    <div mat-dialog-actions>
      <button mat-button class="mat-primary" (click)="onNoClick()">Cancel</button>
      <button mat-button class="mat-warn" [mat-dialog-close]="true" cdkFocusInitial>Yes!</button>
    </div>
  `,
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
