import { SolverStrategy } from './solver-strategy';
import { Board } from '../models/board';
import { Coordinate } from '../models/coordinate';
import { ObjectFacilities } from '../object-facilities';
import { MoveDirection } from '../models/move-direction.enum';
import { ComparisonOperator } from '../models/comparison-operator.enum';

export class OperatorWithHiddenSingleStrategy implements SolverStrategy {
    private readonly _enableLog = false;
    readonly name = 'Operator and Hidden Single';

    constructor(private _board: Board) {
    }

    runAtBoard(): boolean {
        let hasChanges = false;

        while (true) {
            if (this.singleRunAtBoard()) {
                hasChanges = true;
            } else {
                break;
            }
        }

        return hasChanges;
    }

    private singleRunAtBoard(): boolean {
        let hasChanges = false;

        for (const coordinate of Coordinate.iterateBoard(this._board.size)) {
            const cell = this._board.getCell(coordinate);
            if (cell && cell.value === undefined) {
                if (this.runAtCoordinate(coordinate)) {
                    hasChanges = true;
                }
            }
        }

        return hasChanges;
    }

    runAtCoordinate(coordinate: Coordinate): boolean {
        const candidateValueSet = this.calculateCandidateValueSetAt(coordinate);
        return this.applyCandidateValueSet(coordinate, candidateValueSet);
    }

    private calculateCandidateValueSetAt(coordinate: Coordinate): number[] {
        const candidateValueSet = ObjectFacilities.createNumberSequence(this._board.size);

        this.reduceCandidateSetForOperators(coordinate, candidateValueSet);
        this.reduceCandidateSetForHiddenSingles(coordinate, candidateValueSet);

        return candidateValueSet;
    }

    private reduceCandidateSetForOperators(coordinate: Coordinate, candidateValueSet: number[]): boolean {
        let hasChanges = false;

        for (const directionPair of [[MoveDirection.Left, MoveDirection.Right], [MoveDirection.Up, MoveDirection.Down]]) {
            if (!this.reduceForOperatorPair(coordinate, directionPair[0], directionPair[1], candidateValueSet)) {
                for (const direction of directionPair) {
                    hasChanges = this.reduceForSingleOperator(coordinate, direction, candidateValueSet) || hasChanges;
                }
            } else {
                hasChanges = true;
            }
        }

        return hasChanges;
    }

    private reduceForOperatorPair(coordinate: Coordinate, direction1: MoveDirection, direction2: MoveDirection,
        candidateValueSet: number[]): boolean {

        if (coordinate.canMoveOne(direction1) && coordinate.canMoveOne(direction2)) {
            const operator1 = this._board.getOperator(coordinate, direction1);
            const operator2 = this._board.getOperator(coordinate, direction2);

            if (operator1 !== ComparisonOperator.None && operator1 === operator2) {
                const adjacentCell1 = this._board.getCell(coordinate.moveOne(direction1));
                const adjacentCell2 = this._board.getCell(coordinate.moveOne(direction2));

                if (adjacentCell1 && adjacentCell2) {
                    if (operator1 === ComparisonOperator.LessThan) {
                        const adjacentMaxValue1 = adjacentCell1.getMaximum() || this._board.size;
                        const adjacentMaxValue2 = adjacentCell2.getMaximum() || this._board.size;

                        if (adjacentMaxValue1 === adjacentMaxValue2) {
                            const adjacentMaxValue = adjacentMaxValue1 - 1;
                            const generateCount = this._board.size - adjacentMaxValue + 1;
                            const digitsToRemove = ObjectFacilities.createNumberSequence(generateCount, adjacentMaxValue);
                            return this.tryReduceCandidateValueSet(candidateValueSet, digitsToRemove, coordinate,
                                `Operator Pair rule (${direction1} > this < ${direction2})`);
                        }
                    } else {
                        const adjacentMinValue1 = adjacentCell1.getMinimum() || 1;
                        const adjacentMinValue2 = adjacentCell2.getMinimum() || 1;

                        if (adjacentMinValue1 === adjacentMinValue2) {
                            const adjacentMinValue = adjacentMinValue1 + 1;
                            const digitsToRemove = ObjectFacilities.createNumberSequence(adjacentMinValue);
                            return this.tryReduceCandidateValueSet(candidateValueSet, digitsToRemove, coordinate,
                                `Operator Pair rule (${direction1} < this > ${direction2})`);
                        }
                    }
                }
            }
        }

        return false;
    }

