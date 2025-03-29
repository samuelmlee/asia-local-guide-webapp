import { TestBed } from '@angular/core/testing';

import { DestinationService } from './destination.service';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

describe('DestinationService', () => {
  let service: DestinationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()],
    });
    service = TestBed.inject(DestinationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
