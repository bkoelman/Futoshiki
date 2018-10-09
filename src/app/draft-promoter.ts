import { DraftCleaner } from './draft-cleaner';
import { Board } from './models/board';
import { Coordinate } from './models/coordinate';
import { Cell } from './models/cell';

export class DraftPromoter {
    constructor(private _cleaner: DraftCleaner, private _board: Board) {
    }

    promoteSingleDraftValueAt(coordinate: Coordinate, cleanAfterPromote: boolean): boolean {
        const cellToPromote = this.getCellToPromote(coordinate);
        if (cellToPromote) {
            cellToPromote.cell.setUserValue(cellToPromote.digit);

            if (cleanAfterPromote) {
                this._cleaner.reduceDraftValues(cellToPromote.digit, coordinate);
            }

            return true;
        }

        return false;
    }

    promoteSingleDraftValues(cleanAfterPromote: boolean): boolean {
        const cellsToPromote: { cell: Cell, coordinate: Coordinate, digit: number }[] = [];

        for (const coordinate of Coordinate.iterateBoard(this._board.size)) {
            const cellToPromote = this.getCellToPromote(coordinate);
            if (cellToPromote) {
                cellsToPromote.push(cellToPromote);
            }
        }

        for (const { cell, coordinate, digit } of cellsToPromote) {
            cell.setUserValue(digit);

            if (cleanAfterPromote) {
                this._cleaner.reduceDraftValues(digit, coordinate);
            }
        }

        return cellsToPromote.length > 0;
    }

    private getCellToPromote(coordinate: Coordinate): { cell: Cell, coordinate: Coordinate, digit: number } | undefined {
        const cell = this._board.getCell(coordinate);
        if (cell && cell.value === undefined) {
            const possibleValues = cell.getPossibleValues();
            if (possibleValues.length === 1) {
                return { cell: cell, coordinate: coordinate, digit: possibleValues[0] };
            }
        }

        return undefined;
    }
}
