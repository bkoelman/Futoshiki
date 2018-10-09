import { Coordinate } from '../models/coordinate';

export interface SolverStrategy {
    readonly name: string;

    runAtBoard(): boolean;
    runAtCoordinate(coordinate: Coordinate): boolean;
}
