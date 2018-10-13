import { SolverStrategy } from './solver-strategy';
import { Board } from '../models/board';
import { Coordinate } from '../models/coordinate';
import { ObjectFacilities } from '../object-facilities';

export class HiddenSetStrategy extends SolverStrategy {
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
        const candidateValueSet = [...this.allCellValues];

        this.applyDigitRules(coordinate, candidateValueSet);

        return candidateValueSet;
    }

    private applyDigitRules(coordinate: Coordinate, candidateValueSet: number[]): void {
        const coordinatesInRow = coordinate.iterateRow(true);
        const coordinatesInColumn = coordinate.iterateColumn(true);

        this.applyDigitRulesInSequence(coordinate, coordinatesInRow, candidateValueSet, 'row');
        this.applyDigitRulesInSequence(coordinate, coordinatesInColumn, candidateValueSet, 'column');
    }

    private applyDigitRulesInSequence(coordinate: Coordinate, coordinateSequence: Coordinate[], candidateValueSet: number[],
        sequenceName: string): void {
        const possibleDigitsInSequence = this.getPossibleCellValuesInSequence(coordinateSequence);

        this.applyHiddenSetRuleInSequence(coordinate, candidateValueSet, possibleDigitsInSequence, sequenceName);
    }

    private getPossibleCellValuesInSequence(sequence: Coordinate[]): number[][] {
        const possibleDigitsPerCell: number[][] = [];

        for (const coordinate of sequence) {
            const digits = this.getPossibleDigitsForCell(coordinate);
            possibleDigitsPerCell.push([...digits]);
        }

        return possibleDigitsPerCell;
    }

    private applyHiddenSetRuleInSequence(coordinate: Coordinate, candidateValueSet: number[], possibleDigitsPerCell: number[][],
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
                const frequency = this.getHiddenSetFrequency(digitSet, possibleDigitsPerCell);
                if (frequency === digitSet.length - 1) {
                    const digitsToRemove = candidateValueSet.filter(digit => digitSet.indexOf(digit) <= -1);
                    this.reduceCandidateValueSet(candidateValueSet, digitsToRemove, coordinate,
                        `Hidden Set rule with set {${digitSet}} in ${sequenceName}`);
                }
            }
        }
    }

    private getHiddenSetFrequency(digitSet: number[], possibleDigitsPerCell: number[][]): number {
        let setFoundCount = 0;

        for (const possibleDigits of possibleDigitsPerCell) {
            let digitFoundCount = 0;
            for (const digit of digitSet) {
                if (possibleDigits.indexOf(digit) > -1) {
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
                cell.setCandidates(new Set<number>(newValueSet));
            }

            return true;
        }

        return false;
    }

    private getActualValueSet(coordinate: Coordinate): number[] {
        const cell = this.board.getCell(coordinate);
        return cell ? [...cell.getCandidates()] : [];
    }
}
