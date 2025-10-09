import { TestBed } from '@angular/core/testing';

import { RelativesStore } from './relatives.store';

describe('RelativesStore', () => {
  let service: RelativesStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RelativesStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
