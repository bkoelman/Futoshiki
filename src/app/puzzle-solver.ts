import { Board } from './models/board';
import { Coordinate } from './models/coordinate';
import { ObjectFacilities } from './object-facilities';
import { ComparisonOperator } from './models/comparison-operator.enum';
import { MoveDirection } from './models/move-direction.enum';

export class PuzzleSolver {
    private _allCellValuesCached: number[];
    private _powerSetForAllCellValuesCached: number[][];

    constructor(private _board: Board) {
        this._allCellValuesCached = ObjectFacilities.createNumberSequence(this._board.size);
        this._powerSetForAllCellValuesCached = ObjectFacilities.createPowerSet(this._allCellValuesCached);
}

    getPossibleValuesAtCoordinate(coordinate: Coordinate): number[] {
        const candidateValueSet = this._allCellValuesCached.slice();

        // Rules described at: http://pzl.org.uk/futoshiki.html

        this.applyOperatorRules(coordinate, candidateValueSet);
        this.applyDigitRules(coordinate, candidateValueSet);

        if (candidateValueSet.length < this._board.size) {
            console.log(`Final possible values for ${coordinate}: ${candidateValueSet}`);
        }

        return candidateValueSet;
    }

    private applyOperatorRules(coordinate: Coordinate, candidateValueSet: number[]) {
        this.outerApplySingleOperatorRule(coordinate, MoveDirection.Left, candidateValueSet);
        this.outerApplySingleOperatorRule(coordinate, MoveDirection.Right, candidateValueSet);
        this.outerApplyDoubleOperatorRule(coordinate, MoveDirection.Left, MoveDirection.Right, candidateValueSet);

        this.outerApplySingleOperatorRule(coordinate, MoveDirection.Up, candidateValueSet);
        this.outerApplySingleOperatorRule(coordinate, MoveDirection.Down, candidateValueSet);
        this.outerApplyDoubleOperatorRule(coordinate, MoveDirection.Up, MoveDirection.Down, candidateValueSet);
    }

    private outerApplySingleOperatorRule(coordinate: Coordinate, direction: MoveDirection, candidateValueSet: number[]) {
        if (coordinate.canMoveOne(direction)) {
            const operator = this._board.getOperator(coordinate, direction);
            if (operator !== ComparisonOperator.None) {
                const isLessThanAdjacentCell = operator === ComparisonOperator.LessThan;
                this.innerApplySingleOperatorRule(isLessThanAdjacentCell, coordinate.moveOne(direction),
                    coordinate, candidateValueSet, MoveDirection[direction]);
            }
        }
    }

    private innerApplySingleOperatorRule(isLessThanAdjacentCell: boolean, adjacentCellCoordinate: Coordinate,
        currentCellCoordinate: Coordinate, candidateValueSet: number[], direction: string) {
        // Rule: When a cell is greater than its adjacent cell, then it cannot contain digit 1 and
        // its minimum value must be higher than the minimum draft value in the adjacent cell.
        // Likewise, when a cell is less than its adjacent cell, then it cannot contain the highest digit on the board and
        // its maximum value must be lower than the maximum draft value in the adjacent cell.

        // Example:
        //      | | 12345 > 12345 |
        //  =>  | |  2345 > 1234  |

        const adjacentCell = this._board.getCell(adjacentCellCoordinate);

        if (adjacentCell) {
            if (isLessThanAdjacentCell) {
                const adjacentMaxValue = adjacentCell.getMaximum() || this._board.size;
                const generateCount = this._board.size - adjacentMaxValue + 1;
                const digitsToRemove = ObjectFacilities.createNumberSequence(generateCount, adjacentMaxValue);
                this.reduceCandidateValueSet(candidateValueSet, digitsToRemove, currentCellCoordinate,
                    `Single Operator rule (this < ${direction})`);
            } else {
                const adjacentMinValue = adjacentCell.getMinimum() || 1;
                const digitsToRemove = ObjectFacilities.createNumberSequence(adjacentMinValue);
                this.reduceCandidateValueSet(candidateValueSet, digitsToRemove, currentCellCoordinate,
                    `Single Operator rule (this > ${direction})`);
            }
        }
    }

    private outerApplyDoubleOperatorRule(coordinate: Coordinate, direction1: MoveDirection, direction2: MoveDirection,
        candidateValueSet: number[]) {
        if (coordinate.canMoveOne(direction1) && coordinate.canMoveOne(direction2)) {
            const operator1 = this._board.getOperator(coordinate, direction1);
            const operator2 = this._board.getOperator(coordinate, direction2);

            if (operator1 !== ComparisonOperator.None && operator1 === operator2) {
                const isLessThanAdjacentCells = operator1 === ComparisonOperator.LessThan;
                this.innerApplyDoubleOperatorRule(isLessThanAdjacentCells, coordinate.moveOne(direction1), coordinate.moveOne(direction2),
                    coordinate, candidateValueSet, MoveDirection[direction1], MoveDirection[direction2]);
            }
        }
    }

