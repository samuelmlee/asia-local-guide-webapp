import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarService } from './snackbar.service';

describe('SnackbarService', () => {
  let service: SnackbarService;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      providers: [
        SnackbarService,
        { provide: MatSnackBar, useValue: spy },
        provideExperimentalZonelessChangeDetection(),
      ],
    });

    service = TestBed.inject(SnackbarService);
    snackBarSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('openSuccess', () => {
    it('should call snackBar.open with success message', () => {
      const message = 'Operation successful';

      service.openSuccess(message);

      expect(snackBarSpy.open).toHaveBeenCalledWith(message, '', {
        duration: 3000,
        panelClass: 'success-snackbar',
      });
    });

    it('should use empty string as action', () => {
      service.openSuccess('Success');
      const actionParam = snackBarSpy.open.calls.mostRecent().args[1];
      expect(actionParam).toBe('');
    });

    it('should set duration to 3000ms', () => {
      service.openSuccess('Success');
      const config = snackBarSpy.open.calls.mostRecent().args[2];
      expect(config?.duration).toBe(3000);
    });

    it('should set success-snackbar panel class', () => {
      service.openSuccess('Success');
      const config = snackBarSpy.open.calls.mostRecent().args[2];
      expect(config?.panelClass).toBe('success-snackbar');
    });
  });

  describe('openError', () => {
    it('should call snackBar.open with error message', () => {
      const message = 'An error occurred';

      service.openError(message);

      expect(snackBarSpy.open).toHaveBeenCalledWith(message, 'Fermer', {
        panelClass: 'error-snackbar',
      });
    });

    it('should use "Fermer" as action text', () => {
      service.openError('Error');
      const actionParam = snackBarSpy.open.calls.mostRecent().args[1];
      expect(actionParam).toBe('Fermer');
    });

    it('should not set duration for error messages', () => {
      service.openError('Error');
      const config = snackBarSpy.open.calls.mostRecent().args[2];
      expect(config?.duration).toBeUndefined();
    });

    it('should set error-snackbar panel class', () => {
      service.openError('Error');
      const config = snackBarSpy.open.calls.mostRecent().args[2];
      expect(config?.panelClass).toBe('error-snackbar');
    });
  });
});
