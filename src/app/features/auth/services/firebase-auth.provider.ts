import { Injectable, NgZone } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Auth,
  createUserWithEmailAndPassword,
  IdTokenResult,
  signInWithEmailAndPassword,
  updateProfile,
  User,
  user,
  UserCredential,
} from '@angular/fire/auth';
import { doc, Firestore, onSnapshot } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { LoggerService } from '../../../core/services/logger.service';

@Injectable({
  providedIn: 'root',
})
export class FirebaseAuthProvider {
  private _userRoles = new BehaviorSubject<string[]>([]);
  public readonly userRoles$ = this._userRoles.asObservable();

  private userRolesUnsubscribe: (() => void) | null = null;

  constructor(
    private readonly auth: Auth,
    private readonly firestore: Firestore,
    private readonly ngZone: NgZone,
    private readonly logger: LoggerService
  ) {
    this.setupUserRolesListener();
  }

  /**
   * Create new user with email and password
   */
  public createUserWithEmailAndPassword(
    email: string,
    password: string
  ): Promise<UserCredential> {
    return this.ngZone.run(() =>
      createUserWithEmailAndPassword(this.auth, email, password)
    );
  }

  /**
   * Update user profile data
   */
  public updateProfile(
    user: User,
    profile: { displayName?: string | null; photoURL?: string | null }
  ): Promise<void> {
    return this.ngZone.run(() => updateProfile(user, profile));
  }

  /**
   * Get observable of the authenticated user
   */
  public user(): Observable<User | null> {
    return this.ngZone.run(() => user(this.auth));
  }

  /**
   * Get ID token result with custom claims with roles
   */
  public getIdTokenResult(forceRefresh = false): Promise<IdTokenResult | null> {
    return this.ngZone.run(async () => {
      if (!this.auth.currentUser) {
        return null;
      }

      return this.auth.currentUser.getIdTokenResult(forceRefresh);
    });
  }

  /**
   *
   * @param email
   * @param password
   * @returns Promise<UserCredential>
   */

  public signInWithEmailAndPassword(
    email: string,
    password: string
  ): Promise<UserCredential> {
    return this.ngZone.run(() =>
      signInWithEmailAndPassword(this.auth, email, password)
    );
  }

  /**
   * Sign out the user
   */
  public signOut(): Promise<void> {
    return this.ngZone.run(() => this.auth.signOut());
  }

  private setupUserRolesListener(): void {
    this.user()
      .pipe(takeUntilDestroyed())
      .subscribe((user) => {
        if (user) {
          this.subscribeToUserRoles(user.uid);
        } else {
          this.unsubscribeFromUserRoles();
          this._userRoles.next([]);
        }
      });
  }

  /**
   * Subscribe to user roles changes in Firestore
   */
  private subscribeToUserRoles(userId: string): void {
    try {
      const userRolesRef = doc(this.firestore, `userRoles/${userId}`);

      this.userRolesUnsubscribe = onSnapshot(
        userRolesRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            const roles = (data && data['roles']) || [];

            this.logger.info(
              `Roles updated from Firestore for ${userId}:`,
              roles
            );
            this._userRoles.next(roles);

            // Force token refresh to update custom claims
            this.refreshIdToken();
          } else {
            // No roles document exists
            this._userRoles.next([]);
          }
        },
        (error) => {
          this.logger.error(
            `Error listening to user roles for ${userId}:`,
            error
          );
        }
      );
    } catch (error) {
      this.logger.error('Failed to subscribe to user roles:', error);
    }
  }

  /**
   * Force refresh of the ID token
   */
  private async refreshIdToken(): Promise<void> {
    try {
      await this.getIdTokenResult(true);
      this.logger.info('ID token refreshed after role update');
    } catch (error) {
      this.logger.error('Failed to refresh ID token:', error);
    }
  }

  /**
   * Unsubscribe from Firestore listener
   */
  private unsubscribeFromUserRoles(): void {
    if (this.userRolesUnsubscribe) {
      this.userRolesUnsubscribe();
      this.userRolesUnsubscribe = null;
    }
  }
}
