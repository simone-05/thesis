import { TestBed } from '@angular/core/testing';

import { FooterActivationService } from './footer-activation.service';

describe('FooterActivationService', () => {
  let service: FooterActivationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FooterActivationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
