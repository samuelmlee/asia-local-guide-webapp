import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SimpleHeaderComponent } from '../simple-header/simple-header.component';

@Component({
  selector: 'app-simple-layout',
  imports: [RouterOutlet, SimpleHeaderComponent],
  providers: [],
  templateUrl: './simple-layout.component.html',
  styleUrl: './simple-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimpleLayoutComponent {}
