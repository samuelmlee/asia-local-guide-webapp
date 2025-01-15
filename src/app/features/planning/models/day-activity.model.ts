export interface DayActivity {
  productCode: string;
  title: string;
  description: string;
  combinedAverageRating: number;
  reviewCount: number;
  durationMinutes: number;
  fromPrice: number;
  images: Image[];
  startTime: Date;
  endTime: Date;
}

export interface Image {
  imageSource: string;
  caption: string;
  isCover: boolean;
  variants: ImageVariant[];
}

export interface ImageVariant {
  height: number;
  width: number;
  url: string;
}
