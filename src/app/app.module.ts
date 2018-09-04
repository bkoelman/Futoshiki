import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
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
import { CacheInterceptor } from './cache-interceptor';
import { DataService } from './data.service';
import { HttpCacheService } from './http-cache.service';

@NgModule({
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
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [
    DataService,
    HttpCacheService,
    { provide: HTTP_INTERCEPTORS, useClass: CacheInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
