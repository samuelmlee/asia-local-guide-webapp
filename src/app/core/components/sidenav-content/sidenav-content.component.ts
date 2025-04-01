import {
  ChangeDetectionStrategy,
  Component,
  computed,
  OnInit,
  output,
  Signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AppUser } from '../../../features/auth/models/app-user.model';
import { AuthService } from '../../../features/auth/services/auth.service';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { NotificationService } from '../../services/notification.service';
import { LanguageSelectorComponent } from '../language-selector/language-selector.component';

interface UserNameView {
  name: string;
  initials: string;
}

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
export class SidenavContentComponent implements OnInit {
  public readonly closeSidenav = output<void>();

  private readonly appUser: Signal<AppUser | null | undefined>;

  public userName: Signal<UserNameView | null> | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly errorHandler: ErrorHandlerService,
    private readonly notification: NotificationService
  ) {
    this.appUser = this.authService.appUser;
  }

  public ngOnInit(): void {
    this.userName = computed(() => {
      const user = this.appUser();
      if (!user) {
        return null;
      }

      const name = user.displayName || user.email || '';
      const initials = user.displayName
        ? user.displayName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
        : '';

      return { name, initials };
    });
  }

  public async signOut(): Promise<void> {
    try {
      await this.authService.signOut();
      this.closeSidenav.emit();
      this.notification.showSuccess('You have been signed out successfully');
    } catch (error) {
      this.errorHandler.handleError(error, 'Error signing out', {
        notify: true,
      });
    }
  }
}
