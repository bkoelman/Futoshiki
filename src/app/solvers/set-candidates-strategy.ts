import { SolverStrategy } from './solver-strategy';
import { Coordinate } from '../models/coordinate';
import { Board } from '../models/board';

export class SetCandidatesStrategy extends SolverStrategy {
    constructor(board: Board) {
        super('Set Candidates', board);
    }

    runAtBoard(): boolean {
        let changeCount = 0;

        for (const coordinate of Coordinate.iterateBoard(this.board.size)) {
            if (this.innerRunAtCoordinate(coordinate)) {
                changeCount++;
            }
        }

        if (changeCount > 0) {
            this.reportChange(`Placed candidates in ${changeCount} empty cells.`);
        }

        return changeCount > 0;
    }

    runAtCoordinate(coordinate: Coordinate): boolean {
        const hasChanges = this.innerRunAtCoordinate(coordinate);

        if (hasChanges) {
            this.reportChange(`Placed candidates in empty cell ${coordinate}.`);
        }

        return hasChanges;
    }

    private innerRunAtCoordinate(coordinate: Coordinate): boolean {
        const cell = this.board.getCell(coordinate);
        if (cell && cell.isEmpty) {
            cell.setCandidates(this.allCellValues);
            return true;
        }

        return false;
    }
}
