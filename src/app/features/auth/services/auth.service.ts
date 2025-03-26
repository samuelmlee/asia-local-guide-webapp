import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  user,
  UserCredential,
} from '@angular/fire/auth';
import { firstValueFrom, from, map, Observable, of, switchMap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AppUser } from '../models/app-user.model';
import { CreateAccountRequestDTO } from '../models/create-account-request-dto.model';
import { EmailCheckResult } from '../models/email-check-result';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly env = environment;

  public appUser$: Observable<AppUser | null>;

  constructor(
    private readonly firebaseAuth: Auth,
    private readonly http: HttpClient,
  ) {
    this.appUser$ = this.initAppUser();
  }

  public checkEmail(email: string): Promise<EmailCheckResult> {
    const emailCheck = this.http.post<EmailCheckResult>(
      `${this.env.apiUrl}/auth/check-email`,
      { email },
    );

    return firstValueFrom(emailCheck);
  }

  public login(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.firebaseAuth, email, password);
  }

  public register(
    dto: CreateAccountRequestDTO,
  ): Promise<UserCredential | void> {
    return createUserWithEmailAndPassword(
      this.firebaseAuth,
      dto.email,
      dto.password,
    ).then((response) =>
      updateProfile(response.user, {
        displayName: `${dto.firstName} ${dto.lastName}`,
      }),
    );
  }

  public logout(): Promise<void> {
    return signOut(this.firebaseAuth);
  }

  private initAppUser(): Observable<AppUser | null> {
    return user(this.firebaseAuth).pipe(
      switchMap((user) => {
        if (!user) return of(null);

        // Force refresh of Id token to get roles added after account creation
        return from(user.getIdTokenResult(true)).pipe(
          map((token) => {
            return {
              uid: user.uid,
              email: user.email || '',
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
        );
      }),
    );
  }
}
