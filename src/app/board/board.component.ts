import { Component, OnInit, ViewChildren, QueryList, Input } from '@angular/core';
import { DigitCellComponent } from '../digit-cell/digit-cell.component';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html'
})
export class BoardComponent implements OnInit {
  @Input() puzzleLines: string[];
  @Input() boardSize: number;
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

  hasEmptyCells() {
    return this._cells.some(cell => cell.isEmpty);
  }

  getCellValueAt(offset: number): number | undefined {
    const cell = this._cells.find((item, index) => index === offset);
    return cell === undefined ? undefined : cell.value;
  }

  onCellClicked(sender: DigitCellComponent) {
    this.clearSelection();

    if (this.canSelect && !sender.isFixed) {
      sender.isSelected = true;
    }
  }
}
