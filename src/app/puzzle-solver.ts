import { NumberSequenceService } from './number-sequence.service';
import { BoardComponent } from './board/board.component';
import { Coordinate } from './coordinate';

export class PuzzleSolver {
    private _numberSequenceService: NumberSequenceService = new NumberSequenceService();

    private _boardSizeCached: number;
    private _allCellValuesCached: number[];

    constructor(private _board: BoardComponent) {
    }

    getPossibleValuesAtCoordinate(coordinate: Coordinate): number[] {
        this.ensureCache();

        const candidateValueSet = this._allCellValuesCached.slice();

        this.applyOperatorRules(coordinate, candidateValueSet);
        this.applyDigitRules(coordinate, candidateValueSet);

        if (candidateValueSet.length < this._boardSizeCached) {
            console.log(`Final possible values for ${coordinate}: ${candidateValueSet}`);
        }

        return candidateValueSet;
    }

    private ensureCache() {
        if (this._boardSizeCached !== this._board.boardSize) {
            this._boardSizeCached = this._board.boardSize;
            this._allCellValuesCached = this._numberSequenceService.createNumberSequence(this._board.boardSize);
        }
    }

    private applyOperatorRules(coordinate: Coordinate, candidateValueSet: number[]) {
        // Rule: When a cell is greater than another cell, it cannot contain digit 1 and
        // its minimum value must be higher than the minimum draft value in the other cell.
        // Likewise, when a cell is less than another cell, it cannot contain the highest digit on the board and
        // its maximum value must be lower than the maximum draft value in the other cell.

        const isGreaterThanOperatorLeftToCell = this.getIsGreaterThanOperatorLeftToCell(coordinate);
        if (isGreaterThanOperatorLeftToCell !== undefined) {
            const otherCoordinate = coordinate.moveLeft();
            this.applyOperatorRule(isGreaterThanOperatorLeftToCell, otherCoordinate, coordinate, candidateValueSet, 'left');
        }

        const isGreaterThanOperatorRightToCell = this.getIsGreaterThanOperatorRightToCell(coordinate);
        if (isGreaterThanOperatorRightToCell !== undefined) {
            const otherCoordinate = coordinate.moveRight();
            this.applyOperatorRule(!isGreaterThanOperatorRightToCell, otherCoordinate, coordinate, candidateValueSet, 'right');
        }

        const isGreaterThanOperatorAboveCell = this.getIsGreaterThanOperatorAboveCell(coordinate);
        if (isGreaterThanOperatorAboveCell !== undefined) {
            const otherCoordinate = coordinate.moveUp();
            this.applyOperatorRule(isGreaterThanOperatorAboveCell, otherCoordinate, coordinate, candidateValueSet, 'above');
        }

        const isGreaterThanOperatorBelowCell = this.getIsGreaterThanOperatorBelowCell(coordinate);
        if (isGreaterThanOperatorBelowCell !== undefined) {
            const otherCoordinate = coordinate.moveDown();
            this.applyOperatorRule(!isGreaterThanOperatorBelowCell, otherCoordinate, coordinate, candidateValueSet, 'below');
        }
    }

    private getIsGreaterThanOperatorLeftToCell(coordinate: Coordinate): boolean | undefined {
        if (coordinate.column > 1) {
            const lineSetOffset = this.getOffsetInLineArrayForCoordinate(coordinate);
            const leftOperator = this._board.puzzleLines[lineSetOffset.line][lineSetOffset.column - 1];
            if (leftOperator !== '_') {
                return leftOperator === ')';
            }
        }

        return undefined;
    }

    private getIsGreaterThanOperatorRightToCell(coordinate: Coordinate): boolean | undefined {
        if (coordinate.column < this._boardSizeCached) {
            const lineSetOffset = this.getOffsetInLineArrayForCoordinate(coordinate);
            const rightOperator = this._board.puzzleLines[lineSetOffset.line][lineSetOffset.column + 1];
            if (rightOperator !== '_') {
                return rightOperator === ')';
            }
        }

        return undefined;
    }

    private getIsGreaterThanOperatorAboveCell(coordinate: Coordinate): boolean | undefined {
        if (coordinate.row > 1) {
            const lineSetOffset = this.getOffsetInLineArrayForCoordinate(coordinate);
            const aboveOperator = this._board.puzzleLines[lineSetOffset.line - 1][lineSetOffset.column];
            if (aboveOperator !== '_') {
                return aboveOperator === 'v';
            }
        }

        return undefined;
    }

