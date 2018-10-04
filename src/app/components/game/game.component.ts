import { Component, OnInit, ViewChild } from '@angular/core';
import * as Cookies from 'js-cookie';
import { BoardComponent } from '../board/board.component';
import { PuzzleDataService } from '../../services/puzzle-data.service';
import { PuzzleDifficulty } from '../../models/puzzle-difficulty.enum';
import { PuzzleInfo } from '../../models/puzzle-info';
import { PuzzleData } from '../../models/puzzle-data';
import { ChangePuzzleComponent } from '../change-puzzle/change-puzzle.component';
import { HttpRequestController } from '../../services/http-request-controller';
import { CellSnapshot } from '../../models/cell-snapshot';
import { Coordinate } from '../../models/coordinate';
import { PuzzleSolver } from '../../puzzle-solver';
import { GameSaveState } from '../../models/game-save-state';
import { SaveGameAdapter } from '../../save-game-adapter';
import { DebugConsoleComponent } from '../debug-console/debug-console.component';
import { DraftCleaner } from '../../draft-cleaner';
import { MoveChecker } from '../../move-checker';
import { UndoTracker } from '../../undo-tracker';

declare var $: any;

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html'
})
export class GameComponent implements OnInit {
  @ViewChild(BoardComponent) private _boardComponent!: BoardComponent;
  @ViewChild(ChangePuzzleComponent) private _changePuzzleComponent!: ChangePuzzleComponent;
  @ViewChild(DebugConsoleComponent) private _debugConsoleComponent!: DebugConsoleComponent;
  private _undoTracker!: UndoTracker;
  private _solver!: PuzzleSolver;
  private _autoCleaner!: DraftCleaner;
  private _moveChecker!: MoveChecker;
  private _saveGameAdapter = new SaveGameAdapter();

  puzzle: PuzzleData | undefined;
  hasError = false;
  isBoardCompleted = false;
  isGameSolved = false;
  inDebugMode = false;
  isTypingText = false;

  constructor(private puzzleDownloadController: HttpRequestController<PuzzleInfo, PuzzleData>, private _dataService: PuzzleDataService) {
  }

