import { TestBed, async } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { GameComponent } from './game/game.component';
import { BoardComponent } from './board/board.component';
import { DigitCellComponent } from './digit-cell/digit-cell.component';
import { OperatorCellComponent } from './operator-cell/operator-cell.component';
import { SpacerCellComponent } from './spacer-cell/spacer-cell.component';
import { ButtonBarComponent } from './button-bar/button-bar.component';
import { ChangePuzzleComponent } from './change-puzzle/change-puzzle.component';
import { EnumNamesToArrayPipe } from './enum-names-to-array.pipe';
import { HttpRequestController } from './http-request-controller';
import { PuzzleDataService } from './puzzle-data.service';

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
        ChangePuzzleComponent,
        EnumNamesToArrayPipe
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
  it(`should have as title 'Futoshiki'`, async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('Futoshiki');
  }));
  it('should render title in a h1 tag', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('Futoshiki');
  }));
});
