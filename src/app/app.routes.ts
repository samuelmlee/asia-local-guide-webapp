import { Routes } from '@angular/router';
import { LandingComponent } from './core/components/landing/landing.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
  },
  {
    path: 'planning',
    loadComponent: () => {
      return import(
        './features/planning/components/planning/planning.component'
      ).then((m) => m.PlanningComponent);
    },
  },
];
