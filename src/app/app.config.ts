import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';

import { provideHttpClient } from '@angular/common/http';
import {
  MAT_NATIVE_DATE_FORMATS,
  MatDateFormats,
  provideNativeDateAdapter,
} from '@angular/material/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';

export const SHORT_DATE_FORMATS: MatDateFormats = {
  ...MAT_NATIVE_DATE_FORMATS,
  display: {
    ...MAT_NATIVE_DATE_FORMATS.display,
    dateInput: {
      dateInput: {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      } as Intl.DateTimeFormatOptions,
    },
  },
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withRouterConfig({
        onSameUrlNavigation: 'reload',
      }),
    ),
    provideAnimations(),
    provideHttpClient(),
    provideNativeDateAdapter(SHORT_DATE_FORMATS),
  ],
};
