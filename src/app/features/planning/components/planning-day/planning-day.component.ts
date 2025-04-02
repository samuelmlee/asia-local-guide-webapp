import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DayPlan } from '../../models/day-plan.model';
import { PlanningActivityComponent } from '../planning-activity/planning-activity.component';

@Component({
  selector: 'app-planning-day',
  imports: [PlanningActivityComponent, DatePipe],
  templateUrl: './planning-day.component.html',
  styleUrl: './planning-day.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanningDayComponent {
  public dayPlan = input.required({
    transform: (value: DayPlan) => {
      return {
        ...value,
        activities: value.activities
          ? value.activities.sort(
              (a, b) => a.startTime.getTime() - b.startTime.getTime()
            )
          : [],
      };
    },
  });
}
