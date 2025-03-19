import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { Observable, Subscription } from 'rxjs';
import { LanguageSelectorComponent } from '../language-selector/language-selector.component';

@Component({
  selector: 'app-side-nav',
  imports: [MatSidenavModule, LanguageSelectorComponent],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideNavComponent implements OnDestroy {
  @ViewChild('sidenav') private sidenav: MatSidenav | null = null;

  @Input()
  set toggleObs(toggleObs: Observable<void>) {
    if (toggleObs) {
      this.toogleSubscription = toggleObs.subscribe(() =>
        this.sidenav?.toggle(),
      );
    }
  }

  private toogleSubscription: Subscription | null = null;

  public ngOnDestroy(): void {
    this.toogleSubscription?.unsubscribe();
  }
}
