import { Coordinate } from './models/coordinate';
import { Board } from './models/board';
import { GameSettings } from './models/game-settings';
import { SolverStrategy } from './solvers/solver-strategy';
import { SetDraftValuesStrategy } from './solvers/set-draft-values-strategy';
import { PromoteSingleDraftValueStrategy } from './solvers/promote-single-draft-value-strategy';

export class HintProvider {
    private _strategies: SolverStrategy[];

    constructor(board: Board) {
        this._strategies = [
            new PromoteSingleDraftValueStrategy(board),
            new SetDraftValuesStrategy(board)
        ];
    }

    runAtBoard(settings: GameSettings): boolean {
        for (const strategy of this._strategies) {
            console.log('Running strategy: ' + strategy.name);
            if (strategy.runAtBoard(settings)) {
                return true;
            }
        }

        return false;
    }

    runAtCoordinate(coordinate: Coordinate, settings: GameSettings): boolean {
        for (const strategy of this._strategies) {
            console.log('Running strategy: ' + strategy.name);
            if (strategy.runAtCoordinate(coordinate, settings)) {
                return true;
            }
        }

        return false;
    }
}
