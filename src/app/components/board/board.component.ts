import { Component, OnInit, ViewChildren, QueryList, Input, Output, EventEmitter } from '@angular/core';
import { DigitCellComponent } from '../digit-cell/digit-cell.component';
import { Coordinate } from '../../models/coordinate';
import { GameSaveState } from '../../models/game-save-state';
import { ObjectFacilities } from '../../object-facilities';
import { CellContentSnapshot } from '../../models/cell-content-snapshot';
import { ComparisonOperator } from '../../models/comparison-operator.enum';
import { Board } from '../../models/board';
import { MoveDirection } from '../../models/move-direction.enum';
import { CellSnapshot } from '../../models/cell-snapshot';
import { OperatorCellComponent } from '../operator-cell/operator-cell.component';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html'
})
export class BoardComponent implements Board, OnInit {
  @ViewChildren(DigitCellComponent) private _cells!: QueryList<DigitCellComponent>;
  @ViewChildren(OperatorCellComponent) private _operators!: QueryList<OperatorCellComponent>;
  private _canSelect = true;

  @Input() startBoard: Board | undefined;
  @Input() size = -1;
  @Output() contentChanged = new EventEmitter<CellSnapshot>();

  get canSelect(): boolean {
    return this._canSelect;
  }
  set canSelect(value: boolean) {
    if (!value) {
      this.clearSelection();
    }
    this._canSelect = value;
  }

  ngOnInit() {
  }

  getFixedValueAt(rowIndex: number, columnIndex: number): number | undefined {
    if (this.startBoard) {
      const coordinate = this.createCoordinate(rowIndex, columnIndex);
      const cell = this.startBoard.getCell(coordinate);
      if (cell && cell.isFixed) {
        return cell.value;
      }
    }
    return undefined;
  }

  getOperatorAtRight(rowIndex: number, columnIndex: number): ComparisonOperator {
    const coordinate = this.createCoordinate(rowIndex, columnIndex);
    return this.startBoard ? this.startBoard.getOperator(coordinate, MoveDirection.Right) : ComparisonOperator.None;
  }

  getOperatorBelow(rowIndex: number, columnIndex: number): ComparisonOperator {
    const coordinate = this.createCoordinate(rowIndex, columnIndex);
    return this.startBoard ? this.startBoard.getOperator(coordinate, MoveDirection.Down) : ComparisonOperator.None;
  }

  private createCoordinate(rowIndex: number, columnIndex: number): Coordinate {
    const index = rowIndex * this.size + columnIndex;
    return Coordinate.fromIndex(index, this.size);
  }

  reset() {
    this._cells.forEach(cell => cell.clear());
    this.clearSelection();
    this.canSelect = true;
  }

  clearSelection() {
    this._cells.forEach(cell => cell.isSelected = false);
  }

  getSelectedCell(): DigitCellComponent | undefined {
    return this._cells.find(cell => cell.isSelected);
  }

  hasIncompleteCells() {
    return this._cells.some(cell => cell.value === undefined);
  }

  getCell(coordinate: Coordinate): DigitCellComponent | undefined {
    const arrayIndex = coordinate.toIndex();
    return this._cells.find((item, index) => index === arrayIndex);
  }

  getCoordinate(cell: DigitCellComponent): Coordinate | undefined {
    let arrayIndex = -1;

    this._cells.some((item, index) => {
      if (item === cell) {
        arrayIndex = index;
        return true;
      }
      return false;
    });

    return arrayIndex > -1 ? Coordinate.fromIndex(arrayIndex, this.size) : undefined;
  }

  getOperator(coordinate: Coordinate, direction: MoveDirection): ComparisonOperator {
    return this.startBoard ? this.startBoard.getOperator(coordinate, direction) : ComparisonOperator.None;
  }

  getOperatorComponent(coordinate: Coordinate, direction: MoveDirection): OperatorCellComponent | undefined {
    const operatorIndex = this.calculateOperatorIndex(coordinate, direction);
    if (operatorIndex !== undefined) {
      return this._operators.find((item, index) => index === operatorIndex);
    }

    return undefined;
  }

  calculateOperatorIndex(coordinate: Coordinate, direction: MoveDirection) {
    const cellIndex = coordinate.toIndex();
    const cellRowIndex = Math.floor(cellIndex / this.size);
    const cellColumnIndex = cellIndex % this.size;
    const operatorRowSize = 2 * this.size - 1;

    switch (direction) {
      case MoveDirection.Left:
        return cellRowIndex * operatorRowSize + cellColumnIndex - 1;
      case MoveDirection.Right:
        return cellRowIndex * operatorRowSize + cellColumnIndex;
      case MoveDirection.Up:
        return (cellRowIndex - 1) * operatorRowSize + this.size - 1 + cellColumnIndex;
      case MoveDirection.Down:
        return cellRowIndex * operatorRowSize + this.size - 1 + cellColumnIndex;
    }
  }

  getAnswerDigits() {
    let answerDigits = '';
    this._cells.forEach(cell => {
      answerDigits += cell.value || '.';
    });
    return answerDigits;
  }

  loadGame(saveState: GameSaveState) {
    if (saveState.cellSnapshotMap !== undefined) {
      ObjectFacilities.iterateObjectProperties<CellContentSnapshot>(saveState.cellSnapshotMap, (indexText, snapshot) => {
        const indexValue = parseInt(indexText, 10);
        const coordinate = Coordinate.fromIndex(indexValue, this.size);

        const cell = this.getCell(coordinate);
        if (cell) {
          cell.restoreContentSnapshot(snapshot);
        }
      });
    } else {
      this.reset();
    }
  }

  onCellClicked(sender: DigitCellComponent) {
    this.clearSelection();

    if (this.canSelect && !sender.isFixed) {
      sender.isSelected = true;
    }
  }

  onCellContentChanged(event: { sender: DigitCellComponent, snapshotBefore: CellContentSnapshot }) {
    const coordinate = this.getCoordinate(event.sender);
    if (coordinate) {
      this.contentChanged.emit({
        coordinate: coordinate,
        content: event.snapshotBefore
      });
    }
  }
}
