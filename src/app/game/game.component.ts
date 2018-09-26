import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as Cookies from 'js-cookie';
import { BoardComponent } from '../board/board.component';
import { PuzzleDataService } from '../puzzle-data.service';
import { PuzzleDifficulty } from '../puzzle-difficulty.enum';
import { PuzzleInfo } from '../puzzle-info';
import { PuzzleData } from '../puzzle-data';
import { ChangePuzzleComponent } from '../change-puzzle/change-puzzle.component';
import { HttpRequestController } from '../http-request-controller';
import { DigitCellComponent } from '../digit-cell/digit-cell.component';
import { SingleUndoCommand } from '../single-undo-command';
import { AggregateUndoCommand } from '../aggregate-undo-command';
import { Coordinate } from '../coordinate';
import { PuzzleSolver } from '../puzzle-solver';
import { CellContentSnapshot } from '../cell-content-snapshot';
import { GameSaveState } from '../game-save-state';
import { SaveGameAdapter } from '../save-game-adapter';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html'
})
export class GameComponent implements OnInit {
  @ViewChild(BoardComponent) boardComponent: BoardComponent;
  @ViewChild(ChangePuzzleComponent) changePuzzleComponent: ChangePuzzleComponent;
  @ViewChild('gameState') gameStateElement: ElementRef;
  puzzle: PuzzleData | undefined;
  hasError: boolean;
  isBoardCompleted: boolean;
  isGameSolved: boolean;
  undoStack: Array<SingleUndoCommand | AggregateUndoCommand> = [];

  private _solver: PuzzleSolver;
  private _saveGameAdapter = new SaveGameAdapter();
  private _isLoadingGame = false;
  private _inDebugMode = false;

  constructor(private puzzleDownloadController: HttpRequestController<PuzzleInfo, PuzzleData>, private _dataService: PuzzleDataService) {
  }

  ngOnInit() {
    this._solver = new PuzzleSolver(this.boardComponent);

    this._inDebugMode = location.search.indexOf('debug') >= 0;

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
    this._isLoadingGame = true;
    this.hasError = false;
    this.puzzleDownloadController.startRequest(request,
      () => this._dataService.getPuzzle(request),
      (isVisible) => this.onPuzzleLoaderVisibilityChanged(isVisible),
      (data) => this.onPuzzleDownloadSucceeded(data, downloadCompletedAsyncCallback),
      (err) => this.onPuzzleDownloadFailed(err)
    );
  }

  private onPuzzleLoaderVisibilityChanged(isVisible: boolean) {
    if (this.changePuzzleComponent) {
      this.changePuzzleComponent.isLoaderVisible = isVisible;
    }
  }

  private onPuzzleDownloadSucceeded(data: PuzzleData, downloadCompletedAsyncCallback?: () => void) {
    this.puzzle = data;
    this.restart();

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
    this._isLoadingGame = false;
    this.storeGameSaveStateInCookie();
  }

  private onPuzzleDownloadFailed(err: any) {
    this._isLoadingGame = false;
    this.hasError = true;
    console.error(err);
  }

  restart() {
    this.isBoardCompleted = false;
    this.isGameSolved = false;
    this.undoStack = [];

    this.boardComponent.reset();
  }

  showChangePuzzleModal() {
    this.changePuzzleComponent.setDefaults(this.puzzle.info);
  }

  undo() {
    const undoCommand = this.undoStack.pop();

    if (undoCommand instanceof SingleUndoCommand) {
      this.undoSingleCommand(undoCommand);
    } else if (undoCommand instanceof AggregateUndoCommand) {
      this.boardComponent.collectBulkChanges(() => {
        for (const nestedCommand of undoCommand.commands) {
          this.undoSingleCommand(nestedCommand);
        }
      });
    }
  }

  private undoSingleCommand(undoCommand: SingleUndoCommand) {
    const cell = this.boardComponent.getCellAtCoordinate(undoCommand.targetCell);
    if (cell) {
      cell.restoreContentSnapshot(undoCommand.previousState);
      this.boardComponent.clearSelection();
    }
  }

  onClearClicked() {
    const cell = this.boardComponent.getSelectedCell();
    if (cell && !cell.isEmpty) {
      this.pushUndoCommand(cell);
      cell.clear();
    }
  }

  onDigitClicked(data: { value: number, isDraft: boolean }) {
    const cell = this.boardComponent.getSelectedCell();
    if (cell) {
      if (data.isDraft) {
        this.pushUndoCommand(cell);
        cell.toggleDraftValue(data.value);
      } else {
        if (cell.value !== data.value) {
          this.pushUndoCommand(cell);
          cell.setUserValue(data.value);
        }
      }
    }

    this.verifyBoardSolved();
  }

