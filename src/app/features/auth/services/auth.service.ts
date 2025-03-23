import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
} from '@angular/fire/auth';
import { firstValueFrom, from, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private firebaseAuth: Auth,
    private http: HttpClient,
  ) {}

  private env = environment;

  public checkEmail(email: string): Promise<boolean> {
    const emailExists = this.http.post<boolean>(
      `${this.env.apiUrl}/auth/check-email`,
      { email },
    );

    return firstValueFrom(emailExists);
  }

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
