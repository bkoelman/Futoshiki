import { SolverStrategy } from './solver-strategy';
import { Coordinate } from '../models/coordinate';
import { ObjectFacilities } from '../object-facilities';
import { Board } from '../models/board';

export class NakedPairTripleStrategy extends SolverStrategy {
    private _boardSizeCached = -1;
    private _powerSetForPairs: number[][] = [];
    private _powerSetForTriples: number[][] = [];
    private _rowColumnSequences: { coordinates: Coordinate[], name: string }[] = [];

    private get powerSetForPairs() {
        this.ensureCache();
        return this._powerSetForPairs;
    }

    private get powerSetForTriples() {
        this.ensureCache();
        return this._powerSetForTriples;
    }

    private get rowColumnSequences() {
        this.ensureCache();
        return this._rowColumnSequences;
    }

    private ensureCache() {
        if (this._boardSizeCached !== this.board.size) {
            const powerSetForAllCellValues = ObjectFacilities.createPowerSet(this.allCellValues);

            this._powerSetForPairs = powerSetForAllCellValues.filter(set => set.length === 2);
            this._powerSetForTriples = powerSetForAllCellValues.filter(set => set.length === 3);
            this._rowColumnSequences = this.getBoardSequences();

            this._boardSizeCached = this.board.size;
        }
    }

    constructor(board: Board) {
        super('Naked Pair/Triple', board);
    }

    private getBoardSequences(): { coordinates: Coordinate[], name: string }[] {
        const sequences: { coordinates: Coordinate[], name: string }[] = [];

        const firstCoordinate = Coordinate.fromIndex(0, this.board.size);
        for (const firstColumnInRow of firstCoordinate.iterateColumn(false)) {
            const coordinatesInRow = firstColumnInRow.iterateRow(false);
            sequences.push({ coordinates: coordinatesInRow, name: 'row' });
        }

        for (const firstRowInColumn of firstCoordinate.iterateRow(false)) {
            const coordinatesInColumn = firstRowInColumn.iterateColumn(false);
            sequences.push({ coordinates: coordinatesInColumn, name: 'column' });
        }

        return sequences;
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

    private runAtSequence(digitSet: number[], sequence: Coordinate[], sequenceName: string, singleCell: Coordinate | undefined): boolean {
        const nakedSetMembers = this.getMembersOfNakedSetInSequence(digitSet, sequence);
        if (nakedSetMembers.length === digitSet.length) {
            let otherCells = sequence.filter(coordinate => !nakedSetMembers.some(member => member.isEqualTo(coordinate)));

            if (singleCell !== undefined) {
                otherCells = otherCells.filter(coordinate => coordinate.isEqualTo(singleCell));
            }

            return this.removeCandidatesFromOtherCells(otherCells, digitSet, nakedSetMembers, sequenceName);
        }

        return false;
    }

    private getMembersOfNakedSetInSequence(digitSet: number[], sequence: Coordinate[]): Coordinate[] {
        const memberCoordinates: Coordinate[] = [];

        for (const coordinate of sequence) {
            const cell = this.board.getCell(coordinate);
            if (cell) {
                const candidates = cell.getCandidates();
                const digitsInsideSet = candidates.filter(digit => digitSet.indexOf(digit) > -1);
                const digitsOutsideSet = candidates.filter(digit => digitSet.indexOf(digit) <= -1);

                if (digitsInsideSet.length > 0 && digitsOutsideSet.length === 0) {
                    memberCoordinates.push(coordinate);
                }
            }
        }

        return memberCoordinates;
    }

    private removeCandidatesFromOtherCells(otherCells: Coordinate[], digitsToRemove: number[], nakedSetMembers: Coordinate[],
        sequenceName: string): boolean {

        let changedCellCount = 0;
        for (const coordinate of otherCells) {
            if (this.removeCandidatesFromCell(coordinate, digitsToRemove) > 0) {
                changedCellCount++;
            }
        }

        if (changedCellCount > 0) {
            const name = digitsToRemove.length === 2 ? 'Naked pair' : 'Naked triple';
            this.reportChange(`${name} (${digitsToRemove}) in cells (${nakedSetMembers}) eliminated ` +
                `${digitsToRemove} from ${changedCellCount} other cells in ${sequenceName}.`);
            return true;
        }

        return false;
    }
}
