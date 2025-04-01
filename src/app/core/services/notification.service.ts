import { Injectable } from '@angular/core';

export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info',
  WARNING = 'warning',
}

export interface NotificationOptions {
  duration?: number;
  action?: string;
}

@Injectable()
export abstract class NotificationService {
  public abstract showSuccess(
    message: string,
    options?: NotificationOptions
  ): void;

  public abstract showError(
    message: string,
    options?: NotificationOptions
  ): void;

  public abstract showInfo(
    message: string,
    options?: NotificationOptions
  ): void;

  public abstract showWarning(
    message: string,
    options?: NotificationOptions
  ): void;
}
