import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DayPlan } from '../../models/day-plan.model';
import { PlanningActivityComponent } from '../planning-activity/planning-activity.component';

@Component({
  selector: 'app-planning-day',
  imports: [PlanningActivityComponent, CommonModule],
  templateUrl: './planning-day.component.html',
  styleUrl: './planning-day.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanningDayComponent {
  public readonly dayPlan = input(null, {
    transform: (value: DayPlan) => {
      if (!value) {
        return null;
      }
      return {
        ...value,
        activities: value.activities
          ? value.activities.sort(
              (a, b) => a.startTime.getTime() - b.startTime.getTime(),
            )
          : [],
      };
    },
  });
}
