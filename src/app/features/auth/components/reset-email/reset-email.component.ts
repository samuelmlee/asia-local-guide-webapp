import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-account-email',
  imports: [],
  templateUrl: './reset-email.component.html',
  styleUrl: './reset-email.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetEmailComponent {
  public email = input('');
}
