import { Coordinate } from '../models/coordinate';
import { Board } from '../models/board';

export abstract class SolverStrategy {
    protected constructor(readonly name: string, readonly board: Board) {
    }

    abstract runAtBoard(): boolean;
    abstract runAtCoordinate(coordinate: Coordinate): boolean;

    protected reportChange(message: string) {
        console.log(`*STEP* [${this.name}] ${message}`);
    }
}