  ngOnInit() {
    this._undoTracker = new UndoTracker(this._boardComponent);
    this._solver = new PuzzleSolver(this._boardComponent);
    this._autoCleaner = new DraftCleaner(this._boardComponent);
    this._moveChecker = new MoveChecker(this._boardComponent);

    this.inDebugMode = location.search.indexOf('debug') >= 0;

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

  private retrievePuzzle(request: PuzzleInfo, downloadCompletedAsyncCallback?: () => void) {
    this.hasError = false;
    this.puzzleDownloadController.startRequest(request,
      () => this._dataService.getPuzzle(request),
      (isVisible) => this.onPuzzleLoaderVisibilityChanged(isVisible),
      (data) => this.onPuzzleDownloadSucceeded(data, downloadCompletedAsyncCallback),
      (err) => this.onPuzzleDownloadFailed(err)
    );
  }

  private onPuzzleLoaderVisibilityChanged(isVisible: boolean) {
    this._changePuzzleComponent.isLoaderVisible = isVisible;
  }

  private onPuzzleDownloadSucceeded(data: PuzzleData, downloadCompletedAsyncCallback?: () => void) {
    this.puzzle = data;
    this.restart(false);

    if (downloadCompletedAsyncCallback) {
      setTimeout(() => {
        downloadCompletedAsyncCallback();
        this.afterPuzzleDownloadSucceeded();
      });
    } else {
      this.afterPuzzleDownloadSucceeded();
    }

    setTimeout(this.rebindAutoResizeTexts);
  }

  private afterPuzzleDownloadSucceeded() {
    this.storeGameSaveStateInCookie();
    this.rebindAutoResizeTexts();
  }

  private rebindAutoResizeTexts() {
    $(window).off('debouncedresize.fittext orientationchange.fittext');

    $('.auto-resize-text').fitText(0.15);
    $('.auto-resize-large-text').fitText(0.5);
    $('.auto-resize-small-text').fitText(0.125);
  }

  private onPuzzleDownloadFailed(err: any) {
    this.hasError = true;
    console.error(err);
  }

  restart(updateGameSaveState: boolean) {
    this.isBoardCompleted = false;
    this.isGameSolved = false;

    this._undoTracker.reset();
    this._boardComponent.reset();

    if (updateGameSaveState) {
      this.storeGameSaveStateInCookie();
    }
  }

  showChangePuzzleModal() {
    if (this.puzzle) {
      this._changePuzzleComponent.setDefaults(this.puzzle.info);
    }
  }

  areKeysEnabled(): boolean {
    return !this._changePuzzleComponent.isModalVisible && !this.isTypingText;
  }

  canUndo() {
    return this._undoTracker.canUndo() && !this.isGameSolved;
  }

  undo() {
    if (this._undoTracker.undo()) {
      this._boardComponent.clearSelection();
      this.storeGameSaveStateInCookie();
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
      this.storeGameSaveStateInCookie();
      setTimeout(() => this.rebindAutoResizeTexts());
    }
  }

  onDigitClicked(data: { value: number, isDraft: boolean }) {
    this.captureCellChanges(() => {
      const cell = this._boardComponent.getSelectedCell();
      if (cell) {
        if (data.isDraft) {
          cell.toggleDraftValue(data.value);
        } else {
          if (cell.value !== data.value) {
            const coordinate = this._boardComponent.getCoordinate(cell);
            if (coordinate) {
              const result = this._moveChecker.checkIsMoveAllowed(coordinate, data.value);
              if (!this.inDebugMode || /* TODO: Remove debug condition */ result.isAllowed) {
                cell.setUserValue(data.value);
                this._autoCleaner.reduceDraftValues(data.value, coordinate);
              } else {
                if (result.offendingCell !== undefined) {
                  console.log(`Move not allowed due to cell ${result.offendingCell}.`);
                } else if (result.offendingOperator !== undefined) {
                  console.log(`Move not allowed due to operator at ` +
                    `${result.offendingOperator.direction} of ${result.offendingOperator.coordinate}.`);
                }
              }
            }
          }
        }
      }

      this.verifyBoardSolved();
    });
  }

  private verifyBoardSolved() {
    this.isBoardCompleted = !this._boardComponent.hasIncompleteCells();
    if (this.isBoardCompleted) {
      if (this.boardContainsSolution()) {
        this.isGameSolved = true;
        this._boardComponent.canSelect = false;
      }
    }
  }

  boardContainsSolution(): boolean {
    let isCorrect = true;

    const puzzle = this.puzzle;
    if (puzzle) {
      const answerText = puzzle.answerLines.reduce((left, right) => left.concat(right));
      const answerDigits = answerText.match(/\d+/g);
      if (answerDigits) {
        answerDigits.forEach((digit, index) => {
          const answerValue = parseInt(digit, 10);
          const coordinate = Coordinate.fromIndex(index, puzzle.info.boardSize);
          const cell = this._boardComponent.getCell(coordinate);
          if (cell) {
            if (cell.value !== answerValue) {
              isCorrect = false;
            }
          }
        });
      }
    }

    return isCorrect;
  }

  onHintClicked() {
    this.captureCellChanges(() => {
      const cell = this._boardComponent.getSelectedCell();
      if (cell && cell.value === undefined) {
        const coordinate = this._boardComponent.getCoordinate(cell);
        if (coordinate) {
          const possibleValues = this._solver.getPossibleValuesAtCoordinate(coordinate);
          cell.setDraftValues(possibleValues);
        }
      }
    });
  }

  calculateDraftValues() {
    this.captureCellChanges(() => {
      if (this.puzzle) {
        for (const coordinate of Coordinate.iterateBoard(this.puzzle.info.boardSize)) {
          const cell = this._boardComponent.getCell(coordinate);
          if (cell && cell.value === undefined) {
            const possibleValues = this._solver.getPossibleValuesAtCoordinate(coordinate);
            cell.setDraftValues(possibleValues);
          }
        }
      }
    });
  }

  promoteDraftValues() {
    this.captureCellChanges(() => {
      if (this.puzzle) {
        for (const coordinate of Coordinate.iterateBoard(this.puzzle.info.boardSize)) {
          const cell = this._boardComponent.getCell(coordinate);
          if (cell && cell.value === undefined) {
            const possibleValues = cell.getPossibleValues();
            if (possibleValues.length === 1) {
              cell.setUserValue(possibleValues[0]);
            }
          }
        }

        this.verifyBoardSolved();
      }
    });
  }

  onPuzzleSelectionChanged(value: PuzzleInfo) {
    this.puzzle = undefined;
    this.retrievePuzzle(value);
  }

  onBoardContentChanged(event: CellSnapshot) {
    this._undoTracker.registerCellChange(event);
  }

  private storeGameSaveStateInCookie() {
    if (this.puzzle) {
      const gameStateText = this._saveGameAdapter.toText(this.puzzle.info, this._boardComponent, this.isGameSolved);
      Cookies.set('save', gameStateText, {
        expires: 30
      });

      console.log('Save cookie updated.');

      if (this.inDebugMode) {
        this._debugConsoleComponent.updateSaveGameText(gameStateText);
      }
    }
  }

  loadGame(gameStateText: string) {
    if (this.puzzle) {
      const saveState = this._saveGameAdapter.parseText(gameStateText);
      if (saveState) {
        if (JSON.stringify(saveState.info) === JSON.stringify(this.puzzle.info)) {
          this.restart(false);
          this._boardComponent.loadGame(saveState);
          this.storeGameSaveStateInCookie();
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
}
