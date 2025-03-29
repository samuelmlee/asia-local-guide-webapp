import { Injectable } from '@angular/core';
import {
  AppError,
  createAppError,
  isAppError,
} from '../models/app-error.model';
import { ErrorType } from '../models/error-type.enum';
import { LoggerService } from './logger.service';
import { SnackbarService } from './snackbar.service';

export interface ErrorHanderOptions {
  showSnackbar?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  constructor(
    private readonly logger: LoggerService,
    private readonly snackbar: SnackbarService
  ) {}

  /**
   * Handle errors in the component.
   * @param error - The error to handle.
   * @param context - The context in which the error occurred (e.g., 'fetching data').
   * @param options - Options for handling the error.
   * @param options.showSnackbar - Whether to show a snackbar with the error message.
   */
  public handleError(
    error: unknown,
    context: string,
    options?: ErrorHanderOptions
  ): void {
    let errorMessage;

    if (isAppError(error)) {
      this.logger.error(`${error.type} error while ${context}:`, error);
      errorMessage = error.message;
    } else {
      this.logger.error(`Unknown error while ${context}:`, error);
      errorMessage = `An unknown error occurred while ${context}`;
    }

    if (options?.showSnackbar) {
      this.snackbar.openError(errorMessage);
    }
  }

  /**
   * Format service errors into AppError objects.
   * @param error - The error to format.
   * @param defaultMessage - The default message to use if the error is not an AppError.
   * @returns An AppError object.
   */
  public formatServiceError(
    error: unknown,
    defaultMessage = 'An unknown error occurred'
  ): AppError {
    // Format error if it is not of type AppError
    return isAppError(error)
      ? error
      : createAppError(ErrorType.UNKNOWN, defaultMessage, error);
  }
}
