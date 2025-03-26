import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LoggerService } from '../../../../core/services/logger.service';
import { DayActivity } from '../../models/day-activity.model';

@Component({
  selector: 'app-planning-activity',
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './planning-activity.component.html',
  styleUrl: './planning-activity.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanningActivityComponent {
  public dayActivity = input(null, {
    transform: (activity: DayActivity | null) => {
      if (activity) {
        this.resolveImageUrl(activity);
        return activity;
      }
      return null;
    },
  });

  public readonly imageUrl = signal<string | null>(null);

  constructor(private readonly logger: LoggerService) {}

  public navigateToProvider(activity: DayActivity): void {
    if (!activity || !activity.providerUrl) {
      this.logger.warning('No provider URL found for activity', activity);
      return;
    }

    window.open(activity.providerUrl, '_blank');
  }

  private resolveImageUrl(dayActivity: DayActivity): void {
    // TODO: redo resolve img URL according to viewport

    if (dayActivity?.images && dayActivity.images.length > 0) {
      const images = dayActivity.images;

      const imageVariant =
        images.find((v) => v.width === 360 && v.height === 240) || images[0];
      this.imageUrl.set(imageVariant.url);
    } else {
      this.imageUrl.set(null);
    }
  }
}
