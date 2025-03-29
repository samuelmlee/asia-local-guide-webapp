import { HttpClient } from '@angular/common/http';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AppError } from '../../../core/models/app-error.model';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { ActivityTag } from '../models/activity-tag.model';
import { ActivityTagService } from './activity-tag.service';

describe('ActivityTagService', () => {
  let service: ActivityTagService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let errorHandlerSpy: jasmine.SpyObj<ErrorHandlerService>;

  const mockApiUrl = 'http://localhost:8080/v1/activity-tags';

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    errorHandlerSpy = jasmine.createSpyObj('ErrorHandlerService', [
      'formatServiceError',
    ]);

    TestBed.configureTestingModule({
      providers: [
        provideExperimentalZonelessChangeDetection(),
        ActivityTagService,
        { provide: HttpClient, useValue: httpClientSpy },
        { provide: ErrorHandlerService, useValue: errorHandlerSpy },
        {
          provide: 'environment',
          useValue: { apiUrl: 'https://localhost:8080' },
        },
      ],
    });

    service = TestBed.inject(ActivityTagService);
  });

  describe('getActivityTags', () => {
    it('should return activity tags when HTTP call is successful', async () => {
      const mockActivityTags: ActivityTag[] = [
        { id: 1, name: 'Hiking', promptText: 'Hiking prompt' },
        { id: 2, name: 'Swimming', promptText: 'Swimming prompt' },
      ];

      // Just mock the HTTP client - no need to mock firstValueFrom
      httpClientSpy.get.and.returnValue(of(mockActivityTags));

      const result = await service.getActivityTags();

      expect(httpClientSpy.get).toHaveBeenCalledWith(mockApiUrl);
      expect(result).toEqual(mockActivityTags);
      expect(result.length).toBe(2);
    });

    it('should handle errors and format them using the error handler', async () => {
      const testError = new Error('Test error');
      const formattedError = {
        type: 'UNKNOWN',
        message: 'Formatted error',
        originalError: testError,
      };

      // Return an observable that will error
      httpClientSpy.get.and.callFake(() => {
        throw testError;
      });

      errorHandlerSpy.formatServiceError.and.returnValue(
        formattedError as AppError
      );

      try {
        await service.getActivityTags();
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(errorHandlerSpy.formatServiceError).toHaveBeenCalledWith(
          testError,
          'Error fetching activity tags'
        );
        expect(error).toBe(formattedError);
      }
    });
  });
});
