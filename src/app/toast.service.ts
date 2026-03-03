import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private toast: ToastrService) {}

  success(title: string, message?: string, timeout: number = 5000): any {
    return this.toast.success(message, title, { timeOut: timeout });
  }

  info(title: string, message?: string, timeout: number = 5000): any {
    return this.toast.warning(message, title, { timeOut: timeout });
  }

  warning(title: string, message: string, timeout: number = 5000): any {
    return this.toast.warning(message, title, { timeOut: timeout });
  }

  error(title: string, message?: string, timeout: number = 5000): any {
    return this.toast.error(message, title, { timeOut: timeout });
  }
}
