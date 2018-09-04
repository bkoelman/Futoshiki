import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { PuzzleDataService } from './puzzle-data.service';

describe('PuzzleDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule
      ],
      providers: [PuzzleDataService]
    });
  });

  it('should be created', inject([PuzzleDataService], (service: PuzzleDataService) => {
    expect(service).toBeTruthy();
  }));
});
