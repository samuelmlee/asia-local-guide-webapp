import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { createAppError } from '../../../core/models/app-error.model';
import { ErrorType } from '../../../core/models/error-type.enum';
import { DateUtils } from '../../../core/utils/date.utils';
import { ErrorUtils } from '../../../core/utils/error.utils';
import { ValidationUtils } from '../../../core/utils/validation.utils';
import { SearchRequest } from '../../search/models/search-request.model';
import { DayPlan } from '../models/day-plan.model';
import {
  CreateDayActivityDTO,
  PlanningCreateRequestDTO,
} from '../models/planning-create-request-dto';
import { PlanningRequestDTO } from '../models/planning-request-dto.model';
import { Planning } from '../models/planning.model';

@Injectable({ providedIn: 'root' })
export class PlanningService {
  private env = environment;

  private _planning = signal<Planning | null>(null);
  public planning = this._planning.asReadonly();

  private _searchRequest = signal<SearchRequest | null>(null);
  public searchRequest = this._searchRequest.asReadonly();

  private readonly PLANNING_PATH = 'plannings';

  constructor(private readonly http: HttpClient) {}

  public async getDayPlansForRequest(request: SearchRequest): Promise<void> {
    if (!request) {
      throw createAppError(ErrorType.VALIDATION, 'Search request is required');
    }

    const planningRequestDTO: PlanningRequestDTO = {
      destinationId: request.destination.destinationId,
      startDate: DateUtils.formatDateToYMD(request.startDate),
      endDate: DateUtils.formatDateToYMD(request.endDate),
      activityTagIds: request.activities.map((activity) => activity.id),
    };

    try {
      ValidationUtils.validateModel(planningRequestDTO);
    } catch (validationError) {
      throw createAppError(
        ErrorType.VALIDATION,
        (validationError as Error).message,
        validationError
      );
    }

    this._searchRequest.set(request);

    try {
      await this.fetchPlanningData(
        planningRequestDTO,
        request.destination.name,
        request.startDate!,
        request.endDate!
      );
    } catch (error) {
      throw ErrorUtils.formatServiceError(error, 'Failed to created planning');
    }
  }

  public async savePlanning(name: string): Promise<void> {
    const planning = this._planning();

    if (!planning) {
      throw createAppError(
        ErrorType.VALIDATION,
        'Planning data is required to save'
      );
    }
    const planningCreateRequestDTO: PlanningCreateRequestDTO = {
      name: name,

      dayPlans: planning.dayPlans.map((dayPlan) => ({
        date: DateUtils.formatDateToYMD(dayPlan.date),

        activities: dayPlan.activities.map((activity) => {
          const createActivity: CreateDayActivityDTO = {
            productCode: activity.productCode,
            bookingProviderName: activity.bookingProviderName,
            startTime: DateUtils.formatDateToYMDWithTime(activity.startTime),
            endTime: DateUtils.formatDateToYMDWithTime(activity.endTime),
          };

          return createActivity;
        }),
      })),
    };

    try {
      ValidationUtils.validateModel(planningCreateRequestDTO);
    } catch (validationError) {
      throw createAppError(
        ErrorType.VALIDATION,
        (validationError as Error).message,
        validationError
      );
    }

    try {
      await this.savePlanningData(planningCreateRequestDTO);
    } catch (error) {
      throw ErrorUtils.formatServiceError(error, 'Failed to save planning');
    }
  }

  private async fetchPlanningData(
    request: PlanningRequestDTO,
    destination: string,
    startDate: Date,
    endDate: Date
  ): Promise<void> {
    const calendarDays$ = this.http.post<DayPlan[]>(
      `${this.env.apiUrl}/${this.PLANNING_PATH}/generate`,
      request
    );

    const calendarDays = await firstValueFrom(calendarDays$);

    const parsedDays = calendarDays.map((dayPlan) => ({
      ...dayPlan,
      date: new Date(dayPlan.date),
      activities: dayPlan.activities.map((activity) => ({
        ...activity,
        startTime: new Date(activity.startTime),
        endTime: new Date(activity.endTime),
      })),
    }));

    const planning: Planning = {
      dayPlans: parsedDays,
      destination,
      startDate,
      endDate,
    };

    this._planning.set(planning);
  }

  private async savePlanningData(
    request: PlanningCreateRequestDTO
  ): Promise<void> {
    return firstValueFrom(
      this.http.post<void>(`${this.env.apiUrl}/${this.PLANNING_PATH}`, request)
    );
  }
}
