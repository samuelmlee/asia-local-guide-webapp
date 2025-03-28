import { DayPlan } from './day-plan.model';

export interface Planning {
  dayPlans: DayPlan[];
  destination: string;
  startDate: Date;
  endDate: Date;
}
