import { Board } from './models/board';
import { Coordinate } from './models/coordinate';
import { MoveCheckResult } from './models/move-check-result';

export class MoveChecker {
    private _boardSizeCached: number;

    constructor(private _board: Board) {
    }

    checkIsMoveAllowed(coordinate: Coordinate, digit: number): MoveCheckResult {
        this.ensureCache();

        const coordinatesInRow = coordinate.iterateRow(true);
        const coordinatesInColumn = coordinate.iterateColumn(true);
        const coordinateSequence = coordinatesInRow.concat(coordinatesInColumn);

        const violatingCoordinate = this.getViolatingCoordinate(coordinateSequence, digit);

        if (violatingCoordinate !== undefined) {
            return new MoveCheckResult(false, violatingCoordinate, undefined);
        }

        // TODO: Verify operators

        return MoveCheckResult.moveIsAllowed;
    }

    private ensureCache(): void {
        if (this._boardSizeCached !== this._board.size) {
            this._boardSizeCached = this._board.size;
        }
    }

    private getViolatingCoordinate(sequence: Coordinate[], digit: number): Coordinate | undefined {
        for (const coordinate of sequence) {
            const cell = this._board.getCell(coordinate);
            if (cell && cell.value === digit) {
                return coordinate;
            }
        }

        return undefined;
    }
}
