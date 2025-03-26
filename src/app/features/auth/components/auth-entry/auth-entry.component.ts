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
import { LoggerService } from '../../../../core/services/logger.service';
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
  public emailControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

  constructor(
    private readonly authService: AuthService,
    private readonly logger: LoggerService,
    private readonly router: Router,
  ) {}

  public async checkEmailAndNavigate(): Promise<void> {
    const email = this.emailControl.value;

    if (!email) {
      return;
    }

    try {
      const emailResult: EmailCheckResult =
        await this.authService.checkEmail(email);

      const destination = emailResult?.exists ? 'login' : 'create-account';

      this.router.navigate([`${destination}`], {
        state: {
          email,
        },
      });
    } catch (error) {
      this.logger.error(
        'Error while checking userEmail for authentication',
        error,
      );
    }
  }
}
