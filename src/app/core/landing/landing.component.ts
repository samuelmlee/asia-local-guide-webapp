import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PseudoSearchComponent } from './pseudo-search/pseudo-search.component';

@Component({
  selector: 'app-landing',
  imports: [PseudoSearchComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent {}
