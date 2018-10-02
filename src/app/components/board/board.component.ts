import { Component, OnInit, ViewChildren, QueryList, Input, Output, EventEmitter } from '@angular/core';
import { DigitCellComponent } from '../digit-cell/digit-cell.component';
import { Coordinate } from '../../models/coordinate';
import { GameSaveState } from '../../models/game-save-state';
import { ObjectFacilities } from '../../object-facilities';
import { CellContentSnapshot } from '../../models/cell-content-snapshot';
import { ComparisonOperator } from '../../models/comparison-operator.enum';
import { Board } from '../../models/board';
import { MoveDirection } from '../../models/move-direction.enum';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html'
})
export class BoardComponent implements Board, OnInit {
  @Input() startBoard: Board | undefined;
  @Input() size: number | undefined;
  @Output() contentChanged = new EventEmitter<{ cell: Coordinate, snapshotBefore: CellContentSnapshot }>();

  @ViewChildren(DigitCellComponent) private _cells: QueryList<DigitCellComponent>;
  private _canSelect = true;

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
    const coordinate = this.createCoordinate(rowIndex, columnIndex);
    const cell = this.startBoard.getCell(coordinate);
    return cell && cell.isFixed ? cell.value : undefined;
  }

  getOperatorAtRight(rowIndex: number, columnIndex: number): ComparisonOperator {
    const coordinate = this.createCoordinate(rowIndex, columnIndex);
    return this.startBoard.getOperator(coordinate, MoveDirection.Right);
  }

  getOperatorBelow(rowIndex: number, columnIndex: number): ComparisonOperator {
    const coordinate = this.createCoordinate(rowIndex, columnIndex);
    return this.startBoard.getOperator(coordinate, MoveDirection.Down);
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
    return this.startBoard.getOperator(coordinate, direction);
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
        cell: coordinate,
        snapshotBefore: event.snapshotBefore
      });
    }
  }
}
