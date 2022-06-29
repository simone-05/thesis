import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooNodeComponent } from './foo-node.component';

describe('FooNodeComponent', () => {
  let component: FooNodeComponent;
  let fixture: ComponentFixture<FooNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FooNodeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FooNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
