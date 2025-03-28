import { TestBed } from '@angular/core/testing';

import { ActivityTagService } from './activity-tag.service';

describe('ActivityTagService', () => {
  let service: ActivityTagService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActivityTagService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
