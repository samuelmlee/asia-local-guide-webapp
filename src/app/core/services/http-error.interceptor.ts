import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { AppError } from '../models/app-error.model';
import { ErrorType } from '../models/error-type.enum';

export const httpErrorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Create structured AppError
      const appError: AppError = createAppErrorFromHttp(error);

      // Return AppError for components
      return throwError(() => appError);
    })
  );
};

// TODO: use translation keys when translation service implemented

function createAppErrorFromHttp(error: HttpErrorResponse): AppError {
  // Network or client-side error
  if (error.status === 0) {
    return {
      type: ErrorType.NETWORK,
      message: 'Unable to connect to the server. Please check your connection.',
      originalError: error,
    };
  }

  // Server-side errors
  let type: ErrorType;
  let message: string;

  switch (error.status) {
    case 400:
      type = ErrorType.VALIDATION;
      message = 'The request contains invalid data';
      break;
    case 401:
      type = ErrorType.UNAUTHORIZED;
      message = 'You must be logged in to access this resource';
      break;
    case 403:
      type = ErrorType.FORBIDDEN;
      message = 'You do not have permission to access this resource';
      break;
    case 404:
      type = ErrorType.NOT_FOUND;
      message = 'The requested resource was not found';
      break;
    case 500:
      type = ErrorType.SERVER;
      message = 'Something went wrong on our server';
      break;
    default:
      type = ErrorType.UNKNOWN;
      message = `Unexpected error occurred (${error.status})`;
  }

  return {
    type,
    message,
    statusCode: error.status,
    originalError: error,
  };
}
