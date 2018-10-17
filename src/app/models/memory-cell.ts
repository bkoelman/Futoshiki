import { Cell } from './cell';
import { MemoryBoard } from './memory-board';
import { SetFacilities } from '../set-facilities';

export class MemoryCell implements Cell {
  private _fixedValue: number | undefined;
  private _userValue: number | undefined;
  private _candidates = new Set<number>();

  constructor(private _owner: MemoryBoard) {}

  get value(): number | undefined {
    return this._fixedValue || this._userValue;
  }

  get isFixed(): boolean {
    return this._fixedValue !== undefined;
  }

  get isEmpty(): boolean {
    return this.value === undefined && this._candidates.size === 0;
  }

  containsCandidate(digit: number): boolean {
    if (this.isOutOfRange(digit)) {
      throw new Error(`Invalid candidate value '${digit}'.`);
    }

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

  setFixedValue(digit: number) {
    if (digit !== undefined) {
      if (this.isOutOfRange(digit)) {
        throw new Error(`Invalid cell value '${digit}'.`);
      }

      this._userValue = undefined;
      this._candidates.clear();
    }

    this._fixedValue = digit;
  }

  setUserValue(digit: number) {
    if (this.isOutOfRange(digit)) {
      throw new Error(`Invalid cell value '${digit}'.`);
    }

    if (!this.isFixed) {
      this._userValue = digit;
      this._candidates.clear();
    }
  }

  setCandidates(digits: ReadonlySet<number>) {
    digits.forEach(digit => {
      if (this.isOutOfRange(digit)) {
        throw new Error(`Invalid candidate value '${digit}'.`);
      }
    });

    if (!this.isFixed) {
      this._userValue = undefined;
      this._candidates = SetFacilities.sortSet(digits);
    }
  }

  removeCandidate(digit: number) {
    if (this.isOutOfRange(digit)) {
      throw new Error(`Invalid candidate value '${digit}'.`);
    }

    this._candidates.delete(digit);
  }

  private isOutOfRange(digit: number) {
    return isNaN(digit) || Math.floor(digit) !== digit || digit < 1 || digit > this._owner.size;
  }
}
