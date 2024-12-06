import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ResponsiveSearchComponent } from './responsive-search/responsive-search.component';

@Component({
  selector: 'app-landing',
  imports: [ResponsiveSearchComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent {}
