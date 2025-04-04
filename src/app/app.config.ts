import {
  ApplicationConfig,
  provideExperimentalZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import {
  MAT_NATIVE_DATE_FORMATS,
  MatDateFormats,
  provideNativeDateAdapter,
} from '@angular/material/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { httpErrorInterceptor } from './core/services/http-error.interceptor';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from './core/services/notification.service';
import { SnackbarNotificationService } from './core/services/snackbar-notification.service';

export const SHORT_DATE_FORMATS: MatDateFormats = MAT_NATIVE_DATE_FORMATS;

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideRouter(
      routes,
      withRouterConfig({
        onSameUrlNavigation: 'reload',
      })
    ),
    provideAnimations(),
    provideHttpClient(withInterceptors([httpErrorInterceptor])),
    provideNativeDateAdapter(SHORT_DATE_FORMATS),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    {
      provide: NotificationService,
      // Implement DeviceService to resolve Device type and implementation
      useFactory: (snackBar: MatSnackBar) =>
        new SnackbarNotificationService(snackBar),
      deps: [MatSnackBar],
    },
  ],
};
