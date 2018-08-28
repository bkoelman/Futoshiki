import { TestBed, async } from '@angular/core/testing';

import { AppComponent } from './app.component';
import { GameComponent } from './game/game.component'
import { BoardComponent } from './board/board.component';
import { DigitbarComponent } from './digitbar/digitbar.component';
import { CellComponent } from './cell/cell.component';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        GameComponent,
        BoardComponent,
        DigitbarComponent,
        CellComponent
      ],
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
