import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { LoggerService } from '../../../../core/services/logger.service';
import { SnackbarService } from '../../../../core/services/snackbar.service';
import { validateModel } from '../../../../core/utils/validation.utils';
import { CreateAccountRequestDTO } from '../../models/create-account-request-dto.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-create-account',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
  ],
  templateUrl: './create-account.component.html',
  styleUrl: './create-account.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateAccountComponent {
  public email = signal('');

  public submitting = signal(false);

  public createAccountForm: FormGroup;

  constructor(
    private readonly authService: AuthService,
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly logger: LoggerService,
    private readonly snackbar: SnackbarService
  ) {
    // Initialize createAccountForm
    this.createAccountForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      password: ['', Validators.required],
    });

    // Get email from navigation state
    const navigation = this.router.lastSuccessfulNavigation;
    const emailRoute: string = navigation?.extras?.state
      ? navigation.extras.state['email']
      : null;

    this.email.set(emailRoute);
  }

  public async createAccount(): Promise<void> {
    try {
      this.submitting.set(true);
      this.createAccountForm.disable();

      const createAccountDTO: CreateAccountRequestDTO = {
        ...this.createAccountForm.value,
        email: this.email(),
      };

      validateModel(createAccountDTO);

      await this.authService.register(createAccountDTO);

      this.router.navigate(['/account-created']);
    } catch (error) {
      this.submitting.set(false);
      this.logger.error('Error during account creation', error);
      // TODO: update when TranslateService is implemented
      this.snackbar.openError(
        'Une erreur est survenue lors de la création de votre compte.'
      );
    } finally {
      this.submitting.set(false);
      this.createAccountForm.enable();
    }
  }
}
