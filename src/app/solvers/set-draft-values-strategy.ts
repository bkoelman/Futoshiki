import { SolverStrategy } from './solver-strategy';
import { Board } from '../models/board';
import { GameSettings } from '../models/game-settings';
import { Coordinate } from '../models/coordinate';

export class SetDraftValuesStrategy implements SolverStrategy {
    readonly name = 'Set Draft Values';

    constructor(private _board: Board) {
    }

    runAtBoard(settings: GameSettings): boolean {
        return false;
    }

    runAtCoordinate(coordinate: Coordinate, settings: GameSettings): boolean {
        return false;
    }
}
