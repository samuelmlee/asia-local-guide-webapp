import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_NATIVE_DATE_FORMATS,
  MatNativeDateModule,
  NativeDateAdapter,
} from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import {
  debounceTime,
  distinctUntilChanged,
  Observable,
  of,
  startWith,
  switchMap,
} from 'rxjs';
import { ActivityTag } from '../../../../models/activity-tag.model';
import { Destination } from '../../../../models/destination.model';
import { SearchRequest } from '../../../../models/search-request.model';
import { DestinationService } from '../../../../services/destination.service';

@Component({
  selector: 'app-mobile-search-dialog',
  imports: [
    CommonModule,
    MatDatepickerModule,
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
    { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS },
    DestinationService,
  ],
  templateUrl: './mobile-search-dialog.component.html',
  styleUrl: './mobile-search-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileSearchDialogComponent implements OnInit {
  public minDate = new Date();

  public filteredOptions: Observable<Destination[]> | undefined;

  public activityTags: ActivityTag[] = [
    { id: 21910, name: 'Art et culture' },
    { id: 21911, name: 'Gastronomie' },
    { id: 21909, name: 'Activités sportives' },
    { id: 21916, name: 'Évènements' },
    { id: 21612, name: 'Visites guidées' },
  ];

  public readonly searchForm = new FormGroup({
    startDate: new FormControl<Date | null>(null),
    endDate: new FormControl<Date | null>(null),
    destination: new FormControl<string | Destination>(''),
    activities: new FormControl<ActivityTag[]>([]),
  });

  constructor(
    private readonly destinationService: DestinationService,
    private readonly router: Router,
    private readonly dialogRef: MatDialogRef<MobileSearchDialogComponent>,
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
          return query ? this._filter(query as string) : of([]);
        }),
      );
  }

  public submitSearch(): void {
    if (this.searchForm.invalid) {
      return;
    }

    const request = this.searchForm.value as SearchRequest;

    this.router.navigate(['/calendar'], {
      state: {
        request,
      },
    });
    this.dialogRef.close();
  }

  public displayFn(value: Destination): string {
    return value.name;
  }

  private async _filter(name: string): Promise<Destination[]> {
    const filterValue = name.toLowerCase();

    try {
      const destinations =
        await this.destinationService.getDestinationsForQuery(filterValue);

      return destinations;
    } catch (error) {
      console.error(error);
      return [];
    }
  }
}
