import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-calendar',
  imports: [],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarComponent {
  constructor(private readonly router: Router) {
    const navigation = this.router.getCurrentNavigation();
    const dataFromRoute =
      navigation && navigation.extras.state
        ? navigation.extras.state['request']
        : null;

    console.log(dataFromRoute);
  }
}
