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
  distinctUntilChanged,
  firstValueFrom,
  from,
  map,
  Observable,
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
          'Error in creating User for Firebase'
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
      // If user creation fails, Firebase user is deleted from the backend

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
    const appUser$ = this.authProvider.user().pipe(
      takeUntilDestroyed(),
      switchMap((user): Observable<AppUser | null> => {
        if (!user) return of(null);

        // Emitting when Initial User is loaded / Firestore roles document changes
        return this.authProvider.onUserRolesSnapshot(user.uid).pipe(
          // Force token refresh when roles change in Firestore
          switchMap(() => from(this.authProvider.getIdTokenResult(true))),

          map(
            (idToken) =>
              ({
                uid: user.uid,
                email: user.email ?? '',
                displayName: user.displayName ?? '',
                // Token claims is single source of truth
                roles: idToken?.claims['roles'] ?? [],
                createdAt: user.metadata?.creationTime
                  ? new Date(user.metadata.creationTime)
                  : undefined,
                lastLoginAt: user.metadata?.lastSignInTime
                  ? new Date(user.metadata.lastSignInTime)
                  : undefined,
              }) as AppUser
          ),

          // Prevent duplicate AppUser emissions when token hasn't changed
          distinctUntilChanged(
            (prev, curr) =>
              prev.uid === curr.uid &&
              JSON.stringify(prev.roles) === JSON.stringify(curr.roles)
          ),

          // Handle errors in the token refresh or mapping
          catchError((error) => {
            this.logger.error('Error refreshing auth token', error);
            return of(null);
          })
        );
      }),
      catchError((error) => {
        this.logger.error('Authentication for user error', error);
        return of(null);
      })
    );

    return toSignal(appUser$);
  }
}
