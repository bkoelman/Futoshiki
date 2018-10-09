import { DraftCleaner } from './draft-cleaner';
import { Board } from './models/board';
import { Coordinate } from './models/coordinate';
import { Cell } from './models/cell';

export class DraftPromoter {
    constructor(private _cleaner: DraftCleaner, private _board: Board) {
    }

    promoteSingleDraftValues(cleanAfterPromote: boolean) {
        const cellsToPromote: { cell: Cell, coordinate: Coordinate, digit: number }[] = [];

        for (const coordinate of Coordinate.iterateBoard(this._board.size)) {
            const cell = this._board.getCell(coordinate);
            if (cell && cell.value === undefined) {
                const possibleValues = cell.getPossibleValues();
                if (possibleValues.length === 1) {
                    cellsToPromote.push({ cell: cell, coordinate: coordinate, digit: possibleValues[0] });
                }
            }
        }

        for (const { cell, coordinate, digit } of cellsToPromote) {
            cell.setUserValue(digit);

            if (cleanAfterPromote) {
                this._cleaner.reduceDraftValues(digit, coordinate);
            }
        }
    }
}
