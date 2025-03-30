import { HttpClient } from '@angular/common/http';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorType } from '../../../core/models/error-type.enum';
import { ErrorUtils } from '../../../core/utils/error.utils';
import { DestinationType } from '../models/destination-type.model';
import { Destination } from '../models/destination.model';
import { DestinationService } from './destination.service';

describe('DestinationService', () => {
  let service: DestinationService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let formatServiceErrorSpy: jasmine.Spy;

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    formatServiceErrorSpy = spyOn(ErrorUtils, 'formatServiceError');

    TestBed.configureTestingModule({
      providers: [
        DestinationService,
        { provide: HttpClient, useValue: httpClientSpy },
        provideExperimentalZonelessChangeDetection(),
      ],
    });

    service = TestBed.inject(DestinationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getDestinationsForQuery', () => {
    it('should throw validation error if query is empty', async () => {
      await expectAsync(service.getDestinationsForQuery('')).toBeRejectedWith(
        jasmine.objectContaining({
          type: ErrorType.VALIDATION,
          message: 'Query for destination is required',
        })
      );

      expect(httpClientSpy.get).not.toHaveBeenCalled();
    });

    it('should throw validation error if query is undefined', async () => {
      await expectAsync(
        service.getDestinationsForQuery(undefined as unknown as string)
      ).toBeRejectedWith(
        jasmine.objectContaining({
          type: ErrorType.VALIDATION,
          message: 'Query for destination is required',
        })
      );

      expect(httpClientSpy.get).not.toHaveBeenCalled();
    });

    it('should return destinations when HTTP call is successful', async () => {
      const mockDestinations: Destination[] = [
        {
          destinationId: 123,
          name: 'Tokyo',
          type: DestinationType.CITY,
          parentName: 'Japan',
        },
        {
          destinationId: 456,
          name: 'Kyoto',
          type: DestinationType.CITY,
          parentName: 'Japan',
        },
      ];

      const testQuery = 'japan';
      httpClientSpy.get.and.returnValue(of(mockDestinations));

      const result = await service.getDestinationsForQuery(testQuery);

      expect(httpClientSpy.get).toHaveBeenCalledWith(
        `${environment.apiUrl}/destinations/autocomplete?query=${testQuery}`
      );
      expect(result).toEqual(mockDestinations);
      expect(result.length).toBe(2);
      expect(result[0].name).toBe('Tokyo');
    });

    fit('should handle errors and formatServiceError should rethrow http error', async () => {
      const testError = new Error('Network error');

      httpClientSpy.get.and.throwError(testError);
      formatServiceErrorSpy.and.returnValue(testError);

      await expectAsync(
        service.getDestinationsForQuery('tokyo')
      ).toBeRejectedWith(testError);

      expect(ErrorUtils.formatServiceError).toHaveBeenCalledWith(
        testError,
        'Error fetching destinations for query'
      );
    });
  });
});
