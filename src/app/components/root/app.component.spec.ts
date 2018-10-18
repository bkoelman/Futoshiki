import { TestBed, async } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { GameComponent } from '../game/game.component';
import { BoardComponent } from '../board/board.component';
import { DigitCellComponent } from '../digit-cell/digit-cell.component';
import { OperatorCellComponent } from '../operator-cell/operator-cell.component';
import { SpacerCellComponent } from '../spacer-cell/spacer-cell.component';
import { ButtonBarComponent } from '../button-bar/button-bar.component';
import { ChangePuzzleModalComponent } from '../change-puzzle-modal/change-puzzle-modal.component';
import { EnumNamesToArrayPipe } from '../../enum-names-to-array.pipe';
import { HttpRequestController } from '../../services/http-request-controller';
import { PuzzleDataService } from '../../services/puzzle-data.service';
import { DebugConsoleComponent } from '../debug-console/debug-console.component';
import { RepeatPipe } from '../../repeat.pipe';
import { MenuBarComponent } from '../menu-bar/menu-bar.component';
import { SettingsModalComponent } from '../settings-modal/settings-modal.component';
import { WinModalComponent } from '../win-modal/win-modal.component';
import { HintExplanationBoxComponent } from '../hint-explanation-box/hint-explanation-box.component';
import { RulerCellComponent } from '../ruler-cell/ruler-cell.component';
import { AboutModalComponent } from '../about-modal/about-modal.component';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, FormsModule],
      declarations: [
        AppComponent,
        GameComponent,
        BoardComponent,
        DigitCellComponent,
        OperatorCellComponent,
        SpacerCellComponent,
        ButtonBarComponent,
        ChangePuzzleModalComponent,
        EnumNamesToArrayPipe,
        DebugConsoleComponent,
        RepeatPipe,
        MenuBarComponent,
        SettingsModalComponent,
        WinModalComponent,
        HintExplanationBoxComponent,
        RulerCellComponent,
        AboutModalComponent
      ],
      providers: [HttpRequestController, PuzzleDataService]
    }).compileComponents();
  }));
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
