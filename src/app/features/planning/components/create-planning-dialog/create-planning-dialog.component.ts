import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { PlanningService } from '../../services/planning.service';

@Component({
  selector: 'app-create-planning-dialog',
  imports: [
    MatIconModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
  ],
  templateUrl: './create-planning-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatePlanningDialogComponent {
  public name: FormControl<string> = new FormControl<string>('', {
    validators: [Validators.required],
    nonNullable: true,
  });

  public isLoading = signal<boolean>(false);

  constructor(
    private readonly planningService: PlanningService,
    private readonly dialogRef: MatDialogRef<CreatePlanningDialogComponent>,
    private readonly errorHandler: ErrorHandlerService,
    private readonly notificationService: NotificationService
  ) {}

  public closeDialog(): void {
    this.dialogRef.close();
  }

  public async savePlanning(): Promise<void> {
    if (this.name.invalid || !this.name.value) {
      return;
    }

    try {
      this.isLoading.set(true);
      this.name?.disable();
      this.dialogRef.disableClose = true;

      await this.planningService.savePlanning(this.name.value);
      this.notificationService.showSuccess('Planning created successfully');
      this.dialogRef.close();
    } catch (error) {
      this.errorHandler.handleError(error, 'saving planning', {
        notify: true,
      });
    } finally {
      this.isLoading.set(false);
      this.name.enable();
      this.dialogRef.disableClose = false;
    }
  }
}
