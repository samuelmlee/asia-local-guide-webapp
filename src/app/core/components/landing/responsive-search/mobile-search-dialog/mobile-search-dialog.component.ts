import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {
  debounceTime,
  distinctUntilChanged,
  Observable,
  of,
  startWith,
  switchMap,
} from 'rxjs';
import { Destination } from '../../../../models/destination.model';
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
  public destinationControl = new FormControl<string | Destination>('');

  public minDate = new Date();

  public filteredOptions: Observable<Destination[]> | undefined;

  public activityTags: string[] = [
    'Art et culture',
    'Gastronomie',
    'Activités sportives',
    'Évènements',
    'Visites guidées',
  ];

  constructor(private destinationService: DestinationService) {}

  public ngOnInit(): void {
    this.filteredOptions = this.destinationControl.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      startWith(''),
      switchMap((value) => {
        const query = typeof value === 'string' ? value : '';
        return query ? this._filter(query as string) : of([]);
      }),
    );
  }

  public submitSearch(): void {}

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
