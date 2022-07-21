import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NumberOpsNodeComponent } from './number-ops-node.component';

describe('NumberOpsNodeComponent', () => {
  let component: NumberOpsNodeComponent;
  let fixture: ComponentFixture<NumberOpsNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NumberOpsNodeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NumberOpsNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
