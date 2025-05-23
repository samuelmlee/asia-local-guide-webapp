import { BookingProviderName } from './booking-provider-name.enum';

export interface DayActivity {
  productCode: string;
  title: string;
  description: string;
  combinedAverageRating: number;
  reviewCount: number;
  durationMinutes: number;
  fromPrice: number;
  images: Image[];
  providerUrl: string;
  startTime: Date;
  endTime: Date;
  bookingProviderName: BookingProviderName;
}

export interface Image {
  height: number;
  width: number;
  url: string;
}