    private reduceForSingleOperator(coordinate: Coordinate, direction: MoveDirection, candidateValueSet: number[]): boolean {
        if (coordinate.canMoveOne(direction)) {
            const operator = this._board.getOperator(coordinate, direction);
            if (operator !== ComparisonOperator.None) {
                const adjacentCell = this._board.getCell(coordinate.moveOne(direction));

                if (adjacentCell) {
                    if (operator === ComparisonOperator.LessThan) {
                        const adjacentMaxValue = adjacentCell.getMaximum() || this._board.size;
                        const generateCount = this._board.size - adjacentMaxValue + 1;
                        const digitsToRemove = ObjectFacilities.createNumberSequence(generateCount, adjacentMaxValue);
                        return this.tryReduceCandidateValueSet(candidateValueSet, digitsToRemove, coordinate,
                            `Single Operator rule (this < ${direction})`);
                    } else {
                        const adjacentMinValue = adjacentCell.getMinimum() || 1;
                        const digitsToRemove = ObjectFacilities.createNumberSequence(adjacentMinValue);
                        return this.tryReduceCandidateValueSet(candidateValueSet, digitsToRemove, coordinate,
                            `Single Operator rule (this > ${direction})`);
                    }
                }
            }
        }

        return false;
    }

    private reduceCandidateSetForHiddenSingles(coordinate: Coordinate, candidateValueSet: number[]) {
        const coordinatesInRow = coordinate.iterateRow(true);
        this.reduceForSequence(coordinate, coordinatesInRow, candidateValueSet, 'row');

        const coordinatesInColumn = coordinate.iterateColumn(true);
        this.reduceForSequence(coordinate, coordinatesInColumn, candidateValueSet, 'column');
    }

    private reduceForSequence(coordinate: Coordinate, sequence: Coordinate[], candidateValueSet: number[],
        sequenceName: string): boolean {
        const digitCounts = this.getDigitCountsInSequence(sequence);

        const digitsToRemove = ObjectFacilities.createNumberSequence(this._board.size).filter(
            (count, index) => digitCounts[index + 1] >= 1);

        return this.tryReduceCandidateValueSet(candidateValueSet, digitsToRemove, coordinate,
            `Hidden Single rule in ${sequenceName}`);
    }

    private getDigitCountsInSequence(sequence: Coordinate[]): number[] {
        const digitCounts: number[] = [];

        for (const nextCoordinate of sequence) {
            const cell = this._board.getCell(nextCoordinate);
            if (cell) {
                if (cell.value !== undefined) {
                    if (digitCounts[cell.value] > 0) {
                        digitCounts[cell.value]++;
                    } else {
                        digitCounts[cell.value] = 1;
                    }
                }
            }
        }

        return digitCounts;
    }

    private tryReduceCandidateValueSet(candidateValueSet: number[], digitsToRemove: number[], coordinate: Coordinate, ruleName: string):
        boolean {
        const beforeText = candidateValueSet.join(',');
        this.removeNumbersFromArray(candidateValueSet, digitsToRemove);
        const afterText = candidateValueSet.join(',');

        if (beforeText !== afterText) {
            if (this._enableLog) {
                console.log(`Applying ${ruleName} at cell ${coordinate}: ${beforeText} => ${afterText}`);
            }
            return true;
        }

        return false;
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

        // TODO: Break up into separate strategies:
        // - Set all draft values to [1..n]
        // - Reduce based on Hidden Singles
        // - Reduce based on operators

        const newValueSet = actualValueSet.length === 0 ? candidateValueSet :
            actualValueSet.filter(digit => candidateValueSet.indexOf(digit) > -1);

        if (newValueSet.length === 0) {
            throw new Error(`No possible values for ${coordinate}.`);
        }

        if (newValueSet.length !== actualValueSet.length) {
            if (this._enableLog) {
                console.log(`${coordinate}: [${actualValueSet}] to [${newValueSet}] (candidate set: ${candidateValueSet})`);
            }

            const cell = this._board.getCell(coordinate);
            if (cell) {
                cell.setDraftValues(newValueSet);
            }

            return true;
        }

        return false;
    }

    private getActualValueSet(coordinate: Coordinate): number[] {
        const cell = this._board.getCell(coordinate);
        return cell ? cell.getPossibleValues() : [];
    }
}
