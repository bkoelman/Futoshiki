import { Cell } from './cell';
import { Coordinate } from './coordinate';
import { MoveDirection } from './move-direction.enum';
import { ComparisonOperator } from './comparison-operator.enum';

export interface Board {
    readonly size: number;

    getCell(coordinate: Coordinate): Cell | undefined;
    getCoordinate(cell: Cell): Coordinate | undefined;
    getOperator(coordinate: Coordinate, direction: MoveDirection): ComparisonOperator;
}
