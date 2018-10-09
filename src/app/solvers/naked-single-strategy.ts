import { SolverStrategy } from './solver-strategy';
import { Board } from '../models/board';
import { Coordinate } from '../models/coordinate';
import { DraftPromoter } from '../draft-promoter';
import { DraftCleaner } from '../draft-cleaner';

export class NakedSingleStrategy implements SolverStrategy {
    private _promoter: DraftPromoter;

    readonly name = 'Naked Single';

    constructor(private _board: Board) {
        const cleaner = new DraftCleaner(this._board);
        this._promoter = new DraftPromoter(cleaner, this._board);
    }

    runAtBoard(): boolean {
        return this._promoter.promoteSingleDraftValues(false);
    }

    runAtCoordinate(coordinate: Coordinate): boolean {
        return this._promoter.promoteSingleDraftValueAt(coordinate, false);
    }
}
