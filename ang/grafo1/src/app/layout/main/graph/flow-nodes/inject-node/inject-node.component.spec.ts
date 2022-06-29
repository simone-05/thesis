import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InjectNodeComponent } from './inject-node.component';

describe('InjectNodeComponent', () => {
  let component: InjectNodeComponent;
  let fixture: ComponentFixture<InjectNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InjectNodeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InjectNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
