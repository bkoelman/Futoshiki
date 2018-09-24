import { BoardComponent } from './board/board.component';
import { Coordinate } from './coordinate';
import { ObjectFacilities } from './object-facilities';

export class PuzzleSolver {
    private _boardSizeCached: number;
    private _allCellValuesCached: number[];
    private _powerSetForAllCellValuesCached: number[][];

    constructor(private _board: BoardComponent) {
    }

    getPossibleValuesAtCoordinate(coordinate: Coordinate): number[] {
        this.ensureCache();

        const candidateValueSet = this._allCellValuesCached.slice();

        // Rules described at: http://pzl.org.uk/futoshiki.html

        this.applyOperatorRules(coordinate, candidateValueSet);
        this.applyDigitRules(coordinate, candidateValueSet);

        if (candidateValueSet.length < this._boardSizeCached) {
            console.log(`Final possible values for ${coordinate}: ${candidateValueSet}`);
        }

        return candidateValueSet;
    }

    private ensureCache(): void {
        if (this._boardSizeCached !== this._board.boardSize) {
            this._boardSizeCached = this._board.boardSize;
            this._allCellValuesCached = ObjectFacilities.createNumberSequence(this._board.boardSize);
            this._powerSetForAllCellValuesCached = ObjectFacilities.createPowerSet(this._allCellValuesCached)
        }
    }

    private applyOperatorRules(coordinate: Coordinate, candidateValueSet: number[]): void {
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
        currentCellCoordinate: Coordinate, candidateValueSet: number[], direction: string): void {
        const adjacentCell = this._board.getCellAtCoordinate(adjacentCellCoordinate);

        if (isGreaterThanOperator) {
            const adjacentMaxValue = adjacentCell.getMaxValue() || this._boardSizeCached;
            const generateCount = this._boardSizeCached - adjacentMaxValue + 1;
            const digitsToRemove = ObjectFacilities.createNumberSequence(generateCount, adjacentMaxValue);
            this.reduceCandidateValueSet(candidateValueSet, digitsToRemove, currentCellCoordinate, `Operator rule < ${direction}`);
        } else {
            const adjacentMinValue = adjacentCell.getMinValue() || 1;
            const digitsToRemove = ObjectFacilities.createNumberSequence(adjacentMinValue);
            this.reduceCandidateValueSet(candidateValueSet, digitsToRemove, currentCellCoordinate, `Operator rule > ${direction}`);
        }
    }

