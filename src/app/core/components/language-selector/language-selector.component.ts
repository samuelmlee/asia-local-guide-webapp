import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-language-selector',
  imports: [MatMenuModule, MatIconModule, MatButtonModule],
  templateUrl: './language-selector.component.html',
  styleUrl: './language-selector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSelectorComponent {
  public selectedLocale = signal('en-GB');

  public selectLocale(language: string): void {
    this.selectedLocale.set(language);
    // Add additional logic updating a translation service
  }
}
