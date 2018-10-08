import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { GameComponent } from './components/game/game.component';
import { BoardComponent } from './components/board/board.component';
import { DigitCellComponent } from './components/digit-cell/digit-cell.component';
import { OperatorCellComponent } from './components/operator-cell/operator-cell.component';
import { SpacerCellComponent } from './components/spacer-cell/spacer-cell.component';
import { ButtonBarComponent } from './components/button-bar/button-bar.component';
import { ChangePuzzleComponent } from './components/change-puzzle/change-puzzle.component';
import { EnumNamesToArrayPipe } from './enum-names-to-array.pipe';
import { CacheInterceptor } from './services/cache-interceptor';
import { HttpRequestController } from './services/http-request-controller';
import { HttpCacheService } from './services/http-cache.service';
import { PuzzleDataService } from './services/puzzle-data.service';
import { DebugConsoleComponent } from './components/debug-console/debug-console.component';
import { RepeatPipe } from './repeat.pipe';
import { MenuBarComponent } from './menu-bar/menu-bar.component';
import { SettingsComponent } from './components/settings/settings.component';

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
    EnumNamesToArrayPipe,
    DebugConsoleComponent,
    RepeatPipe,
    MenuBarComponent,
    SettingsComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [
    HttpRequestController,
    HttpCacheService,
    PuzzleDataService,
    { provide: HTTP_INTERCEPTORS, useClass: CacheInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
