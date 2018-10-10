import { SolverStrategy } from './solver-strategy';
import { Board } from '../models/board';
import { Coordinate } from '../models/coordinate';
import { ObjectFacilities } from '../object-facilities';

export class HiddenSingleStrategy extends SolverStrategy {
    private readonly _enableLog = false;

    constructor(board: Board) {
        super('Hidden Single', board);
    }

    runAtBoard(): boolean {
        let hasChanges = false;

        for (const coordinate of Coordinate.iterateBoard(this.board.size)) {
            const cell = this.board.getCell(coordinate);
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
        const candidateValueSet = ObjectFacilities.createNumberSequence(this.board.size);

        this.reduceCandidateSetForHiddenSingles(coordinate, candidateValueSet);

        return candidateValueSet;
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

        const digitsToRemove = ObjectFacilities.createNumberSequence(this.board.size).filter(
            (count, index) => digitCounts[index + 1] >= 1);

        return this.tryReduceCandidateValueSet(candidateValueSet, digitsToRemove, coordinate,
            `Hidden Single rule in ${sequenceName}`);
    }

    private getDigitCountsInSequence(sequence: Coordinate[]): number[] {
        const digitCounts: number[] = [];

        for (const nextCoordinate of sequence) {
            const cell = this.board.getCell(nextCoordinate);
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

        const newValueSet = actualValueSet.length === 0 ? candidateValueSet :
            actualValueSet.filter(digit => candidateValueSet.indexOf(digit) > -1);

        if (newValueSet.length === 0) {
            throw new Error(`No possible values for ${coordinate}.`);
        }

        if (newValueSet.length !== actualValueSet.length) {
            if (this._enableLog) {
                console.log(`${coordinate}: [${actualValueSet}] to [${newValueSet}] (candidate set: ${candidateValueSet})`);
            }

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
