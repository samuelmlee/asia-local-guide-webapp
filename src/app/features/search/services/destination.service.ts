import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { createAppError } from '../../../core/models/app-error.model';
import { ErrorType } from '../../../core/models/error-type.enum';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { Destination } from '../models/destination.model';

@Injectable()
export class DestinationService {
  private env = environment;

  constructor(
    private readonly http: HttpClient,
    private readonly errorHandler: ErrorHandlerService
  ) {}

  public async getDestinationsForQuery(query: string): Promise<Destination[]> {
    if (!query?.length) {
      throw createAppError(
        ErrorType.VALIDATION,
        'Query for destination is required'
      );
    }

    const destinations$ = this.http.get<Destination[]>(
      `${this.env.apiUrl}/destinations/autocomplete?query=${query}`
    );

    try {
      return await firstValueFrom(destinations$);
    } catch (error) {
      throw this.errorHandler.formatServiceError(
        error,
        'Error fetching destinations for query'
      );
    }
  }
}
