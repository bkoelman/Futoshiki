import { TestBed, async } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { GameComponent } from './components/game/game.component';
import { BoardComponent } from './components/board/board.component';
import { DigitCellComponent } from './components/digit-cell/digit-cell.component';
import { OperatorCellComponent } from './components/operator-cell/operator-cell.component';
import { SpacerCellComponent } from './components/spacer-cell/spacer-cell.component';
import { ButtonBarComponent } from './components/button-bar/button-bar.component';
import { ChangePuzzleModalComponent } from './components/change-puzzle-modal/change-puzzle-modal.component';
import { EnumNamesToArrayPipe } from './enum-names-to-array.pipe';
import { HttpRequestController } from './services/http-request-controller';
import { PuzzleDataService } from './services/puzzle-data.service';
import { DebugConsoleComponent } from './components/debug-console/debug-console.component';
import { RepeatPipe } from './repeat.pipe';
import { MenuBarComponent } from './components/menu-bar/menu-bar.component';
import { SettingsModalComponent } from './components/settings-modal/settings-modal.component';
import { WinModalComponent } from './components/win-modal/win-modal.component';
import { HintExplanationBoxComponent } from './components/hint-explanation-box/hint-explanation-box.component';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        FormsModule
      ],
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
        HintExplanationBoxComponent
      ],
      providers: [
        HttpRequestController,
        PuzzleDataService
      ]
    }).compileComponents();
  }));
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
