import { SolverStrategy } from './solver-strategy';
import { Board } from '../models/board';
import { Coordinate } from '../models/coordinate';
import { ObjectFacilities } from '../object-facilities';
import { MoveDirection } from '../models/move-direction.enum';
import { ComparisonOperator } from '../models/comparison-operator.enum';

export class HiddenSetStrategy extends SolverStrategy {
    private _boardSizeCached: number | undefined;
    private _allCellValuesCached: number[] = [];

    constructor(board: Board) {
        super('Hidden Set', board);
    }

    runAtBoard(): boolean {
        for (const coordinate of Coordinate.iterateBoard(this.board.size)) {
            const cell = this.board.getCell(coordinate);
            if (cell && cell.value === undefined) {
                if (this.runAtCoordinate(coordinate)) {
                    return true;
                }
            }
        }

        return false;
    }

    runAtCoordinate(coordinate: Coordinate): boolean {
        const candidateValueSet = this.calculateCandidateValueSetAt(coordinate);
        return this.applyCandidateValueSet(coordinate, candidateValueSet);
    }

    private calculateCandidateValueSetAt(coordinate: Coordinate): number[] {
        this.ensureCache();

        const candidateValueSet = this._allCellValuesCached.slice();

        this.applyDigitRules(coordinate, candidateValueSet);

        return candidateValueSet;
    }

    private ensureCache(): void {
        if (this._boardSizeCached !== this.board.size) {
            this._boardSizeCached = this.board.size;
            this._allCellValuesCached = ObjectFacilities.createNumberSequence(this.board.size);
        }
    }

    private applyOperatorRules(coordinate: Coordinate, candidateValueSet: number[]): void {
        this.outerApplySingleOperatorRule(coordinate, MoveDirection.Left, candidateValueSet);
        this.outerApplySingleOperatorRule(coordinate, MoveDirection.Right, candidateValueSet);
        this.outerApplyDoubleOperatorRule(coordinate, MoveDirection.Left, MoveDirection.Right, candidateValueSet);

        this.outerApplySingleOperatorRule(coordinate, MoveDirection.Up, candidateValueSet);
        this.outerApplySingleOperatorRule(coordinate, MoveDirection.Down, candidateValueSet);
        this.outerApplyDoubleOperatorRule(coordinate, MoveDirection.Up, MoveDirection.Down, candidateValueSet);
    }

    private outerApplySingleOperatorRule(coordinate: Coordinate, direction: MoveDirection, candidateValueSet: number[]): void {
        if (coordinate.canMoveOne(direction)) {
            const operator = this.board.getOperator(coordinate, direction);
            if (operator !== ComparisonOperator.None) {
                const isLessThanAdjacentCell = operator === ComparisonOperator.LessThan;
                this.innerApplySingleOperatorRule(isLessThanAdjacentCell, coordinate.moveOne(direction),
                    coordinate, candidateValueSet, MoveDirection[direction]);
            }
        }
    }

