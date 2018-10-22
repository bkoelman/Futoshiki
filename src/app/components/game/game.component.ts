import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import * as Cookies from 'js-cookie';
import { BoardComponent } from '../board/board.component';
import { PuzzleDataService } from '../../services/puzzle-data.service';
import { PuzzleDifficulty } from '../../models/puzzle-difficulty.enum';
import { PuzzleInfo } from '../../models/puzzle-info';
import { PuzzleData } from '../../models/puzzle-data';
import { ChangePuzzleModalComponent } from '../change-puzzle-modal/change-puzzle-modal.component';
import { HttpRequestController } from '../../services/http-request-controller';
import { CellSnapshot } from '../../models/cell-snapshot';
import { Coordinate } from '../../models/coordinate';
import { GameSaveState } from '../../models/game-save-state';
import { SaveGameAdapter } from '../../save-game-adapter';
import { DebugConsoleComponent } from '../debug-console/debug-console.component';
import { CandidateCleaner } from '../../candidate-cleaner';
import { MoveChecker } from '../../move-checker';
import { UndoTracker } from '../../undo-tracker';
import { MoveCheckResult } from '../../models/move-check-result';
import { DigitCellComponent } from '../digit-cell/digit-cell.component';
import { CellContentSnapshot } from '../../models/cell-content-snapshot';
import { GameSettings } from '../../models/game-settings';
import { GameCompletionState } from '../../models/game-completion-state.enum';
import { SettingsModalComponent } from '../settings-modal/settings-modal.component';
import { SettingsAdapter } from '../../settings-adapter';
import { CandidatePromoter } from 'src/app/candidate-promoter';
import { HintProvider } from 'src/app/hint-provider';
import { HintExplanationBoxComponent } from '../hint-explanation-box/hint-explanation-box.component';
import { BoardTextConverter } from 'src/app/board-text-converter';
import { AboutModalComponent } from '../about-modal/about-modal.component';
import { WinModalComponent } from '../win-modal/win-modal.component';
import { Logger } from 'src/app/logger';
import { LogCategory } from 'src/app/models/log-category.enum';
import { environment } from 'src/environments/environment';
import { PlayTimeTracker } from 'src/app/play-time-tracker';

declare var $: any;

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html'
})
export class GameComponent implements OnInit {
  @ViewChild(BoardComponent)
  private _board!: BoardComponent;
  @ViewChild(ChangePuzzleModalComponent)
  private _changePuzzleModal!: ChangePuzzleModalComponent;
  @ViewChild(SettingsModalComponent)
  private _settingsModal!: SettingsModalComponent;
  @ViewChild(AboutModalComponent)
  private _aboutModal!: AboutModalComponent;
  @ViewChild(DebugConsoleComponent)
  private _debugConsole!: DebugConsoleComponent;
  @ViewChild(HintExplanationBoxComponent)
  private _hintExplanationBox!: HintExplanationBoxComponent;
  @ViewChild(WinModalComponent)
  private _winModal!: WinModalComponent;

  private _undoTracker!: UndoTracker;
  private _candidateCleaner!: CandidateCleaner;
  private _candidatePromoter!: CandidatePromoter;
  private _moveChecker!: MoveChecker;
  private _hintProvider!: HintProvider;
  private _saveGameAdapter = new SaveGameAdapter();
  private _settingsAdapter = new SettingsAdapter();
  private _playTimeTracker!: PlayTimeTracker;
  private _isAnimating = false;
  private _isMenuOpen = false;
  private _areCookiesEnabled: boolean;

  GameCompletionStateAlias = GameCompletionState;

  puzzle: PuzzleData | undefined;
  hasRetrieveError = false;
  playState = GameCompletionState.Playing;
  inDebugMode: boolean;
  isTypingText = false;
  settings: GameSettings;

  get canAcceptInput() {
    return !this._isAnimating && !this.hasRetrieveError;
  }

  get areShortcutKeysEnabled(): boolean {
    return this.canAcceptInput && !this.isModalOpen && !this.isTypingText && !this._isMenuOpen && this.playState !== GameCompletionState.Won;
  }

