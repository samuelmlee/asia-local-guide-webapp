import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ResponsiveSearchComponent } from '../../../search/components/responsive-search/responsive-search.component';
import { SearchRequest } from '../../../search/models/search-request.model';

@Component({
  selector: 'app-planning',
  imports: [ResponsiveSearchComponent],
  templateUrl: './planning.component.html',
  styleUrl: './planning.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanningComponent {
  public readonly destination = signal('');

  public readonly date = signal('');

  constructor(private readonly router: Router) {
    const navigation = this.router.getCurrentNavigation();
    const searchRequest: SearchRequest =
      navigation && navigation.extras.state
        ? navigation.extras.state['request']
        : null;

    this.destination.set(searchRequest.destination.name);

    const formattedDate = `${searchRequest.startDate?.toLocaleDateString('default', { month: 'long', day: '2-digit' })} - ${searchRequest.endDate?.getDate()}`;

    this.date.set(formattedDate);
  }
}
