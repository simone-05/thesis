import { TestBed } from '@angular/core/testing';

import { FuncManagerService } from './func-manager.service';

describe('FuncManagerService', () => {
  let service: FuncManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FuncManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
