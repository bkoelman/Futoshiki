import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CellContentSnapshot } from '../../models/cell-content-snapshot.js';
import { Cell } from '../../models/cell.js';

@Component({
  selector: 'app-digit-cell',
  templateUrl: './digit-cell.component.html'
})
export class DigitCellComponent implements Cell, OnInit {
  private _userValue: number | undefined;
  private _draftValues: number[] = [];

  isSelected = false;
  @Input() boardSize!: number;
  @Input() fixedValue: number | undefined;
  @Input() canSelect!: boolean;
  @Output() cellClicked = new EventEmitter<DigitCellComponent>();
  @Output() contentChanged = new EventEmitter<{ sender: DigitCellComponent, snapshotBefore: CellContentSnapshot }>();

  get value(): number | undefined {
    return this.fixedValue !== undefined ? this.fixedValue : this._userValue;
  }

  get isFixed(): boolean {
    return this.fixedValue !== undefined;
  }

  get isDraft(): boolean {
    return !this.isFixed && this._draftValues.length > 0;
  }

  get isEmpty(): boolean {
    return !this.isDraft && this.value === undefined;
  }

  ngOnInit() {
  }

  clear() {
    if (this._userValue !== undefined || this._draftValues.length > 0) {
      this.raiseChangeEventFor(() => {
        this._userValue = undefined;
        this._draftValues = [];
      });
    }
  }

  setFixedValue(digit: number) {
    if (this.fixedValue !== digit) {
      this.raiseChangeEventFor(() => {
        this.fixedValue = digit;
        this._userValue = undefined;
        this._draftValues = [];
      });
    }
  }

  setUserValue(digit: number) {
    if (this._userValue !== digit) {
      this.raiseChangeEventFor(() => {
        this._userValue = digit;
        this._draftValues = [];
      });
    }
  }

  setDraftValues(digits: number[]) {
    digits.sort();
    if (JSON.stringify(digits) !== JSON.stringify(this._draftValues)) {
      this.raiseChangeEventFor(() => {
        this._userValue = undefined;
        this._draftValues = digits.slice();
      });
    }
  }

  toggleDraftValue(digit: number) {
    this.raiseChangeEventFor(() => {
      if (this._draftValues.indexOf(digit) >= 0) {
        this._draftValues = this._draftValues.filter(item => item !== digit);
      } else {
        this._userValue = undefined;
        this._draftValues.push(digit);
        this._draftValues.sort();
      }
    });
  }

  removeDraftValue(digit: number) {
    if (this._draftValues.indexOf(digit) >= 0) {
      this.raiseChangeEventFor(() => {
        this._draftValues = this._draftValues.filter(item => item !== digit);
      });
    }
  }

  getContentSnapshot(): CellContentSnapshot {
    return new CellContentSnapshot(this._userValue, this._draftValues.slice());
  }

  restoreContentSnapshot(snapshot: CellContentSnapshot) {
    const snapshotBefore = this.getContentSnapshot();
    if (!snapshotBefore.isEqualTo(snapshot)) {
      this.raiseChangeEventFor(() => {
        this._draftValues = snapshot.draftValues.slice();
        this._userValue = snapshot.userValue;
      });
    }
  }

  getSingleValue(): number | undefined {
    let result = this.value;

    if (result === undefined) {
      if (this._draftValues.length === 1) {
        result = this._draftValues[0];
      }
    }

    return result;
  }

  getPossibleValues(): number[] {
    if (this.value !== undefined) {
      return [this.value];
    }

    return this._draftValues.slice();
  }

  getMinimum(): number | undefined {
    let result = this.value;

    if (result === undefined && this._draftValues.length > 0) {
      result = Math.min(...this._draftValues);
    }

    return result;
  }

  getMaximum(): number | undefined {
    let result = this.value;

    if (result === undefined && this._draftValues.length > 0) {
      result = Math.max(...this._draftValues);
    }

    return result;
  }

  onBoxClicked() {
    this.cellClicked.emit(this);
  }

  private raiseChangeEventFor(changeAction: () => void) {
    const snapshotBefore = this.getContentSnapshot();
    changeAction();
    this.contentChanged.emit({
      sender: this,
      snapshotBefore: snapshotBefore
    });
  }
}
