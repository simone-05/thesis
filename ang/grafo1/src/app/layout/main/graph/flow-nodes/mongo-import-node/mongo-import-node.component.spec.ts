import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MongoImportNodeComponent } from './mongo-import-node.component';

describe('MongoImportNodeComponent', () => {
  let component: MongoImportNodeComponent;
  let fixture: ComponentFixture<MongoImportNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MongoImportNodeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MongoImportNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
