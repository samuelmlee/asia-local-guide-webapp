import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SearchRequestDTO } from '../../search/models/search-request-dto.model';
import { DayPlan } from '../models/day-plan.model';

@Injectable()
export class PlanningService {
  private env = environment;

  constructor(private readonly http: HttpClient) {}

  public async getDayPlansForRequest(
    request: SearchRequestDTO,
  ): Promise<DayPlan[]> {
    const calendarDays$ = this.http.post<DayPlan[]>(
      `${this.env.apiUrl}/planning/generate`,
      request,
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

    return parsedDays;
  }
}
