import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ResponsiveSearchComponent } from '../../../search/components/responsive-search/responsive-search.component';
import { SearchRequest } from '../../../search/models/search-request.model';
import { CalendarDay } from '../../models/calendar-day.model';

@Component({
  selector: 'app-calendar',
  imports: [ResponsiveSearchComponent],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarComponent {
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

  private generateCalendarDays(startDate: Date, endDate: Date): CalendarDay[] {
    const calendarDays: CalendarDay[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      calendarDays.push({
        date: new Date(currentDate),
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return calendarDays;
  }
}
