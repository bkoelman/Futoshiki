import { Component, OnInit, ViewChild } from '@angular/core';
import { BoardComponent } from '../board/board.component';
import { DataService } from '../data.service';
import { PuzzleData } from '../puzzle-data';
import { PuzzleDifficulty } from '../puzzle-difficulty.enum';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html'
})
export class GameComponent implements OnInit {
  @ViewChild(BoardComponent) boardComponent: BoardComponent;
  puzzle: PuzzleData | undefined;
  isBoardCompleted: boolean;
  isGameSolved: boolean;

  constructor(private _dataService: DataService) {
  }

  ngOnInit() {
    let size = 8;
    let id = 1;
    if (document.location.search === '?4') {
      size = 4;
      id = 140;
    }

    this._dataService.getPuzzle(size, PuzzleDifficulty.Easy, id).subscribe(data => {
      this.puzzle = data;
    }, (err: any) => console.log(err));
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
}
