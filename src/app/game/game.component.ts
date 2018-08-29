import { Component, OnInit, ViewChild } from '@angular/core';
import { BoardComponent } from '../board/board.component';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html'
})
export class GameComponent implements OnInit {
  @ViewChild(BoardComponent) boardComponent: BoardComponent;
  isBoardCompleted: boolean;
  isGameSolved: boolean;

  // Hardcoded puzzle
  puzzleLines: string[] = [
    '._._._2',
    '____v__',
    '.(.(._.',
    '_______',
    '._._._.',
    '____v__',
    '._._._.'
  ];
  answerLines: string[] = [
    '3_1_4_2',
    '____v__',
    '1(2(3_4',
    '_______',
    '4_3_2_1',
    '____v__',
    '2_4_1_3'
  ];
  boardSize: number = 4;

  ngOnInit() {
  }

  restart() {
    this.isBoardCompleted = false;
    this.isGameSolved = false;
    this.boardComponent.reset();
  }

  onDigitClicked(value: number | undefined) {
    let cell = this.boardComponent.getSelectedCell();
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
    let answerText = this.answerLines.reduce((left, right) => left.concat(right));
    let answerDigits = answerText.match(/\d+/g);

    let isCorrect: boolean = true;
    answerDigits.forEach((digit, index) => {
      let answerValue = parseInt(digit);
      let userValue = this.boardComponent.getCellValueAt(index);
      if (userValue !== answerValue) {
        isCorrect = false;
      }
    });

    return isCorrect;
  }
}
