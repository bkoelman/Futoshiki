import { Component, OnInit, ViewChild } from '@angular/core';
import { BoardComponent } from '../board/board.component';
import { DataService } from '../data.service';
import { PuzzleDifficulty } from '../puzzle-difficulty.enum';
import { PuzzleInfo } from '../puzzle-info';
import { PuzzleData } from '../puzzle-data';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html'
})
export class GameComponent implements OnInit {
  @ViewChild(BoardComponent) boardComponent: BoardComponent;
  puzzle: PuzzleData | undefined;
  hasError: boolean;
  boardSize: number;
  isBoardCompleted: boolean;
  isGameSolved: boolean;

  constructor(private _dataService: DataService) {
  }

  ngOnInit() {
    const request: PuzzleInfo = {
      difficulty: PuzzleDifficulty.Easy,
      boardSize: 4,
      id: 1
    };

    this.initPuzzle(request);
  }

  initPuzzle(request: PuzzleInfo) {
    this.hasError = false;
    this._dataService.getPuzzle(request).subscribe(
      (data) => {
        this.puzzle = data;
        this.boardSize = data.info.boardSize;
      },
      (err: any) => {
        this.hasError = true;
        console.log(err);
      });
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