  private get isModalOpen() {
    return this._changePuzzleModal.isModalVisible || this._settingsModal.isModalVisible || this._aboutModal.isModalVisible;
  }

  get canUndo() {
    return this._undoTracker.canUndo();
  }

  constructor(
    private _downloadController: HttpRequestController<PuzzleInfo, PuzzleData>,
    private _dataService: PuzzleDataService,
    private _zone: NgZone
  ) {
    this.inDebugMode = !environment.production && location.search.indexOf('debug') > -1;
    this._areCookiesEnabled = location.search.indexOf('noCookies') <= -1;

    this.settings = this.getSettingsFromCookie();
  }

  private getSettingsFromCookie(): GameSettings {
    if (this._areCookiesEnabled) {
      const settingsText = Cookies.get('settings');
      if (settingsText) {
        Logger.write(LogCategory.Cookies, 'Settings cookie detected.');

        const settings = this._settingsAdapter.parseText(settingsText);
        if (settings) {
          return settings;
        }
      }
    }

    return {
      autoCleanCandidates: true,
      notifyOnWrongMoves: false,
      showHintExplanations: false
    };
  }

  ngOnInit() {
    this._undoTracker = new UndoTracker(this._board);
    this._candidateCleaner = new CandidateCleaner(this._board);
    this._candidatePromoter = new CandidatePromoter(this._candidateCleaner, this._board);
    this._moveChecker = new MoveChecker(this._board);
    this._hintProvider = new HintProvider(this._board);
    this._playTimeTracker = new PlayTimeTracker(() => this.storeGameSaveStateInCookie(), this._zone);

    const saveState = this.getGameSaveStateFromCookie();

    this.retrievePuzzle(saveState.info, () => {
      this._board.loadGame(saveState);
      this._playTimeTracker.setEarlierPlayTime(saveState.playTimeInSeconds);
    });
  }

  private getGameSaveStateFromCookie(): GameSaveState {
    if (this._areCookiesEnabled) {
      const saveText = Cookies.get('save');
      if (saveText) {
        Logger.write(LogCategory.Cookies, 'Save cookie detected.');

        const saveState = this._saveGameAdapter.parseText(saveText);
        if (saveState) {
          return saveState;
        }
      }
    }

    return {
      info: {
        difficulty: PuzzleDifficulty.Easy,
        boardSize: 4,
        id: 1
      },
      playTimeInSeconds: 0,
      cellSnapshotMap: undefined
    };
  }

  private retrievePuzzle(request: PuzzleInfo, downloadCompletedAsyncCallback?: () => void) {
    this.hasRetrieveError = false;
    this._downloadController.startRequest(
      request,
      () => this._dataService.getPuzzle(request),
      isVisible => this.onPuzzleLoaderVisibilityChanged(isVisible),
      data => this.onPuzzleDownloadSucceeded(data, downloadCompletedAsyncCallback),
      err => this.onPuzzleDownloadFailed(err)
    );
  }

  private onPuzzleLoaderVisibilityChanged(isVisible: boolean) {
    this._changePuzzleModal.isLoaderVisible = isVisible;
  }

  private onPuzzleDownloadSucceeded(data: PuzzleData, downloadCompletedAsyncCallback?: () => void) {
    this.puzzle = data;
    this.restart(false);

    if (downloadCompletedAsyncCallback) {
      setTimeout(() => {
        downloadCompletedAsyncCallback();
        this.afterBoardChanged();
      });
    } else {
      this.afterBoardChanged();
    }
  }

  restart(updateGameSaveState: boolean) {
    this.playState = GameCompletionState.Playing;

    this._undoTracker.reset();
    this._board.reset();
    this._hintExplanationBox.hide();
    this._playTimeTracker.reset();

    if (updateGameSaveState) {
      this.storeGameSaveStateInCookie();
    }
  }

