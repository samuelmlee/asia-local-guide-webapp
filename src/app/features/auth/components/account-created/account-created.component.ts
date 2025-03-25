import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AppUser } from '../../models/app-user.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-account-created',
  imports: [JsonPipe],
  templateUrl: './account-created.component.html',
  styleUrl: './account-created.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountCreatedComponent {
  public appUser: Signal<AppUser | null | undefined>;

  constructor(private authService: AuthService) {
    this.appUser = toSignal(this.authService.appUser$);
  }
}
