import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardComponent } from './board.component';
import { DigitCellComponent } from '../digit-cell/digit-cell.component';
import { OperatorCellComponent } from '../operator-cell/operator-cell.component';
import { SpacerCellComponent } from '../spacer-cell/spacer-cell.component';
import { RepeatPipe } from '../../repeat.pipe';
import { RulerCellComponent } from '../ruler-cell/ruler-cell.component';

describe('BoardComponent', () => {
  let component: BoardComponent;
  let fixture: ComponentFixture<BoardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        BoardComponent,
        DigitCellComponent,
        OperatorCellComponent,
        SpacerCellComponent,
        RepeatPipe,
        RulerCellComponent
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
