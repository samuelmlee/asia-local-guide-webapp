import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  Environment,
  ENVIRONMENT,
} from '../../../core/tokens/environment.token';
import { ErrorUtils } from '../../../core/utils/error.utils';
import { ActivityTag } from '../models/activity-tag.model';
@Injectable()
export class ActivityTagService {
  constructor(
    private readonly http: HttpClient,
    @Inject(ENVIRONMENT) private readonly env: Environment
  ) {}

  public async getActivityTags(): Promise<ActivityTag[]> {
    const activityTags$ = this.http
      .get<ActivityTag[]>(`${this.env.apiUrl}/activity-tags`)
      .pipe(
        catchError((error) => {
          throw ErrorUtils.formatServiceError(
            error,
            'Error fetching activity tags'
          );
        })
      );

    return firstValueFrom(activityTags$);
  }
}
