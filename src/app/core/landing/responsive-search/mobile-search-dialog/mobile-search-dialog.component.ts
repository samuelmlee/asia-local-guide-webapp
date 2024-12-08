import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-mobile-search-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    FormsModule,
  ],
  templateUrl: './mobile-search-dialog.component.html',
  styleUrl: './mobile-search-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileSearchDialogComponent {
  public searchTerm = model('');
}
