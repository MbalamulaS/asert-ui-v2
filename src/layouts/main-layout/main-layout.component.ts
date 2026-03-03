import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { NavComponent } from 'layouts/main-layout/nav/nav.component';
import { StorageService } from 'modules/login/storage.service';
import { StorageKey } from 'modules/login/storage.model';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MediaMatcher } from '@angular/cdk/layout';
import { ToolbarMenuComponent } from 'layouts/main-layout/toolbar-menu/toolbar-menu.component';

import { CommonModule } from '@angular/common';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { PreloaderService } from 'components/preloader/preloader.service';
import { PreloaderComponent } from 'components/preloader/preloader.component';
import { AuthService } from 'services/auth.service';
import { LoginDialogComponent } from './login-dialog/login-dialog.component';

const { ASERT_USER } = StorageKey;

@Component({
  selector: `app-main-layout`,
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    NavComponent,
    MatTooltipModule,
    ToolbarMenuComponent,
    PreloaderComponent,
    LoginDialogComponent,
    RouterLink,
  ],
  template: `
    <mat-sidenav-container class="h-screen flex">
      <app-login-dialog *ngIf="isLoginDialogOpen" />
      <mat-sidenav
        #drawer
        mode="side"
        [opened]="!mobileQuery.matches && sidenavOpened"
        class="flex flex-col h-full"
      >
        <mat-toolbar
          class="!bg-primary-400 w-full flex flex-row justify-between sticky top-0 z-10"
        >
          <a routerLink="/dashboard">
            <h1 class="font-bold text-white">AseRT</h1>
          </a>

          <button mat-icon-button (click)="toggleDrawer()">
            <mat-icon class="text-white mt-1">sort</mat-icon>
          </button>
        </mat-toolbar>
        <mat-nav-list class="flex-1 overflow-y-auto">
          <app-nav />
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content class="flex-1 flex flex-col relative">
        <mat-toolbar
          class="!bg-primary-400 flex items-center px-4 justify-between sticky top-0 z-10"
        >
          <button mat-icon-button (click)="toggleDrawer()">
            <mat-icon *ngIf="!sidenavOpened">menu</mat-icon>
          </button>

          <toolbar-menu />
        </mat-toolbar>
        <div class="flex-1 overflow-y-auto p-4 relative">
          <router-outlet>
          </router-outlet>
          <preloader size="16" textColor="gray-500" />
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
})
export class MainLayoutComponent implements OnDestroy, AfterViewInit {
  loading$ = this.preloaderService.loading$;
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  @ViewChild('drawer') drawer!: MatSidenav;
  sidenavOpened = true;
  isLoginDialogOpen = false;

  constructor(
    private storageService: StorageService,
    private preloaderService: PreloaderService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
    private media: MediaMatcher,
    private cdr: ChangeDetectorRef,
    private loginService: AuthService,
  ) {
    this.mobileQuery = this.media.matchMedia('(max-width: 767px)');
    this._mobileQueryListener = () => this.changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngAfterViewInit(): void {
    if (this.mobileQuery.matches) {
      this.sidenavOpened = false;
      this.drawer.close();
    }
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  toggleDrawer() {
    this.sidenavOpened = !this.sidenavOpened;
    this.drawer.toggle();
  }

  logout() {
    this.storageService.remove(ASERT_USER);
    const url = '/portal';
    this.router.navigate([url]);
  }

  ngOnInit(): void {
    // Initialize login dialog subscription
    this.loginService.dialogEvent$.subscribe((isOpen) => {
      this.isLoginDialogOpen = isOpen;
      this.cdr.detectChanges();
    });

    // Initialize inactivity tracker
    // this.inactivityService.init();
  }
}
