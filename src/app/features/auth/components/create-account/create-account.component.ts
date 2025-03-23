import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-account',
  imports: [],
  templateUrl: './create-account.component.html',
  styleUrl: './create-account.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateAccountComponent {
  public email = signal('');

  constructor(private router: Router) {
    const navigation = this.router.lastSuccessfulNavigation;
    const emailRoute: string =
      navigation && navigation.extras.state
        ? navigation.extras.state['email']
        : null;

    this.email.set(emailRoute);

    console.log('In LoginComponent email:', emailRoute);
  }
}
