import { TestBed } from '@angular/core/testing';

import { GraphEditService } from './graph-edit.service';

describe('GraphEditService', () => {
  let service: GraphEditService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GraphEditService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
