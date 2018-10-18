import { Component, OnInit, ViewChild } from '@angular/core';
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

declare var $: any;
declare var TimeMe: any;

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html'
})
export class GameComponent implements OnInit {
  private static readonly _timeMePageName = 'Futoshiki';

  @ViewChild(BoardComponent)
  private _boardComponent!: BoardComponent;
  @ViewChild(ChangePuzzleModalComponent)
  private _changePuzzleModalComponent!: ChangePuzzleModalComponent;
  @ViewChild(SettingsModalComponent)
  private _settingsModalComponent!: SettingsModalComponent;
  @ViewChild(AboutModalComponent)
  private _aboutModalComponent!: AboutModalComponent;
  @ViewChild(DebugConsoleComponent)
  private _debugConsoleComponent!: DebugConsoleComponent;
  @ViewChild(HintExplanationBoxComponent)
  private _hintExplanationBoxComponent!: HintExplanationBoxComponent;
  @ViewChild(WinModalComponent)
  private _winModalComponent!: WinModalComponent;

  private _undoTracker!: UndoTracker;
  private _autoCleaner!: CandidateCleaner;
  private _candidatePromoter!: CandidatePromoter;
  private _moveChecker!: MoveChecker;
  private _hintProvider!: HintProvider;
  private _saveGameAdapter = new SaveGameAdapter();
  private _settingsAdapter = new SettingsAdapter();
  private _isAnimating = false;
  private _isMenuOpen = false;
  private _earlierPlayTimeInSeconds = 0;

  GameCompletionStateAlias = GameCompletionState;

  puzzle: PuzzleData | undefined;
  hasRetrieveError = false;
  playState = GameCompletionState.Playing;
  inDebugMode = false;
  isTypingText = false;
  settings: GameSettings;

  get canAcceptInput() {
    return !this._isAnimating && !this.hasRetrieveError;
  }

  get areShortcutKeysEnabled(): boolean {
    return this.canAcceptInput && !this.isModalOpen && !this.isTypingText && !this._isMenuOpen && this.playState !== GameCompletionState.Won;
  }

  private get isModalOpen() {
    return this._changePuzzleModalComponent.isModalVisible || this._settingsModalComponent.isModalVisible || this._aboutModalComponent.isModalVisible;
  }

  get canUndo() {
    return this._undoTracker.canUndo();
  }

  constructor(private puzzleDownloadController: HttpRequestController<PuzzleInfo, PuzzleData>, private _dataService: PuzzleDataService) {
    this.settings = this.getSettingsFromCookie();
  }

  ngOnInit() {
    this._undoTracker = new UndoTracker(this._boardComponent);
    this._autoCleaner = new CandidateCleaner(this._boardComponent);
    this._candidatePromoter = new CandidatePromoter(this._autoCleaner, this._boardComponent);
    this._moveChecker = new MoveChecker(this._boardComponent);
    this._hintProvider = new HintProvider(this._boardComponent);

    this.initializePlayTime();

    this.inDebugMode = location.search.indexOf('debug') > -1;
    const saveState = this.getGameSaveStateFromCookie();

    this.retrievePuzzle(saveState.info, () => {
      this._boardComponent.loadGame(saveState);
      this._earlierPlayTimeInSeconds = saveState.playTimeInSeconds;
    });
  }

  private initializePlayTime() {
    TimeMe.initialize({
      idleTimeoutInSeconds: 5 * 60
    });

    TimeMe.callWhenUserLeaves(() => {
      TimeMe.stopTimer(GameComponent._timeMePageName);
      this.storeGameSaveStateInCookie();
    });

    TimeMe.callWhenUserReturns(function() {
      TimeMe.startTimer(GameComponent._timeMePageName);
    });
  }

