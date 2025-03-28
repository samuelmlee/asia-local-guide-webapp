import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
} from '@angular/core';
import {
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
import { isAppError } from '../../../../core/models/app-error.model';
import { ErrorType } from '../../../../core/models/error-type.enum';
import { LoggerService } from '../../../../core/services/logger.service';
import { SnackbarService } from '../../../../core/services/snackbar.service';
import { Destination } from '../../../../features/search/models/destination.model';
import { SearchRequest } from '../../../../features/search/models/search-request.model';
import { ActivityTag } from '../../../activity-tag/models/activity-tag.model';
import { PlanningService } from '../../../planning/services/planning.service';
import { DestinationService } from '../../services/destination.service';

@Component({
  selector: 'app-mobile-search-dialog',
  imports: [
    CommonModule,
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
  ],
  providers: [
    { provide: DateAdapter, useClass: NativeDateAdapter },
    DestinationService,
  ],
  templateUrl: './mobile-search-dialog.component.html',
  styleUrl: './mobile-search-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileSearchDialogComponent implements OnInit {
  public isLoading = signal<boolean>(false);

  public minDate = new Date();

  public filteredOptions: Observable<Destination[]> | undefined;

  public activityTags: ActivityTag[] = [
    { id: 21910, name: 'Art et culture', promptText: '' },
    { id: 21911, name: 'Gastronomie', promptText: '' },
    { id: 21909, name: 'Activités sportives', promptText: '' },
    { id: 21915, name: 'Cours et ateliers', promptText: '' },
    { id: 21912, name: 'Tickets et passes', promptText: '' },
  ];

  public readonly searchForm = new FormGroup({
    startDate: new FormControl<Date | null>(null, Validators.required),
    endDate: new FormControl<Date | null>(null, Validators.required),
    destination: new FormControl<string | Destination>('', Validators.required),
    activities: new FormControl<ActivityTag[]>([]),
    startTime: new FormControl<Date>(new Date()),
    endTime: new FormControl<Date>(new Date()),
  });

  constructor(
    private readonly destinationService: DestinationService,
    private readonly planningService: PlanningService,
    private readonly router: Router,
    private readonly dialogRef: MatDialogRef<MobileSearchDialogComponent>,
    private readonly logger: LoggerService,
    private readonly snackbar: SnackbarService
  ) {}

  public ngOnInit(): void {
    this.filteredOptions = this.searchForm
      .get('destination')
      ?.valueChanges.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        startWith(''),
        switchMap((value) => {
          const query = typeof value === 'string' ? value : '';
          return query ? this.filter(query as string) : of([]);
        })
      );
  }

  public async submitSearch(): Promise<void> {
    if (this.searchForm.invalid) {
      return;
    }

    const request = this.searchForm.value as SearchRequest;

    try {
      this.isLoading.set(true);
      this.searchForm.disable();

      await this.planningService.getDayPlansForRequest(request);

      this.router.routeReuseStrategy.shouldReuseRoute = function () {
        return false;
      };

      this.router.navigate(['/planning']);
      this.dialogRef.close();
    } catch (error) {
      this.handleError(error, 'Error creating planning');
    } finally {
      this.isLoading.set(false);
      this.searchForm.enable();
    }
  }

  public displayFn(value: Destination): string {
    return value.name;
  }

  private async filter(name: string): Promise<Destination[]> {
    const filterValue = name.toLowerCase();

    try {
      const destinations =
        await this.destinationService.getDestinationsForQuery(filterValue);

      return destinations;
    } catch (error) {
      this.logger.error('Error while fetching Destinations', error);
      return [];
    }
  }

  private handleError(error: unknown, defaultMessage: string): void {
    let errorMessage = defaultMessage;

    if (isAppError(error)) {
      this.logger.error(`${error.type} error creating planning:`, error);

      switch (error.type) {
        case ErrorType.NETWORK:
          errorMessage =
            'Network error. Please check your connection and try again.';
          break;
        case ErrorType.VALIDATION:
          errorMessage = 'Please check your search criteria.';
          break;
        case ErrorType.NOT_FOUND:
          errorMessage = 'No results found for your search criteria.';
          break;
        case ErrorType.SERVER:
          errorMessage = 'Server error. Please try again later.';
          break;
      }
    } else {
      this.logger.error('Unknown error while creating planning:', error);
    }

    this.snackbar.openError(errorMessage);
  }
}
