import { Coordinate } from './models/coordinate';

export class CoordinateSystem {
    static getCoordinatesInRow(coordinate: Coordinate, skipSelf: boolean, boardSize: number): Coordinate[] {
        const coordinates: Coordinate[] = [];

        for (let column = 1; column <= boardSize; column++) {
            if (!skipSelf || column !== coordinate.column) {
                coordinates.push(new Coordinate(coordinate.row, column));
            }
        }

        return coordinates;
    }

    static getCoordinatesInColumn(coordinate: Coordinate, skipSelf: boolean, boardSize: number): Coordinate[] {
        const coordinates: Coordinate[] = [];

        for (let row = 1; row <= boardSize; row++) {
            if (!skipSelf || row !== coordinate.row) {
                coordinates.push(new Coordinate(row, coordinate.column));
            }
        }

        return coordinates;
    }
}
