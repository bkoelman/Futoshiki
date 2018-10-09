import { SolverStrategy } from './solver-strategy';
import { Board } from '../models/board';
import { GameSettings } from '../models/game-settings';
import { Coordinate } from '../models/coordinate';
import { DraftPromoter } from '../draft-promoter';
import { DraftCleaner } from '../draft-cleaner';

export class PromoteSingleDraftValueStrategy implements SolverStrategy {
    private _promoter: DraftPromoter;

    readonly name = 'Promote Single Draft Value';

    constructor(private _board: Board) {
        const cleaner = new DraftCleaner(this._board);
        this._promoter = new DraftPromoter(cleaner, this._board);
    }

    runAtBoard(settings: GameSettings): boolean {
        return this._promoter.promoteSingleDraftValues(settings.autoCleanDraftValues);
    }

    runAtCoordinate(coordinate: Coordinate, settings: GameSettings): boolean {
        return this._promoter.promoteSingleDraftValueAt(coordinate, false);
    }
}
