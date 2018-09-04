import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { BoardComponent } from '../board/board.component';
import { DataService } from '../data.service';
import { PuzzleDifficulty } from '../puzzle-difficulty.enum';
import { PuzzleInfo } from '../puzzle-info';
import { PuzzleData } from '../puzzle-data';
import { ChangePuzzleComponent } from '../change-puzzle/change-puzzle.component';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html'
})
export class GameComponent implements OnInit {
  @ViewChild(BoardComponent) boardComponent: BoardComponent;
  @ViewChild(ChangePuzzleComponent) changePuzzleComponent: ChangePuzzleComponent;
  puzzle: PuzzleData | undefined;
  pendingDownload: Subscription;
  pendingRequest: PuzzleInfo;
  hasError: boolean;
  boardSize: number;
  isBoardCompleted: boolean;
  isGameSolved: boolean;

  constructor(private _dataService: DataService) {
  }

  ngOnInit() {
    const defaultRequest: PuzzleInfo = {
      difficulty: PuzzleDifficulty.Easy,
      boardSize: 4,
      id: 1
    };

    this.initPuzzle(defaultRequest);
  }

  initPuzzle(request: PuzzleInfo) {
    if (this.isDuplicateRequest(request)) {
      return;
    }

    this.hasError = false;
    this.abortPendingDownload();

    setTimeout(() => {
      if (this.pendingDownload) {
        this.setLoaderVisible(true);
      }
    }, 500);

    this.pendingRequest = request;
    this.pendingDownload = this._dataService.getPuzzle(request).subscribe(
      (data) => {
        this.puzzle = data;
        this.boardSize = data.info.boardSize;
      },
      (err: any) => {
        this.hasError = true;
        console.log(err);
      }, () => {
        this.pendingDownload = undefined;
        this.pendingRequest = undefined;
        this.setLoaderVisible(false);
      });
  }

  isDuplicateRequest(request: PuzzleInfo): boolean {
    if (this.pendingDownload && this.pendingRequest) {
      return JSON.stringify(this.pendingRequest) === JSON.stringify(request);
    } else {
      return false;
    }
  }

  abortPendingDownload() {
    if (this.pendingDownload) {
      this.pendingDownload.unsubscribe();
      this.pendingDownload = undefined;
      this.pendingRequest = undefined;
    }
  }

  setLoaderVisible(showLoader: boolean) {
    if (this.changePuzzleComponent) {
      this.changePuzzleComponent.isLoaderVisible = showLoader;
    }
  }

  restart() {
    this.isBoardCompleted = false;
    this.isGameSolved = false;
    this.boardComponent.reset();
  }

  onDigitClicked(value: number | undefined) {
    const cell = this.boardComponent.getSelectedCell();
    if (cell !== undefined) {
      cell.userValue = value;
    }

    this.isBoardCompleted = !this.boardComponent.hasEmptyCells();
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

  onPuzzleChanged(value: PuzzleInfo) {
    this.initPuzzle(value);
  }
}
