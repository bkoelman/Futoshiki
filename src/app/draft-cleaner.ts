import { BoardComponent } from './board/board.component';
import { Coordinate } from './coordinate';

export class DraftCleaner {
    private _boardSizeCached: number;

    constructor(private _board: BoardComponent) {
    }

    cleanupDraftValues(digit: number, coordinate: Coordinate): void {
        this.ensureCache();

        const coordinatesInRow = this.getCoordinatesInRow(coordinate.row, coordinate.column);
        this.cleanupValuesInSequence(coordinatesInRow, digit);

        const coordinatesInColumn = this.getCoordinatesInColumn(coordinate.column, coordinate.row);
        this.cleanupValuesInSequence(coordinatesInColumn, digit);

        // TODO: Handle operators
    }

    private ensureCache(): void {
        if (this._boardSizeCached !== this._board.boardSize) {
            this._boardSizeCached = this._board.boardSize;
        }
    }

    private getCoordinatesInRow(row: number, columnToSkip: number): Coordinate[] {
        const coordinates: Coordinate[] = [];

        for (let column = 1; column <= this._boardSizeCached; column++) {
            if (column !== columnToSkip) {
                coordinates.push(new Coordinate(row, column));
            }
        }

        return coordinates;
    }

    private getCoordinatesInColumn(column: number, rowToSkip: number): Coordinate[] {
        const coordinates: Coordinate[] = [];

        for (let row = 1; row <= this._boardSizeCached; row++) {
            if (row !== rowToSkip) {
                coordinates.push(new Coordinate(row, column));
            }
        }

        return coordinates;
    }

    private cleanupValuesInSequence(coordinatesInSequence: Coordinate[], digitToRemove: number): void {
        for (const coordinate of coordinatesInSequence) {
            const cell = this._board.getCellAtCoordinate(coordinate);
            if (cell) {
                cell.removeDraftValue(digitToRemove);
            }
        }
    }
}
