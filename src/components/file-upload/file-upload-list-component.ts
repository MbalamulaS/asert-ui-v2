import { Component, Input, Output, EventEmitter } from '@angular/core';
import { UploadedFile } from './types';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {
  heroTrash,
  heroPhoto,
  heroPencilSquare,
  heroCheck,
} from '@ng-icons/heroicons/outline';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'upload-list',
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressBarModule,
    NgIconComponent,
    FormsModule,
  ],
  standalone: true,
  viewProviders: [
    provideIcons({
      heroTrash,
      heroPhoto,
      heroPencilSquare,
      heroCheck,
    }),
  ],
  template: `
    <section class="my-5 mx-0">
      <ul *ngIf="files?.length" class="p-0 list-none">
        <li
          *ngFor="let file of files; trackBy: trackByFileName"
          class="flex items-center mb-2"
        >
          <ng-icon name="heroPhoto" class="text-blue-500 mr-2" size="36" />
          <div class="flex flex-col flex-grow-[1]">
            <div class="flex justify-between items-center">
              <span class="font-semibold">{{ file.name }} Uploading</span>
            </div>
            <mat-progress-bar
              mode="determinate"
              [value]="progressMap.get(file.name) || 0"
            ></mat-progress-bar>
            <span class="progress-label"
              >{{ progressMap.get(file.name) || 0 }}%</span
            >
          </div>
        </li>
      </ul>
    </section>

    <section class="my-5">
      <div *ngIf="uploadedFiles?.length">
        <div
          *ngFor="let file of uploadedFiles; trackBy: trackByFileId"
          class="mb-2 flex items-center justify-between gap-4 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2"
        >
          <div class="flex w-full items-center gap-4">
            <div class="flex w-full items-center gap-4">
              <div class="flex-1">
                <span
                  *ngIf="!file.editing"
                  class="font-semibold cursor-pointer"
                  (click)="enableEditing(file)"
                >
                  {{ file.name }}
                </span>
                <input
                  *ngIf="file.editing"
                  [(ngModel)]="file.editName"
                  class="border rounded px-2 py-1 w-full"
                  (blur)="saveEdit(file)"
                />
              </div>
              <ng-icon
                *ngIf="!file.editing"
                name="heroPencilSquare"
                class="text-blue-500 cursor-pointer"
                (click)="enableEditing(file)"
                size="24"
              ></ng-icon>
              <ng-icon
                *ngIf="file.editing"
                name="heroCheck"
                class="text-blue-500 cursor-pointer"
                (click)="saveEdit(file)"
                size="24"
              ></ng-icon>
              <span class="font-semibold">({{ file.size }})</span>
            </div>
            <ng-icon
              name="heroTrash"
              class="text-blue-500 cursor-pointer"
              (click)="onDelete(file)"
              size="24"
            ></ng-icon>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class UploadListComponent {
  @Input() files: File[] = [];
  @Input() uploadedFiles: UploadedFile[] = [];
  @Input() progressMap: Map<string, number> = new Map();
  @Output() delete = new EventEmitter<UploadedFile>();
  @Output() edit = new EventEmitter<UploadedFile>();

  enableEditing(file: UploadedFile): void {
    file.editing = true;
    file.editName = file.name;
  }

  saveEdit(file: UploadedFile): void {
    file.editing = false;
    file.name = file.editName;
    this.edit.emit(file);
  }

  onDelete(file: UploadedFile): void {
    this.delete.emit(file);
  }

  trackByFileName(index: number, file: File): string {
    return file.name;
  }

  trackByFileId(index: number, file: UploadedFile): string | number {
    return file.id;
  }
}