    private innerApplySingleOperatorRule(isLessThanAdjacentCell: boolean, adjacentCellCoordinate: Coordinate,
        currentCellCoordinate: Coordinate, candidateValueSet: number[], direction: string): void {
        // Rule: When a cell is greater than its adjacent cell, then it cannot contain digit 1 and
        // its minimum value must be higher than the minimum draft value in the adjacent cell.
        // Likewise, when a cell is less than its adjacent cell, then it cannot contain the highest digit on the board and
        // its maximum value must be lower than the maximum draft value in the adjacent cell.

        // Example:
        //      | | 12345 > 12345 |
        //  =>  | |  2345 > 1234  |

        const adjacentCell = this.board.getCell(adjacentCellCoordinate);

        if (adjacentCell) {
            if (isLessThanAdjacentCell) {
                const adjacentMaxValue = adjacentCell.getMaximum() || this.board.size;
                const generateCount = this.board.size - adjacentMaxValue + 1;
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
        candidateValueSet: number[]): void {
        if (coordinate.canMoveOne(direction1) && coordinate.canMoveOne(direction2)) {
            const operator1 = this.board.getOperator(coordinate, direction1);
            const operator2 = this.board.getOperator(coordinate, direction2);

            if (operator1 !== ComparisonOperator.None && operator1 === operator2) {
                const isLessThanAdjacentCells = operator1 === ComparisonOperator.LessThan;
                this.innerApplyDoubleOperatorRule(isLessThanAdjacentCells, coordinate.moveOne(direction1), coordinate.moveOne(direction2),
                    coordinate, candidateValueSet, MoveDirection[direction1], MoveDirection[direction2]);
            }
        }
    }

    private innerApplyDoubleOperatorRule(isLessThanAdjacentCells: boolean, adjacentCellCoordinate1: Coordinate,
        adjacentCellCoordinate2: Coordinate, currentCellCoordinate: Coordinate, candidateValueSet: number[],
        direction1: string, direction2: string): void {
        // Rule: When a cell is greater than both of its adjacent cells in the same sequence (row or column)
        // and the adjacent cells have the same minimum value, then the cell value must be higher than their
        // minimum draft value plus one (because the adjacent cells cannot both contain that minimum value).
        // Likewise, when a cell is less than both of its adjacent cells in the same sequence,
        // and the adjacent cells have the same maximum value, then the cell value must be lower than their
        // maximum draft value minus one (because the adjacent cells cannot both contain that maximum value).

        // Example:
        //      | 2345 > 12345 < 2345 |
        //  =>  | 2345 > 123   < 2345 |

        const adjacentCell1 = this.board.getCell(adjacentCellCoordinate1);
        const adjacentCell2 = this.board.getCell(adjacentCellCoordinate2);

        if (adjacentCell1 && adjacentCell2) {
            if (isLessThanAdjacentCells) {
                const adjacentMaxValue1 = adjacentCell1.getMaximum() || this.board.size;
                const adjacentMaxValue2 = adjacentCell2.getMaximum() || this.board.size;

                if (adjacentMaxValue1 === adjacentMaxValue2) {
                    const adjacentMaxValue = adjacentMaxValue1 - 1;
                    const generateCount = this.board.size - adjacentMaxValue + 1;
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

    private applyDigitRules(coordinate: Coordinate, candidateValueSet: number[]): void {
        const coordinatesInRow = coordinate.iterateRow(true);
        const coordinatesInColumn = coordinate.iterateColumn(true);

        this.applyDigitRulesInSequence(coordinate, coordinatesInRow, candidateValueSet, 'row');
        this.applyDigitRulesInSequence(coordinate, coordinatesInColumn, candidateValueSet, 'column');
    }

    private applyDigitRulesInSequence(coordinate: Coordinate, coordinateSequence: Coordinate[], candidateValueSet: number[],
        sequenceName: string): void {
        const possibleValuesInSequence = this.getPossibleCellValuesInSequence(coordinateSequence);

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
        const cell = this.board.getCell(coordinate);
        if (cell) {
            const possibleValues = cell.getPossibleValues();
            if (possibleValues.length > 0) {
                return possibleValues;
            }
        }

        return this._allCellValuesCached;
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
            if (digitSet.length > 0 && digitSet.length < this.board.size) {
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

    private applyCandidateValueSet(coordinate: Coordinate, candidateValueSet: number[]): boolean {
        if (candidateValueSet.length === 0) {
            throw new Error(`No possible values for ${coordinate}.`);
        }

        const actualValueSet = this.getActualValueSet(coordinate);

        const newValueSet = actualValueSet.length === 0 ? candidateValueSet :
            actualValueSet.filter(digit => candidateValueSet.indexOf(digit) > -1);

        if (newValueSet.length === 0) {
            throw new Error(`No possible values for ${coordinate}.`);
        }

        if (newValueSet.length !== actualValueSet.length) {
            console.log(`${coordinate}: [${actualValueSet}] to [${newValueSet}] (candidate set: ${candidateValueSet})`);

            const cell = this.board.getCell(coordinate);
            if (cell) {
                cell.setDraftValues(newValueSet);
            }

            return true;
        }

        return false;
    }

    private getActualValueSet(coordinate: Coordinate): number[] {
        const cell = this.board.getCell(coordinate);
        return cell ? cell.getPossibleValues() : [];
    }
}
