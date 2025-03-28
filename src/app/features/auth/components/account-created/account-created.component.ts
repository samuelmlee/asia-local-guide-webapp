import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
  Signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { LoggerService } from '../../../../core/services/logger.service';
import {
  ActivityTag,
  ActivityTagView,
} from '../../../activity-tag/models/activity-tag.model';
import { ActivityTagService } from '../../../activity-tag/services/activity-tag.service';
import { AppUser } from '../../models/app-user.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-account-created',
  imports: [MatButtonModule, MatChipsModule, MatIconModule, RouterModule],
  templateUrl: './account-created.component.html',
  styleUrl: './account-created.component.scss',
  providers: [ActivityTagService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountCreatedComponent implements OnInit {
  public readonly appUser: Signal<AppUser | null | undefined>;

  public readonly activityTags = signal<ActivityTagView[]>([]);

  public readonly errorMessage = signal<string>('');

  constructor(
    private readonly activityTagService: ActivityTagService,
    private readonly logger: LoggerService,
    private readonly router: Router,
    authService: AuthService
  ) {
    this.appUser = authService.appUser;
  }

  public ngOnInit(): void {
    this.initActivityTags();
  }

  public finishOnboarding(): void {
    const user = this.appUser();
    if (!user) {
      this.logger.error('User is null or undefined');
    }
    this.router.navigate(['/']);
  }

  private initActivityTags(): void {
    this.errorMessage.set('');

    this.activityTagService
      .getActivityTags()
      .then((tags) => {
        const tagViews: ActivityTagView[] = this.fromTagToTagView(tags);
        this.activityTags.set(tagViews);
      })
      .catch((err) => {
        // TODO: replace with translation service and key
        this.errorMessage.set(
          "Erreur lors du chargement des catégories d'activités."
        );
        // TODO: replace with Global error handling
        this.logger.error('Error fetching Activity Tags', err);
      });
  }

  private fromTagToTagView(tags: ActivityTag[]): ActivityTagView[] {
    return tags.map((tag) => {
      const fontIcon = this.resolveIconFont(tag.id);
      return { ...tag, fontIcon };
    });
  }

  private resolveIconFont(tagId: number): string {
    switch (tagId) {
      case 1:
        return 'museum';
      case 2:
        return 'dinner_dining';
      case 3:
        return 'hiking';
      case 4:
        return 'self_improvement';
      case 5:
        return 'holiday_village';
      default:
        return 'question_mark';
    }
  }
}
