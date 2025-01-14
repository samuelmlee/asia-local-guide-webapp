export interface SearchRequestDTO {
  startDateISO: string;
  endDateISO: string;
  destinationId: number;
  activityTagIds: number[];
}
