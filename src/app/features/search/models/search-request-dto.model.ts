export interface SearchRequestDTO {
  // Date needs to be in ISO format
  startDate: string;
  // Date needs to be in ISO format
  endDate: string;
  destinationId: number;
  activityTagIds: number[];
}