  private storeGameSaveStateInCookie() {
    if (this._areCookiesEnabled && this.puzzle) {
      const isPlaying = this.playState === GameCompletionState.Playing;
      const playTimeInSeconds = isPlaying ? this._playTimeTracker.getPlayTimeInSeconds() : 0;
      const gameStateText = this._saveGameAdapter.toText(this.puzzle.info, playTimeInSeconds, this._board, !isPlaying);
      Cookies.set('save', gameStateText, {
        expires: 30
      });

      Logger.write(LogCategory.Cookies, 'Save cookie updated.');

      if (this.inDebugMode) {
        this._debugConsole.updateSaveGameText(gameStateText);
      }
    }
  }

  private afterBoardChanged() {
    this.verifyIsBoardSolved();
    this.storeGameSaveStateInCookie();
    setTimeout(() => this.rebindAutoResizeElements());
  }

  private verifyIsBoardSolved() {
    if (this.puzzle) {
      this.playState = this._board.verifyIsBoardSolved(this.puzzle.answerDigits);
      if (this.playState === GameCompletionState.Won) {
        this._board.canSelect = false;

        const finishTimeInSeconds = this._playTimeTracker.getPlayTimeInSeconds();
        this._winModal.setFinishTime(finishTimeInSeconds);
        $('#winModal').modal('show');
      }
    }
  }

  private rebindAutoResizeElements() {
    $(window).off('resize.fittext orientationchange.fittext');
    $(window).off('resize.fitbuttons orientationchange.fitbuttons');

    $('.auto-resize-text').fitText(0.15);
    $('.auto-resize-large-text').fitText(0.5);
    $('.auto-resize-small-text').fitText(0.125);

    $('.auto-resize-buttons').fitButtons('.btn');
  }

  private onPuzzleDownloadFailed(err: any) {
    this.hasRetrieveError = true;
    console.error(err);
  }

  onRestartClicked() {
    this.restart(true);
  }

  onNewGameClicked() {
    const puzzleInfo = this.puzzle ? this.puzzle.info : this.getGameSaveStateFromCookie().info;
    this._changePuzzleModal.selectRandomGame(puzzleInfo);
  }

  onChangePuzzleClicked() {
    const puzzleInfo = this.puzzle ? this.puzzle.info : this.getGameSaveStateFromCookie().info;
    this._changePuzzleModal.setDefaults(puzzleInfo);
  }

  onSettingsClicked() {
    this._settingsModal.setDefaults(this.settings);
  }

  onMenuBarIsOpenChanged(isOpened: boolean) {
    this._isMenuOpen = isOpened;
  }

  onPuzzleChanged(info: PuzzleInfo) {
    this.puzzle = undefined;
    this.retrievePuzzle(info);
  }

  onSettingsChanged(settings: GameSettings) {
    this.settings = settings;
    this.storeSettingsInCookie();
  }

  private storeSettingsInCookie() {
    if (this._areCookiesEnabled) {
      const gameStateText = this._settingsAdapter.toText(this.settings);
      Cookies.set('settings', gameStateText, {
        expires: 30
      });

      Logger.write(LogCategory.Cookies, 'Settings cookie updated.');
    }
  }

  onBoardContentChanged(event: CellSnapshot) {
    if (this.canAcceptInput) {
      this._undoTracker.registerCellChange(event);
    }
  }

  onDigitClicked(data: { digit: number; isCandidate: boolean }) {
    this.captureCellChanges(() => {
      const cell = this._board.getSelectedCell();
      if (cell) {
        if (data.isCandidate) {
          if (cell.containsCandidate(data.digit)) {
            cell.removeCandidate(data.digit);
          } else {
            if (this.verifyMoveAllowed(cell, data.digit, data.isCandidate)) {
              cell.insertCandidate(data.digit);
            }
          }
        } else {
          if (cell.value !== data.digit) {
            if (this.verifyMoveAllowed(cell, data.digit, data.isCandidate)) {
              cell.setUserValue(data.digit);

              if (this.settings.autoCleanCandidates) {
                const coordinate = this._board.getCoordinate(cell);
                if (coordinate) {
                  this._candidateCleaner.reduceCandidates(data.digit, coordinate);
                }
              }
            }
          }
        }
      }
    });
  }

