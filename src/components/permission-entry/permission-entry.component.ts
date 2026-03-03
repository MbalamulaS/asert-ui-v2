import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';

export type Entry = {
  id: number;
  name: string;
  uuid: string;
  action: string;
  resource: string;
};

@Component({
  standalone: true,
  imports: [CommonModule, MatCheckboxModule],
  selector: 'app-permission-entry',
  template: `
    <div
      class="flex items-center !border-b !border-gray-200 last:border-0 py-2 hover:bg-gray-100"
    >
      <mat-checkbox
        color="primary"
        [checked]="isSelected"
        (change)="onTogglePermission()"
      >
        {{ permission.action }}
      </mat-checkbox>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PermissionEntryComponent {
  @Input() permission: Entry;
  @Input() isSelected: boolean;
  @Output() togglePermission = new EventEmitter<number>();

  onTogglePermission(): void {
    this.togglePermission.emit(this.permission.id);
  }
}
