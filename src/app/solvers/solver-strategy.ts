import { Coordinate } from '../models/coordinate';
import { Board } from '../models/board';
import { SetFacilities } from '../set-facilities';
import { BoardSizeBasedCache } from '../boardsizebasedcache';

const EnableVerboseLog = false;

export abstract class SolverStrategy {
    private _allCellValuesCache = new BoardSizeBasedCache(this.board, () => SetFacilities.createNumberSet(this.board.size));
    private _rowColumnSequencesCache = new BoardSizeBasedCache(this.board, () => this.getRowColumnSequences());

    protected get allCellValues() {
        return this._allCellValuesCache.value;
    }

    protected get rowColumnSequences() {
        return this._rowColumnSequencesCache.value;
    }

    protected constructor(readonly name: string, readonly board: Board) {
    }

    private getRowColumnSequences(): { coordinates: Coordinate[], name: string }[] {
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

    abstract runAtBoard(): boolean;
    abstract runAtCoordinate(coordinate: Coordinate): boolean;

    protected reportChange(message: string) {
        console.log(`*STEP* [${this.name}] ${message}`);
    }

    protected reportVerbose(message: string) {
        if (EnableVerboseLog) {
            console.log(`[${this.name}] ${message}`);
        }
    }

    protected getPossibleDigitsForCell(coordinate: Coordinate): ReadonlySet<number> {
        const cell = this.board.getCell(coordinate);
        if (cell) {
            if (cell.value !== undefined) {
                return new Set([cell.value]);
            }

            const candidates = cell.getCandidates();
            if (candidates.size > 0) {
                return candidates;
            }
        }

        return this.allCellValues;
    }

    protected removeCandidateFromCell(coordinate: Coordinate, digitToRemove: number): boolean {
        const cell = this.board.getCell(coordinate);
        if (cell && cell.value === undefined) {
            const candidates = cell.getCandidates();
            if (candidates.has(digitToRemove)) {
                cell.removeCandidate(digitToRemove);

                if (candidates.size === 1) {
                    throw new Error(`No possible digits for ${coordinate}.`);
                }

                return true;
            }
        }

        return false;
    }

    protected removeCandidatesFromCell(coordinate: Coordinate, digitsToRemove: ReadonlySet<number>): number {
        let removeCount = 0;

        for (const digitToRemove of digitsToRemove) {
            if (this.removeCandidateFromCell(coordinate, digitToRemove)) {
                removeCount++;
            }
        }

        return removeCount;
    }
}
