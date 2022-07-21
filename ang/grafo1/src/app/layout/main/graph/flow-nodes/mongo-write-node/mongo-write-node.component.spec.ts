import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MongoWriteNodeComponent } from './mongo-write-node.component';

describe('MongoWriteNodeComponent', () => {
  let component: MongoWriteNodeComponent;
  let fixture: ComponentFixture<MongoWriteNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MongoWriteNodeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MongoWriteNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
