export interface PlanningRequestDTO {
  // Date needs to be in ISO format YYYY-MM-DD
  startDate: string;
  // Date needs to be in ISO format YYYY-MM-DD
  endDate: string;
  destinationId: string;
  activityTagIds: number[];
}
