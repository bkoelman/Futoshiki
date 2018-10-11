import { SolverStrategy } from './solver-strategy';
import { Board } from '../models/board';
import { Coordinate } from '../models/coordinate';
import { CandidatePromoter } from '../candidate-promoter';
import { CandidateCleaner } from '../candidate-cleaner';

export class NakedSingleStrategy extends SolverStrategy {
    private _promoter: CandidatePromoter;

    constructor(board: Board) {
        super('Naked Single (Promote)', board);

        const cleaner = new CandidateCleaner(board);
        this._promoter = new CandidatePromoter(cleaner, board);
    }

    runAtBoard(): boolean {
        return this._promoter.promoteSingleCandidates(false);
    }

    runAtCoordinate(coordinate: Coordinate): boolean {
        return this._promoter.promoteSingleCandidateAt(coordinate, false);
    }
}
