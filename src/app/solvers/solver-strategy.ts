import { Coordinate } from '../models/coordinate';
import { GameSettings } from '../models/game-settings';

export interface SolverStrategy {
    readonly name: string;

    runAtBoard(settings: GameSettings): boolean;
    runAtCoordinate(coordinate: Coordinate, settings: GameSettings): boolean;
}
