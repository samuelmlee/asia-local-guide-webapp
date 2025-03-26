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
import { validateModel } from '../../../../core/utils/validation-utils';
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

  public createAccountForm: FormGroup;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private logger: LoggerService,
  ) {
    // Initialize createAccountForm
    this.createAccountForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      password: ['', Validators.required],
    });

    // Get email from navigation state
    const navigation = this.router.lastSuccessfulNavigation;
    const emailRoute: string =
      navigation && navigation.extras.state
        ? navigation.extras.state['email']
        : null;

    this.email.set(emailRoute);
  }

  public async createAccount(): Promise<void> {
    try {
      const createAccountDTO: CreateAccountRequestDTO = {
        ...this.createAccountForm.value,
        email: this.email(),
      };

      validateModel(createAccountDTO);

      await this.authService.register(createAccountDTO);

      this.router.navigate(['/account-created']);
    } catch (error) {
      this.logger.error('Error during account creation', error);
    }
  }
}
