import { Component, OnInit, ViewChildren, QueryList, Input, Output, EventEmitter } from '@angular/core';
import { DigitCellComponent } from '../digit-cell/digit-cell.component';
import { Coordinate } from '../../models/coordinate';
import { GameSaveState } from '../../models/game-save-state';
import { ObjectFacilities } from '../../object-facilities';
import { CellContentSnapshot } from '../../models/cell-content-snapshot';
import { ComparisonOperator, parseComparisonOperator, reverseOperator } from '../../models/comparison-operator.enum';
import { Board } from '../../models/board';
import { MoveDirection } from '../../models/move-direction.enum';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html'
})
export class BoardComponent implements Board, OnInit {
  @Input() puzzleLines: string[] | undefined;
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

  lineStartsWithDotOrDigit(line: string): boolean {
    if (line.length > 0) {
      return this.isDotToken(line[0]) || this.isDigitToken(line[0]);
    }
    return false;
  }

  lineStartsWithUnderscoreOrOperator(line: string): boolean {
    if (line.length > 0) {
      return this.isUnderscoreToken(line[0]) || this.parseOperatorToken(line[0]) !== ComparisonOperator.None;
    }
    return false;
  }

  isDotToken(token: string): boolean {
    return token === '.';
  }

  isDigitToken(token: string): boolean {
    return /^\d$/.test(token);
  }

  isUnderscoreToken(token: string): boolean {
    return token === '_';
  }

  parseOperatorToken(token: string): ComparisonOperator {
    return parseComparisonOperator(token);
  }

  isEvenNumber(index: number): boolean {
    return index % 2 === 0;
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

  getCellValueAtCoordinate(coordinate: Coordinate): number | undefined {
    const cell = this.getCell(coordinate);
    return cell === undefined ? undefined : cell.value;
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
    });

    return arrayIndex > -1 ? Coordinate.fromIndex(arrayIndex, this.size) : undefined;
  }

  getOperator(coordinate: Coordinate, direction: MoveDirection): ComparisonOperator {
    // TODO: Optimize
    switch (direction) {
      case MoveDirection.Left:
        return this.getComparisonToLeftCell(coordinate);
      case MoveDirection.Right:
        return this.getComparisonToRightCell(coordinate);
      case MoveDirection.Up:
        return this.getComparisonToAboveCell(coordinate);
      case MoveDirection.Down:
        return this.getComparisonToBelowCell(coordinate);
    }
  }

  private getComparisonToLeftCell(coordinate: Coordinate): ComparisonOperator {
    if (coordinate.canMoveOne(MoveDirection.Left)) {
      const offset = this.getOffsetInLineArrayForCoordinate(coordinate);
      const operatorChar = this.puzzleLines[offset.line][offset.column - 1];
      return reverseOperator(parseComparisonOperator(operatorChar));
    }

    return ComparisonOperator.None;
  }

  private getComparisonToRightCell(coordinate: Coordinate): ComparisonOperator {
    if (coordinate.canMoveOne(MoveDirection.Right)) {
      const lineSetOffset = this.getOffsetInLineArrayForCoordinate(coordinate);
      const operatorChar = this.puzzleLines[lineSetOffset.line][lineSetOffset.column + 1];
      return parseComparisonOperator(operatorChar);
    }

    return ComparisonOperator.None;
  }

  private getComparisonToAboveCell(coordinate: Coordinate): ComparisonOperator {
    if (coordinate.canMoveOne(MoveDirection.Up)) {
      const lineSetOffset = this.getOffsetInLineArrayForCoordinate(coordinate);
      const operatorChar = this.puzzleLines[lineSetOffset.line - 1][lineSetOffset.column];
      return reverseOperator(parseComparisonOperator(operatorChar));
    }

    return ComparisonOperator.None;
  }

  private getComparisonToBelowCell(coordinate: Coordinate): ComparisonOperator {
    if (coordinate.canMoveOne(MoveDirection.Down)) {
      const lineSetOffset = this.getOffsetInLineArrayForCoordinate(coordinate);
      const operatorChar = this.puzzleLines[lineSetOffset.line + 1][lineSetOffset.column];
      return parseComparisonOperator(operatorChar);
    }

    return ComparisonOperator.None;
  }

  private getOffsetInLineArrayForCoordinate(coordinate: Coordinate): { line: number, column: number } {
    const index = coordinate.toIndex();
    const rowNumber = Math.floor(index / this.size) + 1;
    const columnNumber = index % this.size + 1;
    return {
      line: (rowNumber * 2) - 2,
      column: (columnNumber * 2) - 2
    };
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
