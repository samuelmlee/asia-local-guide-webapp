import { ErrorType } from './error-type.enum';

export interface AppError {
  type: ErrorType;
  message: string;
  statusCode?: number;
  originalError: unknown;
}

export function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    'message' in error &&
    'originalError' in error
  );
}

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
