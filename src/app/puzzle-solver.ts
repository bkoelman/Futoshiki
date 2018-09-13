import { NumberSequenceService } from './number-sequence.service';
import { BoardComponent } from './board/board.component';
import { Coordinate } from './coordinate';

export class PuzzleSolver {
    private _numberSequenceService: NumberSequenceService = new NumberSequenceService();

    constructor(private _board: BoardComponent) {
    }

    getPossibleValuesAtCoordinate(coordinate: Coordinate): number[] {
        // TODO: Take operators into account.

        const rowValuesInUse = this.getValuesInRow(coordinate.row);
        const columnValuesInUse = this.getValuesInColumn(coordinate.column);
        const valuesInUse = this.distinct(rowValuesInUse.concat(columnValuesInUse));

        const valueSet = new NumberSequenceService().createNumberSequence(this._board.boardSize);

        const result = [];
        for (const value of valueSet) {
            if (valuesInUse.indexOf(value) < 0) {
                result.push(value);
            }
        }
        return result;
    }

    private distinct<T>(values: T[]): T[] {
        return values.filter((value, index, array) => array.indexOf(value) === index);
    }

    private getValuesInRow(row: number): number[] {
        const values = [];

        for (let column = 1; column <= this._board.boardSize; column++) {
            const coordinate = new Coordinate(row, column);
            const cell = this._board.getCellAtCoordinate(coordinate);
            if (cell && cell.value !== undefined) {
                values.push(cell.value);
            }
        }

        return values;
    }

    private getValuesInColumn(column: number): number[] {
        const values = [];

        for (let row = 1; row <= this._board.boardSize; row++) {
            const coordinate = new Coordinate(row, column);
            const cell = this._board.getCellAtCoordinate(coordinate);
            if (cell && cell.value !== undefined) {
                values.push(cell.value);
            }
        }

        return values;
    }
}
