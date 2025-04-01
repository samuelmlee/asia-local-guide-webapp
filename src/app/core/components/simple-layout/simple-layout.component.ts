import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterOutlet } from '@angular/router';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { NotificationService } from '../../services/notification.service';
import { SnackbarNotificationService } from '../../services/snackbar-notification.service';
import { SimpleHeaderComponent } from '../simple-header/simple-header.component';

@Component({
  selector: 'app-simple-layout',
  imports: [RouterOutlet, SimpleHeaderComponent],
  providers: [
    {
      provide: NotificationService,
      // TODO: Use service to determine type of device and provide implementation
      useFactory: (snackBar: MatSnackBar) =>
        new SnackbarNotificationService(snackBar),
      deps: [MatSnackBar],
    },
    ErrorHandlerService,
  ],
  templateUrl: './simple-layout.component.html',
  styleUrl: './simple-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimpleLayoutComponent {}
