import { Component, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { CellContentSnapshot } from '../../models/cell-content-snapshot.js';
import { Cell } from '../../models/cell.js';
import { GameCompletionState } from '../../models/game-completion-state.enum.js';
import { SetFacilities } from 'src/app/set-facilities.js';

declare var $: any;

@Component({
  selector: 'app-digit-cell',
  templateUrl: './digit-cell.component.html'
})
export class DigitCellComponent implements Cell {
  @ViewChild('flashable')
  private _flashableElementRef!: ElementRef;

  private _userValue: number | undefined;
  private _candidates = new Set<number>();

  GameCompletionStateAlias = GameCompletionState;

  @Input()
  boardSize!: number;
  @Input()
  fixedValue: number | undefined;
  @Input()
  canSelect!: boolean;
  @Input()
  playState!: GameCompletionState;
  @Input()
  showRuler!: boolean;
  @Output()
  cellClicked = new EventEmitter<DigitCellComponent>();
  @Output()
  contentChanged = new EventEmitter<{ sender: DigitCellComponent; snapshotBefore: CellContentSnapshot }>();

  isSelected = false;
  errorDigit: number | undefined = undefined;

  get value(): number | undefined {
    return this.fixedValue || this._userValue;
  }

  get isFixed(): boolean {
    return this.fixedValue !== undefined;
  }

  get isEmpty(): boolean {
    return this.value === undefined && this._candidates.size === 0;
  }

  get hasCandidates(): boolean {
    return this.value === undefined && this._candidates.size > 0;
  }

  containsCandidate(digit: number): boolean {
    return this.value === undefined && this._candidates.has(digit);
  }

  getCandidates(): ReadonlySet<number> {
    return this.value !== undefined ? SetFacilities.emptyNumberSet : new Set(this._candidates);
  }

  getMinimum(): number | undefined {
    let result = this.value;

    if (result === undefined && this._candidates.size > 0) {
      result = Math.min(...this._candidates);
    }

    return result;
  }

  getMaximum(): number | undefined {
    let result = this.value;

    if (result === undefined && this._candidates.size > 0) {
      result = Math.max(...this._candidates);
    }

    return result;
  }

  clear() {
    if (this._userValue !== undefined || this._candidates.size > 0) {
      this.raiseChangeEventFor(() => {
        this._userValue = undefined;
        this._candidates.clear();
      });
    }
  }

  setFixedValue(digit: number) {
    if (this.fixedValue !== digit) {
      this.raiseChangeEventFor(() => {
        this.fixedValue = digit;
        this._userValue = undefined;
        this._candidates.clear();
      });
    }
  }

  setUserValue(digit: number) {
    if (this._userValue !== digit) {
      this.raiseChangeEventFor(() => {
        this._userValue = digit;
        this._candidates.clear();
      });
    }
  }

  setCandidates(digits: ReadonlySet<number>) {
    const thisArray = [...this._candidates];
    const otherArray = [...digits];
    otherArray.sort();

    if (JSON.stringify(otherArray) !== JSON.stringify(thisArray)) {
      this.raiseChangeEventFor(() => {
        this._userValue = undefined;
        this._candidates = new Set(otherArray);
      });
    }
  }

  removeCandidate(digit: number) {
    if (this.containsCandidate(digit)) {
      this.raiseChangeEventFor(() => {
        this._candidates.delete(digit);
      });
    }
  }

  insertCandidate(digit: number) {
    if (!this.containsCandidate(digit)) {
      this.raiseChangeEventFor(() => {
        this._userValue = undefined;
        this._candidates = this.insertIntoSortedSet(digit, this._candidates);
      });
    }
  }

  private insertIntoSortedSet(digitToInsert: number, digits: ReadonlySet<number>): Set<number> {
    const array = [...digits];
    array.push(digitToInsert);
    array.sort();
    return new Set(array);
  }

  setError(candidateDigit: number | undefined) {
    this.errorDigit = candidateDigit || 1;
  }

  clearError() {
    this.errorDigit = undefined;
  }

  getContentSnapshot(): CellContentSnapshot {
    return new CellContentSnapshot(this._userValue, new Set(this._candidates));
  }

  restoreContentSnapshot(snapshot: CellContentSnapshot) {
    const snapshotBefore = this.getContentSnapshot();
    if (!snapshotBefore.isEqualTo(snapshot)) {
      this.raiseChangeEventFor(() => {
        this._candidates = new Set(snapshot.candidates);
        this._userValue = snapshot.userValue;
      });
    }
  }

  flash(callback: () => void) {
    $(this._flashableElementRef.nativeElement).animateCss('flash', callback);
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
