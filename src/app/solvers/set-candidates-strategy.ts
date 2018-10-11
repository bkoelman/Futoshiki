import { SolverStrategy } from './solver-strategy';
import { Coordinate } from '../models/coordinate';
import { Board } from '../models/board';
import { ObjectFacilities } from '../object-facilities';

export class SetCandidatesStrategy extends SolverStrategy {
    constructor(board: Board) {
        super('Set Candidates', board);
    }

    runAtBoard(): boolean {
        let hasChanges = false;

        for (const coordinate of Coordinate.iterateBoard(this.board.size)) {
            if (this.runAtCoordinate(coordinate)) {
                hasChanges = true;
            }
        }

        return hasChanges;
    }

    runAtCoordinate(coordinate: Coordinate): boolean {
        const cell = this.board.getCell(coordinate);
        if (cell && cell.getPossibleValues().length === 0) {
            cell.setCandidates(ObjectFacilities.createNumberSequence(this.board.size));
            return true;
        }

        return false;
    }
}
