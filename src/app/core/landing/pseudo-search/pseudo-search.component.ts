import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-pseudo-search',
  imports: [FormsModule, MatInputModule, MatIconModule],
  templateUrl: './pseudo-search.component.html',
  styleUrl: './pseudo-search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PseudoSearchComponent {}
