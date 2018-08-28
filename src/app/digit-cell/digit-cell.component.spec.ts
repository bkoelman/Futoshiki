import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DigitCellComponent } from './digit-cell.component';

describe('DigitCellComponent', () => {
  let component: DigitCellComponent;
  let fixture: ComponentFixture<DigitCellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DigitCellComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DigitCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
