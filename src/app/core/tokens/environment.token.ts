import { InjectionToken } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface Environment {
  apiUrl: string;
  production: boolean;
}

export const ENVIRONMENT = new InjectionToken<Environment>('environment', {
  providedIn: 'root',
  factory: () => environment as Environment,
});
