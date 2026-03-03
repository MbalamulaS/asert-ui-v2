import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { StorageService } from 'modules/login/storage.service';
import { StorageKey } from 'modules/login/storage.model';
import {LoginDialogComponent} from "layouts/main-layout/login-dialog/login-dialog.component";
import {JwtPayload} from "./type-interface";
import { jwtDecode } from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class TokenWatcherService {
  private intervalId: any;

  constructor(private storageService: StorageService, private dialog: MatDialog) {}

  startWatching(): void {
    this.stopWatching(); // Ensure no multiple intervals
    this.intervalId = setInterval(() => {
      this.checkTokenExpiration();
    }, 1000 * 60); // Check every minute
  }

  stopWatching(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private checkTokenExpiration(): void {
    const { ASERT_USER } = StorageKey;
    const user = this.storageService.read(ASERT_USER);
    if (user && user.token) {
      const decodedToken: JwtPayload = jwtDecode<JwtPayload>(user.token);
      const tokenHasExpired = Date.now() >= decodedToken.exp * 1000;
      if (tokenHasExpired) {
        this.dialog.open(LoginDialogComponent, {
          width: '400px'
        });
        this.stopWatching();
      }
    }
  }

  checkInitialToken(): void {
    const { ASERT_USER } = StorageKey;
    const user = this.storageService.read(ASERT_USER);
    if (user && user.token) {
      const decodedToken: JwtPayload = jwtDecode<JwtPayload>(user.token);
      const tokenHasExpired = Date.now() >= decodedToken.exp * 1000;
      if (tokenHasExpired) {
        this.dialog.open(LoginDialogComponent, {
          width: '400px'
        });
      } else {
        this.startWatching();
      }
    } else {
      this.dialog.open(LoginDialogComponent, {
        width: '400px'
      });
    }
  }
}
