import { Coordinate } from '../models/coordinate';
import { Board } from '../models/board';
import { ObjectFacilities } from '../object-facilities';

const EnableVerboseLog = false;

export abstract class SolverStrategy {
    private _innerBoardSizeCached = -1;
    private _innerAllCellValuesCached: number[] = [];

    protected get allCellValues() {
        if (this._innerBoardSizeCached !== this.board.size) {
            this._innerAllCellValuesCached = ObjectFacilities.createNumberSequence(this.board.size);
            this._innerBoardSizeCached = this.board.size;
        }

        return this._innerAllCellValuesCached;
    }

    protected constructor(readonly name: string, readonly board: Board) {
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

    protected getPossibleDigitsForCell(coordinate: Coordinate): number[] {
        const cell = this.board.getCell(coordinate);
        if (cell) {
            if (cell.value !== undefined) {
                return [cell.value];
            }

            const candidates = cell.getCandidates();
            if (candidates.length > 0) {
                return candidates;
            }
        }

        return this.allCellValues.slice();
    }

    protected removeCandidateFromCell(coordinate: Coordinate, digitToRemove: number): boolean {
        const cell = this.board.getCell(coordinate);
        if (cell && cell.value === undefined) {
            const candidates = cell.getCandidates();
            if (candidates.indexOf(digitToRemove) > -1) {
                cell.removeCandidate(digitToRemove);

                if (candidates.length === 1) {
                    throw new Error(`No possible digits for ${coordinate}.`);
                }

                return true;
            }
        }

        return false;
    }

    protected removeCandidatesFromCell(coordinate: Coordinate, digitsToRemove: number[]): number {
        const digitsRemoved = [];

        for (const digitToRemove of digitsToRemove) {
            if (this.removeCandidateFromCell(coordinate, digitToRemove)) {
                digitsRemoved.push(digitToRemove);
            }
        }

        return digitsRemoved.length;
    }
}
