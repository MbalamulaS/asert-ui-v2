import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: '',
})
export class ConfirmDialogComponent implements OnChanges {
  @Input() open: boolean = false;
  @Input() title: string = '';
  @Input() message: string = '';
  @Input() confirmMessage: string = 'CONFIRM';
  @Input() width: string = '400px';
  @Output() onClose = new EventEmitter<boolean>();
  @Output() onConfirm = new EventEmitter<void>();
  private dialogRef!: MatDialogRef<any>;

  constructor(private dialog: MatDialog) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open) {
      this.openDialog();
    } else if (changes['open'] && !this.open && this.dialogRef) {
      this.dialogRef.close();
    }
  }

  openDialog(): void {
    this.dialogRef = this.dialog.open(ConfirmDialogContentComponent, {
      width: this.width,
      disableClose: true,
      data: {
        title: this.title,
        message: this.message,
        confirmMessage: this.confirmMessage,
      },
    });

    this.dialogRef.afterClosed().subscribe((result) => {
      this.onClose.emit(result);
      if (result) {
        this.onConfirm.emit();
      }
    });
  }
}

@Component({
  selector: 'app-confirm-dialog-content',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule, MatIconModule],
  template: `
    <div class="fixed z-50 inset-0 overflow-y-auto">
      <div
        class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
      >
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span
          class="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
          >&#8203;</span
        >

        <div
          class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-headline"
        >
          <div class="hidden sm:block absolute top-0 right-0 pt-4 pr-4">
            <mat-icon
              (click)="onCancelClick()"
              class="text-gray-500 cursor-pointer hover:text-gray-700 mt-2 transition-all"
              >close</mat-icon
            >
          </div>
          <div class="sm:flex sm:items-start">
            <div
              class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 border border-orange-300 rounded-full bg-orange-100 sm:mx-0 sm:h-10 sm:w-10"
            >
              <mat-icon class="text-orange-400">warning</mat-icon>
            </div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3
                class="text-lg leading-6 font-medium text-gray-900"
                id="modal-headline"
              >
                {{ data.title }}
              </h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500">{{ data.message }}</p>
              </div>
            </div>
          </div>
          <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              data-behavior="commit"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              (click)="onConfirmClick()"
            >
              {{ data.confirmMessage }}
            </button>
            <button
              type="button"
              (click)="onCancelClick()"
              data-behavior="cancel"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              CANCEL
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class ConfirmDialogContentComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogContentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  onCancelClick(): void {
    this.dialogRef.close(false);
  }

  onConfirmClick(): void {
    this.dialogRef.close(true);
  }
}
