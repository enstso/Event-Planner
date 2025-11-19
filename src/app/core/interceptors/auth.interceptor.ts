import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService} from '../services/auth/auth.service';
import {AuthStorage} from '../dto/auth.dto';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService: AuthService = inject(AuthService);

  if (req.url.includes('/auth') || req.url.includes('/login') || req.url.includes('/register')) {
    return next(req);
  }

  const authStorage: AuthStorage | null = authService.getAuthStorage();

  if (authStorage === null) {
    return next(req);
  }

  const cloned = req.clone({
    setHeaders: {
      Authorization: `Bearer ${authStorage.token}`
    }
  });

  return next(cloned);
};
