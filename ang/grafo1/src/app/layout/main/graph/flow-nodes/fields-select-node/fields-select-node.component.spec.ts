import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldsSelectNodeComponent } from './fields-select-node.component';

describe('FieldSelectNodeComponent', () => {
  let component: FieldsSelectNodeComponent;
  let fixture: ComponentFixture<FieldsSelectNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FieldsSelectNodeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldsSelectNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
