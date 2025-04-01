import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarNotificationService } from './snackbar-notification.service';

// Tests to append to src/app/core/services/snackbar-notification.service.spec.ts

describe('SnackbarNotificationService', () => {
  let service: SnackbarNotificationService;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    service = new SnackbarNotificationService(snackBarSpy);
  });

  it('should show success notification with correct parameters', () => {
    const message = 'Success message';
    service.showSuccess(message);

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      message,
      '',
      jasmine.objectContaining({
        duration: 3000,
        panelClass: ['notification-success'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      })
    );
  });

  it('should show error notification with correct parameters', () => {
    const message = 'Error message';
    service.showError(message);

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      message,
      'Close',
      jasmine.objectContaining({
        duration: 6000,
        panelClass: ['notification-error'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      })
    );
  });

  it('should show info notification with correct parameters', () => {
    const message = 'Info message';
    service.showInfo(message);

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      message,
      '',
      jasmine.objectContaining({
        duration: 4000,
        panelClass: ['notification-info'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      })
    );
  });

  it('should show warning notification with correct parameters', () => {
    const message = 'Warning message';
    service.showWarning(message);

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      message,
      '',
      jasmine.objectContaining({
        duration: 5000,
        panelClass: ['notification-warning'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      })
    );
  });

  it('should respect custom positions', () => {
    const message = 'Custom position';
    const options = {
      horizontalPosition: 'left' as const,
      verticalPosition: 'top' as const,
    };

    service.showInfo(message, options);

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      message,
      '',
      jasmine.objectContaining({
        horizontalPosition: 'left',
        verticalPosition: 'top',
      })
    );
  });

  it('should use custom duration when provided', () => {
    const message = 'Custom duration';
    const options = { duration: 10000 };

    service.showSuccess(message, options);

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      message,
      '',
      jasmine.objectContaining({ duration: 10000 })
    );
  });

  it('should use custom action when provided', () => {
    const message = 'Custom action';
    const options = { action: 'Dismiss' };

    service.showError(message, options);

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      message,
      'Dismiss',
      jasmine.any(Object)
    );
  });
});
