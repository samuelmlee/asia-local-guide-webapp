import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  signal,
} from '@angular/core';
import { DayActivity } from '../../models/day-activity.model';

@Component({
  selector: 'app-planning-activity',
  imports: [CommonModule],
  templateUrl: './planning-activity.component.html',
  styleUrl: './planning-activity.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanningActivityComponent {
  @Input()
  set dayActivity(dayActivity: DayActivity) {
    if (dayActivity) {
      this.resolveImageUrl(dayActivity);
      this.activity.set(dayActivity);
    }
  }

  public readonly activity = signal<DayActivity | null>(null);

  public readonly imageUrl = signal<string | null>(null);

  private resolveImageUrl(dayActivity: DayActivity): void {
    // TODO: redo resolve img URL according to viewport
    const coverImage = dayActivity.images.find((image) => image.isCover);

    if (coverImage && coverImage.variants.length > 0) {
      const lastVariant = coverImage.variants[coverImage.variants.length - 1];
      this.imageUrl.set(lastVariant.url);
    } else {
      this.imageUrl.set(null);
    }
  }
}
