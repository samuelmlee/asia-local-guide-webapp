import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { ActivityTag } from '../models/activity-tag.model';

@Injectable()
export class ActivityTagService {
  private readonly env = environment;

  constructor(
    private readonly http: HttpClient,
    private readonly errorHandler: ErrorHandlerService
  ) {}

  public async getActivityTags(): Promise<ActivityTag[]> {
    try {
      const activityTags$ = this.http.get<ActivityTag[]>(
        `${this.env.apiUrl}/activity-tags`
      );

      return firstValueFrom(activityTags$);
    } catch (error) {
      throw this.errorHandler.formatServiceError(
        error,
        'Error fetching activity tags'
      );
    }
  }
}
