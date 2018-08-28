import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { GameComponent } from './game/game.component';
import { BoardComponent } from './board/board.component';
import { DigitCellComponent } from './digit-cell/digit-cell.component';
import { OperatorCellComponent } from './operator-cell/operator-cell.component';
import { SpacerCellComponent } from './spacer-cell/spacer-cell.component';
import { ButtonBarComponent } from './button-bar/button-bar.component';

@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
    BoardComponent,
    DigitCellComponent,
    OperatorCellComponent,
    SpacerCellComponent,
    ButtonBarComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
