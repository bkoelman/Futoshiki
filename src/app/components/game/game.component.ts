import { Component, OnInit, ViewChild } from '@angular/core';
import * as Cookies from 'js-cookie';
import { BoardComponent } from '../board/board.component';
import { PuzzleDataService } from '../../services/puzzle-data.service';
import { PuzzleDifficulty } from '../../models/puzzle-difficulty.enum';
import { PuzzleInfo } from '../../models/puzzle-info';
import { PuzzleData } from '../../models/puzzle-data';
import { ChangePuzzleComponent } from '../change-puzzle/change-puzzle.component';
import { HttpRequestController } from '../../services/http-request-controller';
import { SingleUndoCommand } from '../../models/single-undo-command';
import { AggregateUndoCommand } from '../../models/aggregate-undo-command';
import { Coordinate } from '../../models/coordinate';
import { PuzzleSolver } from '../../puzzle-solver';
import { CellContentSnapshot } from '../../models/cell-content-snapshot';
import { GameSaveState } from '../../models/game-save-state';
import { SaveGameAdapter } from '../../save-game-adapter';
import { DebugConsoleComponent } from '../debug-console/debug-console.component';
import { DraftCleaner } from '../../draft-cleaner';
import { ObjectFacilities } from '../../object-facilities';
import { MoveChecker } from '../../move-checker';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html'
})
export class GameComponent implements OnInit {
  @ViewChild(BoardComponent) boardComponent: BoardComponent;
  @ViewChild(ChangePuzzleComponent) changePuzzleComponent: ChangePuzzleComponent;
  @ViewChild(DebugConsoleComponent) debugConsoleComponent: DebugConsoleComponent;
  puzzle: PuzzleData | undefined;
  hasError: boolean;
  isBoardCompleted: boolean;
  isGameSolved: boolean;
  undoStack: AggregateUndoCommand[] = [];
  inDebugMode = false;
  isTypingText = false;

  private _solver: PuzzleSolver;
  private _autoCleaner: DraftCleaner;
  private _moveChecker: MoveChecker;
  private _saveGameAdapter = new SaveGameAdapter();
  private _isTrackingChanges: boolean;
  private _changesTracked = {};

  constructor(private puzzleDownloadController: HttpRequestController<PuzzleInfo, PuzzleData>, private _dataService: PuzzleDataService) {
  }

  ngOnInit() {
    this._solver = new PuzzleSolver(this.boardComponent);
    this._autoCleaner = new DraftCleaner(this.boardComponent);
    this._moveChecker = new MoveChecker(this.boardComponent);

    this.inDebugMode = location.search.indexOf('debug') >= 0;

    const saveState = this.getGameSaveStateFromCookie();
    this.retrievePuzzle(saveState.info, () => this.boardComponent.loadGame(saveState));
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
    this.changePuzzleComponent.isLoaderVisible = isVisible;
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
  }

  private afterPuzzleDownloadSucceeded() {
    this.storeGameSaveStateInCookie();
  }

  private onPuzzleDownloadFailed(err: any) {
    this.hasError = true;
    console.error(err);
  }

  restart(updateGameSaveState: boolean) {
    this.isBoardCompleted = false;
    this.isGameSolved = false;
    this.undoStack = [];

    this.boardComponent.reset();

    if (updateGameSaveState) {
      this.storeGameSaveStateInCookie();
    }
  }

  showChangePuzzleModal() {
    this.changePuzzleComponent.setDefaults(this.puzzle.info);
  }

  undo() {
    const undoCommand = this.undoStack.pop();
    if (undoCommand) {
      for (const nestedCommand of undoCommand.commands) {
        const cell = this.boardComponent.getCell(nestedCommand.targetCell);
        if (cell) {
          cell.restoreContentSnapshot(nestedCommand.previousState);
          this.boardComponent.clearSelection();
        }
      }

      this.storeGameSaveStateInCookie();
    }
  }

  onClearClicked() {
    const cell = this.boardComponent.getSelectedCell();
    if (cell && !cell.isEmpty) {

      this.captureUndoCommand(() => {
        cell.clear();
      });
    }
  }

