import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
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
      throw new Error('Search request is required');
    }
    const planningRequestDTO: PlanningRequestDTO = {
      destinationId: request.destination.destinationId,
      startDate: formatDateToYMD(request.startDate),
      endDate: formatDateToYMD(request.endDate),
      activityTagIds: request.activities.map((activity) => activity.id),
    };

    validateModel(planningRequestDTO);

    await this.fetchPlanningData(
      planningRequestDTO,
      request.destination.name,
      request.startDate!,
      request.endDate!
    );
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
}
