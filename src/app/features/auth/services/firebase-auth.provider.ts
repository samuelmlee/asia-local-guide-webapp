import { Injectable, NgZone } from '@angular/core';
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
import {
  doc,
  DocumentReference,
  DocumentSnapshot,
  Firestore,
  onSnapshot,
  Timestamp,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { LoggerService } from '../../../core/services/logger.service';

export interface UserRolesDocument {
  email: string;
  roles: string[];
  updatedAt: Timestamp; // Firebase timestamp
}

@Injectable({
  providedIn: 'root',
})
export class FirebaseAuthProvider {
  constructor(
    private readonly auth: Auth,
    private readonly firestore: Firestore,
    private readonly ngZone: NgZone,
    private readonly logger: LoggerService
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

  /**
   * Listen to a Firestore document and return an Observable of DocumentSnapshot
   * @param documentPath Path to the document
   * @returns Observable of document snapshots
   */
  public onUserRolesSnapshot(userId: string): Observable<DocumentSnapshot> {
    return new Observable<DocumentSnapshot>((observer) => {
      try {
        if (userId?.length === 0) {
          const error = new Error(`Invalid userId: ${userId}`);
          observer.error(error);
          return () => {
            return;
          };
        }

        const docRef: DocumentReference = doc(
          this.firestore,
          `userRoles/${userId}`
        );

        // The onSnapshot function returns an unsubscribe function
        const unsubscribe = onSnapshot(
          docRef,
          (snapshot) => {
            // Emit the snapshot to subscribers
            observer.next(snapshot);
          },
          (error) => {
            this.logger.error(
              `Error in document snapshot listener for userRoles/${userId}`,
              error
            );
            observer.error(error);
          }
        );

        // Return the teardown logic
        return () => unsubscribe();
      } catch (error) {
        this.logger.error(
          `Failed to set up document listener for userRoles/${userId}`,
          error
        );
        observer.error(error);
        return () => {
          return;
        };
      }
    });
  }
}
