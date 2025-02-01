import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LoggerService } from '../../../../core/services/logger.service';
import { ResponsiveSearchComponent } from '../../../search/components/responsive-search/responsive-search.component';
import { SearchRequestDTO } from '../../../search/models/search-request-dto.model';
import { SearchRequest } from '../../../search/models/search-request.model';
import { DayPlan } from '../../models/day-plan.model';
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

  constructor(
    private readonly router: Router,
    private readonly planningService: PlanningService,
    private readonly logger: LoggerService,
  ) {
    const navigation = this.router.getCurrentNavigation();
    const searchRequest: SearchRequest =
      navigation && navigation.extras.state
        ? navigation.extras.state['request']
        : null;

    this.destination.set(searchRequest.destination.name);

    const formattedDate = `${searchRequest.startDate?.toLocaleDateString('default', { month: 'long', day: '2-digit' })} - ${searchRequest.endDate?.getDate()}`;

    this.date.set(formattedDate);

    this.getDayPlans(searchRequest);

    console.log('DayPlans:', this.dayPlans());
  }

  private async getDayPlans(request: SearchRequest): Promise<void> {
    try {
      const searchRequestDTO: SearchRequestDTO = {
        destinationId: request.destination.destinationId,
        startDate: request.startDate?.toLocaleDateString() ?? '',
        endDate: request.endDate?.toLocaleDateString() ?? '',
        activityTagIds: request.activities.map((activity) => activity.id),
      };

      this.validateSearchRequestDTO(searchRequestDTO);

      const dayPlans: DayPlan[] =
        await this.planningService.getDayPlansForRequest(searchRequestDTO);

      this.dayPlans.set(dayPlans);

      // const jsonObj = JSON.parse(dayPlansString);
      // const dayPlansList = jsonObj as DayPlan[];
      // this.dayPlans.set(dayPlansList);
    } catch (error) {
      this.logger.error('Error while fetching DayPlans', error);
      this.dayPlans.set([]);
    }
  }

  private validateSearchRequestDTO(dto: SearchRequestDTO): void {
    const invalidProperties = Object.keys(dto).filter(
      (key: string) =>
        dto[key as keyof SearchRequestDTO] === null ||
        dto[key as keyof SearchRequestDTO] === undefined,
    );

    if (invalidProperties.length > 0) {
      throw new Error(
        `Validation failed. Missing or invalid properties: ${invalidProperties.join(', ')}`,
      );
    }
  }
}
