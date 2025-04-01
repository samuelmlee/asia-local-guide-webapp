import { createAppError } from '../models/app-error.model';
import { ErrorType } from '../models/error-type.enum';
import { ErrorHandlerService } from './error-handler.service';
import { LoggerService } from './logger.service';
import { NotificationService } from './notification.service';

describe('ErrorHandlerService', () => {
  let service: ErrorHandlerService;
  let loggerSpy: jasmine.SpyObj<LoggerService>;
  let notification: jasmine.SpyObj<NotificationService>;

  beforeEach(() => {
    // Create fresh spies for each test
    loggerSpy = jasmine.createSpyObj('LoggerService', ['error']);
    notification = jasmine.createSpyObj('SnackbarService', ['showError']);

    service = new ErrorHandlerService(loggerSpy, notification);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('handleError', () => {
    it('should log AppError with correct type and message', () => {
      const appError = createAppError(
        ErrorType.NETWORK,
        'Test error message',
        null
      );
      const context = 'testing';

      service.handleError(appError, context);

      expect(loggerSpy.error).toHaveBeenCalledWith(
        `${appError.type} error while ${context}:`,
        appError
      );
    });

    it('should log non-AppError as unknown error', () => {
      const error = new Error('Regular error');
      const context = 'testing';

      service.handleError(error, context);

      expect(loggerSpy.error).toHaveBeenCalledWith(
        `Unknown error while ${context}:`,
        error
      );
    });

    it('should not show snackbar when showSnackbar option is not provided', () => {
      const error = new Error('Test error');

      service.handleError(error, 'testing');

      expect(notification.showError).not.toHaveBeenCalled();
    });

    it('should show snackbar when showSnackbar option is true', () => {
      const appError = createAppError(
        ErrorType.NETWORK,
        'Test error message',
        null
      );

      service.handleError(appError, 'testing', { notify: true });

      expect(notification.showError).toHaveBeenCalledWith(appError.message);
    });

    it('should show generic error message in snackbar for non-AppError', () => {
      const error = new Error('Regular error');
      const context = 'testing';

      service.handleError(error, context, { notify: true });

      expect(notification.showError).toHaveBeenCalledWith(
        `An unknown error occurred while ${context}`
      );
    });
  });
});
