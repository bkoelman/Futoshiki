import { Component, OnInit, ViewChild } from '@angular/core';
import * as Cookies from 'js-cookie';
import { BoardComponent } from '../board/board.component';
import { PuzzleDataService } from '../puzzle-data.service';
import { PuzzleDifficulty } from '../puzzle-difficulty.enum';
import { PuzzleInfo } from '../puzzle-info';
import { PuzzleData } from '../puzzle-data';
import { ChangePuzzleComponent } from '../change-puzzle/change-puzzle.component';
import { HttpRequestController } from '../http-request-controller';
import { SingleUndoCommand } from '../single-undo-command';
import { AggregateUndoCommand } from '../aggregate-undo-command';
import { Coordinate } from '../coordinate';
import { PuzzleSolver } from '../puzzle-solver';
import { CellContentSnapshot } from '../cell-content-snapshot';
import { GameSaveState } from '../game-save-state';
import { SaveGameAdapter } from '../save-game-adapter';
import { DebugConsoleComponent } from '../debug-console/debug-console.component';
import { DraftCleaner } from '../draft-cleaner';
import { ObjectFacilities } from '../object-facilities';

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
  private _draftCleaner: DraftCleaner;
  private _saveGameAdapter = new SaveGameAdapter();
  private _isTrackingChanges: boolean;
  private _changesTracked = {};

  constructor(private puzzleDownloadController: HttpRequestController<PuzzleInfo, PuzzleData>, private _dataService: PuzzleDataService) {
  }

  ngOnInit() {
    this._solver = new PuzzleSolver(this.boardComponent);
    this._draftCleaner = new DraftCleaner(this.boardComponent);

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
    for (const nestedCommand of undoCommand.commands) {
      const cell = this.boardComponent.getCellAtCoordinate(nestedCommand.targetCell);
      if (cell) {
        cell.restoreContentSnapshot(nestedCommand.previousState);
        this.boardComponent.clearSelection();
      }
    }

    this.storeGameSaveStateInCookie();
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
            cell.setUserValue(data.value);

            const coordinate = this.boardComponent.getCoordinateForCell(cell);
            if (coordinate) {
              this._draftCleaner.cleanupDraftValues(data.value, coordinate);
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
      const userValue = this.boardComponent.getCellValueAtCoordinate(coordinate);
      if (userValue !== answerValue) {
        isCorrect = false;
      }
    });

    return isCorrect;
  }

  onHintClicked() {
    this.captureUndoCommand(() => {
      const cell = this.boardComponent.getSelectedCell();
      if (cell && cell.value === undefined) {
        const coordinate = this.boardComponent.getCoordinateForCell(cell);
        if (coordinate) {
          const possibleValues = this._solver.getPossibleValuesAtCoordinate(coordinate);

          const snapshotAfter = new CellContentSnapshot(undefined, possibleValues);
          cell.restoreContentSnapshot(snapshotAfter);
        }
      }
    });
  }

  calculateDraftValues() {
    this.captureUndoCommand(() => {
      for (let row = 1; row <= this.puzzle.info.boardSize; row++) {
        for (let column = 1; column <= this.puzzle.info.boardSize; column++) {
          const coordinate = new Coordinate(row, column);
          const cell = this.boardComponent.getCellAtCoordinate(coordinate);
          if (cell && cell.value === undefined) {
            const possibleValues = this._solver.getPossibleValuesAtCoordinate(coordinate);

            const snapshotAfter = new CellContentSnapshot(undefined, possibleValues);
            cell.restoreContentSnapshot(snapshotAfter);
          }
        }
      }
    });
  }

  promoteDraftValues() {
    this.captureUndoCommand(() => {
      for (let row = 1; row <= this.puzzle.info.boardSize; row++) {
        for (let column = 1; column <= this.puzzle.info.boardSize; column++) {
          const coordinate = new Coordinate(row, column);
          const cell = this.boardComponent.getCellAtCoordinate(coordinate);
          if (cell && cell.value === undefined) {
            const possibleValues = cell.getPossibleValues();
            if (possibleValues.length === 1) {

              const snapshotAfter = new CellContentSnapshot(possibleValues[0], []);
              cell.restoreContentSnapshot(snapshotAfter);
            }
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
      const index = event.cell.toIndex(this.puzzle.info.boardSize);
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

  loadGame(gameStateText) {
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
