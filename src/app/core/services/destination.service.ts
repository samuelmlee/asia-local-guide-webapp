import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environments';
import { Destination } from '../models/destination.model';

@Injectable()
export class DestinationService {
  private env = environment;

  constructor(private readonly http: HttpClient) {}

  public async getDestinationsForQuery(query: string): Promise<Destination[]> {
    const destinations$ = this.http.get<Destination[]>(
      `${this.env.apiUrl}/destinations/autocomplete?query=${query}`,
    );

    const destinations = await firstValueFrom(destinations$);
    return destinations;
  }
}
