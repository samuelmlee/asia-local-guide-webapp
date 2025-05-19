import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  HostListener,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
export class PlanningComponent implements OnInit, AfterViewInit {
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

  public isStickyFilters = signal<boolean>(false);

  @HostListener('window:scroll') public watchScroll(): void {
    this.scroll.next(window.pageYOffset);
  }

  @ViewChild('stickyFilters') private searchElement: ElementRef | null = null;

  private scroll = new Subject<number>();
  private searchPosition = 0;

  constructor(
    private readonly planningService: PlanningService,
    private readonly destroRef: DestroyRef
  ) {}

  public ngOnInit(): void {
    this.scroll
      .pipe(debounceTime(200), takeUntilDestroyed(this.destroRef))
      .subscribe((y) => this.handleScroll(y));
  }

  public ngAfterViewInit(): void {
    this.searchPosition = this.searchElement?.nativeElement.offsetTop;
  }

  public savePlanning(): void {
    this.planningService.savePlanning();
  }

  private handleScroll(y: number): void {
    console.log('scroll y value', y);

    if (y > this.searchPosition) {
      this.isStickyFilters.set(true);
    } else {
      this.isStickyFilters.set(false);
    }
  }
}
