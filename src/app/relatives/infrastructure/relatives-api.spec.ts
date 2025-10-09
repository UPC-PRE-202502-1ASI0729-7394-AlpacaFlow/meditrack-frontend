import { TestBed } from '@angular/core/testing';

import { RelativesApi } from './relatives-api';

describe('RelativesApi', () => {
  let service: RelativesApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RelativesApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
