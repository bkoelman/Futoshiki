import { Coordinate } from '../models/coordinate';
import { Board } from '../models/board';

const EnableVerboseLog = false;

export abstract class SolverStrategy {
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

    protected removeCandidateFromCell(coordinate: Coordinate, digitToRemove: number): boolean {
        const cell = this.board.getCell(coordinate);
        if (cell && cell.value === undefined) {
            const possibleValues = cell.getPossibleValues();
            if (possibleValues.indexOf(digitToRemove) > -1) {
                cell.removeCandidate(digitToRemove);

                if (possibleValues.length === 1) {
                    throw new Error(`No possible values for ${coordinate}.`);
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
