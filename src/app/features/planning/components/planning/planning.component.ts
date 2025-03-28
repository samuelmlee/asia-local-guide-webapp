import {
  ChangeDetectionStrategy,
  Component,
  signal,
  TemplateRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { LoggerService } from '../../../../core/services/logger.service';
import { formateDateToYMD } from '../../../../core/utils/date-utils';
import { validateModel } from '../../../../core/utils/validation-utils';
import { ResponsiveSearchComponent } from '../../../search/components/responsive-search/responsive-search.component';
import { SearchRequest } from '../../../search/models/search-request.model';
import { DayPlan } from '../../models/day-plan.model';
import { PlanningRequestDTO } from '../../models/planning-request-dto.model';
import { PlanningService } from '../../services/planning.service';
import { PlanningDayComponent } from '../planning-day/planning-day.component';

@Component({
  selector: 'app-planning',
  imports: [ResponsiveSearchComponent, PlanningDayComponent],
  templateUrl: './planning.component.html',
  styleUrl: './planning.component.scss',
  providers: [PlanningService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanningComponent {
  public readonly destination = signal('');

  public readonly date = signal('');

  public readonly dayPlans = signal<DayPlan[]>([]);

  public resultTemplate!: TemplateRef<unknown>;

  constructor(
    private readonly router: Router,
    private readonly planningService: PlanningService,
    private readonly logger: LoggerService
  ) {
    const navigation = this.router.lastSuccessfulNavigation;
    const searchRequest: SearchRequest =
      navigation && navigation.extras.state
        ? navigation.extras.state['request']
        : null;

    this.destination.set(searchRequest.destination.name);

    const formattedDate = `${searchRequest.startDate?.toLocaleDateString('default', { month: 'long', day: '2-digit' })} - ${searchRequest.endDate?.getDate()}`;

    this.date.set(formattedDate);

    this.getDayPlans(searchRequest);
  }

  private async getDayPlans(request: SearchRequest): Promise<void> {
    try {
      const planningRequestDTO: PlanningRequestDTO = {
        destinationId: request.destination.destinationId,
        startDate: formateDateToYMD(request.startDate),
        endDate: formateDateToYMD(request.endDate),
        activityTagIds: request.activities.map((activity) => activity.id),
      };

      validateModel(planningRequestDTO);

      const dayPlans: DayPlan[] =
        await this.planningService.getDayPlansForRequest(planningRequestDTO);

      this.dayPlans.set(dayPlans);
    } catch (error) {
      this.logger.error('Error while fetching DayPlans', error);
      this.dayPlans.set([]);
    }
  }
}
