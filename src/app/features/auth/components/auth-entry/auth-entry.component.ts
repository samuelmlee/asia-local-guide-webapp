import { ChangeDetectionStrategy, Component } from '@angular/core';
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
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { EmailCheckResult } from '../../models/email-check-result';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './auth-entry.component.html',
  styleUrl: './auth-entry.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthEntryComponent {
  public emailControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.email],
  });

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly errorHandler: ErrorHandlerService
  ) {}

  public async checkEmailAndNavigate(): Promise<void> {
    if (!this.emailControl.valid) {
      return;
    }

    try {
      const email = this.emailControl.value;
      const emailResult: EmailCheckResult =
        await this.authService.checkEmail(email);

      const route = emailResult?.exists ? 'login' : 'create-account';

      this.router.navigate([`${route}`], {
        state: {
          email,
        },
      });
    } catch (error) {
      this.errorHandler.handleError(error, 'checking email', {
        notify: true,
      });
    }
  }
}
