import { HttpClient } from '@angular/common/http';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorType } from '../../../core/models/error-type.enum';
import { DateUtils } from '../../../core/utils/date.utils';
import { ErrorUtils } from '../../../core/utils/error.utils';
import { ValidationUtils } from '../../../core/utils/validation.utils';
import { DestinationType } from '../../search/models/destination-type.model';
import { SearchRequest } from '../../search/models/search-request.model';
import { PlanningService } from './planning.service';

fdescribe('PlanningService', () => {
  let service: PlanningService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['post']);

    TestBed.configureTestingModule({
      providers: [
        PlanningService,
        { provide: HttpClient, useValue: httpClientSpy },
        provideExperimentalZonelessChangeDetection(),
      ],
    });

    service = TestBed.inject(PlanningService);
  });

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
        destinationId: 123,
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
      destinationId: 123,
      startDate: '2025-01-01',
      endDate: '2025-01-05',
      activityTagIds: [1, 2],
    });
  });

  it('should throw app error when validation fails', async () => {
    const request: SearchRequest = {
      destination: {
        destinationId: 123,
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

    await expectAsync(service.getDayPlansForRequest(request)).toBeRejectedWith(
      jasmine.objectContaining({
        type: ErrorType.VALIDATION,
        message: 'Validation failed',
      })
    );
  });

  it('should throw formatted error when fetchPlanningData fails', async () => {
    const request: SearchRequest = {
      destination: {
        destinationId: 123,
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

    await expectAsync(service.getDayPlansForRequest(request)).toBeRejectedWith(
      formattedError
    );

    expect(ErrorUtils.formatServiceError).toHaveBeenCalledWith(
      fetchError,
      'Failed to created planning'
    );
  });

  it('should set planning signal when API call is successful', async () => {
    const request: SearchRequest = {
      destination: {
        destinationId: 123,
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
        destinationId: 123,
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
