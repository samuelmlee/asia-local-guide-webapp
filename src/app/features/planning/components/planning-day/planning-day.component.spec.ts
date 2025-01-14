import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanningDayComponent } from './planning-day.component';

describe('PlanningDayComponent', () => {
  let component: PlanningDayComponent;
  let fixture: ComponentFixture<PlanningDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanningDayComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PlanningDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