    private innerApplyDoubleOperatorRule(isLessThanAdjacentCells: boolean, adjacentCellCoordinate1: Coordinate,
        adjacentCellCoordinate2: Coordinate, currentCellCoordinate: Coordinate, candidateValueSet: number[],
        direction1: string, direction2: string) {
        // Rule: When a cell is greater than both of its adjacent cells in the same sequence (row or column)
        // and the adjacent cells have the same minimum value, then the cell value must be higher than their
        // minimum draft value plus one (because the adjacent cells cannot both contain that minimum value).
        // Likewise, when a cell is less than both of its adjacent cells in the same sequence,
        // and the adjacent cells have the same maximum value, then the cell value must be lower than their
        // maximum draft value minus one (because the adjacent cells cannot both contain that maximum value).

        // Example:
        //      | 2345 > 12345 < 2345 |
        //  =>  | 2345 > 123   < 2345 |

        const adjacentCell1 = this._board.getCell(adjacentCellCoordinate1);
        const adjacentCell2 = this._board.getCell(adjacentCellCoordinate2);

        if (adjacentCell1 && adjacentCell2) {
            if (isLessThanAdjacentCells) {
                const adjacentMaxValue1 = adjacentCell1.getMaximum() || this._board.size;
                const adjacentMaxValue2 = adjacentCell2.getMaximum() || this._board.size;

                if (adjacentMaxValue1 === adjacentMaxValue2) {
                    const adjacentMaxValue = adjacentMaxValue1 - 1;
                    const generateCount = this._board.size - adjacentMaxValue + 1;
                    const digitsToRemove = ObjectFacilities.createNumberSequence(generateCount, adjacentMaxValue);
                    this.reduceCandidateValueSet(candidateValueSet, digitsToRemove, currentCellCoordinate,
                        `Double Operator rule (${direction1} > this < ${direction2})`);
                }
            } else {
                const adjacentMinValue1 = adjacentCell1.getMinimum() || 1;
                const adjacentMinValue2 = adjacentCell2.getMinimum() || 1;

                if (adjacentMinValue1 === adjacentMinValue2) {
                    const adjacentMinValue = adjacentMinValue1 + 1;
                    const digitsToRemove = ObjectFacilities.createNumberSequence(adjacentMinValue);
                    this.reduceCandidateValueSet(candidateValueSet, digitsToRemove, currentCellCoordinate,
                        `Double Operator rule (${direction1} < this > ${direction2})`);
                }
            }
        }
    }

    private applyDigitRules(coordinate: Coordinate, candidateValueSet: number[]) {
        const coordinatesInRow = coordinate.iterateRow(true);
        const coordinatesInColumn = coordinate.iterateColumn(true);

        this.applyDigitRulesInSequence(coordinate, coordinatesInRow, candidateValueSet, 'row');
        this.applyDigitRulesInSequence(coordinate, coordinatesInColumn, candidateValueSet, 'column');
    }

    private applyDigitRulesInSequence(coordinate: Coordinate, coordinateSequence: Coordinate[], candidateValueSet: number[],
        sequenceName: string) {
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
        const cell = this._board.getCell(coordinate);
        if (cell) {
            const possibleValues = cell.getPossibleValues();
            if (possibleValues.length > 0) {
                return possibleValues;
            }
        }

        return this._allCellValuesCached;
    }

    private applyNakedSetRuleInSequence(coordinate: Coordinate, candidateValueSet: number[], possibleValuesPerCell: number[][],
        sequenceName: string) {
        // Rule: a sequence (row or column) must contain exactly one of each of the digits. If N cells each contain only the same N digits,
        // then those digits must be the answers for the N cells, and any occurrences of those digits in other cells in the sequence
        // can be deleted.
        // N ranges from 1 to the size of the board (exclusive).
        //
        // Example:
        //      12 | 12 | 123 | 245 | 135
        //  =>  12 | 12 |   3 |  45 |  35

        for (const digitSet of this._powerSetForAllCellValuesCached) {
            if (digitSet.length > 0 && digitSet.length < this._board.size) {
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
        sequenceName: string) {
        // Rule: a sequence (row or column) must contain exactly one of each of the digits. If N cells contain the only copies of N digits
        // in a sequence, then those digits must be the answers for the N cells, and any other digits in those cells can be deleted.
        // N ranges from 1 to the size of the board (exclusive).
        //
        // Example:
        //      123 | 124 | 35 | 345 | 34
        //  =>  12  | 12  | 35 | 345 | 34

        const powerSet = ObjectFacilities.createPowerSet(candidateValueSet);

        for (const digitSet of powerSet) {
            if (digitSet.length > 0 && digitSet.length < this._board.size) {
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
