import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  TemplateRef,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MobileSearchDialogComponent } from '../mobile-search-dialog/mobile-search-dialog.component';

@Component({
  selector: 'app-responsive-search',
  imports: [MatIconModule, NgTemplateOutlet],
  templateUrl: './responsive-search.component.html',
  styleUrl: './responsive-search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResponsiveSearchComponent {
  public template = input<TemplateRef<unknown> | null>(null);

  constructor(private readonly dialog: MatDialog) {}

  public openSearchDialog(): void {
    this.dialog.open(MobileSearchDialogComponent, {
      width: '100%',
      maxWidth: '100%',
      position: { top: '0' },
      autoFocus: false,
      panelClass: 'screen-top-dialog',
    });
  }
}
