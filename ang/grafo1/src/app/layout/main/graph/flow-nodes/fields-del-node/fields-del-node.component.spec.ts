import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldsDelNodeComponent } from './fields-del-node.component';

describe('FieldsDelNodeComponent', () => {
  let component: FieldsDelNodeComponent;
  let fixture: ComponentFixture<FieldsDelNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FieldsDelNodeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldsDelNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
