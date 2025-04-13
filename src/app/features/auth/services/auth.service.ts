import { HttpClient } from '@angular/common/http';
import {
  Inject,
  Injectable,
  Injector,
  runInInjectionContext,
  Signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { IdTokenResult, User } from '@angular/fire/auth';
import {
  catchError,
  combineLatest,
  distinctUntilChanged,
  firstValueFrom,
  of,
  switchMap,
} from 'rxjs';
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
import {
  AuthProviderName,
  CreateUserDTO,
} from '../models/create-user-dto.model';
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

    let firebaseUser: User | null = null;

    try {
      firebaseUser = await this.createFirebaseUser(dto);

      if (!firebaseUser || !firebaseUser.email || !firebaseUser.displayName) {
        throw createAppError(
          ErrorType.SERVER,
          'Invalid created user returned by Firebase'
        );
      }

      const createUserDTO: CreateUserDTO = {
        providerUserId: firebaseUser.uid,
        providerName: AuthProviderName.FIREBASE,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
      };

      await firstValueFrom(
        this.http.post<void>(`${this.env.apiUrl}/users`, createUserDTO)
      );
    } catch (error) {
      // If the user creation fails, delete the Firebase user
      if (firebaseUser) {
        try {
          await firstValueFrom(
            this.http.delete<void>(
              `${this.env.apiUrl}/users/${firebaseUser.uid}`
            )
          );
          this.logger.info(
            `Deleted Firebase user ${firebaseUser.uid} after registration failure`
          );
        } catch (deleteError) {
          this.logger.error(
            `Error deleting Firebase user ${firebaseUser.uid} after registration failure`,
            deleteError
          );
        }
      }

      throw ErrorUtils.formatServiceError(error, 'Registration failed');
    }
  }

  private async createFirebaseUser(
    dto: CreateAccountRequestDTO
  ): Promise<User> {
    const response = await this.authProvider.createUserWithEmailAndPassword(
      dto.email,
      dto.password
    );

    const user: User = response.user;

    await this.authProvider.updateProfile(user, {
      displayName: `${dto.firstName} ${dto.lastName}`,
    });

    return user;
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
        'Error logging in with user credentials'
      );
    }
  }

  public async signOut(): Promise<void> {
    try {
      await this.authProvider.signOut();
    } catch (error) {
      throw ErrorUtils.formatServiceError(error, 'Error logging out user');
    }
  }

  public async getIdTokenResult(forceRefresh = false): Promise<string | null> {
    try {
      const tokenResult: IdTokenResult | null =
        await this.authProvider.getIdTokenResult(forceRefresh);
      return tokenResult?.token ?? null;
    } catch (error) {
      this.logger.error('Failed to get ID token', error);
      return null;
    }
  }

  private initAppUser(): Signal<AppUser | null | undefined> {
    const appUser$ = combineLatest([
      this.authProvider.user(),
      this.authProvider.userRoles$,
    ]).pipe(
      takeUntilDestroyed(),
      distinctUntilChanged((prev, curr) => {
        // Only emit if uid is different or roles are different
        return (
          prev[0]?.uid === curr[0]?.uid &&
          JSON.stringify(prev[1]) === JSON.stringify(curr[1])
        );
      }),
      switchMap(([user, userRoles]) => {
        if (!user) return of(null);

        return of({
          uid: user.uid,
          email: user.email ?? '',
          displayName: user.displayName ?? '',
          // Extract roles from userRoles subscription
          roles: (userRoles as string[]) ?? [],
          createdAt: user.metadata?.creationTime
            ? new Date(user.metadata.creationTime)
            : undefined,
          lastLoginAt: user.metadata?.lastSignInTime
            ? new Date(user.metadata.lastSignInTime)
            : undefined,
        });
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
