import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class SnackbarService {
  constructor(public readonly snackBar: MatSnackBar) {}

  public openSuccess(message: string): void {
    this.snackBar.open(message, '', {
      duration: 3000,
      panelClass: 'success-snackbar',
    });
  }

  // TODO: to update after translation service implementation
  public openError(message: string): void {
    this.snackBar.open(message, 'Fermer', { panelClass: 'error-snackbar' });
  }
}
