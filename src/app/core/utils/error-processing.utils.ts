import { AppError } from '../models/app-error.model';
import { ErrorType } from '../models/error-type.enum';

/**
 * Creates an AppError object.
 *
 * @param type - The type of the error.
 * @param message - A user-friendly error message.
 * @param originalError - The original error object (optional).
 * @returns An AppError object.
 */
export function createAppError(
  type: ErrorType,
  message: string,
  originalError?: unknown
): AppError {
  return {
    type,
    message,
    originalError: originalError || new Error(message),
  };
}
