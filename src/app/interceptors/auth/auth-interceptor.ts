import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ToastService} from "app/toast.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private toast: ToastService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('ASERT_USER_TOKEN');
    if (!token) {
      throw new Error('No token found in localStorage');
    }
    const tokenString = JSON.parse(token);

    if (tokenString) {
      const clonedRequest = req.clone({
        setHeaders: {
          Authorization: `Bearer ${tokenString}`
        }
      });
      return next.handle(clonedRequest);
    } else {
      return next.handle(req);
    }
  }
}
