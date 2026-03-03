import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ConfirmDialogComponent } from 'components/confirm/confirm.dialog';
import { ProgressMap, UploadedFile, UploadTypes } from './types';
import { HttpService } from 'app/api/api.service';
import { UploadListComponent } from './file-upload-list-component';
import { lastValueFrom } from 'rxjs';
import { FileUploadService } from './file-upload.service';

const API = 'uploads';

@Component({
  standalone: true,
  imports: [
    MatIconModule,
    CommonModule,
    MatProgressBarModule,
    ConfirmDialogComponent,
    UploadListComponent,
  ],
  selector: 'file-upload',
  template: `
    <div
      class="w-full relative border-4 border-gray-300 border-dashed rounded-lg p-6 hover:border-gray-400 transition-all"
      id="dropzone"
    >
      <input
        class="absolute inset-0 w-full h-full opacity-0 z-50"
        type="file"
        #fileInput
        [multiple]="multiple"
        [accept]="accept"
        (change)="handleChange($event)"
        hidden
      />

      <div
        class="flex flex-col items-center justify-center w-full cursor-pointer"
        [ngClass]="{ 'drag-over': isDragOver }"
        (drop)="handleDrop($event)"
        (dragover)="handleDragOver($event)"
        (dragleave)="handleDragLeave($event)"
        (click)="fileInputRef.nativeElement.click()"
      >
        <svg
          class="fill-gray-300 h-14 w-14"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M19,13a1,1,0,0,0-1,1v.38L16.52,12.9a2.79,2.79,0,0,0-3.93,0l-.7.7L9.41,11.12a2.85,2.85,0,0,0-3.93,0L4,12.6V7A1,1,0,0,1,5,6h7a1,1,0,0,0,0-2H5A3,3,0,0,0,2,7V19a3,3,0,0,0,3,3H17a3,3,0,0,0,3-3V14A1,1,0,0,0,19,13ZM5,20a1,1,0,0,1-1-1V15.43l2.9-2.9a.79.79,0,0,1,1.09,0l3.17,3.17,0,0L15.46,20Zm13-1a.89.89,0,0,1-.18.53L13.31,15l.7-.7a.77.77,0,0,1,1.1,0L18,17.21ZM22.71,4.29l-3-3a1,1,0,0,0-.33-.21,1,1,0,0,0-.76,0,1,1,0,0,0-.33.21l-3,3a1,1,0,0,0,1.42,1.42L18,4.41V10a1,1,0,0,0,2,0V4.41l1.29,1.3a1,1,0,0,0,1.42,0A1,1,0,0,0,22.71,4.29Z"
          />
        </svg>

        <label for="file-upload" class="relative cursor-pointer">
          <span>{{ label }}</span>
        </label>
      </div>
    </div>

    <upload-list
      [files]="files"
      [progressMap]="progressMap"
      [uploadedFiles]="uploadedFiles"
      (delete)="setItemToDelete($event)"
      (edit)="updateFile($event)"
    />

    <app-confirm-dialog
      [title]="'Delete Upload'"
      [open]="openConfirmDialog"
      [message]="'Are you sure you want to remove this upload?'"
      (onConfirm)="deleteItem()"
    />
  `,
})
export class FileUploadComponent {
  @ViewChild('fileInput') fileInputRef: ElementRef<HTMLInputElement>;
  @Input() label = 'Upload Logo';
  @Input() accept = '.png, .jpg, .jpeg,.zip,.pdf,.xlsx';
  @Input() multiple = false;
  @Input() uploadType: UploadTypes;
  @Output() onSuccess = new EventEmitter<any>();
  @Input() autoUpload = true;
  openConfirmDialog: boolean = false;

  isDragOver = false;
  files: File[] = [];
  uploadedFiles: UploadedFile[] = [];
  progressMap: ProgressMap = new Map<string, number>();
  currentItem: UploadedFile;

  constructor(
    private http: HttpService,
    private fileUploadService: FileUploadService
  ) {}

  handleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      const newFiles = Array.from(target.files);
      this.files.push(...newFiles);
      this.uploadFiles();
    }
  }

  handleDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    if (event.dataTransfer && event.dataTransfer.files) {
      const newFiles = Array.from(event.dataTransfer.files);
      this.files.push(...newFiles);
      this.uploadFiles();
    }
  }

  handleDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  handleDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  async uploadFiles() {
    const uploadPromises = [];
    const initialProgressMap = new Map<string, number>();
    this.files.forEach((file) => {
      initialProgressMap.set(file.name, 0);
    });
    this.progressMap = initialProgressMap;

    this.files.forEach((file: File, index: number) => {
      if (this.autoUpload) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('uploadType', this.uploadType);

        uploadPromises.push(
          this.http
            .postWithProgress(API, formData)
            .toPromise()
            .then(async (event) => {
              if (event.type === HttpEventType.UploadProgress) {
                const percentCompleted = Math.round(
                  (event.loaded * 100) / (event.total || 1)
                );
                this.progressMap.set(file.name, percentCompleted);
              } else if (event instanceof HttpResponse) {
                const _data = event.body as any;
                const { data } = _data;

                const uploadSize = data.fileSize;
                const fileSize =
                  uploadSize < 1024
                    ? `${uploadSize} KB`
                    : `${(uploadSize / (1024 * 1024)).toFixed(2)} MB`;
                this.uploadedFiles.push({
                  id: data.id,
                  uuid: data.uuid,
                  size: fileSize,
                  name: data.name,
                  fileSize: data.fileSize,
                  uploadType: data.uploadType,
                  fileType: data.fileType,
                  ...data,
                });
              }
            })
        );
      } else {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const uploadSize = file.size;
          const fileSize =
            uploadSize < 1024
              ? `${uploadSize} KB`
              : `${(uploadSize / (1024 * 1024)).toFixed(2)} MB`;
          const result = reader.result as string;
          const base64String = result.split(',')[1];
          this.uploadedFiles.push({
            id: null,
            uuid: null,
            size: fileSize,
            name: file.name,
            fileSize: file.size,
            uploadType: this.uploadType || 'manual',
            fileType: file.type || 'application/octet-stream',
            base64: base64String,
            index: index,
            editing: true,
            editName: file.name,
          });
        };
      }
    });

    try {
      if (this.autoUpload) {
        await Promise.all(uploadPromises);
        this.onSuccess.emit(this.uploadedFiles);
      } else {
        this.onSuccess.emit(this.uploadedFiles);
      }
    } catch (error) {
      console.error(error);
    } finally {
      this.files = [];
      this.progressMap = new Map<string, number>();
    }
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  setItemToDelete(file: UploadedFile) {
    this.currentItem = file;
    this.openConfirmDialog = true;
  }

  async deleteItem() {
    if (this.currentItem) {
      if (this.autoUpload && this.currentItem.uuid) {
        try {
          const response = await this.http
            .delete(`uploads/${this.currentItem.uuid}`)
            .toPromise();
          if ((response as any).status === 200) {
            const uploadedFileIndex = this.uploadedFiles.findIndex(
              (f) => f.id === this.currentItem.id
            );
            if (uploadedFileIndex !== -1) {
              this.uploadedFiles.splice(uploadedFileIndex, 1);
            }

            if (this.multiple) {
              this.onSuccess.emit(this.uploadedFiles);
            } else {
              this.onSuccess.emit(null);
            }

            const fileIndex = this.files.findIndex(
              (f) => f.name === this.currentItem.name
            );
            if (fileIndex !== -1) {
              this.files.splice(fileIndex, 1);
            }

            this.openConfirmDialog = false;
          }
        } catch (error) {
          console.error(error);
        }
      } else {
        const uploadedFileIndex = this.uploadedFiles.findIndex(
          (f) => f.index === this.currentItem.index
        );
        if (uploadedFileIndex !== -1) {
          this.uploadedFiles.splice(uploadedFileIndex, 1);
        }

        if (this.multiple) {
          this.onSuccess.emit(this.uploadedFiles);
        } else {
          this.onSuccess.emit(null);
        }

        const fileIndex = this.files.findIndex(
          (f) => f.name === this.currentItem.name
        );
        if (fileIndex !== -1) {
          this.files.splice(fileIndex, 1);
        }

        this.openConfirmDialog = false;
      }
    }
  }

  closeDialog() {
    this.openConfirmDialog = false;
  }

  async handleFilenameEdit(file: UploadedFile) {
    const uploadedFile = this.uploadedFiles.find((f) => f.id === file.id);
    if (uploadedFile) {
      uploadedFile.name = file.name;
    }
  }

  async updateFile(file: UploadedFile) {
    const { uuid } = file;
    await lastValueFrom(this.fileUploadService.updateFileName(uuid, file));
  }
}
