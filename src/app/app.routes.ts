import { Routes } from '@angular/router';
import { LandingComponent } from './core/components/landing/landing.component';
import { MainLayoutComponent } from './core/components/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [{ path: '', component: LandingComponent }],
  },
  {
    path: 'planning',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => {
          return import(
            './features/planning/components/planning/planning.component'
          ).then((m) => m.PlanningComponent);
        },
      },
    ],
  },
  {
    path: 'login',
    loadComponent: () => {
      return import('./core/components/login/login.component').then(
        (m) => m.LoginComponent,
      );
    },
  },
];