    private getIsGreaterThanOperatorBelowCell(coordinate: Coordinate): boolean | undefined {
        if (coordinate.row < this._boardSizeCached) {
            const lineSetOffset = this.getOffsetInLineArrayForCoordinate(coordinate);
            const belowOperator = this._board.puzzleLines[lineSetOffset.line + 1][lineSetOffset.column];
            if (belowOperator !== '_') {
                return belowOperator === 'v';
            }
        }

        return undefined;
    }

    private getOffsetInLineArrayForCoordinate(coordinate: Coordinate): { line: number, column: number } {
        return {
            line: (coordinate.row * 2) - 2,
            column: (coordinate.column * 2) - 2
        };
    }

    private applyOperatorRule(isGreaterThanOperator: boolean, otherCellCoordinate: Coordinate,
        currentCellCoordinate: Coordinate, candidateValueSet: number[], direction: string) {
        const otherCell = this._board.getCellAtCoordinate(otherCellCoordinate);

        if (isGreaterThanOperator) {
            const otherMaxValue = otherCell.getMaxValue() || this._boardSizeCached;
            const generateCount = this._boardSizeCached - otherMaxValue + 1;
            const digitsToRemove = this._numberSequenceService.createNumberSequence(generateCount, otherMaxValue);
            this.reduceCandidateValueSet(candidateValueSet, digitsToRemove, currentCellCoordinate, `Operator rule < ${direction}`);
        } else {
            const otherMinValue = otherCell.getMinValue() || 1;
            const digitsToRemove = this._numberSequenceService.createNumberSequence(otherMinValue);
            this.reduceCandidateValueSet(candidateValueSet, digitsToRemove, currentCellCoordinate, `Operator rule > ${direction}`);
        }
    }

    private applyDigitRules(coordinate: Coordinate, candidateValueSet: number[]) {
        const possibleValuesPerCellAtRow = this.getPossibleValuesPerCellAtRow(coordinate.row, coordinate.column);
        const possibleValuesPerCellAtColumn = this.getPossibleValuesPerCellAtColumn(coordinate.column, coordinate.row);

        this.applySetRuleInSequence(coordinate, candidateValueSet, possibleValuesPerCellAtRow, 'Set rule (row)');
        this.applySetRuleInSequence(coordinate, candidateValueSet, possibleValuesPerCellAtColumn, 'Set rule (column)');

        const possibleValuesInCurrentCell = this.getPossibleValuesForCell(coordinate.row, coordinate.column);

        this.applyUniqueRuleInSequence(coordinate, candidateValueSet, possibleValuesPerCellAtRow,
            possibleValuesInCurrentCell, 'Unique rule (row)');
        this.applyUniqueRuleInSequence(coordinate, candidateValueSet, possibleValuesPerCellAtColumn,
            possibleValuesInCurrentCell, 'Unique rule (column)');
    }

    private getPossibleValuesPerCellAtRow(row: number, columnToSkip: number): Array<number[]> {
        const possibleValuesPerCell: Array<number[]> = [];

        for (let column = 1; column <= this._boardSizeCached; column++) {
            if (column !== columnToSkip) {
                const cellValues = this.getPossibleValuesForCell(row, column);
                possibleValuesPerCell.push(cellValues);
            }
        }

        return possibleValuesPerCell;
    }

    private getPossibleValuesPerCellAtColumn(column: number, rowToSkip: number): Array<number[]> {
        const possibleValuesPerCell: Array<number[]> = [];

        for (let row = 1; row <= this._boardSizeCached; row++) {
            if (row !== rowToSkip) {
                const cellValues = this.getPossibleValuesForCell(row, column);
                possibleValuesPerCell.push(cellValues);
            }
        }

        return possibleValuesPerCell;
    }

    private getPossibleValuesForCell(row: number, column: number): number[] {
        const coordinate = new Coordinate(row, column);
        const cell = this._board.getCellAtCoordinate(coordinate);
        if (cell) {
            const possibleValues = cell.getPossibleValues();
            if (possibleValues.length > 0) {
                return possibleValues;
            }
        }

        return this._allCellValuesCached;
    }


