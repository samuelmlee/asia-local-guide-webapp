import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
} from '@angular/fire/auth';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private firebaseAuth: Auth) {}

  public login(email: string, password: string): Observable<UserCredential> {
    return from(signInWithEmailAndPassword(this.firebaseAuth, email, password));
  }

  public register(email: string, password: string): Observable<UserCredential> {
    return from(
      createUserWithEmailAndPassword(this.firebaseAuth, email, password),
    );
  }

  public logout(): Observable<void> {
    return from(signOut(this.firebaseAuth));
  }
}
