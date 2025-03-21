import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-simple-header',
  imports: [],
  templateUrl: './simple-header.component.html',
  styleUrl: './simple-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SimpleHeaderComponent {

}
