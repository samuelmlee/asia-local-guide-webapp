import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterOutlet } from '@angular/router';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { NotificationService } from '../../services/notification.service';
import { SnackbarNotificationService } from '../../services/snackbar-notification.service';
import { HeaderComponent } from '../header/header.component';
import { SidenavContentComponent } from '../sidenav-content/sidenav-content.component';

@Component({
  selector: 'app-main-layout',
  imports: [
    HeaderComponent,
    MatSidenavModule,
    SidenavContentComponent,
    RouterOutlet,
  ],
  providers: [
    {
      provide: NotificationService,
      useFactory: (snackBar: MatSnackBar) =>
        new SnackbarNotificationService(snackBar),
      deps: [MatSnackBar],
    },
    ErrorHandlerService,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {}
