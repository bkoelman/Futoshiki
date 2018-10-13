import { SolverStrategy } from './solver-strategy';
import { Coordinate } from '../models/coordinate';
import { Board } from '../models/board';
import { SetFacilities } from '../set-facilities';

export class HiddenPairTripleStrategy extends SolverStrategy {
    constructor(board: Board) {
        super('Hidden Pair/Triple', board);
    }

    runAtBoard(): boolean {
        return this.runAtSequences(this.rowColumnSequences, undefined);
    }

    runAtCoordinate(coordinate: Coordinate): boolean {
        const sequences = [{
            coordinates: coordinate.iterateRow(false),
            name: 'row'
        }, {
            coordinates: coordinate.iterateColumn(false),
            name: 'column'
        }];

        return this.runAtSequences(sequences, coordinate);
    }

    private runAtSequences(sequences: { coordinates: Coordinate[], name: string }[], singleCoordinate: Coordinate | undefined) {
        for (const powerSet of [this.powerSetForPairs, this.powerSetForTriples]) {
            for (const digitSet of powerSet) {
                for (const sequence of sequences) {
                    if (this.runAtSequence(sequence.coordinates, digitSet, sequence.name, singleCoordinate)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    private runAtSequence(sequence: Coordinate[], digitSet: ReadonlySet<number>, sequenceName: string,
        singleCoordinate: Coordinate | undefined) {
        const cellsInHiddenSet = this.getCellsInHiddenSet(sequence, digitSet);

        if (cellsInHiddenSet.length === digitSet.size) {
            return this.removeOtherCandidatesFromCells(cellsInHiddenSet, digitSet, sequenceName, singleCoordinate);
        }

        return false;
    }

    private getCellsInHiddenSet(sequence: Coordinate[], digitSet: ReadonlySet<number>): Coordinate[] {
        const cellsInHiddenSet = [];

        for (const coordinate of sequence) {
            const isInSet = this.isCellInHiddenSet(coordinate, digitSet);
            if (isInSet === true) {
                cellsInHiddenSet.push(coordinate);
            } else if (isInSet === undefined) {
                return [];
            }
        }

        return cellsInHiddenSet;
    }

    private isCellInHiddenSet(coordinate: Coordinate, digitSet: ReadonlySet<number>): boolean | undefined {
        const possibleDigits = this.getPossibleDigitsForCell(coordinate);

        let foundCount = 0;
        for (const digit of digitSet) {
            if (possibleDigits.has(digit)) {
                foundCount++;
            }
        }

        if (foundCount === digitSet.size) {
            return true;
        } else if (foundCount === 0) {
            return false;
        } else {
            return undefined;
        }
    }

    private removeOtherCandidatesFromCells(cellsInHiddenSet: Coordinate[], digitsToKeep: ReadonlySet<number>,
        sequenceName: string, singleCoordinate: Coordinate | undefined): boolean {
        const digitsToRemove = SetFacilities.filterSet(this.allCellValues, digit => !digitsToKeep.has(digit));

        const cellsToUpdate = singleCoordinate === undefined ? cellsInHiddenSet :
            cellsInHiddenSet.filter(coordinate => coordinate.isEqualTo(singleCoordinate));

        let changedCellCount = 0;
        for (const coordinate of cellsToUpdate) {
            if (this.removeCandidatesFromCell(coordinate, digitsToRemove)) {
                changedCellCount++;
            }
        }

        if (changedCellCount > 0) {
            const arity = this.getArityName(digitsToKeep.size);
            const target = singleCoordinate === undefined ? 'these cells' : `${singleCoordinate}`;
            this.reportChange(`Hidden ${arity} (${SetFacilities.formatSet(digitsToKeep)}) in ${sequenceName}` +
                ` of cells (${cellsInHiddenSet}) eliminated others in ${target}.`);

            return true;
        }

        return false;
    }
}
