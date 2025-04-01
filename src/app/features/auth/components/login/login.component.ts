import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { DisableControlDirective } from '../../../../core/directives/disable-control.directive';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { AuthService } from '../../services/auth.service';
import { ResetEmailComponent } from '../reset-email/reset-email.component';

@Component({
  selector: 'app-login',
  imports: [
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    FormsModule,
    DisableControlDirective,
    ResetEmailComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  public email = signal('');

  public submitting = signal(false);

  public passwordControl = new FormControl('', [Validators.required]);

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly errorHandler: ErrorHandlerService
  ) {
    const navigation = this.router.lastSuccessfulNavigation;
    const emailRoute: string = navigation?.extras?.state
      ? navigation.extras.state['email']
      : null;

    this.email.set(emailRoute);
  }

  public async submitPassword(): Promise<void> {
    const password = this.passwordControl.value;

    try {
      this.submitting.set(true);
      this.passwordControl.disable();

      await this.authService.signInWithEmailAndPassword(
        this.email(),
        password!
      );

      this.router.navigate(['/']);
    } catch (error) {
      this.errorHandler.handleError(error, 'creating account', {
        notify: true,
      });
    } finally {
      this.submitting.set(false);
      this.passwordControl.enable();
    }
  }
}
