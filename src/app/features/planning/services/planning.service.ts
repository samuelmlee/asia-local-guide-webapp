import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AppError, isAppError } from '../../../core/models/app-error.model';
import { ErrorType } from '../../../core/models/error-type.enum';
import { formateDateToYMD as formatDateToYMD } from '../../../core/utils/date-utils';
import { validateModel } from '../../../core/utils/validation-utils';
import { SearchRequest } from '../../search/models/search-request.model';
import { DayPlan } from '../models/day-plan.model';
import { PlanningRequestDTO } from '../models/planning-request-dto.model';
import { Planning } from '../models/planning.model';

@Injectable({ providedIn: 'root' })
export class PlanningService {
  private env = environment;

  public planning = signal<Planning | null>(null);

  constructor(private readonly http: HttpClient) {}

  public async getDayPlansForRequest(request: SearchRequest): Promise<void> {
    if (!request) {
      throw this.createAppError(
        ErrorType.VALIDATION,
        'Search request is required'
      );
    }

    const planningRequestDTO: PlanningRequestDTO = {
      destinationId: request.destination.destinationId,
      startDate: formatDateToYMD(request.startDate),
      endDate: formatDateToYMD(request.endDate),
      activityTagIds: request.activities.map((activity) => activity.id),
    };

    try {
      validateModel(planningRequestDTO);
    } catch (validationError) {
      throw this.createAppError(
        ErrorType.VALIDATION,
        (validationError as Error).message,
        validationError
      );
    }

    try {
      await this.fetchPlanningData(
        planningRequestDTO,
        request.destination.name,
        request.startDate!,
        request.endDate!
      );
    } catch (error) {
      const appError = isAppError(error)
        ? error
        : this.createAppError(
            ErrorType.UNKNOWN,
            'Failed to create planning',
            error
          );

      throw appError;
    }
  }

  private async fetchPlanningData(
    request: PlanningRequestDTO,
    destination: string,
    startDate: Date,
    endDate: Date
  ): Promise<void> {
    const calendarDays$ = this.http.post<DayPlan[]>(
      `${this.env.apiUrl}/planning/generate`,
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

    this.planning.set(planning);
  }

  // Create application errors for non-HTTP errors
  private createAppError(
    type: ErrorType,
    message: string,
    originalError?: unknown
  ): AppError {
    return {
      type,
      message,
      originalError: originalError || new Error(message),
    };
  }
}
