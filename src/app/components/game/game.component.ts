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
import { PuzzleSolver } from '../../puzzle-solver';
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

declare var $: any;

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html'
})
export class GameComponent implements OnInit {
  @ViewChild(BoardComponent) private _boardComponent!: BoardComponent;
  @ViewChild(ChangePuzzleModalComponent) private _changePuzzleModalComponent!: ChangePuzzleModalComponent;
  @ViewChild(SettingsModalComponent) private _settingsModalComponent!: SettingsModalComponent;
  @ViewChild(DebugConsoleComponent) private _debugConsoleComponent!: DebugConsoleComponent;
  private _undoTracker!: UndoTracker;
  private _solver!: PuzzleSolver;
  private _autoCleaner!: CandidateCleaner;
  private _candidatePromoter!: CandidatePromoter;
  private _moveChecker!: MoveChecker;
  private _hintProvider!: HintProvider;
  private _saveGameAdapter = new SaveGameAdapter();
  private _settingsAdapter = new SettingsAdapter();
  private _isAnimating = false;
  private _isMenuOpen = false;

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
    return this.canAcceptInput && !this._changePuzzleModalComponent.isModalVisible && !this._settingsModalComponent.isModalVisible &&
      !this.isTypingText && !this._isMenuOpen && this.playState !== GameCompletionState.Won;
  }

  get canUndo() {
    return this.canAcceptInput && this._undoTracker.canUndo() && this.playState !== GameCompletionState.Won;
  }

  constructor(private puzzleDownloadController: HttpRequestController<PuzzleInfo, PuzzleData>, private _dataService: PuzzleDataService) {
    this.settings = this.getSettingsFromCookie();
  }

  ngOnInit() {
    this._undoTracker = new UndoTracker(this._boardComponent);
    this._solver = new PuzzleSolver(this._boardComponent);
    this._autoCleaner = new CandidateCleaner(this._boardComponent);
    this._candidatePromoter = new CandidatePromoter(this._autoCleaner, this._boardComponent);
    this._moveChecker = new MoveChecker(this._boardComponent);
    this._hintProvider = new HintProvider(this._boardComponent);

    this.inDebugMode = location.search.indexOf('debug') > -1;

    const saveState = this.getGameSaveStateFromCookie();
    this.retrievePuzzle(saveState.info, () => this._boardComponent.loadGame(saveState));
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
      notifyOnWrongMoves: false
    };
  }

  private retrievePuzzle(request: PuzzleInfo, downloadCompletedAsyncCallback?: () => void) {
    this.hasRetrieveError = false;
    this.puzzleDownloadController.startRequest(request,
      () => this._dataService.getPuzzle(request),
      (isVisible) => this.onPuzzleLoaderVisibilityChanged(isVisible),
      (data) => this.onPuzzleDownloadSucceeded(data, downloadCompletedAsyncCallback),
      (err) => this.onPuzzleDownloadFailed(err)
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

    setTimeout(this.rebindAutoResizeTexts);
  }

  private rebindAutoResizeTexts() {
    $(window).off('debouncedresize.fittext orientationchange.fittext');

    $('.auto-resize-text').fitText(0.15);
    $('.auto-resize-large-text').fitText(0.5);
    $('.auto-resize-small-text').fitText(0.125);
  }

  private onPuzzleDownloadFailed(err: any) {
    this.hasRetrieveError = true;
    console.error(err);
  }

  restart(updateGameSaveState: boolean) {
    this.playState = GameCompletionState.Playing;

    this._undoTracker.reset();
    this._boardComponent.reset();

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

  undo() {
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
    setTimeout(() => this.rebindAutoResizeTexts());
  }

  onDigitClicked(data: { digit: number, isCandidate: boolean }) {
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
      const moveCheckResult = this.settings.notifyOnWrongMoves ?
        this._moveChecker.checkIsMoveAllowed(digit, coordinate) : MoveCheckResult.createValid();
      if (!moveCheckResult.isValid) {
        this.startErrorForMove(cell, coordinate, moveCheckResult, digit, isCandidate);
        return false;
      }
    }

    return true;
  }

  private startErrorForMove(cell: DigitCellComponent, coordinate: Coordinate, result: MoveCheckResult, digit: number,
    isCandidate: boolean) {
    const snapshot = cell.getContentSnapshot();
    this._isAnimating = true;

    if (isCandidate) {
      cell.insertCandidate(digit);
      cell.setError(digit);
    } else {
      cell.setUserValue(digit);
      cell.setError(undefined);
    }

    setTimeout(() => this.rebindAutoResizeTexts());

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

  onHintClicked() {
    this.captureCellChanges(() => {
      const cell = this._boardComponent.getSelectedCell();
      if (cell && cell.value === undefined) {
        const coordinate = this._boardComponent.getCoordinate(cell);
        if (coordinate) {
          const candidates = this._solver.getCandidatesAtCoordinate(coordinate);
          cell.setCandidates(candidates);
        }
      }
    });
  }

  calculateCandidates() {
    this.captureCellChanges(() => {
      if (this.puzzle) {
        for (const coordinate of Coordinate.iterateBoard(this.puzzle.info.boardSize)) {
          const cell = this._boardComponent.getCell(coordinate);
          if (cell && cell.value === undefined) {
            const candidates = this._solver.getCandidatesAtCoordinate(coordinate);
            cell.setCandidates(candidates);
          }
        }
      }
    });
  }

  promoteCandidates() {
    this.captureCellChanges(() => {
      this._candidatePromoter.promoteSingleCandidates(this.settings.autoCleanCandidates);
    });
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
      const gameStateText = this._saveGameAdapter.toText(this.puzzle.info, this._boardComponent,
        this.playState !== GameCompletionState.Playing);
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

  debugIsTypingTextChanged(isTypingText: boolean) {
    this.isTypingText = isTypingText;
  }

  menuBarOpenChanged(isOpened: boolean) {
    this._isMenuOpen = isOpened;
  }

  onHintBoardClicked() {
    this.captureCellChanges(() => {
      this._hintProvider.runAtBoard();
    });
  }

  onHintCellClicked() {
    this.captureCellChanges(() => {
      const cell = this._boardComponent.getSelectedCell();
      if (cell && cell.value === undefined) {
        const coordinate = this._boardComponent.getCoordinate(cell);
        if (coordinate) {
          this._hintProvider.runAtCoordinate(coordinate);
        }
      }
    });
  }
}
