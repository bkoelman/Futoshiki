import { SolverStrategy } from './solver-strategy';
import { Board } from '../models/board';
import { Coordinate } from '../models/coordinate';
import { CandidatePromoter } from '../candidate-promoter';
import { CandidateCleaner } from '../candidate-cleaner';

export class PromoteStrategy extends SolverStrategy {
    private _promoter: CandidatePromoter;

    constructor(board: Board) {
        super('Promote', board);

        const cleaner = new CandidateCleaner(board);
        this._promoter = new CandidatePromoter(cleaner, board);
    }

    runAtBoard(): boolean {
        const changeCount = this._promoter.promoteSingleCandidates(false);

        if (changeCount > 0) {
            this.reportChange(`Promoted ${changeCount} single-candidate cells.`);
        }

        return changeCount > 0;
    }

    runAtCoordinate(coordinate: Coordinate): boolean {
        const hasChanges = this._promoter.promoteSingleCandidateAt(coordinate, false);

        if (hasChanges) {
            this.reportChange(`Promoted single-candidate cell ${coordinate}.`);
        }

        return hasChanges;
    }
}
