import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { debounceTime, Subject } from 'rxjs';
import { ResponsiveSearchComponent } from '../../../search/components/responsive-search/responsive-search.component';
import { PlanningService } from '../../services/planning.service';
import { PlanningDayComponent } from '../planning-day/planning-day.component';

@Component({
  selector: 'app-planning',
  imports: [
    ResponsiveSearchComponent,
    PlanningDayComponent,
    MatIconModule,
    MatDividerModule,
  ],
  templateUrl: './planning.component.html',
  styleUrl: './planning.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanningComponent implements OnInit, OnDestroy {
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

  private scroll = new Subject<number>();

  public ngOnInit(): void {
    this.scroll
      .pipe(debounceTime(200))
      .subscribe((y) => this.dealWithScroll(window.scrollY));
  }

  public ngOnDestroy(): void {
    this.scroll.complete();
  }

  @HostListener('window:scroll') public watchScroll(): void {
    this.scroll.next(window.scrollY);
  }

  constructor(private readonly planningService: PlanningService) {}

  public savePlanning(): void {
    this.planningService.savePlanning();
  }

  private dealWithScroll(y: number): void {}
}
