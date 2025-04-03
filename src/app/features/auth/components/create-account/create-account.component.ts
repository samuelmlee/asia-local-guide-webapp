import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  AbstractControl,
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
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { CreateAccountRequestDTO } from '../../models/create-account-request-dto.model';
import { AuthService } from '../../services/auth.service';
import { ResetEmailComponent } from '../reset-email/reset-email.component';

interface CreateAccountFrom {
  firstName: AbstractControl<string>;
  lastName: AbstractControl<string>;
  password: AbstractControl<string>;
}

@Component({
  selector: 'app-create-account',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    ResetEmailComponent,
  ],
  templateUrl: './create-account.component.html',
  styleUrl: './create-account.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateAccountComponent {
  public email = signal('');

  public submitting = signal(false);

  public createAccountForm: FormGroup<CreateAccountFrom>;
  constructor(
    private readonly authService: AuthService,
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly errorHandler: ErrorHandlerService
  ) {
    // Initialize createAccountForm
    this.createAccountForm = this.fb.nonNullable.group<CreateAccountFrom>({
      firstName: this.fb.control('', {
        nonNullable: true,
        validators: Validators.required,
      }),
      lastName: fb.control('', {
        nonNullable: true,
        validators: Validators.required,
      }),
      password: fb.control('', {
        nonNullable: true,
        validators: Validators.required,
      }),
    });

    // Get email from navigation state
    const navigation = this.router.lastSuccessfulNavigation;
    const emailRoute: string = navigation?.extras?.state
      ? navigation.extras.state['email']
      : null;

    this.email.set(emailRoute);
  }

  public async createAccount(): Promise<void> {
    if (!this.createAccountForm.valid) {
      return;
    }

    try {
      this.submitting.set(true);
      this.createAccountForm.disable();

      const createAccountDTO: CreateAccountRequestDTO = {
        ...this.createAccountForm.getRawValue(),
        email: this.email(),
      };

      await this.authService.register(createAccountDTO);

      this.router.navigate(['/account-created']);
    } catch (error) {
      this.errorHandler.handleError(error, 'creating account', {
        notify: true,
      });
    } finally {
      this.submitting.set(false);
      this.createAccountForm.enable();
    }
  }
}
