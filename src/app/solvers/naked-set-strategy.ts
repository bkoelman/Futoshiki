import { SolverStrategy } from './solver-strategy';
import { Coordinate } from '../models/coordinate';
import { Board } from '../models/board';
import { ObjectFacilities } from '../object-facilities';

export class NakedSetStrategy extends SolverStrategy {
    private _boardSizeCached: number | undefined;
    private _allCellValuesCached: number[] = [];
    private _powerSetForAllCellValuesCached: number[][] = [[]];

    constructor(board: Board) {
        super('Naked Set', board);
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
            this._powerSetForAllCellValuesCached = ObjectFacilities.createPowerSet(this._allCellValuesCached);
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

        this.applyNakedSetRuleInSequence(coordinate, candidateValueSet, possibleValuesInSequence, sequenceName);
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
            if (digitSet.length > 0 && digitSet.length < this.board.size) {
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
                cell.setCandidates(newValueSet);
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
