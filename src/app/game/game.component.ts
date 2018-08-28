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

    /* Puzzle:

    ._._._2
    ____v__
    .(.(._.
    _______
    ._._._.
    ____v__
    ._._._.

    3_1_4_2
    ____v__
    1(2(3_4
    _______
    4_3_2_1
    ____v__
    2_4_1_3
    
    */
    if (this.boardComponent.getCellValueAt(0) == 3 &&
      this.boardComponent.getCellValueAt(1) == 1 &&
      this.boardComponent.getCellValueAt(2) == 4 &&
      this.boardComponent.getCellValueAt(3) == 2 &&

      this.boardComponent.getCellValueAt(4) == 1 &&
      this.boardComponent.getCellValueAt(5) == 2 &&
      this.boardComponent.getCellValueAt(6) == 3 &&
      this.boardComponent.getCellValueAt(7) == 4 &&

      this.boardComponent.getCellValueAt(8) == 4 &&
      this.boardComponent.getCellValueAt(9) == 3 &&
      this.boardComponent.getCellValueAt(10) == 2 &&
      this.boardComponent.getCellValueAt(11) == 1 &&

      this.boardComponent.getCellValueAt(12) == 2 &&
      this.boardComponent.getCellValueAt(13) == 4 &&
      this.boardComponent.getCellValueAt(14) == 1 &&
      this.boardComponent.getCellValueAt(15) == 3) {
      return true;
    }
    else {
      return false;
    }
  }
}
