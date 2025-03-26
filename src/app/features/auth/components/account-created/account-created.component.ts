import { ChangeDetectionStrategy, Component, Signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { AppUser } from '../../models/app-user.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-account-created',
  imports: [MatButtonModule, MatChipsModule, MatIconModule],
  templateUrl: './account-created.component.html',
  styleUrl: './account-created.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountCreatedComponent {
  private readonly appUser: Signal<AppUser | null | undefined>;

  constructor(private readonly authService: AuthService) {
    this.appUser = this.authService.appUser;
  }

  public savePreferences(): void {
    throw new Error('Method not implemented.');
  }
}
