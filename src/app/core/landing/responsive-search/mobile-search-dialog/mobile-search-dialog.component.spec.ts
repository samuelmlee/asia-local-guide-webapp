import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileSearchDialogComponent } from './mobile-search-dialog.component';

describe('MobileSearchDialogComponent', () => {
  let component: MobileSearchDialogComponent;
  let fixture: ComponentFixture<MobileSearchDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileSearchDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MobileSearchDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
