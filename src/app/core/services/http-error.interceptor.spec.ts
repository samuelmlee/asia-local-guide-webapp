import {
  HttpErrorResponse,
  HttpHandler,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { AppError } from '../models/app-error.model';
import { ErrorType } from '../models/error-type.enum';
import { httpErrorInterceptor } from './http-error.interceptor';

describe('httpErrorInterceptor', () => {
  // Create a mock HttpHandler
  function createMockHandler(
    status: number,
    statusText: string,
    error?: unknown
  ): HttpHandler {
    return {
      handle: () =>
        throwError(
          () =>
            new HttpErrorResponse({
              error,
              status,
              statusText,
              url: '/test',
            })
        ),
    };
  }

  it('should transform network errors (status 0) to NETWORK AppError', (done) => {
    const req = new HttpRequest('GET', '/api/test');
    const mockHandler = createMockHandler(
      0,
      'Unknown Error',
      new Error('Network Error')
    );

    httpErrorInterceptor(req, mockHandler.handle).subscribe({
      next: () => {
        fail('Expected an error but got a successful response');
        done();
      },
      error: (error: AppError) => {
        expect(error.type).toBe(ErrorType.NETWORK);
        expect(error.message).toContain('Unable to connect to the server');
        expect(error.originalError).toBeDefined();
        done();
      },
    });
  });

  it('should transform 400 errors to VALIDATION AppError', (done) => {
    const req = new HttpRequest('GET', '/api/test');
    const mockHandler = createMockHandler(400, 'Bad Request');

    httpErrorInterceptor(req, mockHandler.handle).subscribe({
      error: (error: AppError) => {
        expect(error.type).toBe(ErrorType.VALIDATION);
        expect(error.message).toContain('invalid data');
        expect(error.statusCode).toBe(400);
        expect(error.originalError).toBeDefined();
        done();
      },
    });
  });

  it('should transform 401 errors to UNAUTHORIZED AppError', (done) => {
    const req = new HttpRequest('GET', '/api/test');
    const mockHandler = createMockHandler(401, 'Unauthorized');

    httpErrorInterceptor(req, mockHandler.handle).subscribe({
      error: (error: AppError) => {
        expect(error.type).toBe(ErrorType.UNAUTHORIZED);
        expect(error.message).toContain('logged in');
        expect(error.statusCode).toBe(401);
        expect(error.originalError).toBeDefined();
        done();
      },
    });
  });

  it('should transform 403 errors to FORBIDDEN AppError', (done) => {
    const req = new HttpRequest('GET', '/api/test');
    const mockHandler = createMockHandler(403, 'Forbidden');

    httpErrorInterceptor(req, mockHandler.handle).subscribe({
      error: (error: AppError) => {
        expect(error.type).toBe(ErrorType.FORBIDDEN);
        expect(error.message).toContain('permission');
        expect(error.statusCode).toBe(403);
        expect(error.originalError).toBeDefined();
        done();
      },
    });
  });

  it('should transform 404 errors to NOT_FOUND AppError', (done) => {
    const req = new HttpRequest('GET', '/api/test');
    const mockHandler = createMockHandler(404, 'Not Found');

    httpErrorInterceptor(req, mockHandler.handle).subscribe({
      error: (error: AppError) => {
        expect(error.type).toBe(ErrorType.NOT_FOUND);
        expect(error.message).toContain('not found');
        expect(error.statusCode).toBe(404);
        expect(error.originalError).toBeDefined();
        done();
      },
    });
  });

  it('should transform 500 errors to SERVER AppError', (done) => {
    const req = new HttpRequest('GET', '/api/test');
    const mockHandler = createMockHandler(500, 'Internal Server Error');

    httpErrorInterceptor(req, mockHandler.handle).subscribe({
      error: (error: AppError) => {
        expect(error.type).toBe(ErrorType.SERVER);
        expect(error.message).toContain('server');
        expect(error.statusCode).toBe(500);
        expect(error.originalError).toBeDefined();
        done();
      },
    });
  });

  it('should transform other status codes to UNKNOWN AppError', (done) => {
    const req = new HttpRequest('GET', '/api/test');
    const mockHandler = createMockHandler(503, 'Service Unavailable');

    httpErrorInterceptor(req, mockHandler.handle).subscribe({
      error: (error: AppError) => {
        expect(error.type).toBe(ErrorType.UNKNOWN);
        expect(error.message).toContain('Unexpected error');
        expect(error.statusCode).toBe(503);
        expect(error.originalError).toBeDefined();
        done();
      },
    });
  });

  // Test that the interceptor passes through successful responses
  it('should pass through successful responses', (done) => {
    const req = new HttpRequest('GET', '/api/test');
    const mockHandler = {
      handle: () => of(new HttpResponse({ body: 'Success!' })),
    };

    httpErrorInterceptor(req, mockHandler.handle).subscribe({
      next: (response) => {
        expect(response).toEqual(
          jasmine.objectContaining({
            body: 'Success!',
          })
        );
        expect(response).toBeInstanceOf(HttpResponse);
        done();
      },
      error: () => {
        fail('Expected successful response but got error');
        done();
      },
    });
  });
});
