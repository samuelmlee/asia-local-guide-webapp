import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { createAppError } from '../../../core/models/app-error.model';
import { ErrorType } from '../../../core/models/error-type.enum';
import { ErrorUtils } from '../../../core/utils/error.utils';
import { Destination } from '../models/destination.model';

@Injectable()
export class DestinationService {
  private env = environment;

  constructor(private readonly http: HttpClient) {}

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
