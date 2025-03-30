import { TestBed } from '@angular/core/testing';

import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { createAppError } from '../models/app-error.model';
import { ErrorType } from '../models/error-type.enum';
import { ErrorHandlerService } from './error-handler.service';
import { LoggerService } from './logger.service';
import { SnackbarService } from './snackbar.service';

describe('ErrorHandlerService', () => {
  let service: ErrorHandlerService;
  let loggerSpy: jasmine.SpyObj<LoggerService>;
  let snackbarSpy: jasmine.SpyObj<SnackbarService>;

  beforeEach(() => {
    const loggerSpyObj = jasmine.createSpyObj('LoggerService', ['error']);
    const snackbarSpyObj = jasmine.createSpyObj('SnackbarService', [
      'openError',
    ]);

    TestBed.configureTestingModule({
      providers: [
        ErrorHandlerService,
        { provide: LoggerService, useValue: loggerSpyObj },
        { provide: SnackbarService, useValue: snackbarSpyObj },
        provideExperimentalZonelessChangeDetection(),
      ],
    });

    service = TestBed.inject(ErrorHandlerService);
    loggerSpy = TestBed.inject(LoggerService) as jasmine.SpyObj<LoggerService>;
    snackbarSpy = TestBed.inject(
      SnackbarService
    ) as jasmine.SpyObj<SnackbarService>;
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

      expect(snackbarSpy.openError).not.toHaveBeenCalled();
    });

    it('should show snackbar when showSnackbar option is true', () => {
      const appError = createAppError(
        ErrorType.NETWORK,
        'Test error message',
        null
      );

      service.handleError(appError, 'testing', { showSnackbar: true });

      expect(snackbarSpy.openError).toHaveBeenCalledWith(appError.message);
    });

    it('should show generic error message in snackbar for non-AppError', () => {
      const error = new Error('Regular error');
      const context = 'testing';

      service.handleError(error, context, { showSnackbar: true });

      expect(snackbarSpy.openError).toHaveBeenCalledWith(
        `An unknown error occurred while ${context}`
      );
    });
  });
});
