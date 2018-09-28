import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OperatorCellComponent } from './operator-cell.component';

describe('OperatorCellComponent', () => {
  let component: OperatorCellComponent;
  let fixture: ComponentFixture<OperatorCellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OperatorCellComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperatorCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
