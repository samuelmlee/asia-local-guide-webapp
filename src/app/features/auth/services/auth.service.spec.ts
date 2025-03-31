import { HttpClient } from '@angular/common/http';
import {
  Injector,
  provideExperimentalZonelessChangeDetection,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { IdTokenResult, User, UserCredential } from '@angular/fire/auth';
import { of } from 'rxjs';
import { ErrorType } from '../../../core/models/error-type.enum';
import { LoggerService } from '../../../core/services/logger.service';
import { Environment } from '../../../core/tokens/environment.token';
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
    authProviderSpy = jasmine.createSpyObj('FirebaseAuthProvider', [
      'user',
      'createUserWithEmailAndPassword',
      'updateProfile',
      'getIdTokenResult',
      'signInWithEmailAndPassword',
    ]);
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
    it('should lazily initialize the signal when first accessed', () => {
      // The spy shouldn't be called until we access appUser
      expect(authProviderSpy.user).not.toHaveBeenCalled();

      // Access triggers initialization
      service.appUser();

      // Now it should have been called
      expect(authProviderSpy.user).toHaveBeenCalled();
    });

    it('should return null when user is not authenticated', async () => {
      // Already configured in beforeEach with of(null)

      // Call getter to initialize
      service.appUser();

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Check the value
      expect(service.appUser()).toBeNull();
    });

    it('should map Firebase user to AppUser when authenticated', async () => {
      TestBed.resetTestingModule();

      // Setup with getIdTokenResult spy on the user object
      const mockToken: Partial<IdTokenResult> = {
        claims: { roles: ['user', 'admin'] },
        token: 'mock-token',
        authTime: '2023-01-01T00:00:00.000Z',
        expirationTime: '2023-01-02T00:00:00.000Z',
        issuedAtTime: '2023-01-01T00:00:00.000Z',
      };

      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        metadata: {
          creationTime: '2023-01-01T12:00:00Z',
          lastSignInTime: '2023-01-02T12:00:00Z',
        },
        // Add method to mock user
        getIdTokenResult: () => Promise.resolve(mockToken as IdTokenResult),
      } as unknown as User;

      // Configure the spy on the user
      spyOn(mockUser, 'getIdTokenResult').and.returnValue(
        Promise.resolve(mockToken as IdTokenResult)
      );

      // Re-create all the spies with new behavior
      httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post']);
      authProviderSpy = jasmine.createSpyObj('FirebaseAuthProvider', ['user']);
      loggerSpy = jasmine.createSpyObj('LoggerService', [
        'info',
        'warning',
        'error',
      ]);

      // Configure the auth provider - pass the user with working getIdTokenResult
      authProviderSpy.user.and.returnValue(of(mockUser));

      // Configure TestBed
      TestBed.configureTestingModule({
        providers: [
          AuthService,
          { provide: HttpClient, useValue: httpClientSpy },
          { provide: FirebaseAuthProvider, useValue: authProviderSpy },
          { provide: LoggerService, useValue: loggerSpy },
          provideExperimentalZonelessChangeDetection(),
        ],
      });

      // Get the service
      service = TestBed.inject(AuthService);

      // Call the getter to initialize the signal
      service.appUser();

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Assert
      expect(service.appUser()).toBeTruthy();
      expect(service.appUser()?.uid).toBe('test-uid');
      expect(service.appUser()?.email).toBe('test@example.com');
      expect(service.appUser()?.displayName).toBe('Test User');
      expect(service.appUser()?.roles).toEqual(['user', 'admin']);
      expect(service.appUser()?.createdAt).toEqual(jasmine.any(Date));
      expect(service.appUser()?.lastLoginAt).toEqual(jasmine.any(Date));

      // Verify the user's getIdTokenResult was called with force refresh
      expect(mockUser.getIdTokenResult).toHaveBeenCalledWith(true);
    });

    it('should handle error when getIdTokenResult throws exception', async () => {
      // Reset TestBed for this specific test
      TestBed.resetTestingModule();

      // Create token error
      const tokenError = new Error('Token fetch failed');

      // Setup user object but with failing getIdTokenResult
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        metadata: {
          creationTime: '2023-01-01T12:00:00Z',
          lastSignInTime: '2023-01-02T12:00:00Z',
        },
        // Method that throws an error
        getIdTokenResult: () => Promise.reject(tokenError),
      } as unknown as User;

      // Spy on the method to track calls
      spyOn(mockUser, 'getIdTokenResult').and.returnValue(
        Promise.reject(tokenError)
      );

      // Re-create spies
      httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post']);
      authProviderSpy = jasmine.createSpyObj('FirebaseAuthProvider', ['user']);
      loggerSpy = jasmine.createSpyObj('LoggerService', [
        'info',
        'warning',
        'error',
      ]);

      // Configure auth provider to return our user
      authProviderSpy.user.and.returnValue(of(mockUser));

      // Configure TestBed
      TestBed.configureTestingModule({
        providers: [
          AuthService,
          { provide: HttpClient, useValue: httpClientSpy },
          { provide: FirebaseAuthProvider, useValue: authProviderSpy },
          { provide: LoggerService, useValue: loggerSpy },
          provideExperimentalZonelessChangeDetection(),
        ],
      });

      // Get the service
      service = TestBed.inject(AuthService);

      // Call the getter to initialize the signal
      service.appUser();

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Assert - user should still exist but with no roles
      expect(service.appUser()).toBeTruthy();
      expect(service.appUser()?.uid).toBe('test-uid');
      expect(service.appUser()?.email).toBe('test@example.com');
      expect(service.appUser()?.displayName).toBe('Test User');
      expect(service.appUser()?.roles).toEqual([]);

      // Verify error was logged
      expect(loggerSpy.error).toHaveBeenCalledWith(
        'Error fetching user Firebase Id token and Roles',
        tokenError
      );

      // Verify getIdTokenResult was called with force refresh
      expect(mockUser.getIdTokenResult).toHaveBeenCalledWith(true);
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
      const mockUser: Partial<User> = { uid: 'new-user-123' };
      const mockUserCredential: Partial<UserCredential> = {
        user: mockUser as User,
      };

      // Configure spies for this test case
      authProviderSpy.createUserWithEmailAndPassword.and.returnValue(
        Promise.resolve(mockUserCredential as UserCredential)
      );
      authProviderSpy.updateProfile.and.returnValue(Promise.resolve());

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
        'Error creating user account'
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
        'Error creating user account'
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
        'Error loging with user credentials'
      );
    });
  });
});
