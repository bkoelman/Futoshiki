import { Cell } from './cell';
import { MemoryBoard } from './memory-board';

export class MemoryCell implements Cell {
    private _fixedValue: number | undefined;
    private _userValue: number | undefined;
    private _draftValues: number[] = [];

    constructor(private _owner: MemoryBoard) {
    }

    get value(): number | undefined {
        return this.isFixed ? this._fixedValue : this._userValue;
    }

    get isFixed(): boolean {
        return this._fixedValue !== undefined;
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

    setFixedValue(digit: number) {
        if (this.isOutOfRange(digit)) {
            throw new Error(`Invalid cell value '${digit}'.`);
        }

        if (digit !== undefined) {
            this._userValue = undefined;
            this._draftValues = [];
        }

        this._fixedValue = digit;
    }

    setUserValue(digit: number) {
        if (this.isOutOfRange(digit)) {
            throw new Error(`Invalid cell value '${digit}'.`);
        }

        if (!this.isFixed) {
            this._userValue = digit;
            this._draftValues = [];
        }
    }

    setDraftValues(digits: number[]) {
        const firstOutOfRange = digits.find(digit => this.isOutOfRange(digit));
        if (firstOutOfRange !== undefined) {
            throw new Error(`Invalid draft value '${firstOutOfRange}'.`);
        }

        if (!this.isFixed) {
            this._userValue = undefined;
            this._draftValues = digits.slice().sort();
        }
    }

    removeDraftValue(digit: number) {
        if (this.isOutOfRange(digit)) {
            throw new Error(`Invalid draft value '${digit}'.`);
        }

        if (this._draftValues.indexOf(digit) >= 0) {
            this._draftValues = this._draftValues.filter(item => item !== digit);
        }
    }

    private isOutOfRange(digit: number) {
        return isNaN(digit) || Math.floor(digit) !== digit || digit < 1 || digit > this._owner.size;
    }
}