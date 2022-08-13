import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrometheusNodeComponent } from './prometheus-node.component';

describe('PrometheusNodeComponent', () => {
  let component: PrometheusNodeComponent;
  let fixture: ComponentFixture<PrometheusNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrometheusNodeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrometheusNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
