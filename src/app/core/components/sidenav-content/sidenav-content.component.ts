import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { LanguageSelectorComponent } from '../language-selector/language-selector.component';

@Component({
  selector: 'app-sidenav-content',
  imports: [
    MatIconModule,
    MatButtonModule,
    LanguageSelectorComponent,
    RouterLink,
  ],
  templateUrl: './sidenav-content.component.html',
  styleUrl: './sidenav-content.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidenavContentComponent {
  @Output()
  public closeSidenav = new EventEmitter<void>();
}
