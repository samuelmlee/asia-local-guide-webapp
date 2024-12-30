import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl, FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
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
import { map, Observable, startWith } from 'rxjs';
import { Destination } from '../../../../models/destination.model';
import { DestinationService } from '../../../../services/destination.service';

@Component({
  selector: 'app-mobile-search-dialog',
  imports: [
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatAutocompleteModule,
    FormsModule,
  ],
  providers: [
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS },
  ],
  templateUrl: './mobile-search-dialog.component.html',
  styleUrl: './mobile-search-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileSearchDialogComponent implements OnInit {
  public destinationControl = new FormControl<string | Destination>('');

  public startDate = new Date();

  public filteredOptions: Observable<Destination[]> | undefined;

  public constructor(private destinationService: DestinationService) {}

  public ngOnInit(): void {
    this.filteredOptions = this.destinationControl.valueChanges.pipe(
      startWith(''),
      map((destination) => {
        const name =
          typeof destination === 'string' ? destination : destination?.name;
        return name ? this._filter(name as string) : [];
      })
    );
  }

  public submitSearch(): void {}

  public displayFn(value: Destination): string {
    return value.name;
  }

  private _filter(name: string): Destination[] {
    const filterValue = name.toLowerCase();

    return this.destinationService.getDestinationsForQuery(filterValue);
  }
}
