import { Routes } from '@angular/router';
import { LandingComponent } from './core/components/landing/landing.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
  },
  {
    path: 'calendar',
    loadComponent: () => {
      return import(
        './features/calendar/components/calendar/calendar.component'
      ).then((m) => m.CalendarComponent);
    },
  },
];
