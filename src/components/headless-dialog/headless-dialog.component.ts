import {
  Component,
  ContentChild,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogConfig,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'headless-dialog',
  standalone: true,
  imports: [
    CommonModule,
    NgIconComponent,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
  ],
  viewProviders: [provideIcons({})],
  template: '',
})
export class HeadlessDialogComponent implements OnChanges {
  @Input() open: boolean = false;
  @Input() title: string = '';
  @Input() width: string = '740px';
  @Input() closeOnEscape: boolean = true;
  @Output() onClose = new EventEmitter<boolean>();
  @ContentChild(TemplateRef) content!: TemplateRef<any>;

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
    const dialogConfig = new MatDialogConfig();
    dialogConfig.position = {
      top: '100px',
    };

    this.dialogRef = this.dialog.open(HeadlessDialogContentComponent, {
      width: this.width,
      disableClose: !this.closeOnEscape,
      position: dialogConfig.position,
      data: {
        content: this.content,
      },
    });

    this.dialogRef.afterClosed().subscribe((result) => {
      this.onClose.emit(result);
    });
  }
}

@Component({
  selector: 'headless-dialog-content',
  standalone: true,
  imports: [
    MatIconModule,
    CommonModule,
    NgIconComponent,
    MatButtonModule,
    MatDialogModule,
  ],
  template: `
    <div class="flex flex-col rounded-full overflow-hidden">
      <div mat-dialog-content class="!m-0 !p-0 !rounded-3xl">
        <ng-container *ngTemplateOutlet="data.content"> </ng-container>
      </div>
    </div>
  `,
  styles: [],
})
export class HeadlessDialogContentComponent {
  constructor(
    public dialogRef: MatDialogRef<HeadlessDialogContentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  onCancelClick(): void {
    this.dialogRef.close(false);
  }

  onConfirmClick(): void {
    this.dialogRef.close(true);
  }
}
