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

  public checkEmailAndNavigate(): void {
    throw new Error('Method not implemented.');
  }
}
