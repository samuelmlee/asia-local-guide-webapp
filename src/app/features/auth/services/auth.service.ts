import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Auth,
  createUserWithEmailAndPassword,
  updateProfile,
  user,
} from '@angular/fire/auth';
import { catchError, firstValueFrom, from, map, of, switchMap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { createAppError } from '../../../core/models/app-error.model';
import { ErrorType } from '../../../core/models/error-type.enum';
import { LoggerService } from '../../../core/services/logger.service';
import { ErrorUtils } from '../../../core/utils/error.utils';
import { AppUser } from '../models/app-user.model';
import { CreateAccountRequestDTO } from '../models/create-account-request-dto.model';
import { EmailCheckResult } from '../models/email-check-result';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly env = environment;

  public appUser: Signal<AppUser | null | undefined>;

  constructor(
    private readonly firebaseAuth: Auth,
    private readonly http: HttpClient,
    private readonly ngZone: NgZone,
    private readonly logger: LoggerService
  ) {
    this.appUser = this.initAppUser();
  }

  public async checkEmail(email: string): Promise<EmailCheckResult> {
    if (!email) {
      throw createAppError(ErrorType.VALIDATION, 'Email is required');
    }

    try {
      const emailCheck = this.http.post<EmailCheckResult>(
        `${this.env.apiUrl}/auth/check-email`,
        { email }
      );

      return await firstValueFrom(emailCheck);
    } catch (error) {
      throw ErrorUtils.formatServiceError(error, 'Error checking email');
    }
  }

  public register(dto: CreateAccountRequestDTO): Promise<void> {
    if (!dto.email || !dto.password || !dto.firstName || !dto.lastName) {
      throw createAppError(ErrorType.VALIDATION, 'All fields are required');
    }

    return this.ngZone.run(async () => {
      try {
        const response = await createUserWithEmailAndPassword(
          this.firebaseAuth,
          dto.email,
          dto.password
        );
        await updateProfile(response.user, {
          displayName: `${dto.firstName} ${dto.lastName}`,
        });
      } catch (error) {
        throw ErrorUtils.formatServiceError(
          error,
          'Error creating user account'
        );
      }
    });
  }

  private initAppUser(): Signal<AppUser | null | undefined> {
    const appUser$ = this.ngZone.run(() =>
      user(this.firebaseAuth).pipe(
        switchMap((user) => {
          if (!user) return of(null);

          // Force refresh of Id token to get roles added by Firebase after account creation
          return from(user.getIdTokenResult(true)).pipe(
            map((token) => {
              return {
                uid: user.uid,
                email: user.email ?? '',
                displayName: user.displayName ?? '',
                // Extract roles from custom claims
                roles: (token.claims['roles'] as string[]) ?? [],
                createdAt: user.metadata?.creationTime
                  ? new Date(user.metadata.creationTime)
                  : undefined,
                lastLoginAt: user.metadata?.lastSignInTime
                  ? new Date(user.metadata.lastSignInTime)
                  : undefined,
              };
            }),
            catchError((error) => {
              this.logger.error(
                'Error fetching user Firebase Id token and Roles',
                error
              );
              return of({
                uid: user.uid,
                email: user.email ?? '',
                displayName: user.displayName ?? '',
                roles: [],
                createdAt: undefined,
                lastLoginAt: undefined,
              });
            })
          );
        }),
        catchError((error) => {
          // Log the auth stream error
          this.logger.error('Authentication for user error', error);
          return of(null);
        })
      )
    );

    return toSignal(appUser$);
  }
}
