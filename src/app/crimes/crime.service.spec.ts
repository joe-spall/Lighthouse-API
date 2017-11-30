import { TestBed, inject } from '@angular/core/testing';

import { CrimeService } from './crime.service';

describe('CrimeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CrimeService]
    });
  });

  it('should be created', inject([CrimeService], (service: CrimeService) => {
    expect(service).toBeTruthy();
  }));
});
