import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponsiveSearchComponent } from './responsive-search.component';

describe('PseudoSearchComponent', () => {
  let component: ResponsiveSearchComponent;
  let fixture: ComponentFixture<ResponsiveSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResponsiveSearchComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ResponsiveSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
