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
        // Rule: When a cell is greater than its adjacent cell, it cannot contain digit 1 and
        // its minimum value must be higher than the minimum draft value in the adjacent cell.
        // Likewise, when a cell is less than its adjacent cell, it cannot contain the highest digit on the board and
        // its maximum value must be lower than the maximum draft value in the adjacent cell.

        const isGreaterThanOperatorLeftToCell = this.getIsGreaterThanOperatorLeftToCell(coordinate);
        if (isGreaterThanOperatorLeftToCell !== undefined) {
            const adjacentCoordinate = coordinate.moveLeft();
            this.applyOperatorRule(isGreaterThanOperatorLeftToCell, adjacentCoordinate, coordinate, candidateValueSet, 'left');
        }

        const isGreaterThanOperatorRightToCell = this.getIsGreaterThanOperatorRightToCell(coordinate);
        if (isGreaterThanOperatorRightToCell !== undefined) {
            const adjacentCoordinate = coordinate.moveRight();
            this.applyOperatorRule(!isGreaterThanOperatorRightToCell, adjacentCoordinate, coordinate, candidateValueSet, 'right');
        }

        const isGreaterThanOperatorAboveCell = this.getIsGreaterThanOperatorAboveCell(coordinate);
        if (isGreaterThanOperatorAboveCell !== undefined) {
            const adjacentCoordinate = coordinate.moveUp();
            this.applyOperatorRule(isGreaterThanOperatorAboveCell, adjacentCoordinate, coordinate, candidateValueSet, 'above');
        }

        const isGreaterThanOperatorBelowCell = this.getIsGreaterThanOperatorBelowCell(coordinate);
        if (isGreaterThanOperatorBelowCell !== undefined) {
            const adjacentCoordinate = coordinate.moveDown();
            this.applyOperatorRule(!isGreaterThanOperatorBelowCell, adjacentCoordinate, coordinate, candidateValueSet, 'below');
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

    private applyOperatorRule(isGreaterThanOperator: boolean, adjacentCellCoordinate: Coordinate,
        currentCellCoordinate: Coordinate, candidateValueSet: number[], direction: string) {
        const adjacentCell = this._board.getCellAtCoordinate(adjacentCellCoordinate);

        if (isGreaterThanOperator) {
            const adjacentMaxValue = adjacentCell.getMaxValue() || this._boardSizeCached;
            const generateCount = this._boardSizeCached - adjacentMaxValue + 1;
            const digitsToRemove = this._numberSequenceService.createNumberSequence(generateCount, adjacentMaxValue);
            this.reduceCandidateValueSet(candidateValueSet, digitsToRemove, currentCellCoordinate, `Operator rule < ${direction}`);
        } else {
            const adjacentMinValue = adjacentCell.getMinValue() || 1;
            const digitsToRemove = this._numberSequenceService.createNumberSequence(adjacentMinValue);
            this.reduceCandidateValueSet(candidateValueSet, digitsToRemove, currentCellCoordinate, `Operator rule > ${direction}`);
        }
    }

    private applyDigitRules(coordinate: Coordinate, candidateValueSet: number[]) {
        const possibleValuesInCurrentCell = this.getPossibleValuesForCell(coordinate);

        const coordinatesInRow = this.getCoordinatesInRow(coordinate.row, coordinate.column);
        const coordinatesInColumn = this.getCoordinatesInColumn(coordinate.column, coordinate.row);

        this.applyDigitRulesInSequence(coordinate, coordinatesInRow, possibleValuesInCurrentCell, candidateValueSet, 'row');
        this.applyDigitRulesInSequence(coordinate, coordinatesInColumn, possibleValuesInCurrentCell, candidateValueSet, 'column');
    }

    private getPossibleValuesForCell(coordinate: Coordinate): number[] {
        const cell = this._board.getCellAtCoordinate(coordinate);
        if (cell) {
            const possibleValues = cell.getPossibleValues();
            if (possibleValues.length > 0) {
                return possibleValues;
            }
        }

        return this._allCellValuesCached;
    }

    private getCoordinatesInRow(row: number, columnToSkip: number): Coordinate[] {
        const coordinates: Coordinate[] = [];

        for (let column = 1; column <= this._boardSizeCached; column++) {
            if (column !== columnToSkip) {
                coordinates.push(new Coordinate(row, column));
            }
        }

        return coordinates;
    }

    private getCoordinatesInColumn(column: number, rowToSkip: number): Coordinate[] {
        const coordinates: Coordinate[] = [];

        for (let row = 1; row <= this._boardSizeCached; row++) {
            if (row !== rowToSkip) {
                coordinates.push(new Coordinate(row, column));
            }
        }

        return coordinates;
    }

    private applyDigitRulesInSequence(coordinate: Coordinate, coordinateSequence: Coordinate[],
        possibleValuesInCurrentCell: number[], candidateValueSet: number[], sequenceName: string) {
        const possibleValuesInSequence = this.getPossibleCellValuesInSequence(coordinateSequence);

        this.applySetRuleInSequence(coordinate, candidateValueSet, possibleValuesInSequence, sequenceName);
        this.applyUniqueRuleInSequence(coordinate, candidateValueSet, possibleValuesInCurrentCell, possibleValuesInSequence, sequenceName);
    }

    private getPossibleCellValuesInSequence(sequence: Coordinate[]): Array<number[]> {
        const possibleValuesPerCell: Array<number[]> = [];

        for (const coordinate of sequence) {
            const possibleCellValues = this.getPossibleValuesForCell(coordinate);
            possibleValuesPerCell.push(possibleCellValues);
        }

        return possibleValuesPerCell;
    }

    private applySetRuleInSequence(coordinate: Coordinate, candidateValueSet: number[], possibleValuesPerCell: Array<number[]>,
        sequenceName: string) {
        // Rule: When a sequence (row or column) contains N cells with the exact same N draft digits,
        // then the other cells in that same sequence cannot contain those digits.
        // N ranges from 1 to the size of the board (exclusive).
        //
        // Example:
        //      12 | 12 | 123 | 245 | 135
        //  =>  12 | 12 |   3 |  45 |  35

        for (const setSize of this._numberSequenceService.createNumberSequence(this._boardSizeCached - 1, 1)) {
            const digitSetFrequencyMap = this.createDigitSetFrequencyMap(setSize, possibleValuesPerCell);

            for (const digitSet in digitSetFrequencyMap) {
                if (Object.prototype.hasOwnProperty.call(digitSetFrequencyMap, digitSet)) {
                    const frequency = digitSetFrequencyMap[digitSet];
                    if (frequency >= setSize) {
                        const digitsToRemove: number[] = digitSet.split(',').map(text => parseInt(text, 10));
                        this.reduceCandidateValueSet(candidateValueSet, digitsToRemove, coordinate,
                            `Set rule (${sequenceName} at size ${setSize})`);
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

    private applyUniqueRuleInSequence(coordinate: Coordinate, candidateValueSet: number[], possibleValuesInCurrentCell: number[],
        possibleValuesPerCell: Array<number[]>, sequenceName: string) {
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
                this.selectCandidateValue(candidateValueSet, exclusiveDigits[0], coordinate, `Unique rule (${sequenceName})`);
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
