import { SolverStrategy } from './solver-strategy';
import { Coordinate } from '../models/coordinate';
import { Board } from '../models/board';
import { SetFacilities } from '../set-facilities';

export class NakedPairTripleStrategy extends SolverStrategy {
    private _boardSizeCached = -1;
    private _powerSetForPairs = SetFacilities.emptyNumberSetOfSet;
    private _powerSetForTriples = SetFacilities.emptyNumberSetOfSet;

    private get powerSetForPairs() {
        this.ensureCache();
        return this._powerSetForPairs;
    }

    private get powerSetForTriples() {
        this.ensureCache();
        return this._powerSetForTriples;
    }

    private ensureCache() {
        if (this._boardSizeCached !== this.board.size) {
            const powerSetForAllCellValues = SetFacilities.createPowerSet(this.allCellValues);

            this._powerSetForPairs = SetFacilities.filterSet(powerSetForAllCellValues, set => set.size === 2);
            this._powerSetForTriples = SetFacilities.filterSet(powerSetForAllCellValues, set => set.size === 3);

            this._boardSizeCached = this.board.size;
        }
    }

    constructor(board: Board) {
        super('Naked Pair/Triple', board);
    }

    runAtBoard(): boolean {
        this.ensureCache();

        return this.runAtSequences(this.rowColumnSequences, undefined);
    }

    runAtCoordinate(coordinate: Coordinate): boolean {
        this.ensureCache();

        const sequences = [{
            coordinates: coordinate.iterateRow(false),
            name: 'row'
        }, {
            coordinates: coordinate.iterateColumn(false),
            name: 'column'
        }];

        return this.runAtSequences(sequences, coordinate);
    }

    private runAtSequences(sequences: { coordinates: Coordinate[], name: string }[], coordinate: Coordinate | undefined) {
        for (const powerSet of [this.powerSetForPairs, this.powerSetForTriples]) {
            for (const digitSet of powerSet) {
                for (const sequence of sequences) {
                    if (this.runAtSequence(digitSet, sequence.coordinates, sequence.name, coordinate)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    private runAtSequence(digitSet: ReadonlySet<number>, sequence: Coordinate[], sequenceName: string,
        singleCell: Coordinate | undefined): boolean {
        const nakedSetMembers = this.getMembersOfNakedSetInSequence(digitSet, sequence);
        if (nakedSetMembers.length === digitSet.size) {
            let otherCells = sequence.filter(coordinate => !nakedSetMembers.some(member => member.isEqualTo(coordinate)));

            if (singleCell !== undefined) {
                otherCells = otherCells.filter(coordinate => coordinate.isEqualTo(singleCell));
            }

            return this.removeCandidatesFromOtherCells(otherCells, digitSet, nakedSetMembers, sequenceName);
        }

        return false;
    }

    private getMembersOfNakedSetInSequence(digitSet: ReadonlySet<number>, sequence: Coordinate[]): Coordinate[] {
        const memberCoordinates: Coordinate[] = [];

        for (const coordinate of sequence) {
            const cell = this.board.getCell(coordinate);
            if (cell) {
                const candidates = cell.getCandidates();
                const digitsInsideSet = SetFacilities.filterSet(candidates, digit => digitSet.has(digit));
                const digitsOutsideSet = SetFacilities.filterSet(candidates, digit => !digitSet.has(digit));

                if (digitsInsideSet.size > 0 && digitsOutsideSet.size === 0) {
                    memberCoordinates.push(coordinate);
                }
            }
        }

        return memberCoordinates;
    }

    private removeCandidatesFromOtherCells(otherCells: Coordinate[], digitsToRemove: ReadonlySet<number>, nakedSetMembers: Coordinate[],
        sequenceName: string): boolean {

        let changedCellCount = 0;
        for (const coordinate of otherCells) {
            if (this.removeCandidatesFromCell(coordinate, digitsToRemove) > 0) {
                changedCellCount++;
            }
        }

        if (changedCellCount > 0) {
            const name = digitsToRemove.size === 2 ? 'Naked pair' : 'Naked triple';
            this.reportChange(`${name} (${SetFacilities.formatSet(digitsToRemove)}) in cells (${nakedSetMembers}) eliminated ` +
                `${SetFacilities.formatSet(digitsToRemove)} from ${changedCellCount} other cells in that ${sequenceName}.`);
            return true;
        }

        return false;
    }
}
