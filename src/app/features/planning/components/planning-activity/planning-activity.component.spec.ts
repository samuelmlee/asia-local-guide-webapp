import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanningActivityComponent } from './planning-activity.component';

describe('PlanningActivityComponent', () => {
  let component: PlanningActivityComponent;
  let fixture: ComponentFixture<PlanningActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanningActivityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanningActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
