import { DestinationType } from './destination-type.model';

export interface Destination {
  destinationId: number;
  type: DestinationType;
  name: string;
  parentName: string;
}
