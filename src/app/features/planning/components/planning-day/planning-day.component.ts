import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
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
  @Input()
  public dayPlan: DayPlan | null = null;
}