  private captureUndoCommand(action: () => void) {
    this._changesTracked = {};
    this._isTrackingChanges = true;

    action();

    this._isTrackingChanges = false;

    const commands: SingleUndoCommand[] = [];
    ObjectFacilities.iterateObjectProperties<CellContentSnapshot>(this._changesTracked, (index, snapshotBefore) => {
      const coordinate = Coordinate.fromIndex(parseInt(index, 10), this.puzzle.info.boardSize);
      commands.push(new SingleUndoCommand(coordinate, snapshotBefore));
    });

    if (commands.length > 0) {
      this.undoStack.push(new AggregateUndoCommand(commands));
      this.storeGameSaveStateInCookie();
    }
  }

  onDigitClicked(data: { value: number, isDraft: boolean }) {
    this.captureUndoCommand(() => {
      const cell = this.boardComponent.getSelectedCell();
      if (cell) {
        if (data.isDraft) {
          cell.toggleDraftValue(data.value);
        } else {
          if (cell.value !== data.value) {
            const coordinate = this.boardComponent.getCoordinate(cell);
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
    this.isBoardCompleted = !this.boardComponent.hasIncompleteCells();
    if (this.isBoardCompleted) {
      if (this.boardContainsSolution()) {
        this.isGameSolved = true;
        this.boardComponent.canSelect = false;
      }
    }
  }

  boardContainsSolution(): boolean {
    const answerText = this.puzzle.answerLines.reduce((left, right) => left.concat(right));
    const answerDigits = answerText.match(/\d+/g);

    let isCorrect = true;
    answerDigits.forEach((digit, index) => {
      const answerValue = parseInt(digit, 10);
      const coordinate = Coordinate.fromIndex(index, this.puzzle.info.boardSize);
      const cell = this.boardComponent.getCell(coordinate);
      if (cell) {
        if (cell.value !== answerValue) {
          isCorrect = false;
        }
      }
    });

    return isCorrect;
  }

  onHintClicked() {
    this.captureUndoCommand(() => {
      const cell = this.boardComponent.getSelectedCell();
      if (cell && cell.value === undefined) {
        const coordinate = this.boardComponent.getCoordinate(cell);
        if (coordinate) {
          const possibleValues = this._solver.getPossibleValuesAtCoordinate(coordinate);
          cell.setDraftValues(possibleValues);
        }
      }
    });
  }

  calculateDraftValues() {
    this.captureUndoCommand(() => {
      for (const coordinate of Coordinate.iterateBoard(this.puzzle.info.boardSize)) {
        const cell = this.boardComponent.getCell(coordinate);
        if (cell && cell.value === undefined) {
          const possibleValues = this._solver.getPossibleValuesAtCoordinate(coordinate);
          cell.setDraftValues(possibleValues);
        }
      }
    });
  }

  promoteDraftValues() {
    this.captureUndoCommand(() => {
      for (const coordinate of Coordinate.iterateBoard(this.puzzle.info.boardSize)) {
        const cell = this.boardComponent.getCell(coordinate);
        if (cell && cell.value === undefined) {
          const possibleValues = cell.getPossibleValues();
          if (possibleValues.length === 1) {
            cell.setUserValue(possibleValues[0]);
          }
        }
      }

      this.verifyBoardSolved();
    });
  }

  onPuzzleSelectionChanged(value: PuzzleInfo) {
    this.puzzle = undefined;
    this.retrievePuzzle(value);
  }

  onBoardContentChanged(event: { cell: Coordinate, snapshotBefore: CellContentSnapshot }) {
    if (this._isTrackingChanges) {
      const index = event.cell.toIndex();
      if (!this._changesTracked[index]) {
        this._changesTracked[index] = event.snapshotBefore;
      }
    }
  }

  private storeGameSaveStateInCookie() {
    const gameStateText = this._saveGameAdapter.toText(this.puzzle.info, this.boardComponent, this.isGameSolved);
    Cookies.set('save', gameStateText, {
      expires: 30
    });

    console.log('Save cookie updated.');

    if (this.inDebugMode) {
      this.debugConsoleComponent.updateSaveGameText(gameStateText);
    }
  }

  loadGame(gameStateText: string) {
    const saveState = this._saveGameAdapter.parseText(gameStateText);
    if (saveState) {
      if (JSON.stringify(saveState.info) === JSON.stringify(this.puzzle.info)) {
        this.restart(false);
        this.boardComponent.loadGame(saveState);
        this.storeGameSaveStateInCookie();
      } else {
        this.puzzle = undefined;
        this.retrievePuzzle(saveState.info, () => {
          this.boardComponent.loadGame(saveState);
        });
      }
    }
  }

  debugIsTypingTextChanged(isTypingText: boolean) {
    this.isTypingText = isTypingText;
  }
}