  private verifyBoardSolved() {
    this.isBoardCompleted = !this.boardComponent.hasIncompleteCells();
    if (this.isBoardCompleted) {
      if (this.BoardContainsSolution()) {
        this.isGameSolved = true;
        this.boardComponent.canSelect = false;
        this.storeGameSaveStateInCookie();
      }
    }
  }

  BoardContainsSolution(): boolean {
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

  private pushUndoCommand(cell: DigitCellComponent) {
    const snapshot = cell.getContentSnapshot();
    const coordinate = this.boardComponent.getCoordinateForCell(cell);

    if (coordinate) {
      this.undoStack.push(new SingleUndoCommand(coordinate, snapshot));
    }
  }

  private pushAggregateUndoCommand(commands: SingleUndoCommand[]) {
    this.undoStack.push(new AggregateUndoCommand(commands));
  }

  onHintClicked() {
    const cell = this.boardComponent.getSelectedCell();
    if (cell && cell.value === undefined) {
      const coordinate = this.boardComponent.getCoordinateForCell(cell);
      const possibleValues = this._solver.getPossibleValuesAtCoordinate(coordinate);

      const snapshotBefore = cell.getContentSnapshot();
      const snapshotAfter = new CellContentSnapshot(undefined, possibleValues);

      if (!snapshotBefore.isEqualTo(snapshotAfter)) {
        this.pushUndoCommand(cell);
        cell.restoreContentSnapshot(snapshotAfter);
      }
    }
  }

  calculateDraftValues() {
    this.boardComponent.collectBulkChanges(() => {
      const undoCommands: SingleUndoCommand[] = [];

      for (let row = 1; row <= this.puzzle.info.boardSize; row++) {
        for (let column = 1; column <= this.puzzle.info.boardSize; column++) {
          const coordinate = new Coordinate(row, column);
          const cell = this.boardComponent.getCellAtCoordinate(coordinate);
          if (cell && cell.value === undefined) {
            const possibleValues = this._solver.getPossibleValuesAtCoordinate(coordinate);

            const snapshotBefore = cell.getContentSnapshot();
            const snapshotAfter = new CellContentSnapshot(undefined, possibleValues);

            if (!snapshotBefore.isEqualTo(snapshotAfter)) {
              undoCommands.push(new SingleUndoCommand(coordinate, snapshotBefore));
              cell.restoreContentSnapshot(snapshotAfter);
            }
          }
        }
      }

      if (undoCommands.length > 0) {
        this.pushAggregateUndoCommand(undoCommands);
      }
    });
  }

  promoteDraftValues() {
    this.boardComponent.collectBulkChanges(() => {
      const undoCommands: SingleUndoCommand[] = [];

      for (let row = 1; row <= this.puzzle.info.boardSize; row++) {
        for (let column = 1; column <= this.puzzle.info.boardSize; column++) {
          const coordinate = new Coordinate(row, column);
          const cell = this.boardComponent.getCellAtCoordinate(coordinate);
          if (cell && cell.value === undefined) {
            const possibleValues = cell.getPossibleValues();
            if (possibleValues.length === 1) {
              const snapshotBefore = cell.getContentSnapshot();
              const snapshotAfter = new CellContentSnapshot(possibleValues[0], []);

              undoCommands.push(new SingleUndoCommand(coordinate, snapshotBefore));
              cell.restoreContentSnapshot(snapshotAfter);

              this.verifyBoardSolved();
            }
          }
        }
      }

      if (undoCommands.length > 0) {
        this.pushAggregateUndoCommand(undoCommands);
      }
    });
  }

  onPuzzleSelectionChanged(value: PuzzleInfo) {
    this.retrievePuzzle(value);
  }

  onBoardContentChanged() {
    if (!this._isLoadingGame) {
      this.storeGameSaveStateInCookie();
    }
  }

  private storeGameSaveStateInCookie() {
    const saveGameText = this._saveGameAdapter.toText(this.puzzle.info, this.boardComponent, this.isGameSolved);
    Cookies.set('save', saveGameText, {
      expires: 30
    });

    console.log('Save cookie updated.');

    if (this._inDebugMode) {
      this.gameStateElement.nativeElement.value = saveGameText;
    }
  }

  loadGame() {
    const saveState = this._saveGameAdapter.parseText(this.gameStateElement.nativeElement.value);
    if (saveState) {
      if (JSON.stringify(saveState.info) === JSON.stringify(this.puzzle.info)) {
        this._isLoadingGame = true;
        this.boardComponent.loadGame(saveState);
        this._isLoadingGame = false;
      } else {
        this.retrievePuzzle(saveState.info, () => this.boardComponent.loadGame(saveState));
      }

      this.storeGameSaveStateInCookie();
    }
  }
}
