import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { CellComponent } from '../cell/cell.component';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html'
})
export class BoardComponent implements OnInit {
  @ViewChildren(CellComponent) private _cells: QueryList<CellComponent>

  private _canSelect: boolean = true;

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

  reset() {
    this._cells.forEach(cell => cell.clear());
    this.clearSelection();
    this.canSelect = true;
  }

  clearSelection() {
    this._cells.forEach(cell => cell.isSelected = false);
  }

  getSelectedCell(): CellComponent | undefined {
    return this._cells.find(cell => cell.isSelected);
  }

  hasEmptyCells() {
    var emptyCell = this._cells.find(cell => cell.isEmpty());
    return emptyCell !== undefined;
  }

  getCellValueAt(offset: number): number | undefined {
    let cell = this._cells.find((item, index) => index === offset);
    return cell === undefined ? undefined : cell.value;
  }

  onCellClicked(sender: CellComponent) {
    this.clearSelection();

    if (this.canSelect && !sender.isFixed()) {
      sender.isSelected = true;
    }
  }
}
