import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ActivityTag } from '../models/activity-tag.model';

@Injectable()
export class ActivityTagService {
  private readonly env = environment;

  constructor(private readonly http: HttpClient) {}

  public async getActivityTags(): Promise<ActivityTag[]> {
    const activityTags$ = this.http.get<ActivityTag[]>(
      `${this.env.apiUrl}/activity-tags`
    );

    return firstValueFrom(activityTags$);
  }
}
