import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { animations } from 'layouts/main-layout/nav/animation';
import { MenuItem } from 'layouts/main-layout/nav/menu-items';
import { StorageService } from 'modules/login/storage.service';
import { StorageKey } from 'modules/login/storage.model';
import { Router, RouterLink } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DialogComponent } from 'components/dialog/dialog.component';
import { ChangePasswordFormComponent } from 'modules/user/forms/change-password-form';
import { lastValueFrom } from 'rxjs';
import { UserService } from 'modules/user/user.service';

@Component({
  selector: 'toolbar-menu',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatMenuModule,
    RouterLink,
    MatTooltipModule,
    DialogComponent,
    ChangePasswordFormComponent,
  ],
  animations: animations,
  template: `
    <div class="ml-auto flex items-center gap-3">
      <a matTooltip="Home" routerLink="/dashboard">
        <mat-icon class="material-symbols-outlined">home</mat-icon>
      </a>
      <button mat-icon-button matTooltip="Applications">
        <mat-icon class="material-symbols-outlined">apps</mat-icon>
      </button>

      <button
        mat-icon-button
        [matMenuTriggerFor]="accountMenu"
        matTooltip="Account"
        position="below-end"
      >
        <mat-icon
          class="material-symbols-outlined"
          matBadge="3"
          matBadgeColor="warn"
          matBadgeSize="small"
          >account_circle</mat-icon
        >
      </button>

      <mat-menu xPosition="before" #accountMenu="matMenu">
        <mat-divider></mat-divider>
        <a mat-menu-item>
          <mat-icon class="material-symbols-outlined">tune</mat-icon>
          <span>Settings</span>
        </a>
        <a mat-menu-item>
          <mat-icon class="material-symbols-outlined">contrast</mat-icon>
          <span>Appearance</span>
        </a>
        <a mat-menu-item>
          <mat-icon class="material-symbols-outlined">question_mark</mat-icon>
          <span>Help Center</span>
        </a>
        <mat-divider></mat-divider>
        <a mat-menu-item>
          <mat-icon class="material-symbols-outlined">translate</mat-icon>
          <span>Language</span>
        </a>
        <a mat-menu-item (click)="changeUserPassword()">
          <mat-icon class="material-symbols-outlined">lock_reset</mat-icon>
          <span>Change Password</span>
        </a>
        <mat-divider></mat-divider>
        <a mat-menu-item (click)="logout()">
          <mat-icon class="material-symbols-outlined">logout</mat-icon>
          <span>Logout</span>
        </a>
      </mat-menu>
      <app-dialog
        [open]="isOpen"
        (onClose)="handleClose($event)"
        width="540px"
        title="Change Password"
      >
        <ng-template>
          <app-change-password-form (onSubmit)="saveData($event)" />
        </ng-template>
      </app-dialog>
    </div>
  `,
})
export class ToolbarMenuComponent implements OnInit {
  @Input() menu: MenuItem;
  userId: number;
  isOpen = false;

  constructor(
    private storageService: StorageService,
    private service: UserService,
    private router: Router
  ) {}

  toggleMenu(menu: any) {
    menu.isOpen = !menu.isOpen;
  }

  ngOnInit() {
    this.setUserId();
  }

  setUserId() {
    const userData = this.storageService.read(StorageKey.ASERT_USER);
    this.userId = userData ? userData.user.id : null;
  }

  logout() {
    this.storageService.clear();
    let url = '/';
    this.router.navigate([url]);
    window.location.reload();
  }

  changeUserPassword() {
    this.isOpen = true;
  }

  handleClose(result: boolean): void {
    this.service.clearChangePasswordForm();
    this.isOpen = false;
  }

  async saveData(data: any) {
    try {
      delete data.passwordConfirm;
      await lastValueFrom(this.service.changePassword(data));
      this.isOpen = false;
      this.logout();
    } catch (error) {
      // Handle error
      console.log(error);
    }
  }
}
