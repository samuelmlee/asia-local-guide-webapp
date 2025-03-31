import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { Environment } from '../../../core/tokens/environment.token';
import { ErrorUtils } from '../../../core/utils/error.utils';
import { ActivityTag } from '../models/activity-tag.model';
import { ActivityTagService } from './activity-tag.service';

describe('ActivityTagService', () => {
  let service: ActivityTagService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let formatServiceErrorSpy: jasmine.Spy;

  // Define API constants
  const mockEnvironment: Environment = {
    apiUrl: 'http://localhost:8080',
    production: false,
  };
  const apiEndpoint = '/activity-tags';
  let expectedUrl: string;

  beforeEach(() => {
    // Create spies
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    formatServiceErrorSpy = spyOn(ErrorUtils, 'formatServiceError');

    // Set expected URL
    expectedUrl = `${mockEnvironment.apiUrl}${apiEndpoint}`;

    // Create service instance with mocked dependencies
    service = new ActivityTagService(httpClientSpy, mockEnvironment);
  });

  describe('getActivityTags', () => {
    it('should return activity tags when HTTP call is successful', async () => {
      const mockActivityTags: ActivityTag[] = [
        { id: 1, name: 'Hiking', promptText: 'Hiking prompt' },
        { id: 2, name: 'Museum', promptText: 'Museum prompt' },
      ];

      httpClientSpy.get.and.returnValue(of(mockActivityTags));

      const result = await service.getActivityTags();

      expect(httpClientSpy.get).toHaveBeenCalledWith(expectedUrl);
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

      // Configure HTTP to throw error using throwError
      httpClientSpy.get.and.returnValue(throwError(() => testError));
      formatServiceErrorSpy.and.returnValue(formattedError);

      await expectAsync(service.getActivityTags()).toBeRejectedWith(
        formattedError
      );
      expect(ErrorUtils.formatServiceError).toHaveBeenCalledWith(
        testError,
        'Error fetching activity tags'
      );
    });
  });
});
