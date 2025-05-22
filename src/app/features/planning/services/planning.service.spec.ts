import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorType } from '../../../core/models/error-type.enum';
import { DateUtils } from '../../../core/utils/date.utils';
import { ErrorUtils } from '../../../core/utils/error.utils';
import { ValidationUtils } from '../../../core/utils/validation.utils';
import { DestinationType } from '../../search/models/destination-type.model';
import { SearchRequest } from '../../search/models/search-request.model';
import { BookingProdiverName } from '../models/booking-provider-name.enum';
import { Planning } from '../models/planning.model';
import { PlanningService } from './planning.service';

describe('PlanningService', () => {
  let service: PlanningService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['post']);

    service = new PlanningService(httpClientSpy);
  });

  describe('getDayPlansForRequest', () => {
    it('should throw validation error if request is null or undefined', async () => {
      await expectAsync(
        service.getDayPlansForRequest(undefined as unknown as SearchRequest)
      ).toBeRejectedWith(
        jasmine.objectContaining({
          type: ErrorType.VALIDATION,
          message: 'Search request is required',
        })
      );
    });

    it('should create PlanningRequestDTO from SearchRequest and validate it', async () => {
      const request: SearchRequest = {
        destination: {
          destinationId: 'uuid1',
          name: 'Tokyo',
          type: DestinationType.CITY,
          parentName: 'Japan',
        },
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-05'),
        activities: [
          { id: 1, name: 'Museums', promptText: 'Museums prompt' },
          { id: 2, name: 'Food', promptText: 'Food prompt' },
        ],
      };

      spyOn(DateUtils, 'formatDateToYMD')
        .withArgs(request.startDate)
        .and.returnValue('2025-01-01')
        .withArgs(request.endDate)
        .and.returnValue('2025-01-05');

      spyOn(ValidationUtils, 'validateModel').and.returnValue(undefined);

      const mockResponse = [{ date: '2025-01-01', activities: [] }];
      httpClientSpy.post.and.returnValue(of(mockResponse));

      await service.getDayPlansForRequest(request);

      expect(ValidationUtils.validateModel).toHaveBeenCalledWith({
        destinationId: 'uuid1',
        startDate: '2025-01-01',
        endDate: '2025-01-05',
        activityTagIds: [1, 2],
      });
    });

    it('should throw app error when validation fails', async () => {
      const request: SearchRequest = {
        destination: {
          destinationId: 'uuid1',
          name: 'Tokyo',
          type: DestinationType.CITY,
          parentName: 'Japan',
        },
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-05'),
        activities: [{ id: 1, name: 'Museums', promptText: 'Museums prompt' }],
      };

      const validationError = new Error('Validation failed');
      spyOn(ValidationUtils, 'validateModel').and.throwError(validationError);
      spyOn(DateUtils, 'formatDateToYMD').and.returnValue('2025-01-01');

      await expectAsync(
        service.getDayPlansForRequest(request)
      ).toBeRejectedWith(
        jasmine.objectContaining({
          type: ErrorType.VALIDATION,
          message: 'Validation failed',
        })
      );
    });

    it('should throw formatted error when fetchPlanningData fails', async () => {
      const request: SearchRequest = {
        destination: {
          destinationId: 'uuid1',
          name: 'Tokyo',
          type: DestinationType.CITY,
          parentName: 'Japan',
        },
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-05'),
        activities: [{ id: 1, name: 'Museums', promptText: 'Museums prompt' }],
      };

      spyOn(ValidationUtils, 'validateModel').and.returnValue(undefined);
      spyOn(DateUtils, 'formatDateToYMD').and.returnValue('2025-01-01');

      const fetchError = new Error('Network error');
      httpClientSpy.post.and.throwError(fetchError);

      const formattedError = {
        type: ErrorType.SERVER,
        message: 'Service error',
        originalError: fetchError,
      };
      spyOn(ErrorUtils, 'formatServiceError').and.returnValue(formattedError);

      await expectAsync(
        service.getDayPlansForRequest(request)
      ).toBeRejectedWith(formattedError);

      expect(ErrorUtils.formatServiceError).toHaveBeenCalledWith(
        fetchError,
        'Failed to created planning'
      );
    });

    it('should set planning signal when API call is successful', async () => {
      const request: SearchRequest = {
        destination: {
          destinationId: 'uuid1',
          name: 'Tokyo',
          type: DestinationType.CITY,
          parentName: 'Japan',
        },
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-05'),
        activities: [{ id: 1, name: 'Museums', promptText: 'Museums prompt' }],
      };

      spyOn(ValidationUtils, 'validateModel').and.returnValue(undefined);
      spyOn(DateUtils, 'formatDateToYMD')
        .withArgs(request.startDate)
        .and.returnValue('2025-01-01')
        .withArgs(request.endDate)
        .and.returnValue('2025-01-05');

      const mockResponse = [
        {
          date: '2025-01-01',
          activities: [
            {
              productCode: 'act1',
              name: 'Visit Tokyo Tower',
              startTime: '2025-01-01T09:00:00',
              endTime: '2025-01-01T11:00:00',
            },
          ],
        },
      ];

      // Return mock response from HTTP client
      httpClientSpy.post.and.returnValue(of(mockResponse));

      await service.getDayPlansForRequest(request);

      // Verify HTTP request was made correctly
      expect(httpClientSpy.post).toHaveBeenCalledWith(
        `${environment.apiUrl}/planning/generate`,
        {
          destinationId: 'uuid1',
          startDate: '2025-01-01',
          endDate: '2025-01-05',
          activityTagIds: [1],
        }
      );

      // Check that planning signal was updated correctly
      const planning = service.planning();
      expect(planning).toBeTruthy();
      expect(planning!.destination).toBe('Tokyo');
      expect(planning!.dayPlans.length).toBe(1);
      expect(planning!.dayPlans[0].date).toEqual(jasmine.any(Date));
      expect(planning!.dayPlans[0].activities[0].productCode).toBe('act1');
      expect(planning!.dayPlans[0].activities[0].startTime).toEqual(
        jasmine.any(Date)
      );
    });
  });

  describe('savePlanning', () => {
    let mockPlanning: Planning;

    beforeEach(() => {
      mockPlanning = {
        dayPlans: [
          {
            date: new Date('2025-01-01'),
            activities: [
              {
                productCode: 'PROD123',
                title: 'Test Activity',
                description: 'Test description',
                combinedAverageRating: 4.5,
                reviewCount: 100,
                durationMinutes: 120,
                fromPrice: 50,
                images: [],
                providerUrl: 'http://example.com',
                startTime: new Date('2025-01-01T10:00:00'),
                endTime: new Date('2025-01-01T12:00:00'),
                bookingProviderName: BookingProdiverName.VIATOR,
              },
            ],
          },
        ],
        destination: 'Tokyo',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-05'),
      };
    });

    it('should throw validation error if planning signal is null', async () => {
      // Ensure planning signal is null
      service.planning.set(null);

      await expectAsync(service.savePlanning('My Trip')).toBeRejectedWith(
        jasmine.objectContaining({
          type: ErrorType.VALIDATION,
          message: 'Planning data is required to save',
        })
      );

      expect(httpClientSpy.post).not.toHaveBeenCalled();
    });

    it('should throw validation error if DTO validation fails', async () => {
      service.planning.set(mockPlanning);

      // Force validation to fail
      const validationError = new Error('Validation failed');
      spyOn(ValidationUtils, 'validateModel').and.throwError(validationError);

      await expectAsync(service.savePlanning('My Trip')).toBeRejectedWith(
        jasmine.objectContaining({
          type: ErrorType.VALIDATION,
          message: 'Validation failed',
        })
      );

      expect(ValidationUtils.validateModel).toHaveBeenCalled();
      expect(httpClientSpy.post).not.toHaveBeenCalled();
    });

    it('should throw formatted error when HTTP request fails', async () => {
      service.planning.set(mockPlanning);

      // Set up validation to pass
      spyOn(ValidationUtils, 'validateModel').and.returnValue(undefined);

      // Set up DateUtils to return expected strings
      spyOn(DateUtils, 'formatDateToYMD').and.returnValue('2025-01-01');
      spyOn(DateUtils, 'formatDateToYMDWithTime').and.returnValue(
        '2025-01-01T10:00:00'
      ); // Simplify for test

      // Set up HTTP request to fail
      const httpError = new Error('Network error');
      httpClientSpy.post.and.throwError(httpError);

      // Set up error formatting
      const formattedError = {
        type: ErrorType.SERVER,
        message: 'Service error',
        originalError: httpError,
      };
      spyOn(ErrorUtils, 'formatServiceError').and.returnValue(formattedError);

      await expectAsync(service.savePlanning('My Trip')).toBeRejectedWith(
        formattedError
      );

      expect(httpClientSpy.post).toHaveBeenCalledWith(
        `${environment.apiUrl}/planning`,
        jasmine.any(Object)
      );
      expect(ErrorUtils.formatServiceError).toHaveBeenCalledWith(
        httpError,
        'Failed to save planning'
      );
    });

    it('should successfully save planning when all data is valid', async () => {
      service.planning.set(mockPlanning);

      // Set up validation to pass
      spyOn(ValidationUtils, 'validateModel').and.returnValue(undefined);

      // Set up DateUtils to return expected strings
      spyOn(DateUtils, 'formatDateToYMD').and.returnValue('2025-01-01');
      spyOn(DateUtils, 'formatDateToYMDWithTime').and.returnValue(
        '2025-01-01T10:00:00'
      ); // Simplify for test

      // Set up HTTP request to succeed
      httpClientSpy.post.and.returnValue(of(undefined));

      await expectAsync(service.savePlanning('My Trip')).toBeResolved();

      // Verify correct data was sent in the request
      expect(httpClientSpy.post).toHaveBeenCalledWith(
        `${environment.apiUrl}/planning`,
        {
          name: 'My Trip',
          dayPlans: [
            {
              date: '2025-01-01',
              activities: [
                {
                  productCode: 'PROD123',
                  bookingProviderName: BookingProdiverName.VIATOR,
                  startTime: '2025-01-01T10:00:00',
                  endTime: '2025-01-01T10:00:00',
                },
              ],
            },
          ],
        }
      );
    });
  });
});
