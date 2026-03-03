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
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  viewProviders: [],
  template: '',
})
export class DialogComponent implements OnChanges {
  @Input() open: boolean = false;
  @Input() title: string = '';
  @Input() width: string = '740px';
  @Input() height: string = 'auto'; // New input property for height
  @Input() full: boolean = false;
  @Input() showFullScreen: boolean = false; // New input property
  @Input() disableClose: boolean = false; // New input property to make dialog unclosable
  @Input() headerBgColor: string = 'bg-primary-400'; // Customizable header background
  @Input() headerTextColor: string = 'text-white'; // Customizable header text color
  @Output() onClose = new EventEmitter<boolean>();
  @ContentChild(TemplateRef) content!: TemplateRef<any>;

  private dialogRef!: MatDialogRef<any>;
  private isFullScreen: boolean = false;

  constructor(private dialog: MatDialog) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open) {
      this.isFullScreen = this.full;
      this.openDialog();
    } else if (changes['open'] && !this.open && this.dialogRef) {
      this.dialogRef.close();
    }

    if (changes['full'] && this.dialogRef) {
      this.isFullScreen = this.full;
      this.updateDialogSize();
    }

    // Handle disableClose changes
    if (changes['disableClose'] && this.dialogRef) {
      this.dialogRef.disableClose = this.disableClose;
      // Update the dialog data
      this.dialogRef.componentInstance.data.disableClose = this.disableClose;
    }
  }

  openDialog(): void {
    this.dialogRef = this.dialog.open(DialogContentComponent, {
      width: this.isFullScreen ? '100vw' : this.width,
      height: this.isFullScreen ? '100vh' : this.height,
      maxWidth: this.isFullScreen ? '100vw' : 'none',
      maxHeight: this.isFullScreen ? '100vh' : 'none',
      disableClose: this.disableClose,
      panelClass: this.isFullScreen ? 'full-screen-dialog' : '',
      data: {
        title: this.title,
        content: this.content,
        isFullScreen: this.isFullScreen,
        showFullScreen: this.showFullScreen, // Pass showFullScreen to dialog data
        disableClose: this.disableClose, // Pass disableClose to dialog data
        headerBgColor: this.headerBgColor, // Pass header background color
        headerTextColor: this.headerTextColor, // Pass header text color
      },
    });

    this.dialogRef.componentInstance.onToggleFullScreen.subscribe(() => {
      this.toggleFullScreen();
    });

    this.dialogRef.afterClosed().subscribe((result) => {
      this.onClose.emit(result);
    });
  }

  toggleFullScreen(): void {
    this.isFullScreen = !this.isFullScreen;
    this.updateDialogSize();
    this.dialogRef.componentInstance.data.isFullScreen = this.isFullScreen;
  }

  updateDialogSize(): void {
    this.dialogRef.updateSize(
      this.isFullScreen ? '100vw' : this.width,
      this.isFullScreen ? '100vh' : this.height,
    );
    this.dialogRef.removePanelClass('full-screen-dialog');
    if (this.isFullScreen) {
      this.dialogRef.addPanelClass('full-screen-dialog');
    }
  }
}

@Component({
  selector: 'app-dialog-content',
  standalone: true,
  imports: [
    MatIconModule,
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatTabsModule,
  ],
  template: `
    <div class="flex flex-col h-full">
      <!-- Header -->
      <div
        class="w-full justify-between items-center flex flex-row p-1 pr-4"
        [class]="
          (data.headerBgColor || 'bg-primary-400') +
          ' ' +
          (data.headerTextColor || 'text-white')
        "
      >
        <span>
          <h1
            mat-dialog-title
            class="!mb-0 text-sm !text-white"
            [class]="'!' + (data.headerTextColor || 'text-white')"
          >
            {{ data.title }}
          </h1>
        </span>
        <div class="flex items-center gap-2">
          <!-- Toggle Full-Screen Button (shown only if showFullScreen is true) -->
          <span
            *ngIf="data.showFullScreen"
            class="cursor-pointer group"
            (click)="toggleFullScreen()"
            title="{{ data.isFullScreen ? 'Exit Full Screen' : 'Full Screen' }}"
          >
            <mat-icon
              class="mt-1 group-hover:scale-110 transition-all"
              [class]="data.headerTextColor || 'text-white'"
              >{{
                data.isFullScreen ? 'fullscreen_exit' : 'fullscreen'
              }}</mat-icon
            >
          </span>
          <!-- Close Button (only show if dialog is closable) -->
          <span
            *ngIf="!data.disableClose"
            class="cursor-pointer group"
            (click)="onCancelClick()"
          >
            <mat-icon
              class="mt-1 group-hover:rotate-90 transition-all"
              [class]="data.headerTextColor || 'text-white'"
              >close</mat-icon
            >
          </span>
        </div>
      </div>

      <!-- Content Area -->
      <div mat-dialog-content class="flex-grow overflow-auto p-0">
        <ng-container *ngTemplateOutlet="data.content"></ng-container>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
      }
      .mat-dialog-content {
        flex-grow: 1;
        overflow-y: auto;
        padding: 0 !important;
        margin: 0 !important;
        max-height: none !important;
      }
      h1[mat-dialog-title] {
        color: white !important;
      }
    `,
  ],
})
export class DialogContentComponent {
  onToggleFullScreen = new EventEmitter<void>();

  constructor(
    public dialogRef: MatDialogRef<DialogContentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  onCancelClick(): void {
    this.dialogRef.close(false);
  }

  onConfirmClick(): void {
    this.dialogRef.close(true);
  }

  toggleFullScreen(): void {
    this.onToggleFullScreen.emit();
  }
}
