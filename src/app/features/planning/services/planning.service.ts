import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environments';
import { SearchRequestDto } from '../../search/models/search-request-dto.model';
import { DayPlan } from '../models/calendar-day.model';

@Injectable()
export class PlanningService {
  private env = environment;

  constructor(private readonly http: HttpClient) {}

  public async getDestinationsForQuery(
    request: SearchRequestDto,
  ): Promise<DayPlan[]> {
    const calendarDays$ = this.http.post<DayPlan[]>(
      `${this.env.apiUrl}/planning/generate`,
      request,
    );

    const calendarDays = await firstValueFrom(calendarDays$);
    return calendarDays;
  }
}
