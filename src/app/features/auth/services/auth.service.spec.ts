import { HttpClient } from '@angular/common/http';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { IdTokenResult, User } from '@angular/fire/auth';
import { of } from 'rxjs';
import { LoggerService } from '../../../core/services/logger.service';
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

      // Setup
      const mockUser: Partial<User> = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        metadata: {
          creationTime: '2023-01-01T12:00:00Z',
          lastSignInTime: '2023-01-02T12:00:00Z',
        },
      };

      const mockToken: Partial<IdTokenResult> = {
        claims: { roles: ['user', 'admin'] },
      };

      // Re-create all the spies with new behavior
      httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post']);
      authProviderSpy = jasmine.createSpyObj('FirebaseAuthProvider', [
        'user',
        'getIdTokenResult',
      ]);
      loggerSpy = jasmine.createSpyObj('LoggerService', [
        'info',
        'warning',
        'error',
      ]);

      // Configure the auth provider
      authProviderSpy.user.and.returnValue(of(mockUser as User));
      authProviderSpy.getIdTokenResult.and.returnValue(
        Promise.resolve(mockToken as IdTokenResult)
      );

      // Reconfigure TestBed
      TestBed.configureTestingModule({
        providers: [
          AuthService,
          { provide: HttpClient, useValue: httpClientSpy },
          { provide: FirebaseAuthProvider, useValue: authProviderSpy },
          { provide: LoggerService, useValue: loggerSpy },
          provideExperimentalZonelessChangeDetection(),
        ],
      });

      // Get new service instance
      service = TestBed.inject(AuthService);

      // Initialize by calling getter
      service.appUser();

      // Wait for async operations
      await waitForAsyncOperations();

      // Assert
      expect(service.appUser()).toBeTruthy();
      expect(service.appUser()?.uid).toBe('test-uid');
      expect(service.appUser()?.email).toBe('test@example.com');
      expect(service.appUser()?.displayName).toBe('Test User');
      expect(service.appUser()?.roles).toEqual(['user', 'admin']);
      expect(service.appUser()?.createdAt).toEqual(jasmine.any(Date));
      expect(service.appUser()?.lastLoginAt).toEqual(jasmine.any(Date));
    });

    // Additional tests follow the same pattern:
    // 1. Reset TestBed if needed for the test
    // 2. Setup test-specific spies and mocks
    // 3. Reconfigure TestBed if needed
    // 4. Get service instance
    // 5. Test behavior
  });

  // More tests for checkEmail, register, etc.
});