    private applySetRuleInSequence(coordinate: Coordinate, candidateValueSet: number[], possibleValuesPerCell: Array<number[]>,
        ruleName: string) {
        // Rule: When a sequence (row or column) contains N cells with the exact same N draft digits,
        // then the other cells in that same sequence cannot contain those digits.
        // N ranges from 1 to the size of the board (exclusive).

        for (const setSize of this._numberSequenceService.createNumberSequence(this._boardSizeCached - 1, 1)) {
            const digitSetFrequencyMap = this.createDigitSetFrequencyMap(setSize, possibleValuesPerCell);

            for (const digitSet in digitSetFrequencyMap) {
                if (Object.prototype.hasOwnProperty.call(digitSetFrequencyMap, digitSet)) {
                    const frequency = digitSetFrequencyMap[digitSet];
                    if (frequency >= setSize) {
                        const digitsToRemove: number[] = digitSet.split(',').map(text => parseInt(text, 10));
                        this.reduceCandidateValueSet(candidateValueSet, digitsToRemove, coordinate, `${ruleName}@${setSize}`);
                    }
                }
            }
        }
    }

    private createDigitSetFrequencyMap(setSize: number, possibleValuesPerCell: Array<number[]>): object {
        const digitSetFrequencyMap: object = {};

        for (const possibleValues of possibleValuesPerCell) {
            if (possibleValues.length === setSize) {
                const digitSet = possibleValues.join(',');
                this.incrementDigitSetFrequency(digitSet, digitSetFrequencyMap);
            }
        }

        return digitSetFrequencyMap;
    }

    private incrementDigitSetFrequency(digitSet: string, digitSetFrequencyMap: object) {
        if (!digitSetFrequencyMap[digitSet]) {
            digitSetFrequencyMap[digitSet] = 0;
        }

        digitSetFrequencyMap[digitSet]++;
    }

    private applyUniqueRuleInSequence(coordinate: Coordinate, candidateValueSet: number[], possibleValuesPerCell: Array<number[]>,
        possibleValuesInCurrentCell: number[], ruleName: string) {
        // Rule: When a certain digit occurs in the draft set of only one cell in a sequence (row or column),
        // then that digit must be the final value of that cell.

        const exclusiveDigits: number[] = [];

        const digitFrequencyMap = this.createDigitFrequencyMap(possibleValuesPerCell);
        for (const digit of possibleValuesInCurrentCell) {
            const frequency = digitFrequencyMap[digit];
            if (frequency === undefined) {
                exclusiveDigits.push(digit);
            }
        }

        if (exclusiveDigits.length > 0) {
            if (exclusiveDigits.length === 1) {
                this.selectCandidateValue(candidateValueSet, exclusiveDigits[0], coordinate, `${ruleName}`);
            } else {
                console.log(`WARN: Found multiple exclusive digits for cell at ${coordinate}: ${exclusiveDigits}`);
            }
        }
    }

    private createDigitFrequencyMap(possibleValuesPerCell: Array<number[]>): object {
        const digitFrequencyMap: object = {};

        for (const digit of this._allCellValuesCached) {
            for (const possibleValues of possibleValuesPerCell) {
                if (possibleValues.indexOf(digit) > -1) {
                    this.incrementDigitFrequency(digit, digitFrequencyMap);
                }
            }
        }

        return digitFrequencyMap;
    }

    private incrementDigitFrequency(digit: number, digitFrequencyMap: object) {
        if (!digitFrequencyMap[digit]) {
            digitFrequencyMap[digit] = 0;
        }

        digitFrequencyMap[digit]++;
    }

    private selectCandidateValue(candidateValueSet: number[], digitToSelect: number, coordinate: Coordinate, ruleName: string) {
        const beforeText = candidateValueSet.join(',');
        candidateValueSet.length = 0;
        candidateValueSet.push(digitToSelect);
        const afterText = candidateValueSet.join(',');

        if (beforeText !== afterText) {
            console.log(`Applying ${ruleName} at cell ${coordinate}: ${beforeText} => ${afterText}`);
        }
    }

    private reduceCandidateValueSet(candidateValueSet: number[], digitsToRemove: number[], coordinate: Coordinate, ruleName: string) {
        const beforeText = candidateValueSet.join(',');
        this.removeNumbersFromArray(candidateValueSet, digitsToRemove);
        const afterText = candidateValueSet.join(',');

        if (beforeText !== afterText) {
            console.log(`Applying ${ruleName} at cell ${coordinate}: ${beforeText} => ${afterText}`);
        }
    }

    private removeNumbersFromArray(targetArray: number[], numbersToRemove: number[]) {
        for (const numberToRemove of numbersToRemove) {
            const indexToRemove = targetArray.indexOf(numberToRemove);
            if (indexToRemove > -1) {
                targetArray.splice(indexToRemove, 1);
            }
        }
    }
}
