import { Cell } from './cell';

export class MemoryCell implements Cell {
    private _userValue: number;
    private _draftValues: number[] = [];

    get value(): number | undefined {
        return this._userValue;
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

    setUserValue(digit: number) {
        this._userValue = digit;
        this._draftValues = [];
    }

    setDraftValues(digits: number[]) {
        this._userValue = undefined;
        this._draftValues = digits.slice().sort();
    }

    removeDraftValue(digit: number) {
        if (this._draftValues.indexOf(digit) >= 0) {
            this._draftValues = this._draftValues.filter(item => item !== digit);
        }
    }
}
