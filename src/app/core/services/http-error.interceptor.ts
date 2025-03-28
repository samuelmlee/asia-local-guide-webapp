import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { LoggerService } from './logger.service';
import { SnackbarService } from './snackbar.service';

export const httpErrorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const logger = inject(LoggerService);
      const snackBar = inject(SnackbarService);

      let errorMessage: string;

      if (error.status === 0) {
        // A client-side or network error occurred.
        errorMessage =
          'Client or Network error - please check your input or connection';
        logger.error('Network error', error);
      } else {
        errorMessage = getErrorMessage(error);
        logger.error(`API error ${error.status}`, error);
      }

      snackBar.openError(errorMessage);

      // Re-throw for components to handle specific cases
      return throwError(() => error);
    })
  );
};

const getErrorMessage = (error: HttpErrorResponse): string => {
  switch (error.status) {
    case 400:
      return 'Invalid request';
    case 401:
      return 'Please log in to continue';
    case 403:
      return "You don't have permission to access this resource";
    case 404:
      return 'Resource not found';
    case 500:
      return 'Server error - please try again later';
    default:
      return `Error ${error.status}: ${error.message}`;
  }
};