    private applyDigitRules(coordinate: Coordinate, candidateValueSet: number[]): void {
        const coordinatesInRow = this.getCoordinatesInRow(coordinate.row, coordinate.column);
        const coordinatesInColumn = this.getCoordinatesInColumn(coordinate.column, coordinate.row);

        this.applyDigitRulesInSequence(coordinate, coordinatesInRow, candidateValueSet, 'row');
        this.applyDigitRulesInSequence(coordinate, coordinatesInColumn, candidateValueSet, 'column');
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

    private applyDigitRulesInSequence(coordinate: Coordinate, coordinateSequence: Coordinate[], candidateValueSet: number[],
        sequenceName: string): void {
        const possibleValuesInSequence = this.getPossibleCellValuesInSequence(coordinateSequence);

        this.applyNakedSetRuleInSequence(coordinate, candidateValueSet, possibleValuesInSequence, sequenceName);
        this.applyHiddenSetRuleInSequence(coordinate, candidateValueSet, possibleValuesInSequence, sequenceName);
    }

    private getPossibleCellValuesInSequence(sequence: Coordinate[]): number[][] {
        const possibleValuesPerCell: number[][] = [];

        for (const coordinate of sequence) {
            const possibleCellValues = this.getPossibleValuesForCell(coordinate);
            possibleValuesPerCell.push(possibleCellValues);
        }

        return possibleValuesPerCell;
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

    private applyNakedSetRuleInSequence(coordinate: Coordinate, candidateValueSet: number[], possibleValuesPerCell: number[][],
        sequenceName: string): void {
        // Rule: a sequence (row or column) must contain exactly one of each of the digits. If N cells each contain only the same N digits,
        // then those digits must be the answers for the N cells, and any occurrences of those digits in other cells in the sequence
        // can be deleted.
        // N ranges from 1 to the size of the board (exclusive).
        //
        // Example:
        //      12 | 12 | 123 | 245 | 135
        //  =>  12 | 12 |   3 |  45 |  35

        for (const digitSet of this._powerSetForAllCellValuesCached) {
            if (digitSet.length > 0 && digitSet.length < this._boardSizeCached) {
                const frequency = this.getNakedSetFrequency(digitSet, possibleValuesPerCell);
                if (frequency >= digitSet.length) {
                    const digitsToRemove = candidateValueSet.filter(digit => digitSet.indexOf(digit) > -1);
                    this.reduceCandidateValueSet(candidateValueSet, digitsToRemove, coordinate,
                        `Naked Set rule with set {${digitSet}} in ${sequenceName}`);
                }
            }
        }
    }

    private getNakedSetFrequency(digitSet: number[], possibleValuesPerCell: number[][]): number {
        let setFoundCount = 0;

        for (const possibleValues of possibleValuesPerCell) {
            if (this.isNakedSet(digitSet, possibleValues)) {
                setFoundCount++;
            }
        }

        return setFoundCount;
    }

    private isNakedSet(digitSet: number[], possibleValues: number[]) {
        return JSON.stringify(digitSet) === JSON.stringify(possibleValues);
    }

    private applyHiddenSetRuleInSequence(coordinate: Coordinate, candidateValueSet: number[], possibleValuesPerCell: number[][],
        sequenceName: string): void {
        // Rule: a sequence (row or column) must contain exactly one of each of the digits. If N cells contain the only copies of N digits
        // in a sequence, then those digits must be the answers for the N cells, and any other digits in those cells can be deleted.
        // N ranges from 1 to the size of the board (exclusive).
        //
        // Example:
        //      123 | 124 | 35 | 345 | 34
        //  =>  12  | 12  | 35 | 345 | 34

        const powerSet = ObjectFacilities.createPowerSet(candidateValueSet);

        for (const digitSet of powerSet) {
            if (digitSet.length > 0 && digitSet.length < this._boardSizeCached) {
                const frequency = this.getHiddenSetFrequency(digitSet, possibleValuesPerCell);
                if (frequency === digitSet.length - 1) {
                    const digitsToRemove = candidateValueSet.filter(digit => digitSet.indexOf(digit) <= -1);
                    this.reduceCandidateValueSet(candidateValueSet, digitsToRemove, coordinate,
                        `Hidden Set rule with set {${digitSet}} in ${sequenceName}`);
                }
            }
        }
    }

    private getHiddenSetFrequency(digitSet: number[], possibleValuesPerCell: number[][]): number {
        let setFoundCount = 0;

        for (const possibleValues of possibleValuesPerCell) {
            let digitFoundCount = 0;
            for (const digit of digitSet) {
                if (possibleValues.indexOf(digit) > -1) {
                    digitFoundCount++;
                }
            }

            if (digitFoundCount === digitSet.length) {
                setFoundCount++;
            } else if (digitFoundCount > 0) {
                return 0;
            }
        }

        return setFoundCount;
    }

    private reduceCandidateValueSet(candidateValueSet: number[], digitsToRemove: number[], coordinate: Coordinate, ruleName: string): void {
        const beforeText = candidateValueSet.join(',');
        this.removeNumbersFromArray(candidateValueSet, digitsToRemove);
        const afterText = candidateValueSet.join(',');

        if (beforeText !== afterText) {
            console.log(`Applying ${ruleName} at cell ${coordinate}: ${beforeText} => ${afterText}`);
        }
    }

    private removeNumbersFromArray(targetArray: number[], numbersToRemove: number[]): void {
        for (const numberToRemove of numbersToRemove) {
            const indexToRemove = targetArray.indexOf(numberToRemove);
            if (indexToRemove > -1) {
                targetArray.splice(indexToRemove, 1);
            }
        }
    }
}
