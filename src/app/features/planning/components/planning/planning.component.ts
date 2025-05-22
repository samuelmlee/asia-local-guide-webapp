import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  HostListener,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { debounceTime, Subject } from 'rxjs';
import { ResponsiveSearchComponent } from '../../../search/components/responsive-search/responsive-search.component';
import { PlanningService } from '../../services/planning.service';
import { CreatePlanningDialogComponent } from '../create-planning-dialog/create-planning-dialog.component';
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
export class PlanningComponent implements OnInit {
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

  private readonly scroll = new Subject<number>();
  // Offset Y from native element for stickyFilters not available on AfterViewInit
  private readonly REM_TO_PX_RATIO = 16;
  private readonly searchPosition = 9 * this.REM_TO_PX_RATIO; // 9rem

  constructor(
    private readonly planningService: PlanningService,
    private readonly destroRef: DestroyRef,
    private readonly dialog: MatDialog
  ) {}

  public ngOnInit(): void {
    this.scroll
      .pipe(debounceTime(200), takeUntilDestroyed(this.destroRef))
      .subscribe((y) => this.handleScroll(y));
  }

  @HostListener('window:scroll')
  public watchScroll(): void {
    this.scroll.next(window.pageYOffset);
  }

  public openCreateDialog(): void {
    this.dialog.open(CreatePlanningDialogComponent, {
      width: '100%',
      maxWidth: '100%',
      autoFocus: false,
      panelClass: 'full-screen-dialog',
    });
  }

  private handleScroll(y: number): void {
    if (y > this.searchPosition) {
      this.isStickyFilters.set(true);
    } else {
      this.isStickyFilters.set(false);
    }
  }
}
