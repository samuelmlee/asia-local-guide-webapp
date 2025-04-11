import { Injectable, NgZone } from '@angular/core';
import {
  Auth,
  IdTokenResult,
  User,
  UserCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  user,
} from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirebaseAuthProvider {
  constructor(
    private readonly auth: Auth,
    private readonly ngZone: NgZone
  ) {}

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
}
