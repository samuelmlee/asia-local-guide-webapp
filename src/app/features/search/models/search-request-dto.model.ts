export interface SearchRequestDto {
  startDateISO: string;
  endDateISO: string;
  destinationId: number;
  activityTagIds: number[];
}