  private getGameSaveStateFromCookie(): GameSaveState {
    const saveText = Cookies.get('save');
    if (saveText) {
      console.log('Save cookie detected.');

      const saveState = this._saveGameAdapter.parseText(saveText);
      if (saveState) {
        return saveState;
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

  private getSettingsFromCookie(): GameSettings {
    const settingsText = Cookies.get('settings');
    if (settingsText) {
      console.log('Settings cookie detected.');

      const settings = this._settingsAdapter.parseText(settingsText);
      if (settings) {
        return settings;
      }
    }

    return {
      autoCleanCandidates: true,
      notifyOnWrongMoves: false,
      showHintExplanations: false
    };
  }

  private retrievePuzzle(request: PuzzleInfo, downloadCompletedAsyncCallback?: () => void) {
    this.hasRetrieveError = false;
    this.puzzleDownloadController.startRequest(
      request,
      () => this._dataService.getPuzzle(request),
      isVisible => this.onPuzzleLoaderVisibilityChanged(isVisible),
      data => this.onPuzzleDownloadSucceeded(data, downloadCompletedAsyncCallback),
      err => this.onPuzzleDownloadFailed(err)
    );
  }

  private onPuzzleLoaderVisibilityChanged(isVisible: boolean) {
    this._changePuzzleModalComponent.isLoaderVisible = isVisible;
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

  restart(updateGameSaveState: boolean) {
    this.playState = GameCompletionState.Playing;

    this._undoTracker.reset();
    this._boardComponent.reset();
    this._hintExplanationBoxComponent.hide();

    this._earlierPlayTimeInSeconds = 0;
    TimeMe.resetRecordedPageTime(GameComponent._timeMePageName);
    TimeMe.startTimer(GameComponent._timeMePageName);

    if (updateGameSaveState) {
      this.storeGameSaveStateInCookie();
    }
  }

  startRandomGame() {
    const puzzleInfo = this.puzzle ? this.puzzle.info : this.getGameSaveStateFromCookie().info;
    this._changePuzzleModalComponent.selectRandomGame(puzzleInfo);
  }

  showChangePuzzleModal() {
    const puzzleInfo = this.puzzle ? this.puzzle.info : this.getGameSaveStateFromCookie().info;
    this._changePuzzleModalComponent.setDefaults(puzzleInfo);
  }

  showSettings() {
    this._settingsModalComponent.setDefaults(this.settings);
  }

  onUndoClicked() {
    if (this._undoTracker.undo()) {
      this._boardComponent.clearSelection();
      this.afterBoardChanged();
    }
  }

  onClearClicked() {
    const cell = this._boardComponent.getSelectedCell();
    if (cell && !cell.isEmpty) {
      this.captureCellChanges(() => {
        cell.clear();
      });
    }
  }

  private captureCellChanges(action: () => void) {
    if (this._undoTracker.captureUndoFrame(action)) {
      this.afterBoardChanged();
    }
  }

  private afterBoardChanged() {
    this.verifyIsBoardSolved();
    this.storeGameSaveStateInCookie();
    setTimeout(() => this.rebindAutoResizeElements());
  }

  onDigitClicked(data: { digit: number; isCandidate: boolean }) {
    this.captureCellChanges(() => {
      const cell = this._boardComponent.getSelectedCell();
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
                const coordinate = this._boardComponent.getCoordinate(cell);
                if (coordinate) {
                  this._autoCleaner.reduceCandidates(data.digit, coordinate);
                }
              }
            }
          }
        }
      }
    });
  }

  private verifyMoveAllowed(cell: DigitCellComponent, digit: number, isCandidate: boolean): boolean {
    const coordinate = this._boardComponent.getCoordinate(cell);
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
      const offendingCell = this._boardComponent.getCell(offendingCoordinate);
      if (offendingCell) {
        offendingCell.flash(() => this.completeErrorForMove(cell, snapshot));
      }
    }

    for (const offendingOperator of result.offendingOperators) {
      const operatorComponent = this._boardComponent.getOperatorComponent(coordinate, offendingOperator);
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

  private verifyIsBoardSolved() {
    if (this.puzzle) {
      const isBoardCompleted = !this._boardComponent.hasIncompleteCells();
      if (isBoardCompleted) {
        const boardAnswerDigits = this._boardComponent.getAnswerDigits();
        if (boardAnswerDigits.length > 0) {
          if (this.puzzle.answerDigits === boardAnswerDigits) {
            this.playState = GameCompletionState.Won;
            this._boardComponent.canSelect = false;

            const finishTimeInSeconds = this.getPlayTimeInSeconds();
            this._winModalComponent.setFinishTime(finishTimeInSeconds);
            $('#winModal').modal('show');
          } else {
            this.playState = GameCompletionState.Lost;
          }

          return;
        }
      }
    }

    this.playState = GameCompletionState.Playing;
  }

  private getPlayTimeInSeconds() {
    return this._earlierPlayTimeInSeconds + TimeMe.getTimeOnPageInSeconds(GameComponent._timeMePageName);
  }

  onPromoteClicked() {
    this.captureCellChanges(() => {
      this._candidatePromoter.promoteSingleCandidates(this.settings.autoCleanCandidates);
    });
  }

  onHintCellClicked() {
    this.captureCellChanges(() => {
      const cell = this._boardComponent.getSelectedCell();
      if (cell) {
        const coordinate = this._boardComponent.getCoordinate(cell);
        if (coordinate) {
          this.trySolveStep(() => this._hintProvider.runAtCoordinate(coordinate));
        }
      } else {
        this._hintExplanationBoxComponent.hide();
      }
    });
  }

  onHintBoardClicked() {
    this.captureCellChanges(() => {
      this.trySolveStep(() => this._hintProvider.runAtBoard());
    });
  }

  private trySolveStep(step: () => void) {
    try {
      step();
      this._hintExplanationBoxComponent.show(this._hintProvider.explanationText);
    } catch (error) {
      this._hintExplanationBoxComponent.show('Unsolvable board.');
      throw error;
    }
  }

  onPuzzleSelectionChanged(info: PuzzleInfo) {
    this.puzzle = undefined;
    this.retrievePuzzle(info);
  }

  onSettingsChanged(settings: GameSettings) {
    this.settings = settings;
    this.storeSettingsInCookie();
  }

  onBoardContentChanged(event: CellSnapshot) {
    if (this.canAcceptInput) {
      this._undoTracker.registerCellChange(event);
    }
  }

  private storeGameSaveStateInCookie() {
    if (this.puzzle) {
      const isPlaying = this.playState === GameCompletionState.Playing;
      const playTimeInSeconds = isPlaying ? this.getPlayTimeInSeconds() : 0;
      const gameStateText = this._saveGameAdapter.toText(this.puzzle.info, playTimeInSeconds, this._boardComponent, !isPlaying);
      Cookies.set('save', gameStateText, {
        expires: 30
      });

      console.log('Save cookie updated.');

      if (this.inDebugMode) {
        this._debugConsoleComponent.updateSaveGameText(gameStateText);
      }
    }
  }

  private storeSettingsInCookie() {
    const gameStateText = this._settingsAdapter.toText(this.settings);
    Cookies.set('settings', gameStateText, {
      expires: 30
    });

    console.log('Settings cookie updated.');
  }

  loadGame(gameStateText: string) {
    if (this.puzzle) {
      const saveState = this._saveGameAdapter.parseText(gameStateText);
      if (saveState) {
        if (JSON.stringify(saveState.info) === JSON.stringify(this.puzzle.info)) {
          this.restart(false);
          this._boardComponent.loadGame(saveState);
          this.afterBoardChanged();
        } else {
          this.puzzle = undefined;
          this.retrievePuzzle(saveState.info, () => {
            this._boardComponent.loadGame(saveState);
          });
        }
      }
    }
  }

  dumpBoard() {
    const converter = new BoardTextConverter();
    const text = converter.boardToText(this._boardComponent);
    console.log(text);
  }

  debugIsTypingTextChanged(isTypingText: boolean) {
    this.isTypingText = isTypingText;
  }

  menuBarOpenChanged(isOpened: boolean) {
    this._isMenuOpen = isOpened;
  }
}
