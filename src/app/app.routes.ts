import { Routes } from '@angular/router';
import { LandingComponent } from './core/components/landing/landing.component';
import { MainLayoutComponent } from './core/components/main-layout/main-layout.component';
import { SimpleLayoutComponent } from './core/components/simple-layout/simple-layout.component';

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
    path: 'auth-entry',
    component: SimpleLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => {
          return import(
            './features/auth/components/auth-entry/auth-entry.component'
          ).then((m) => m.AuthEntryComponent);
        },
      },
    ],
  },
  {
    path: 'login',
    component: SimpleLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => {
          return import(
            './features/auth/components/login/login.component'
          ).then((m) => m.LoginComponent);
        },
      },
    ],
  },
  {
    path: 'create-account',
    component: SimpleLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => {
          return import(
            './features/auth/components/create-account/create-account.component'
          ).then((m) => m.CreateAccountComponent);
        },
      },
    ],
  },
  {
    path: 'account-created',
    component: SimpleLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => {
          return import(
            './features/auth/components/account-created/account-created.component'
          ).then((m) => m.AccountCreatedComponent);
        },
      },
    ],
  },
];
