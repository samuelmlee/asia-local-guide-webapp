import { Injectable } from '@angular/core';

import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import {
  NotificationOptions,
  NotificationService,
  NotificationType,
} from './notification.service';

export interface SnackbarNotificationOptions extends NotificationOptions {
  horizontalPosition?: 'center' | 'left' | 'right';
  verticalPosition?: 'top' | 'bottom';
}

@Injectable()
export class SnackbarNotificationService extends NotificationService {
  constructor(private readonly snackBar: MatSnackBar) {
    super();
  }

  public showSuccess(
    message: string,
    options?: SnackbarNotificationOptions
  ): void {
    this.showNotification(message, NotificationType.SUCCESS, options);
  }

  public showError(
    message: string,
    options?: SnackbarNotificationOptions
  ): void {
    this.showNotification(message, NotificationType.ERROR, options);
  }

  public showInfo(
    message: string,
    options?: SnackbarNotificationOptions
  ): void {
    this.showNotification(message, NotificationType.INFO, options);
  }

  public showWarning(
    message: string,
    options?: SnackbarNotificationOptions
  ): void {
    this.showNotification(message, NotificationType.WARNING, options);
  }

  private showNotification(
    message: string,
    type: NotificationType,
    options?: SnackbarNotificationOptions
  ): void {
    const config: MatSnackBarConfig = {
      duration: this.getDurationByType(type, options?.duration),
      panelClass: [`notification-${type}`],
      horizontalPosition: options?.horizontalPosition || 'center',
      verticalPosition: options?.verticalPosition || 'bottom',
    };

    const action = options?.action || this.getDefaultActionByType(type);
    this.snackBar.open(message, action, config);
  }

  private getDurationByType(
    type: NotificationType,
    customDuration?: number
  ): number | undefined {
    if (customDuration !== undefined) {
      return customDuration;
    }

    // Default durations by notification type
    switch (type) {
      case NotificationType.SUCCESS:
        return 3000;
      case NotificationType.INFO:
        return 4000;
      case NotificationType.WARNING:
        return 5000;
      case NotificationType.ERROR:
        return 6000;
      default:
        return 4000;
    }
  }

  private getDefaultActionByType(type: NotificationType): string {
    switch (type) {
      case NotificationType.ERROR:
        return 'Close';
      default:
        return '';
    }
  }
}
