import {
  AppError,
  createAppError,
  isAppError,
} from '../models/app-error.model';
import { ErrorType } from '../models/error-type.enum';

export const ErrorUtils = {
  /**
   * Format service errors into AppError objects.
   * @param error - The error to format.
   * @param defaultMessage - The default message to use if the error is not an AppError.
   * @returns An AppError object.
   */
  formatServiceError(
    error: unknown,
    defaultMessage = 'An unknown error occurred'
  ): AppError {
    // Format error if it is not of type AppError
    return isAppError(error)
      ? error
      : createAppError(ErrorType.UNKNOWN, defaultMessage, error);
  },
};
