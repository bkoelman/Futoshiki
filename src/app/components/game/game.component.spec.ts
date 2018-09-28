import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { GameComponent } from './game.component';
import { BoardComponent } from '../board/board.component';
import { DigitCellComponent } from '../digit-cell/digit-cell.component';
import { OperatorCellComponent } from '../operator-cell/operator-cell.component';
import { SpacerCellComponent } from '../spacer-cell/spacer-cell.component';
import { ButtonBarComponent } from '../button-bar/button-bar.component';
import { ChangePuzzleComponent } from '../change-puzzle/change-puzzle.component';
import { EnumNamesToArrayPipe } from '../../enum-names-to-array.pipe';
import { HttpRequestController } from '../../services/http-request-controller';
import { PuzzleDataService } from '../../services/puzzle-data.service';
import { DebugConsoleComponent } from '../debug-console/debug-console.component';

describe('GameComponent', () => {
  let component: GameComponent;
  let fixture: ComponentFixture<GameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        FormsModule
      ],
      declarations: [
        GameComponent,
        BoardComponent,
        DigitCellComponent,
        OperatorCellComponent,
        SpacerCellComponent,
        ButtonBarComponent,
        ChangePuzzleComponent,
        EnumNamesToArrayPipe,
        DebugConsoleComponent
      ],
      providers: [
        HttpRequestController,
        PuzzleDataService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
