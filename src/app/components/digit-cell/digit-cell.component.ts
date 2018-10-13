import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { CellContentSnapshot } from '../../models/cell-content-snapshot.js';
import { Cell } from '../../models/cell.js';
import { GameCompletionState } from '../../models/game-completion-state.enum.js';

declare var $: any;

@Component({
  selector: 'app-digit-cell',
  templateUrl: './digit-cell.component.html'
})
export class DigitCellComponent implements Cell, OnInit {
  @ViewChild('flashable') private _flashableElementRef!: ElementRef;
  private _userValue: number | undefined;
  private _candidates: number[] = [];

  GameCompletionState = GameCompletionState;

  isSelected = false;
  errorDigit: number | undefined = undefined;
  @Input() boardSize!: number;
  @Input() fixedValue: number | undefined;
  @Input() canSelect!: boolean;
  @Input() playState!: GameCompletionState;
  @Output() cellClicked = new EventEmitter<DigitCellComponent>();
  @Output() contentChanged = new EventEmitter<{ sender: DigitCellComponent, snapshotBefore: CellContentSnapshot }>();

  get value(): number | undefined {
    return this.fixedValue || this._userValue;
  }

  get isFixed(): boolean {
    return this.fixedValue !== undefined;
  }

  get hasCandidates(): boolean {
    return this.value === undefined && this._candidates.length > 0;
  }

  get isEmpty(): boolean {
    return this.value === undefined && this._candidates.length === 0;
  }

  ngOnInit() {
  }

  clear() {
    if (this._userValue !== undefined || this._candidates.length > 0) {
      this.raiseChangeEventFor(() => {
        this._userValue = undefined;
        this._candidates = [];
      });
    }
  }

  setFixedValue(digit: number) {
    if (this.fixedValue !== digit) {
      this.raiseChangeEventFor(() => {
        this.fixedValue = digit;
        this._userValue = undefined;
        this._candidates = [];
      });
    }
  }

  setUserValue(digit: number) {
    if (this._userValue !== digit) {
      this.raiseChangeEventFor(() => {
        this._userValue = digit;
        this._candidates = [];
      });
    }
  }

  setCandidates(digits: number[]) {
    digits.sort();
    if (JSON.stringify(digits) !== JSON.stringify(this._candidates)) {
      this.raiseChangeEventFor(() => {
        this._userValue = undefined;
        this._candidates = digits.slice();
      });
    }
  }

  containsCandidate(digit: number): boolean {
    return this._candidates.indexOf(digit) > -1;
  }

  insertCandidate(digit: number) {
    if (!this.containsCandidate(digit)) {
      this.raiseChangeEventFor(() => {
        this._userValue = undefined;
        this._candidates.push(digit);
        this._candidates.sort();
      });
    }
  }

  removeCandidate(digit: number) {
    if (this.containsCandidate(digit)) {
      this.raiseChangeEventFor(() => {
        this._candidates = this._candidates.filter(item => item !== digit);
      });
    }
  }

  setError(candidateDigit: number | undefined) {
    this.errorDigit = candidateDigit || 1;
  }

  clearError() {
    this.errorDigit = undefined;
  }

  getContentSnapshot(): CellContentSnapshot {
    return new CellContentSnapshot(this._userValue, this._candidates.slice());
  }

  restoreContentSnapshot(snapshot: CellContentSnapshot) {
    const snapshotBefore = this.getContentSnapshot();
    if (!snapshotBefore.isEqualTo(snapshot)) {
      this.raiseChangeEventFor(() => {
        this._candidates = snapshot.candidates.slice();
        this._userValue = snapshot.userValue;
      });
    }
  }

  getSingleValue(): number | undefined {
    let result = this.value;

    if (result === undefined) {
      if (this._candidates.length === 1) {
        result = this._candidates[0];
      }
    }

    return result;
  }

  getCandidates(): number[] {
    return this.value !== undefined ? [] : this._candidates.slice();
  }

  getMinimum(): number | undefined {
    let result = this.value;

    if (result === undefined && this._candidates.length > 0) {
      result = Math.min(...this._candidates);
    }

    return result;
  }

  getMaximum(): number | undefined {
    let result = this.value;

    if (result === undefined && this._candidates.length > 0) {
      result = Math.max(...this._candidates);
    }

    return result;
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
