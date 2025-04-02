import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-account-email',
  imports: [RouterLink],
  templateUrl: './reset-email.component.html',
  styleUrl: './reset-email.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetEmailComponent {
  public email = input.required<string>();
}
