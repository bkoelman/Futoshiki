import { SolverStrategy } from './solver-strategy';
import { Coordinate } from '../models/coordinate';
import { Board } from '../models/board';

export class NakedSingleStrategy extends SolverStrategy {
    constructor(board: Board) {
        super('Naked Single', board);
    }

    runAtBoard(): boolean {
        for (const coordinate of Coordinate.iterateBoard(this.board.size)) {
            const digit = this.getSingleDigitAt(coordinate);
            if (digit !== undefined) {
                let changeCount = 0;

                for (const nextCoordinate of coordinate.iterateRow(true).concat(coordinate.iterateColumn(true))) {
                    if (this.removeCandidateFromCell(nextCoordinate, digit)) {
                        changeCount++;
                    }
                }

                if (changeCount > 0) {
                    this.reportChange(`Naked single (${digit}) in cell ${coordinate} ` +
                        `eliminated '${digit}' from ${changeCount} other cells in related row and column.`);
                    return true;
                }
            }
        }

        return false;
    }

    runAtCoordinate(coordinate: Coordinate): boolean {
        for (const nextCoordinate of coordinate.iterateRow(true).concat(coordinate.iterateColumn(true))) {
            const digit = this.getSingleDigitAt(nextCoordinate);
            if (digit !== undefined) {
                const hasChanges = this.removeCandidateFromCell(coordinate, digit);

                if (hasChanges) {
                    this.reportChange(`Naked single (${digit}) in cell ${nextCoordinate} eliminated '${digit}' from ${coordinate}.`);
                    return true;
                }
            }
        }

        return false;
    }

    private getSingleDigitAt(coordinate: Coordinate): number | undefined {
        const digits = this.getPossibleDigitsForCell(coordinate);
        if (digits.size === 1) {
            return [...digits][0];
        }

        return undefined;
    }
}
