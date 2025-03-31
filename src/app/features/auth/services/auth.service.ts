import { HttpClient } from '@angular/common/http';
import {
  Inject,
  Injectable,
  Injector,
  runInInjectionContext,
  Signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, firstValueFrom, from, map, of, switchMap } from 'rxjs';
import { createAppError } from '../../../core/models/app-error.model';
import { ErrorType } from '../../../core/models/error-type.enum';
import { LoggerService } from '../../../core/services/logger.service';
import {
  Environment,
  ENVIRONMENT,
} from '../../../core/tokens/environment.token';
import { ErrorUtils } from '../../../core/utils/error.utils';
import { AppUser } from '../models/app-user.model';
import { CreateAccountRequestDTO } from '../models/create-account-request-dto.model';
import { EmailCheckResult } from '../models/email-check-result';
import { FirebaseAuthProvider } from './firebase-auth.provider';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _appUser: Signal<AppUser | null | undefined> | undefined;

  constructor(
    private readonly http: HttpClient,
    private readonly authProvider: FirebaseAuthProvider,
    private readonly logger: LoggerService,
    private readonly injector: Injector,
    @Inject(ENVIRONMENT) private readonly env: Environment
  ) {}

  public get appUser(): Signal<AppUser | null | undefined> {
    if (!this._appUser) {
      // Run in injection context and set _appUser
      runInInjectionContext(
        this.injector,
        () => (this._appUser = this.initAppUser())
      );
    }

    return this._appUser!;
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

  public async register(dto: CreateAccountRequestDTO): Promise<void> {
    if (!dto.email || !dto.password || !dto.firstName || !dto.lastName) {
      throw createAppError(ErrorType.VALIDATION, 'All fields are required');
    }

    try {
      const response = await this.authProvider.createUserWithEmailAndPassword(
        dto.email,
        dto.password
      );
      await this.authProvider.updateProfile(response.user, {
        displayName: `${dto.firstName} ${dto.lastName}`,
      });
    } catch (error) {
      throw ErrorUtils.formatServiceError(error, 'Error creating user account');
    }
  }

  public async signInWithEmailAndPassword(
    email: string,
    password: string
  ): Promise<void> {
    if (!email?.length || !password?.length) {
      throw createAppError(
        ErrorType.VALIDATION,
        'Email and password are required'
      );
    }

    try {
      await this.authProvider.signInWithEmailAndPassword(email, password);
    } catch (error) {
      throw ErrorUtils.formatServiceError(
        error,
        'Error loging with user credentials'
      );
    }
  }

  private initAppUser(): Signal<AppUser | null | undefined> {
    const appUser$ = this.authProvider.user().pipe(
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
    );

    return toSignal(appUser$);
  }
}
