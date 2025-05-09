import { DestinationType } from './destination-type.model';

export interface Destination {
  destinationId: string;
  type: DestinationType;
  name: string;
  parentName: string;
}
