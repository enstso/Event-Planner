import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { AuthStorage } from '../dto/auth.dto';

// HTTP interceptor used to automatically attach the Authorization header
// to outgoing HTTP requests (except for authentication routes).
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Inject AuthService manually because this is a standalone interceptor function.
  const authService: AuthService = inject(AuthService);

  // Skip adding Authorization header for authentication-related endpoints.
  // These endpoints should not require a token.
  if (
    req.url.includes('/auth') ||
    req.url.includes('/login') ||
    req.url.includes('/register')
  ) {
    return next(req);
  }

  // Retrieve authentication data stored in localStorage.
  const authStorage: AuthStorage | null = authService.getAuthStorage();

  // If the user is not logged in, simply send the request without modification.
  if (authStorage === null) {
    return next(req);
  }

  // Clone the request and add the Authorization header containing the token.
  const cloned = req.clone({
    setHeaders: {
      Authorization: `Bearer ${authStorage.token}`
    }
  });

  // Forward the modified request to the next handler.
  return next(cloned);
};
