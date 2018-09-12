import { Component, OnInit, ViewChild } from '@angular/core';
import { BoardComponent } from '../board/board.component';
import { PuzzleDataService } from '../puzzle-data.service';
import { PuzzleDifficulty } from '../puzzle-difficulty.enum';
import { PuzzleInfo } from '../puzzle-info';
import { PuzzleData } from '../puzzle-data';
import { ChangePuzzleComponent } from '../change-puzzle/change-puzzle.component';
import { HttpRequestController } from '../http-request-controller';
import { DigitCellComponent } from '../digit-cell/digit-cell.component';
import { UndoCommand } from '../undo-command';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html'
})
export class GameComponent implements OnInit {
  @ViewChild(BoardComponent) boardComponent: BoardComponent;
  @ViewChild(ChangePuzzleComponent) changePuzzleComponent: ChangePuzzleComponent;
  puzzle: PuzzleData | undefined;
  hasError: boolean;
  boardSize: number;
  isBoardCompleted: boolean;
  isGameSolved: boolean;
  undoStack: UndoCommand[] = [];

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
    this.boardSize = data.info.boardSize;

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

  undo() {
    const undoCommand = this.undoStack.pop();
    if (undoCommand) {
      const cell = this.boardComponent.getCellAtOffset(undoCommand.targetCellOffset);
      if (cell) {
        cell.restoreContentSnapshot(undoCommand.previousState);
        this.boardComponent.clearSelection();
      }
    }
  }

  onClearClicked() {
    const cell = this.boardComponent.getSelectedCell();
    if (cell !== undefined && !cell.isEmpty) {
      this.pushUndoCommand(cell);
      cell.clear();
    }
  }

  onDigitClicked(data: { value: number, isDraft: boolean }) {
    const cell = this.boardComponent.getSelectedCell();
    if (cell !== undefined) {
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
      const userValue = this.boardComponent.getCellValueAt(index);
      if (userValue !== answerValue) {
        isCorrect = false;
      }
    });

    return isCorrect;
  }

  private pushUndoCommand(cell: DigitCellComponent) {
    const snapshot = cell.getContentSnapshot();
    const offset = this.boardComponent.getOffsetForCell(cell);

    if (offset !== -1) {
      this.undoStack.push({
        targetCellOffset: offset,
        previousState: snapshot
      });
    }
  }

  onPuzzleChanged(value: PuzzleInfo) {
    this.initPuzzle(value);
  }
}
