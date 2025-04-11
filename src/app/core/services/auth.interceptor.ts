import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { user } from '@angular/fire/auth';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AuthService } from '../../features/auth/services/auth.service';
import { LoggerService } from './logger.service';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  if (isPublicEndpoint(req)) {
    return next(req);
  }

  const authService = inject(AuthService);
  const logger = inject(LoggerService);

  if (!user) {
    // User not logged in
    return next(req);
  }

  return from(authService.getIdTokenResult()).pipe(
    switchMap((token) => {
      // Continue without authentication
      if (!token) {
        logger.warning('Proceeding with unauthenticated request');
        return next(req);
      }

      // Clone request with token
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
      return next(authReq);
    }),
    catchError((error) => {
      if (
        error instanceof HttpErrorResponse &&
        (error.status === 401 || error.status === 403)
      ) {
        // Handle auth failure
      }
      return throwError(() => error);
    })
  );
};

function isPublicEndpoint(req: HttpRequest<unknown>): boolean {
  const publicEndpoints = ['/auth/check-email'];
  return publicEndpoints.some((endpoint) => req.url.includes(endpoint));
}
