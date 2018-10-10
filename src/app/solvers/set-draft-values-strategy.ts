import { SolverStrategy } from './solver-strategy';
import { Coordinate } from '../models/coordinate';
import { Board } from '../models/board';
import { ObjectFacilities } from '../object-facilities';

export class SetDraftValuesStrategy implements SolverStrategy {
    readonly name = 'Set Draft Values';

    constructor(private _board: Board) {
    }

    runAtBoard(): boolean {
        let hasChanges = false;

        for (const coordinate of Coordinate.iterateBoard(this._board.size)) {
            if (this.runAtCoordinate(coordinate)) {
                hasChanges = true;
            }
        }

        return hasChanges;
    }

    runAtCoordinate(coordinate: Coordinate): boolean {
        const cell = this._board.getCell(coordinate);
        if (cell && cell.getPossibleValues().length === 0) {
            cell.setDraftValues(ObjectFacilities.createNumberSequence(this._board.size));
            return true;
        }

        return false;
    }
}
