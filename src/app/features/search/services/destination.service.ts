import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { createAppError } from '../../../core/models/app-error.model';
import { ErrorType } from '../../../core/models/error-type.enum';
import {
  Environment,
  ENVIRONMENT,
} from '../../../core/tokens/environment.token';
import { ErrorUtils } from '../../../core/utils/error.utils';
import { Destination } from '../models/destination.model';

@Injectable()
export class DestinationService {
  constructor(
    private readonly http: HttpClient,
    @Inject(ENVIRONMENT) private readonly env: Environment
  ) {}

  public async getDestinationsForQuery(query: string): Promise<Destination[]> {
    if (!query?.length) {
      throw createAppError(
        ErrorType.VALIDATION,
        'Query for destination is required'
      );
    }

    try {
      const destinations$ = this.http.get<Destination[]>(
        `${this.env.apiUrl}/destinations/autocomplete?query=${query}`
      );

      return await firstValueFrom(destinations$);
    } catch (error) {
      throw ErrorUtils.formatServiceError(
        error,
        'Error fetching destinations for query'
      );
    }
  }
}
