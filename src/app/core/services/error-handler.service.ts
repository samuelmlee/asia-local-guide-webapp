import { Injectable } from '@angular/core';
import { isAppError } from '../models/app-error.model';
import { LoggerService } from './logger.service';
import { NotificationService } from './notification.service';

export interface ErrorHanderOptions {
  notify?: boolean;
}

@Injectable()
export class ErrorHandlerService {
  constructor(
    private readonly logger: LoggerService,
    private readonly notificationService: NotificationService
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

    if (options?.notify) {
      this.notificationService.showError(errorMessage);
    }
  }
}
