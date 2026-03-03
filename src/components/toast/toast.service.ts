import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastSubject = new BehaviorSubject<ToastMessage | null>(null);
  toast$ = this.toastSubject.asObservable();

  show(
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string,
  ) {
    this.toastSubject.next({ type, title, message });
  }

  success(title: string, message: string) {
    this.show('success', title, message);
  }

  error(title: string, message: string) {
    this.show('error', title, message);
  }

  warning(title: string, message: string) {
    this.show('warning', title, message);
  }

  info(title: string, message: string) {
    this.show('info', title, message);
  }

  clear() {
    this.toastSubject.next(null);
  }
}
