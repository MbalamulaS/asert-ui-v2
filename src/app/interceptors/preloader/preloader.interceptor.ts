import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { PreloaderService } from 'components/preloader/preloader.service';

export const preloaderInterceptor: HttpInterceptorFn = (req, next) => {
  const preloaderService = inject(PreloaderService);
  preloaderService.show();
  return next(req).pipe(finalize(() => preloaderService.hide()));
};
