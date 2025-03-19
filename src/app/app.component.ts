import { Component } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './core/components/header/header.component';
import { SidenavContentComponent } from './core/components/sidenav-content/sidenav-content.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [
    RouterOutlet,
    HeaderComponent,
    MatSidenavModule,
    SidenavContentComponent,
  ],
})
export class AppComponent {
  public title = 'asia-local-guide-webapp';
}
