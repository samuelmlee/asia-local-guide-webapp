import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LanguageSelectorComponent } from '../language-selector/language-selector.component';

@Component({
  selector: 'app-sidenav-content',
  imports: [LanguageSelectorComponent],
  templateUrl: './sidenav-content.component.html',
  styleUrl: './sidenav-content.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidenavContentComponent {}
