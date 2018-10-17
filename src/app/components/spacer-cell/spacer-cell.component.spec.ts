import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpacerCellComponent } from './spacer-cell.component';

describe('SpacerCellComponent', () => {
  let component: SpacerCellComponent;
  let fixture: ComponentFixture<SpacerCellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SpacerCellComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpacerCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
