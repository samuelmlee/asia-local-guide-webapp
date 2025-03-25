import { HttpClient } from '@angular/common/http';
import { EnvironmentInjector, Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  user,
  UserCredential,
} from '@angular/fire/auth';
import { firstValueFrom, map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AppUser } from '../models/app-user.model';
import { CreateAccountRequestDTO } from '../models/create-account-request-dto.model';
import { EmailCheckResult } from '../models/email-check-result';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private env = environment;

  public appUser$: Observable<AppUser | null>;

  constructor(
    private firebaseAuth: Auth,
    private http: HttpClient,
    private environmentInjector: EnvironmentInjector,
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
      map((user) => {
        if (!user) return null;

        return {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          // TODO: check API to get custom claims
          roles: [],
          emailVerified: user.emailVerified,
          isAnonymous: user.isAnonymous,
          createdAt: user.metadata?.creationTime
            ? new Date(user.metadata.creationTime)
            : undefined,
          lastLoginAt: user.metadata?.lastSignInTime
            ? new Date(user.metadata.lastSignInTime)
            : undefined,
        };
      }),
    );
  }
}
