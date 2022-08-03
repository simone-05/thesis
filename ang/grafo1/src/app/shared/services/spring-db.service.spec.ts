import { TestBed } from '@angular/core/testing';

import { SpringDbService } from './spring-db.service';

describe('SpringService', () => {
  let service: SpringDbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpringDbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
