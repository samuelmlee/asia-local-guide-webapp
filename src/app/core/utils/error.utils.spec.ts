import { createAppError } from '../models/app-error.model';
import { ErrorType } from '../models/error-type.enum';
import { ErrorUtils } from './error.utils';

describe('ErrorUtils', () => {
  describe('formatServiceError', () => {
    it('should return the original error if it is an AppError', () => {
      const appError = createAppError(
        ErrorType.NETWORK,
        'Original error',
        null
      );

      const result = ErrorUtils.formatServiceError(appError);

      expect(result).toBe(appError);
    });

    it('should create an AppError with UNKNOWN type if input is not an AppError', () => {
      const error = new Error('Regular error');

      const result = ErrorUtils.formatServiceError(error);

      expect(result.type).toBe(ErrorType.UNKNOWN);
      expect(result.message).toBe('An unknown error occurred');
      expect(result.originalError).toBe(error);
    });

    it('should use provided default message when creating AppError', () => {
      const error = new Error('Regular error');
      const defaultMessage = 'Custom default message';

      const result = ErrorUtils.formatServiceError(error, defaultMessage);

      expect(result.message).toBe(defaultMessage);
    });
  });
});
