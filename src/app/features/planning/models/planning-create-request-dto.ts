import { BookingProviderName } from './booking-provider-name.enum';

export interface PlanningCreateRequestDTO {
  name: string;
  dayPlans: CreateDayPlanDTO[];
}

export interface CreateDayPlanDTO {
  // Date needs to be in ISO format YYYY-MM-DD
  date: string;
  activities: CreateDayActivityDTO[];
}

export interface CreateDayActivityDTO {
  productCode: string;
  bookingProviderName: BookingProviderName;
  startTime: string;
  endTime: string;
}
