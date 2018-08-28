import { Component, OnInit, ViewChild } from '@angular/core';
import { BoardComponent } from '../board/board.component';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html'
})
export class GameComponent implements OnInit {
  @ViewChild(BoardComponent) boardComponent : BoardComponent;
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
    
    1_._._.
    ._4_._.
    ._._._.
    2_._1_.
    
    1_2_4_3
    3_4_2_1
    4_1_3_2
    2_3_1_4
    
    */
    if (this.boardComponent.getCellValueAt(0) == 1 &&
      this.boardComponent.getCellValueAt(1) == 2 &&
      this.boardComponent.getCellValueAt(2) == 4 &&
      this.boardComponent.getCellValueAt(3) == 3 &&

      this.boardComponent.getCellValueAt(4) == 3 &&
      this.boardComponent.getCellValueAt(5) == 4 &&
      this.boardComponent.getCellValueAt(6) == 2 &&
      this.boardComponent.getCellValueAt(7) == 1 &&

      this.boardComponent.getCellValueAt(8) == 4 &&
      this.boardComponent.getCellValueAt(9) == 1 &&
      this.boardComponent.getCellValueAt(10) == 3 &&
      this.boardComponent.getCellValueAt(11) == 2 &&

      this.boardComponent.getCellValueAt(12) == 2 &&
      this.boardComponent.getCellValueAt(13) == 3 &&
      this.boardComponent.getCellValueAt(14) == 1 &&
      this.boardComponent.getCellValueAt(15) == 4) {
      return true;
    }
    else {
      return false;
    }
  }
}
