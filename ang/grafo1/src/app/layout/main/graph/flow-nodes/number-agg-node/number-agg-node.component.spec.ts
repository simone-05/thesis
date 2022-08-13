import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NumberAggNodeComponent } from './number-agg-node.component';

describe('NumberAggNodeComponent', () => {
  let component: NumberAggNodeComponent;
  let fixture: ComponentFixture<NumberAggNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NumberAggNodeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NumberAggNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
