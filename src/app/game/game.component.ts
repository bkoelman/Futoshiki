import { Component, OnInit, ViewChild, AfterViewChecked } from '@angular/core';
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

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html'
})
export class GameComponent implements OnInit, AfterViewChecked {
  @ViewChild(BoardComponent) boardComponent: BoardComponent;
  @ViewChild(ChangePuzzleComponent) changePuzzleComponent: ChangePuzzleComponent;
  puzzle: PuzzleData | undefined;
  hasError: boolean;
  isBoardCompleted: boolean;
  isGameSolved: boolean;
  undoStack: Array<SingleUndoCommand | AggregateUndoCommand> = [];

  private _solver: PuzzleSolver;

  constructor(private puzzleDownloadController: HttpRequestController<PuzzleInfo, PuzzleData>, private _dataService: PuzzleDataService) {
  }

  ngOnInit() {
    const defaultRequest: PuzzleInfo = {
      difficulty: PuzzleDifficulty.Easy,
      boardSize: 4,
      id: 1
    };

    this.initPuzzle(defaultRequest);
  }

  ngAfterViewChecked(): void {
    if (!this._solver && this.boardComponent) {
      this._solver = new PuzzleSolver(this.boardComponent);
    }
  }

  private initPuzzle(request: PuzzleInfo) {
    this.hasError = false;
    this.puzzleDownloadController.startRequest(request,
      () => this._dataService.getPuzzle(request),
      (isVisible) => this.onPuzzleLoaderVisibilityChanged(isVisible),
      (data) => this.onPuzzleDownloadSucceeded(data),
      (err) => this.onPuzzleDownloadFailed(err)
    );
  }

  private onPuzzleLoaderVisibilityChanged(isVisible: boolean) {
    if (this.changePuzzleComponent) {
      this.changePuzzleComponent.isLoaderVisible = isVisible;
    }
  }

  private onPuzzleDownloadSucceeded(data: PuzzleData) {
    this.puzzle = data;
    this.restart();
  }

  private onPuzzleDownloadFailed(err: any) {
    this.hasError = true;
    console.log(err);
  }

  restart() {
    this.isBoardCompleted = false;
    this.isGameSolved = false;
    this.undoStack = [];

    if (this.boardComponent) {
      this.boardComponent.reset();
    }
  }

  showChangePuzzleModal() {
    this.changePuzzleComponent.setDefaults(this.puzzle.info);
  }

  undo() {
    const undoCommand = this.undoStack.pop();

    if (undoCommand instanceof SingleUndoCommand) {
      this.undoSingleCommand(undoCommand);
    } else if (undoCommand instanceof AggregateUndoCommand) {
      for (const nestedCommand of undoCommand.commands) {
        this.undoSingleCommand(nestedCommand);
      }
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

    this.isBoardCompleted = !this.boardComponent.hasIncompleteCells();
    if (this.isBoardCompleted) {
      if (this.BoardContainsSolution()) {
        this.isGameSolved = true;
        this.boardComponent.canSelect = false;
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

  calculateDraftValue() {
    const cell = this.boardComponent.getSelectedCell();
    if (cell && cell.value === undefined) {
      this.pushUndoCommand(cell);

      const coordinate = this.boardComponent.getCoordinateForCell(cell);
      const possibleValues = this._solver.getPossibleValuesAtCoordinate(coordinate);
      const snapshot = new CellContentSnapshot(undefined, possibleValues);
      cell.restoreContentSnapshot(snapshot);
    }
  }

  calculateDraftValues() {
    const undoCommands: SingleUndoCommand[] = [];

    for (let row = 1; row <= this.puzzle.info.boardSize; row++) {
      for (let column = 1; column <= this.puzzle.info.boardSize; column++) {
        const coordinate = new Coordinate(row, column);
        const cell = this.boardComponent.getCellAtCoordinate(coordinate);
        if (cell && cell.value === undefined) {
          const possibleValues = this._solver.getPossibleValuesAtCoordinate(coordinate);

          const snapshotBefore = cell.getContentSnapshot();
          const snapshotAfter = new CellContentSnapshot(undefined, possibleValues);

          if (JSON.stringify(snapshotBefore) !== JSON.stringify(snapshotAfter)) {
            undoCommands.push(new SingleUndoCommand(coordinate, snapshotBefore));
            cell.restoreContentSnapshot(snapshotAfter);
          }
        }
      }
    }

    if (undoCommands.length > 0) {
      this.pushAggregateUndoCommand(undoCommands);
    }
  }

  onPuzzleChanged(value: PuzzleInfo) {
    this.initPuzzle(value);
  }
}
