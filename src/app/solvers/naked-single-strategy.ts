import { SolverStrategy } from './solver-strategy';
import { Board } from '../models/board';
import { Coordinate } from '../models/coordinate';
import { DraftPromoter } from '../draft-promoter';
import { DraftCleaner } from '../draft-cleaner';

export class NakedSingleStrategy extends SolverStrategy {
    private _promoter: DraftPromoter;

    constructor(board: Board) {
        super('Naked Single', board);

        const cleaner = new DraftCleaner(board);
        this._promoter = new DraftPromoter(cleaner, board);
    }

    runAtBoard(): boolean {
        return this._promoter.promoteSingleDraftValues(false);
    }

    runAtCoordinate(coordinate: Coordinate): boolean {
        return this._promoter.promoteSingleDraftValueAt(coordinate, false);
    }
}