  private captureCellChanges(action: () => void) {
    if (this._undoTracker.captureUndoFrame(action)) {
      this.afterBoardChanged();
    }
  }

  private verifyMoveAllowed(cell: DigitCellComponent, digit: number, isCandidate: boolean): boolean {
    const coordinate = this._board.getCoordinate(cell);
    if (coordinate) {
      const moveCheckResult = this.settings.notifyOnWrongMoves
        ? this._moveChecker.checkIsMoveAllowed(digit, coordinate)
        : MoveCheckResult.createValid();
      if (!moveCheckResult.isValid) {
        this.startErrorForMove(cell, coordinate, moveCheckResult, digit, isCandidate);
        return false;
      }
    }

    return true;
  }

  private startErrorForMove(cell: DigitCellComponent, coordinate: Coordinate, result: MoveCheckResult, digit: number, isCandidate: boolean) {
    const snapshot = cell.getContentSnapshot();
    this._isAnimating = true;

    if (isCandidate) {
      cell.insertCandidate(digit);
      cell.setError(digit);
    } else {
      cell.setUserValue(digit);
      cell.setError(undefined);
    }

    setTimeout(() => this.rebindAutoResizeElements());

    for (const offendingCoordinate of result.offendingCells) {
      const offendingCell = this._board.getCell(offendingCoordinate);
      if (offendingCell) {
        offendingCell.flash(() => this.completeErrorForMove(cell, snapshot));
      }
    }

    for (const offendingOperator of result.offendingOperators) {
      const operatorComponent = this._board.getOperatorComponent(coordinate, offendingOperator);
      if (operatorComponent) {
        operatorComponent.flash(() => this.completeErrorForMove(cell, snapshot));
      }
    }
  }

  private completeErrorForMove(cell: DigitCellComponent, snapshot: CellContentSnapshot) {
    this._isAnimating = false;
    cell.clearError();
    cell.restoreContentSnapshot(snapshot);
  }

  onClearClicked() {
    const cell = this._board.getSelectedCell();
    if (cell && !cell.isEmpty) {
      this.captureCellChanges(() => {
        cell.clear();
      });
    }
  }

  onHintCellClicked() {
    this.captureCellChanges(() => {
      const cell = this._board.getSelectedCell();
      if (cell) {
        const coordinate = this._board.getCoordinate(cell);
        if (coordinate) {
          this.trySolveStep(() => this._hintProvider.runAtCoordinate(coordinate));
        }
      } else {
        this._hintExplanationBox.hide();
      }
    });
  }

  private trySolveStep(step: () => void) {
    try {
      step();
      this._hintExplanationBox.show(this._hintProvider.explanationText);
    } catch (error) {
      this._hintExplanationBox.show('Unsolvable board.');
      throw error;
    }
  }

  onUndoClicked() {
    if (this._undoTracker.undo()) {
      this._board.clearSelection();
      this.afterBoardChanged();
    }
  }

  onPromoteClicked() {
    this.captureCellChanges(() => {
      this._candidatePromoter.promoteSingleCandidates(this.settings.autoCleanCandidates);
    });
  }

  onHintBoardClicked() {
    this.captureCellChanges(() => {
      this.trySolveStep(() => this._hintProvider.runAtBoard());
    });
  }

  onLoadClicked(gameStateText: string) {
    if (this.puzzle) {
      const saveState = this._saveGameAdapter.parseText(gameStateText);
      if (saveState) {
        if (JSON.stringify(saveState.info) === JSON.stringify(this.puzzle.info)) {
          this.restart(false);
          this._board.loadGame(saveState);
          this.afterBoardChanged();
        } else {
          this.puzzle = undefined;
          this.retrievePuzzle(saveState.info, () => {
            this._board.loadGame(saveState);
          });
        }
      }
    }
  }

  onDumpBoardClicked() {
    const converter = new BoardTextConverter();
    const text = converter.boardToText(this._board);
    console.log(text);
  }

  onDebugIsTypingTextChanged(isTypingText: boolean) {
    this.isTypingText = isTypingText;
  }
}
