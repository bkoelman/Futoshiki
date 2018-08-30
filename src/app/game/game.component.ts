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

  // Hardcoded puzzle 4x4
  puzzleLines4: string[] = [
    '._._._2',
    '____v__',
    '.(.(._.',
    '_______',
    '._._._.',
    '____v__',
    '._._._.'
  ];
  answerLines4: string[] = [
    '3_1_4_2',
    '____v__',
    '1(2(3_4',
    '_______',
    '4_3_2_1',
    '____v__',
    '2_4_1_3'
  ];
  boardSize4 = 4;

  // Hardcoded puzzle 8x8
  puzzleLines8: string[] = [
    '._._5_3_7(._._.',
    '__v_v_^_^___v__',
    '.(._._._._._._.',
    '_______________',
    '._._.)._._._._.',
    '__v___v________',
    '._._.(._._._._.',
    '_______________',
    '.).)._.)._._._.',
    '_______________',
    '._._._._.(.(.(.',
    '______v________',
    '._._1_6_3(._.(.',
    '_______________',
    '.(3_7_._5)._.).'
  ];
  answerLines8: string[] = [
    '1_6_5_3_7(8_4_2',
    '__v_v_^_^___v__',
    '3(4_2_7_8_6_1_5',
    '_______________',
    '6_7_8)5_4_2_3_1',
    '__v___v________',
    '5_2_3(4_6_1_7_8',
    '_______________',
    '8)5)4_2)1_7_6_3',
    '_______________',
    '4_1_6_8_2(3(5(7',
    '______v________',
    '7_8_1_6_3(5_2(4',
    '_______________',
    '2(3_7_1_5)4_8)6'
  ];
  boardSize8 = 8;

  puzzleLines: string[] = this.puzzleLines8;
  answerLines: string[] = this.answerLines8;
  boardSize: number = this.boardSize8;

  ngOnInit() {
    if (document.location.search === '?4') {
      this.puzzleLines = this.puzzleLines4;
      this.answerLines = this.answerLines4;
      this.boardSize = this.boardSize4;
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
    const answerText = this.answerLines.reduce((left, right) => left.concat(right));
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
