import { Injectable } from '@angular/core';
import { Destination } from '../models/destination.model';

@Injectable()
export class DestinationService {
  public getDestinationsForQuery(query: string): Destination[] {
    return [];
  }
}
