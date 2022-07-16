import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeBasicsComponent } from './node-basics.component';

describe('NodeBasicsComponent', () => {
  let component: NodeBasicsComponent;
  let fixture: ComponentFixture<NodeBasicsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NodeBasicsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NodeBasicsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
