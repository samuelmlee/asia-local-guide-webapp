import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';

import { provideHttpClient } from '@angular/common/http';
import {
  MatDateFormats,
  provideNativeDateAdapter,
} from '@angular/material/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';

export const SHORT_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: 'YYYY-MM-DD',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
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
