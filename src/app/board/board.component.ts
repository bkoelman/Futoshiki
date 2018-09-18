import { Component, OnInit, ViewChildren, QueryList, Input, Output, EventEmitter } from '@angular/core';
import { DigitCellComponent } from '../digit-cell/digit-cell.component';
import { Coordinate } from '../coordinate';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html'
})
export class BoardComponent implements OnInit {
  @Input() puzzleLines: string[];
  @Input() boardSize: number;
  @Output() contentChanged = new EventEmitter();

  @ViewChildren(DigitCellComponent) private _cells: QueryList<DigitCellComponent>;
  private _canSelect = true;
  private _isUpdatingBoard = false;
  private _hasPendingChangeEvent = false;

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
      return this.isUnderscoreToken(line[0]) || this.isOperatorToken(line[0]);
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

  isOperatorToken(token: string): boolean {
    return token === 'v' || token === '^' || token === '(' || token === ')';
  }

  isGreaterThanToken(token: string): boolean {
    return token === ')' || token === 'v';
  }

  isEvenNumber(index: number): boolean {
    return index % 2 === 0;
  }

  reset() {
    this.collectBulkChanges(() => {
      this._cells.forEach(cell => cell.clear());
      this.clearSelection();
      this.canSelect = true;
    });
  }

  collectBulkChanges(action: () => void) {
    const isNested = this._isUpdatingBoard;

    if (!isNested) {
      this._hasPendingChangeEvent = false;
      this._isUpdatingBoard = true;
    }

    action();

    if (!isNested) {
      this._isUpdatingBoard = false;

      if (this._hasPendingChangeEvent) {
        this.onCellContentChanged();
      }
    }
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
    const cell = this.getCellAtCoordinate(coordinate);
    return cell === undefined ? undefined : cell.value;
  }

  getCellAtCoordinate(coordinate: Coordinate): DigitCellComponent | undefined {
    const arrayIndex = coordinate.toIndex(this.boardSize);
    return this._cells.find((item, index) => index === arrayIndex);
  }

  getCoordinateForCell(cell: DigitCellComponent): Coordinate | undefined {
    let arrayIndex = -1;

    this._cells.some((item, index) => {
      if (item === cell) {
        arrayIndex = index;
        return true;
      }
    });

    return arrayIndex > -1 ? Coordinate.fromIndex(arrayIndex, this.boardSize) : undefined;
  }

  onCellClicked(sender: DigitCellComponent) {
    this.clearSelection();

    if (this.canSelect && !sender.isFixed) {
      sender.isSelected = true;
    }
  }

  onCellContentChanged() {
    if (this._isUpdatingBoard) {
      this._hasPendingChangeEvent = true;
    } else {
      this._hasPendingChangeEvent = false;
      this.contentChanged.emit(undefined);
    }
  }
}
