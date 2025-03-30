import { HttpClient } from '@angular/common/http';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { IdTokenResult, User } from '@angular/fire/auth';
import { of } from 'rxjs';
import { ErrorType } from '../../../core/models/error-type.enum';
import { LoggerService } from '../../../core/services/logger.service';
import { ErrorUtils } from '../../../core/utils/error.utils';
import { EmailCheckResult } from '../models/email-check-result';
import { AuthService } from './auth.service';
import { FirebaseAuthProvider } from './firebase-auth.provider';

describe('AuthService', () => {
  let service: AuthService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let authProviderSpy: jasmine.SpyObj<FirebaseAuthProvider>;
  let loggerSpy: jasmine.SpyObj<LoggerService>;

  // Helper function to wait for async operations
  async function waitForAsyncOperations(): Promise<void> {
    await Promise.resolve();
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post']);
    authProviderSpy = jasmine.createSpyObj('FirebaseAuthProvider', [
      'user',
      'createUserWithEmailAndPassword',
      'updateProfile',
      'getIdTokenResult',
    ]);
    loggerSpy = jasmine.createSpyObj('LoggerService', [
      'info',
      'warning',
      'error',
    ]);

    // Default behavior
    authProviderSpy.user.and.returnValue(of(null));

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: HttpClient, useValue: httpClientSpy },
        { provide: FirebaseAuthProvider, useValue: authProviderSpy },
        { provide: LoggerService, useValue: loggerSpy },
        provideExperimentalZonelessChangeDetection(),
      ],
    });

    service = TestBed.inject(AuthService);
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
      await waitForAsyncOperations();

      // Check the value
      expect(service.appUser()).toBeNull();
    });

    it('should map Firebase user to AppUser when authenticated', async () => {
      // Reset TestBed for this specific test
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
});
