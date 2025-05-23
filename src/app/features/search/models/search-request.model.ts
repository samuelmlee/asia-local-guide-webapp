import { ActivityTag } from '../../activity-tag/models/activity-tag.model';
import { Destination } from './destination.model';

export interface SearchRequest {
  startDate: Date | null;
  endDate: Date | null;
  destination: Destination;
  activities: ActivityTag[];
}
