import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebugNodeComponent } from './debug-node.component';

describe('DebugNodeComponent', () => {
  let component: DebugNodeComponent;
  let fixture: ComponentFixture<DebugNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DebugNodeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DebugNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
