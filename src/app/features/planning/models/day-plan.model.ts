import { DayActivity } from './day-activity.model';

export interface DayPlan {
  date: Date;
  activities: DayActivity[];
}
