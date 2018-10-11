import { Coordinate } from '../models/coordinate';
import { Board } from '../models/board';

export abstract class SolverStrategy {
    protected constructor(readonly name: string, readonly board: Board) {
    }

    abstract runAtBoard(): boolean;
    abstract runAtCoordinate(coordinate: Coordinate): boolean;

    protected reportChange(message: string) {
        console.log(`*STEP* [${this.name}] ${message}`);
    }

    protected removeCandidateFromCell(coordinate: Coordinate, digitToRemove: number): boolean {
        const cell = this.board.getCell(coordinate);
        if (cell && cell.value === undefined) {
            const possibleValues = cell.getPossibleValues();
            if (possibleValues.indexOf(digitToRemove) > -1) {
                cell.removeCandidate(digitToRemove);
                return true;
            }
        }

        return false;
    }
}
