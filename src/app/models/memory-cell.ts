import { Cell } from './cell';
import { MemoryBoard } from './memory-board';

export class MemoryCell implements Cell {
    private _fixedValue: number | undefined;
    private _userValue: number | undefined;
    private _candidates: number[] = [];

    constructor(private _owner: MemoryBoard) {
    }

    get value(): number | undefined {
        return this._fixedValue || this._userValue;
    }

    get isFixed(): boolean {
        return this._fixedValue !== undefined;
    }

    get isEmpty(): boolean {
        return this.value === undefined && this._candidates.length === 0;
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

    setFixedValue(digit: number) {
        if (this.isOutOfRange(digit)) {
            throw new Error(`Invalid cell value '${digit}'.`);
        }

        if (digit !== undefined) {
            this._userValue = undefined;
            this._candidates = [];
        }

        this._fixedValue = digit;
    }

    setUserValue(digit: number) {
        if (this.isOutOfRange(digit)) {
            throw new Error(`Invalid cell value '${digit}'.`);
        }

        if (!this.isFixed) {
            this._userValue = digit;
            this._candidates = [];
        }
    }

    setCandidates(digits: number[]) {
        const firstOutOfRange = digits.find(digit => this.isOutOfRange(digit));
        if (firstOutOfRange !== undefined) {
            throw new Error(`Invalid candidate '${firstOutOfRange}'.`);
        }

        if (!this.isFixed) {
            this._userValue = undefined;
            this._candidates = digits.slice().sort();
        }
    }

    removeCandidate(digit: number) {
        if (this.isOutOfRange(digit)) {
            throw new Error(`Invalid candidate '${digit}'.`);
        }

        if (this._candidates.indexOf(digit) > -1) {
            this._candidates = this._candidates.filter(item => item !== digit);
        }
    }

    private isOutOfRange(digit: number) {
        return isNaN(digit) || Math.floor(digit) !== digit || digit < 1 || digit > this._owner.size;
    }
}
