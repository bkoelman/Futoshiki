import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './components/root/app.component';
import { GameComponent } from './components/game/game.component';
import { BoardComponent } from './components/board/board.component';
import { DigitCellComponent } from './components/digit-cell/digit-cell.component';
import { OperatorCellComponent } from './components/operator-cell/operator-cell.component';
import { SpacerCellComponent } from './components/spacer-cell/spacer-cell.component';
import { ButtonBarComponent } from './components/button-bar/button-bar.component';
import { ChangePuzzleModalComponent } from './components/change-puzzle-modal/change-puzzle-modal.component';
import { EnumNamesToArrayPipe } from './enum-names-to-array.pipe';
import { CacheInterceptor } from './services/cache-interceptor';
import { HttpRequestController } from './services/http-request-controller';
import { HttpCacheService } from './services/http-cache.service';
import { PuzzleDataService } from './services/puzzle-data.service';
import { DebugConsoleComponent } from './components/debug-console/debug-console.component';
import { RepeatPipe } from './repeat.pipe';
import { MenuBarComponent } from './components/menu-bar/menu-bar.component';
import { SettingsModalComponent } from './components/settings-modal/settings-modal.component';
import { WinModalComponent } from './components/win-modal/win-modal.component';
import { HintExplanationBoxComponent } from './components/hint-explanation-box/hint-explanation-box.component';

@NgModule({
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
