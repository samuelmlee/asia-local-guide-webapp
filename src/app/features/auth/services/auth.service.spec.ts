import { HttpClient } from '@angular/common/http';
import {
  Injector,
  provideExperimentalZonelessChangeDetection,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { IdTokenResult, User, UserCredential } from '@angular/fire/auth';
import {
  DocumentData,
  DocumentSnapshot,
  QueryDocumentSnapshot,
} from '@angular/fire/firestore';
import { of, Subject, throwError } from 'rxjs';
import { ErrorType } from '../../../core/models/error-type.enum';
import { LoggerService } from '../../../core/services/logger.service';
import {
  ENVIRONMENT,
  Environment,
} from '../../../core/tokens/environment.token';
import { ErrorUtils } from '../../../core/utils/error.utils';
import { EmailCheckResult } from '../models/email-check-result';
import { AuthService } from './auth.service';
import { FirebaseAuthProvider } from './firebase-auth.provider';

describe('AuthService', () => {
  let service: AuthService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let authProviderSpy: jasmine.SpyObj<FirebaseAuthProvider>;
  let loggerSpy: jasmine.SpyObj<LoggerService>;

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post']);
    authProviderSpy = jasmine.createSpyObj(
      'FirebaseAuthProvider',
      [
        'user',
        'createUserWithEmailAndPassword',
        'updateProfile',
        'getIdTokenResult',
        'signInWithEmailAndPassword',
        'signOut',
      ],
      {
        userRoles$: of([]), // Mocking userRoles$ as an observable
      }
    );
    loggerSpy = jasmine.createSpyObj('LoggerService', [
      'info',
      'warning',
      'error',
    ]);

    const mockEnvironment: Environment = {
      apiUrl: 'http://localhost:8080',
      production: false,
    };

    // Default return value for user observable
    authProviderSpy.user.and.returnValue(of(null));

    service = new AuthService(
      httpClientSpy,
      authProviderSpy,
      loggerSpy,
      { get: () => null } as Injector, // Mock injector
      mockEnvironment
    );
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('appUser signal', () => {
    // Create mock subjects and values
    let roleDocumentSubject: Subject<
      DocumentSnapshot<DocumentData, DocumentData>
    >;
    let mockIdToken: Partial<IdTokenResult>;
    beforeEach(() => {
      // Reset TestBed before each test
      TestBed.resetTestingModule();

      // Create mock subjects and values
      roleDocumentSubject = new Subject<
        DocumentSnapshot<DocumentData, DocumentData>
      >();
      mockIdToken = {
        claims: { roles: ['user', 'admin'] },
        token: 'mock-token-123',
      };

      // Set up spies
      httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post']);
      loggerSpy = jasmine.createSpyObj('LoggerService', [
        'info',
        'warning',
        'error',
      ]);

      // Configure auth provider spy with all needed methods
      authProviderSpy = jasmine.createSpyObj('FirebaseAuthProvider', [
        'user',
        'onUserRolesSnapshot',
        'getIdTokenResult',
        'signOut',
      ]);

      // Configure default behaviors
      authProviderSpy.user.and.returnValue(of(null));
      authProviderSpy.onUserRolesSnapshot.and.returnValue(
        roleDocumentSubject.asObservable()
      );
      authProviderSpy.getIdTokenResult.and.returnValue(
        Promise.resolve(mockIdToken as IdTokenResult)
      );

      TestBed.configureTestingModule({
        providers: [
          AuthService,
          { provide: HttpClient, useValue: httpClientSpy },
          { provide: FirebaseAuthProvider, useValue: authProviderSpy },
          { provide: LoggerService, useValue: loggerSpy },
          {
            provide: ENVIRONMENT,
            useValue: { apiUrl: 'http://localhost:8080' },
          },
          provideExperimentalZonelessChangeDetection(),
        ],
      });
    });

    it('should lazily initialize the signal when first accessed', () => {
      // Get service from TestBed
      service = TestBed.inject(AuthService);

      // The spy shouldn't be called until we access appUser
      expect(authProviderSpy.user).not.toHaveBeenCalled();

      // Access triggers initialization
      service.appUser();

      // Now it should have been called
      expect(authProviderSpy.user).toHaveBeenCalled();
    });

    it('should return null when user is not authenticated', async () => {
      // Configure auth provider to return null user
      authProviderSpy.user.and.returnValue(of(null));

      // Get service
      service = TestBed.inject(AuthService);

      // Access the signal
      service.appUser();

      // Should return null for unauthenticated user
      expect(service.appUser()).toBeNull();
    });

    it('should map Firebase user and token claims to AppUser when authenticated', async () => {
      // Create a mock user
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        metadata: {
          creationTime: '2023-01-01T12:00:00Z',
          lastSignInTime: '2023-01-02T12:00:00Z',
        },
      } as unknown as User;

      // Configure auth provider for authenticated user flow
      authProviderSpy.user.and.returnValue(of(mockUser));

      // Get service
      service = TestBed.inject(AuthService);

      // Initialize signal
      service.appUser();

      const documentSnapshot = {
        exists(): this is QueryDocumentSnapshot<DocumentData, DocumentData> {
          return true;
        },
        data: () => ({ roles: ['user', 'admin'] }),
      } as Partial<DocumentSnapshot<DocumentData, DocumentData>>;

      // Emit a document change to trigger the token refresh
      roleDocumentSubject.next(
        documentSnapshot as DocumentSnapshot<DocumentData, DocumentData>
      );

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Verify the mapped user with roles from token claims
      expect(service.appUser()).toBeTruthy();
      expect(service.appUser()?.uid).toBe('test-uid');
      expect(service.appUser()?.email).toBe('test@example.com');
      expect(service.appUser()?.displayName).toBe('Test User');
      expect(service.appUser()?.roles).toEqual(['user', 'admin']); // From token claims
      expect(service.appUser()?.createdAt).toEqual(jasmine.any(Date));
      expect(service.appUser()?.lastLoginAt).toEqual(jasmine.any(Date));

      // Verify token was refreshed
      expect(authProviderSpy.getIdTokenResult).toHaveBeenCalledWith(true);
    });

    it('should handle errors in the auth stream', async () => {
      // Configure auth provider to throw an error
      const streamError = new Error('Auth stream failed');
      authProviderSpy.user.and.returnValue(throwError(() => streamError));

      // Get service
      service = TestBed.inject(AuthService);

      // Initialize signal
      service.appUser();

      // Should return null on error
      expect(service.appUser()).toBeNull();

      // Verify error was logged
      expect(loggerSpy.error).toHaveBeenCalledWith(
        'Authentication for user error',
        jasmine.objectContaining({
          message: 'Auth stream failed',
        })
      );
    });

    it('should refresh token and update roles when Firestore document changes', async () => {
      // Create a mock user
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        metadata: {
          creationTime: '2023-01-01T12:00:00Z',
          lastSignInTime: '2023-01-02T12:00:00Z',
        },
      } as unknown as User;

      // Configure auth provider
      authProviderSpy.user.and.returnValue(of(mockUser));

      // Get service
      service = TestBed.inject(AuthService);

      // Initialize signal
      service.appUser();

      const initialSnapshot = {
        exists(): this is QueryDocumentSnapshot<DocumentData, DocumentData> {
          return true;
        },
      } as Partial<DocumentSnapshot<DocumentData, DocumentData>>;

      // Emit first document change
      roleDocumentSubject.next(
        initialSnapshot as DocumentSnapshot<DocumentData, DocumentData>
      );

      // Verify token was refreshed
      expect(authProviderSpy.getIdTokenResult).toHaveBeenCalledTimes(1);

      // Update token claims for second refresh
      const updatedToken: Partial<IdTokenResult> = {
        claims: { roles: ['user', 'admin', 'super-admin'] },
        token: 'updated-token-456',
      };
      authProviderSpy.getIdTokenResult.and.returnValue(
        Promise.resolve(updatedToken as IdTokenResult)
      );

      // Reset the spy to track next call
      authProviderSpy.getIdTokenResult.calls.reset();

      const updatedSnapshot = {
        exists(): this is QueryDocumentSnapshot<DocumentData, DocumentData> {
          return true;
        },
      } as Partial<DocumentSnapshot<DocumentData, DocumentData>>;

      // Trigger second document change
      roleDocumentSubject.next(
        updatedSnapshot as DocumentSnapshot<DocumentData, DocumentData>
      );

      // Verify token was refreshed again
      expect(authProviderSpy.getIdTokenResult).toHaveBeenCalledWith(true);

      // Wait for token to be processed
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Verify roles were updated from the new token
      expect(service.appUser()?.roles).toEqual([
        'user',
        'admin',
        'super-admin',
      ]);
    });

    it('should handle errors during token refresh', async () => {
      // Create a mock user
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        metadata: {
          creationTime: '2023-01-01T12:00:00Z',
          lastSignInTime: '2023-01-02T12:00:00Z',
        },
      } as unknown as User;

      // Configure auth provider
      authProviderSpy.user.and.returnValue(of(mockUser));

      // Configure token refresh to fail
      const tokenError = new Error('Token refresh failed');
      authProviderSpy.getIdTokenResult.and.returnValue(
        Promise.reject(tokenError)
      );

      // Get service
      service = TestBed.inject(AuthService);

      // Initialize signal
      service.appUser();

      const documentSnapshot = {
        exists(): this is QueryDocumentSnapshot<DocumentData, DocumentData> {
          return true;
        },
      } as Partial<DocumentSnapshot<DocumentData, DocumentData>>;

      // Trigger document change
      roleDocumentSubject.next(
        documentSnapshot as DocumentSnapshot<DocumentData, DocumentData>
      );

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Should return null on token error
      expect(service.appUser()).toBeNull();

      // Verify error was logged
      expect(loggerSpy.error).toHaveBeenCalledWith(
        'Error refreshing auth token',
        jasmine.any(Error)
      );
    });
  });

  describe('checkEmail', () => {
    it('should throw validation error if email is empty', async () => {
      await expectAsync(service.checkEmail('')).toBeRejectedWith({
        type: ErrorType.VALIDATION,
        message: 'Email is required',
        originalError: new Error('Email is required'),
      });

      expect(httpClientSpy.post).not.toHaveBeenCalled();
    });

    it('should call API and return that email exists', async () => {
      const mockResponse: EmailCheckResult = {
        email: 'existing@example.com',
        exists: true,
      };

      httpClientSpy.post.and.returnValue(of(mockResponse));

      const result = await service.checkEmail('existing@example.com');

      expect(httpClientSpy.post).toHaveBeenCalledWith(
        jasmine.stringContaining('/auth/check-email'),
        { email: 'existing@example.com' }
      );
      expect(result).toEqual(mockResponse);
      expect(result.exists).toBeTrue();
    });

    it('should call API and return that email does not exist', async () => {
      const mockResponse: EmailCheckResult = {
        email: 'new@example.com',
        exists: false,
      };

      httpClientSpy.post.and.returnValue(of(mockResponse));

      const result = await service.checkEmail('new@example.com');

      expect(httpClientSpy.post).toHaveBeenCalledWith(
        jasmine.stringContaining('/auth/check-email'),
        { email: 'new@example.com' }
      );
      expect(result).toEqual(mockResponse);
      expect(result.exists).toBeFalse();
    });

    it('should format service errors correctly', async () => {
      const mockError = new Error('Network error');
      const formattedError = {
        type: ErrorType.NETWORK,
        message: 'Formatted error',
        originalError: mockError,
      };

      httpClientSpy.post.and.throwError(mockError);

      spyOn(ErrorUtils, 'formatServiceError').and.returnValue(formattedError);

      await expectAsync(service.checkEmail('test@example.com')).toBeRejected();
      expect(ErrorUtils.formatServiceError).toHaveBeenCalledWith(
        mockError,
        'Error checking email'
      );
    });
  });

  describe('register', () => {
    it('should throw validation error if any field is missing', async () => {
      // Test missing email
      await expectAsync(
        service.register({
          email: '',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
        })
      ).toBeRejectedWith(
        jasmine.objectContaining({
          type: ErrorType.VALIDATION,
          message: jasmine.stringMatching(/All fields are required/),
        })
      );

      // Test missing password
      await expectAsync(
        service.register({
          email: 'test@example.com',
          password: '',
          firstName: 'John',
          lastName: 'Doe',
        })
      ).toBeRejectedWith(
        jasmine.objectContaining({
          type: ErrorType.VALIDATION,
          message: jasmine.stringMatching(/All fields are required/),
        })
      );

      // Test missing firstName
      await expectAsync(
        service.register({
          email: 'test@example.com',
          password: 'password123',
          firstName: '',
          lastName: 'Doe',
        })
      ).toBeRejectedWith(
        jasmine.objectContaining({
          type: ErrorType.VALIDATION,
          message: jasmine.stringMatching(/All fields are required/),
        })
      );

      // Test missing lastName
      await expectAsync(
        service.register({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: '',
        })
      ).toBeRejectedWith(
        jasmine.objectContaining({
          type: ErrorType.VALIDATION,
          message: jasmine.stringMatching(/All fields are required/),
        })
      );
    });

    it('should create user account and update profile on successful registration', async () => {
      // Setup mock user and credential
      const mockUser: Partial<User> = {
        uid: 'new-user-123',
        email: 'newuser@example.com',
        displayName: 'New User',
      };
      const mockUserCredential: Partial<UserCredential> = {
        user: mockUser as User,
      };

      // Configure spies for this test case
      authProviderSpy.createUserWithEmailAndPassword.and.returnValue(
        Promise.resolve(mockUserCredential as UserCredential)
      );
      authProviderSpy.updateProfile.and.returnValue(Promise.resolve());

      httpClientSpy.post.and.returnValue(of({ userId: '1' }));

      // Execute registration
      await service.register({
        email: 'newuser@example.com',
        password: 'SecurePassword123',
        firstName: 'Jane',
        lastName: 'Smith',
      });

      // Verify auth provider methods were called with correct arguments
      expect(
        authProviderSpy.createUserWithEmailAndPassword
      ).toHaveBeenCalledWith('newuser@example.com', 'SecurePassword123');

      expect(authProviderSpy.updateProfile).toHaveBeenCalledWith(
        mockUser as User,
        {
          displayName: 'Jane Smith',
        }
      );
    });

    it('should handle error when creating user account', async () => {
      // Setup error case
      const authError = new Error('Email already in use');
      const formattedError = {
        type: ErrorType.UNAUTHORIZED,
        message: 'Formatted account creation error',
        originalError: authError,
      };

      // Reset and reconfigure spies for this test case
      authProviderSpy.createUserWithEmailAndPassword.calls.reset();
      authProviderSpy.updateProfile.calls.reset();
      authProviderSpy.createUserWithEmailAndPassword.and.returnValue(
        Promise.reject(authError)
      );

      // Mock the error formatting utility
      spyOn(ErrorUtils, 'formatServiceError').and.returnValue(formattedError);

      // Execute and verify error handling
      await expectAsync(
        service.register({
          email: 'existing@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
        })
      ).toBeRejectedWith(formattedError);

      expect(authProviderSpy.createUserWithEmailAndPassword).toHaveBeenCalled();
      expect(authProviderSpy.updateProfile).not.toHaveBeenCalled(); // Should not be called after error
      expect(ErrorUtils.formatServiceError).toHaveBeenCalledWith(
        authError,
        'Registration failed'
      );
    });

    it('should handle error when updating user profile', async () => {
      // Setup mock user and error cases
      const mockUser = { uid: 'new-user-123' };
      const mockUserCredential = { user: mockUser };
      const profileError = new Error('Profile update failed');
      const formattedError = {
        type: ErrorType.VALIDATION,
        message: 'Formatted profile error',
        originalError: profileError,
      };

      // Reset and reconfigure spies for this test
      authProviderSpy.createUserWithEmailAndPassword.calls.reset();
      authProviderSpy.updateProfile.calls.reset();

      authProviderSpy.createUserWithEmailAndPassword.and.returnValue(
        Promise.resolve(mockUserCredential as UserCredential)
      );
      authProviderSpy.updateProfile.and.returnValue(
        Promise.reject(profileError)
      );
      spyOn(ErrorUtils, 'formatServiceError').and.returnValue(formattedError);

      // Execute and verify profile error handling
      await expectAsync(
        service.register({
          email: 'valid@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
        })
      ).toBeRejectedWith(formattedError);

      expect(authProviderSpy.createUserWithEmailAndPassword).toHaveBeenCalled();
      expect(authProviderSpy.updateProfile).toHaveBeenCalled();
      expect(ErrorUtils.formatServiceError).toHaveBeenCalledWith(
        profileError,
        'Registration failed'
      );
    });
  });

  describe('signInWithEmailAndPassword', () => {
    it('should throw validation error if email is missing', async () => {
      await expectAsync(
        service.signInWithEmailAndPassword('', 'password123')
      ).toBeRejectedWith(
        jasmine.objectContaining({
          type: ErrorType.VALIDATION,
          message: jasmine.stringMatching(/Email and password are required/),
        })
      );

      // Verify the auth provider was never called
      expect(authProviderSpy.signInWithEmailAndPassword).not.toHaveBeenCalled();
    });

    it('should throw validation error if password is missing', async () => {
      await expectAsync(
        service.signInWithEmailAndPassword('test@example.com', '')
      ).toBeRejectedWith(
        jasmine.objectContaining({
          type: ErrorType.VALIDATION,
          message: jasmine.stringMatching(/Email and password are required/),
        })
      );

      expect(authProviderSpy.signInWithEmailAndPassword).not.toHaveBeenCalled();
    });

    it('should call Firebase auth provider with correct credentials when successful', async () => {
      // Configure the spy to resolve successfully
      authProviderSpy.signInWithEmailAndPassword.and.returnValue(
        Promise.resolve({} as UserCredential)
      );

      // Call the method
      await service.signInWithEmailAndPassword(
        'user@example.com',
        'securePass123'
      );

      // Verify the provider was called with correct arguments
      expect(authProviderSpy.signInWithEmailAndPassword).toHaveBeenCalledWith(
        'user@example.com',
        'securePass123'
      );
    });

    it('should format and re-throw authentication errors', async () => {
      // Set up an auth error
      const authError = new Error('Invalid credentials');
      const formattedError = {
        type: ErrorType.UNAUTHORIZED,
        message: 'Authentication failed',
        originalError: authError,
      };

      // Configure spies
      authProviderSpy.signInWithEmailAndPassword.and.returnValue(
        Promise.reject(authError)
      );
      spyOn(ErrorUtils, 'formatServiceError').and.returnValue(formattedError);

      // Call the method and expect it to fail
      await expectAsync(
        service.signInWithEmailAndPassword('user@example.com', 'wrongPassword')
      ).toBeRejectedWith(formattedError);

      // Verify the error was formatted correctly
      expect(ErrorUtils.formatServiceError).toHaveBeenCalledWith(
        authError,
        'Error logging in with user credentials'
      );
    });
  });

  describe('signOut', () => {
    it('should call Firebase auth provider signOut method when successful', async () => {
      // Configure the spy to resolve successfully
      authProviderSpy.signOut.and.returnValue(Promise.resolve());

      // Call the method
      await service.signOut();

      // Verify the provider was called
      expect(authProviderSpy.signOut).toHaveBeenCalled();
    });

    it('should format and re-throw errors that occur during sign out', async () => {
      // Set up a sign out error
      const signOutError = new Error('Failed to sign out');
      const formattedError = {
        type: ErrorType.UNKNOWN,
        message: 'Formatted sign out error',
        originalError: signOutError,
      };

      // Configure spies
      authProviderSpy.signOut.and.returnValue(Promise.reject(signOutError));
      spyOn(ErrorUtils, 'formatServiceError').and.returnValue(formattedError);

      // Call the method and expect it to fail
      await expectAsync(service.signOut()).toBeRejectedWith(formattedError);

      // Verify the error was formatted correctly
      expect(ErrorUtils.formatServiceError).toHaveBeenCalledWith(
        signOutError,
        'Error logging out user'
      );
    });
  });
});
