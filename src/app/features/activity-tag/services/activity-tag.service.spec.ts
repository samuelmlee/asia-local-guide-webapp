import { HttpClient } from '@angular/common/http';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ErrorUtils } from '../../../core/utils/error.utils';
import { ActivityTag } from '../models/activity-tag.model';
import { ActivityTagService } from './activity-tag.service';

describe('ActivityTagService', () => {
  let service: ActivityTagService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let formatServiceErrorSpy: jasmine.Spy;

  const mockApiUrl = 'http://localhost:8080/v1/activity-tags';

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);

    formatServiceErrorSpy = spyOn(ErrorUtils, 'formatServiceError');

    TestBed.configureTestingModule({
      providers: [
        provideExperimentalZonelessChangeDetection(),
        ActivityTagService,
        { provide: HttpClient, useValue: httpClientSpy },
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

      httpClientSpy.get.and.returnValue(of(mockActivityTags));

      const result = await service.getActivityTags();

      expect(httpClientSpy.get).toHaveBeenCalledWith(mockApiUrl);
      expect(result).toEqual(mockActivityTags);
      expect(result.length).toBe(2);
    });

    it('should handle errors and format them using formatServiceError utility', async () => {
      const testError = new Error('Test error');
      const formattedError = {
        type: 'UNKNOWN',
        message: 'Formatted error',
        originalError: testError,
      };

      // Configure the HTTP call to throw an error
      httpClientSpy.get.and.callFake(() => {
        throw testError;
      });

      formatServiceErrorSpy.and.returnValue(formattedError);

      try {
        await service.getActivityTags();
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(ErrorUtils.formatServiceError).toHaveBeenCalledWith(
          testError,
          'Error fetching activity tags'
        );
        expect(error).toBe(formattedError);
      }
    });
  });
});
