import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CompanyDialogService {
  private dialogStateSubject = new BehaviorSubject<boolean>(false);
  dialogState$ = this.dialogStateSubject.asObservable();

  // Store the route that was attempted to be accessed before company dialog was shown
  private returnUrlSubject = new BehaviorSubject<string | null>(null);
  returnUrl$ = this.returnUrlSubject.asObservable();

  // Track whether the dialog is required and should be unclosable
  private isRequiredSubject = new BehaviorSubject<boolean>(false);
  isRequired$ = this.isRequiredSubject.asObservable();

  constructor() {}

  openDialog(returnUrl?: string, isRequired: boolean = false): void {
    if (returnUrl) {
      this.returnUrlSubject.next(returnUrl);
    }
    this.isRequiredSubject.next(isRequired);
    this.dialogStateSubject.next(true);
  }

  closeDialog(): void {
    // Only allow closing if not required
    if (!this.isRequiredSubject.value) {
      this.dialogStateSubject.next(false);
      this.isRequiredSubject.next(false);
    }
  }

  forceCloseDialog(): void {
    // Force close regardless of required state (used after successful company creation)
    this.dialogStateSubject.next(false);
    this.isRequiredSubject.next(false);
  }

  getDialogState(): Observable<boolean> {
    return this.dialogState$;
  }

  getReturnUrl(): Observable<string | null> {
    return this.returnUrl$;
  }

  clearReturnUrl(): void {
    this.returnUrlSubject.next(null);
  }

  getIsRequired(): boolean {
    return this.isRequiredSubject.value;
  }
}
