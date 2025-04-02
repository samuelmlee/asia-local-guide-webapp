import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import {
  DateAdapter,
  MatNativeDateModule,
  NativeDateAdapter,
} from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { Router } from '@angular/router';
import {
  debounceTime,
  distinctUntilChanged,
  Observable,
  of,
  startWith,
  switchMap,
} from 'rxjs';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { Destination } from '../../../../features/search/models/destination.model';
import { SearchRequest } from '../../../../features/search/models/search-request.model';
import { ActivityTag } from '../../../activity-tag/models/activity-tag.model';
import { ActivityTagService } from '../../../activity-tag/services/activity-tag.service';
import { PlanningService } from '../../../planning/services/planning.service';
import { DestinationService } from '../../services/destination.service';

@Component({
  selector: 'app-mobile-search-dialog',
  imports: [
    AsyncPipe,
    MatDatepickerModule,
    MatTimepickerModule,
    MatChipsModule,
    MatNativeDateModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    FormsModule,
    MatProgressSpinnerModule,
  ],
  providers: [
    { provide: DateAdapter, useClass: NativeDateAdapter },
    DestinationService,
    ActivityTagService,
  ],
  templateUrl: './mobile-search-dialog.component.html',
  styleUrl: './mobile-search-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileSearchDialogComponent implements OnInit {
  public isLoading = signal<boolean>(false);

  public minDate = new Date();

  public filteredOptions: Observable<Destination[]> | undefined;

  public activityTags = signal<ActivityTag[]>([]);

  public searchForm: FormGroup;

  constructor(
    private readonly destinationService: DestinationService,
    private readonly planningService: PlanningService,
    private readonly router: Router,
    private readonly errorHandler: ErrorHandlerService,
    private readonly activityTagService: ActivityTagService,
    private readonly dialogRef: MatDialogRef<MobileSearchDialogComponent>,
    private readonly fb: FormBuilder
  ) {
    // TODO: add validation for startTime and endTime
    this.searchForm = this.fb.group({
      startDate: new FormControl<Date | null>(null, Validators.required),
      endDate: new FormControl<Date | null>(null, Validators.required),
      destination: new FormControl<string | Destination>('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      activities: new FormControl<ActivityTag[]>([]),
      startTime: new FormControl<Date>(new Date()),
      endTime: new FormControl<Date>(new Date()),
    });
  }

  public ngOnInit(): void {
    this.filteredOptions = this.searchForm
      .get('destination')
      ?.valueChanges.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        startWith(''),
        switchMap((value) => {
          const query = typeof value === 'string' ? value : '';
          return query ? this.filter(query) : of([]);
        })
      );

    this.initActivityTags();
  }

  public async submitSearch(): Promise<void> {
    if (this.searchForm?.invalid) {
      return;
    }

    const request: SearchRequest = this.searchForm?.value;

    try {
      this.isLoading.set(true);
      this.searchForm?.disable();
      this.dialogRef.disableClose = true;

      await this.planningService.getDayPlansForRequest(request);

      this.router.routeReuseStrategy.shouldReuseRoute = function () {
        return false;
      };

      this.router.navigate(['/planning']);
      this.dialogRef.close();
    } catch (error) {
      this.errorHandler.handleError(error, 'creating planning', {
        notify: true,
      });
    } finally {
      this.isLoading.set(false);
      this.searchForm?.enable();
      this.dialogRef.disableClose = false;
    }
  }

  public displayFn(value: Destination): string {
    return value.name;
  }

  private initActivityTags(): void {
    this.activityTagService
      .getActivityTags()
      .then((tags) => this.activityTags.set(tags))
      .catch((err: unknown) =>
        this.errorHandler.handleError(err, 'fetching activity tags', {
          notify: true,
        })
      );
  }

  private async filter(name: string): Promise<Destination[]> {
    const filterValue = name.toLowerCase();

    try {
      const destinations =
        await this.destinationService.getDestinationsForQuery(filterValue);

      return destinations;
    } catch (error) {
      this.errorHandler.handleError(error, 'fetching destinations', {
        notify: true,
      });
      return [];
    }
  }
}
