import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  public info(template: string, ...optionalParams: unknown[]): void {
    console.log(template, ...optionalParams);
  }

  public warning(template: string, ...optionalParams: unknown[]): void {
    console.warn(template, ...optionalParams);
  }

  public error(template: string, ...optionalParams: unknown[]): void {
    console.error(template, ...optionalParams);
  }
}
