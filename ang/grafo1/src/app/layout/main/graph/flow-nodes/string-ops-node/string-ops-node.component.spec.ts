import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StringOpsNodeComponent } from './string-ops-node.component';

describe('StringOpsNodeComponent', () => {
  let component: StringOpsNodeComponent;
  let fixture: ComponentFixture<StringOpsNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StringOpsNodeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StringOpsNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
