import { TestBed, inject } from '@angular/core/testing';
import { NumberSequenceService } from './number-sequence.service';

describe('NumberSequenceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NumberSequenceService]
    });
  });

  it('should be created', inject([NumberSequenceService], (service: NumberSequenceService) => {
    expect(service).toBeTruthy();
  }));
});
