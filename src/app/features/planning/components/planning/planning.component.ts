import {
  ChangeDetectionStrategy,
  Component,
  computed,
  TemplateRef,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ResponsiveSearchComponent } from '../../../search/components/responsive-search/responsive-search.component';
import { PlanningService } from '../../services/planning.service';
import { PlanningDayComponent } from '../planning-day/planning-day.component';

@Component({
  selector: 'app-planning',
  imports: [ResponsiveSearchComponent, PlanningDayComponent, MatIconModule],
  templateUrl: './planning.component.html',
  styleUrl: './planning.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanningComponent {
  public readonly destination = computed(() => {
    const planning = this.planningService.planning();
    return planning?.destination ?? 'Unknown Destination';
  });

  public readonly date = computed(() => {
    const startDate = this.planningService.planning()?.startDate;
    const endDate = this.planningService.planning()?.endDate;

    if (!startDate || !endDate) {
      return '';
    }

    return `${startDate?.toLocaleDateString('default', { month: 'long', day: '2-digit' })} - ${endDate?.getDate()}`;
  });

  public readonly dayPlans = computed(() => {
    const planning = this.planningService.planning();
    return planning?.dayPlans ?? [];
  });

  public resultTemplate!: TemplateRef<unknown>;

  constructor(private readonly planningService: PlanningService) {}

  public savePlanning(): void {
    this.planningService.savePlanning();
  }
}
