import { BoardComponent } from './board/board.component';
import { Coordinate } from './coordinate';
import { ComparisonOperator, parseComparisonOperator, reverseOperator } from './comparison-operator.enum';
import { ObjectFacilities } from './object-facilities';
import { DigitCellComponent } from './digit-cell/digit-cell.component';

export class DraftCleaner {
    private _boardSizeCached: number;

    constructor(private _board: BoardComponent) {
    }

    reduceDraftValues(digit: number, coordinate: Coordinate): void {
        this.ensureCache();

        this.reduceForSequences(coordinate, digit);
        this.reduceForOperators(coordinate, digit);
    }

    private ensureCache(): void {
        if (this._boardSizeCached !== this._board.boardSize) {
            this._boardSizeCached = this._board.boardSize;
        }
    }

    private reduceForSequences(coordinate: Coordinate, digit: number) {
        const coordinatesInRow = this.getCoordinatesInRow(coordinate.row, coordinate.column);
        this.reduceInSequence(coordinatesInRow, digit);

        const coordinatesInColumn = this.getCoordinatesInColumn(coordinate.column, coordinate.row);
        this.reduceInSequence(coordinatesInColumn, digit);
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

    private reduceInSequence(coordinatesInSequence: Coordinate[], digitToRemove: number): void {
        for (const coordinate of coordinatesInSequence) {
            const cell = this._board.getCellAtCoordinate(coordinate);
            if (cell) {
                cell.removeDraftValue(digitToRemove);
            }
        }
    }

    private reduceForOperators(coordinate: Coordinate, digit: number) {
        const comparisonToLeft = this.getComparisonToLeftCell(coordinate);
        if (comparisonToLeft !== ComparisonOperator.None) {
            const isLessThanAdjacentCell = comparisonToLeft === ComparisonOperator.LessThan;
            this.reduceForOperator(isLessThanAdjacentCell, coordinate.moveLeft(), digit);
        }

        const comparisonToRight = this.getComparisonToRightCell(coordinate);
        if (comparisonToRight !== ComparisonOperator.None) {
            const isLessThanAdjacentCell = comparisonToRight === ComparisonOperator.LessThan;
            this.reduceForOperator(isLessThanAdjacentCell, coordinate.moveRight(), digit);
        }

        const comparisonToAbove = this.getComparisonToAboveCell(coordinate);
        if (comparisonToAbove !== ComparisonOperator.None) {
            const isLessThanAdjacentCell = comparisonToAbove === ComparisonOperator.LessThan;
            this.reduceForOperator(isLessThanAdjacentCell, coordinate.moveUp(), digit);
        }

        const comparisonToBelow = this.getComparisonToBelowCell(coordinate);
        if (comparisonToBelow !== ComparisonOperator.None) {
            const isLessThanAdjacentCell = comparisonToBelow === ComparisonOperator.LessThan;
            this.reduceForOperator(isLessThanAdjacentCell, coordinate.moveDown(), digit);
        }
    }

    private getComparisonToLeftCell(coordinate: Coordinate): ComparisonOperator {
        if (coordinate.column > 1) {
            const offset = this.getOffsetInLineArrayForCoordinate(coordinate);
            const operatorChar = this._board.puzzleLines[offset.line][offset.column - 1];
            return reverseOperator(parseComparisonOperator(operatorChar));
        }

        return ComparisonOperator.None;
    }

    private getComparisonToRightCell(coordinate: Coordinate): ComparisonOperator {
        if (coordinate.column < this._boardSizeCached) {
            const lineSetOffset = this.getOffsetInLineArrayForCoordinate(coordinate);
            const operatorChar = this._board.puzzleLines[lineSetOffset.line][lineSetOffset.column + 1];
            return parseComparisonOperator(operatorChar);
        }

        return ComparisonOperator.None;
    }

    private getComparisonToAboveCell(coordinate: Coordinate): ComparisonOperator {
        if (coordinate.row > 1) {
            const lineSetOffset = this.getOffsetInLineArrayForCoordinate(coordinate);
            const operatorChar = this._board.puzzleLines[lineSetOffset.line - 1][lineSetOffset.column];
            return reverseOperator(parseComparisonOperator(operatorChar));
        }

        return ComparisonOperator.None;
    }

    private getComparisonToBelowCell(coordinate: Coordinate): ComparisonOperator {
        if (coordinate.row < this._boardSizeCached) {
            const lineSetOffset = this.getOffsetInLineArrayForCoordinate(coordinate);
            const operatorChar = this._board.puzzleLines[lineSetOffset.line + 1][lineSetOffset.column];
            return parseComparisonOperator(operatorChar);
        }

        return ComparisonOperator.None;
    }

    private getOffsetInLineArrayForCoordinate(coordinate: Coordinate): { line: number, column: number } {
        return {
            line: (coordinate.row * 2) - 2,
            column: (coordinate.column * 2) - 2
        };
    }

    private reduceForOperator(isLessThanAdjacentCell: boolean, adjacentCellCoordinate: Coordinate,
        currentDigit: number): void {
        const adjacentCell = this._board.getCellAtCoordinate(adjacentCellCoordinate);

        if (isLessThanAdjacentCell) {
            const adjacentMinValue = currentDigit + 1;
            const digitsToRemove = ObjectFacilities.createNumberSequence(adjacentMinValue - 1);
            this.removeDraftDigits(adjacentCell, digitsToRemove);
        } else {
            const adjacentMaxValue = currentDigit - 1;
            const generateCount = this._boardSizeCached - adjacentMaxValue;
            const digitsToRemove = ObjectFacilities.createNumberSequence(generateCount, adjacentMaxValue + 1);
            this.removeDraftDigits(adjacentCell, digitsToRemove);
        }
    }

    private removeDraftDigits(cell: DigitCellComponent, digitsToRemove: number[]) {
        for (const digitToRemove of digitsToRemove) {
            cell.removeDraftValue(digitToRemove);
        }
    }
}
