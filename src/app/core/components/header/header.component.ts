import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from 'rxjs';
import { SideNavComponent } from '../side-nav/side-nav.component';

@Component({
  selector: 'app-header',
  imports: [MatIconModule, SideNavComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private readonly toggleSub = new Subject<void>();

  public readonly toggleObs = this.toggleSub.asObservable();

  public toggleSidenav(): void {
    this.toggleSub.next();
  }
}
