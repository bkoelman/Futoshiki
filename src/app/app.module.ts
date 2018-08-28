import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { DigitbarComponent } from './digitbar/digitbar.component';
import { BoardComponent } from './board/board.component';
import { GameComponent } from './game/game.component';
import { CellComponent } from './cell/cell.component';

@NgModule({
  declarations: [
    AppComponent,
    DigitbarComponent,
    BoardComponent,
    GameComponent,
    CellComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
