import { SolverStrategy } from './solver-strategy';
import { Board } from '../models/board';
import { GameSettings } from '../models/game-settings';
import { Coordinate } from '../models/coordinate';

export class PromoteSingleDraftValueStrategy implements SolverStrategy {
    readonly name = 'Promote Single Draft Value';

    constructor(private _board: Board) {
    }

    runAtBoard(settings: GameSettings): boolean {
        return false;
    }

    runAtCoordinate(coordinate: Coordinate, settings: GameSettings): boolean {
        return false;
    }
}
