import { Board } from './models/board';
import { Coordinate } from './models/coordinate';
import { ComparisonOperator } from './models/comparison-operator.enum';
import { ObjectFacilities } from './object-facilities';
import { Cell } from './models/cell';
import { MoveDirection } from './models/move-direction.enum';
import { CoordinateSystem } from './coordinate-system';

export class DraftCleaner {
    private _boardSizeCached: number;

    constructor(private _board: Board) {
    }

    reduceDraftValues(digit: number, coordinate: Coordinate): void {
        this.ensureCache();

        this.reduceForSequences(coordinate, digit);
        this.reduceForOperators(coordinate, digit);
    }

    private ensureCache(): void {
        if (this._boardSizeCached !== this._board.size) {
            this._boardSizeCached = this._board.size;
        }
    }

    private reduceForSequences(coordinate: Coordinate, digit: number) {
        const coordinatesInRow = CoordinateSystem.getCoordinatesInRow(coordinate, true, this._boardSizeCached);
        this.reduceInSequence(coordinatesInRow, digit);

        const coordinatesInColumn = CoordinateSystem.getCoordinatesInColumn(coordinate, true, this._boardSizeCached);
        this.reduceInSequence(coordinatesInColumn, digit);
    }

    private reduceInSequence(coordinatesInSequence: Coordinate[], digitToRemove: number): void {
        for (const coordinate of coordinatesInSequence) {
            const cell = this._board.getCell(coordinate);
            if (cell) {
                cell.removeDraftValue(digitToRemove);
            }
        }
    }

    private reduceForOperators(coordinate: Coordinate, digit: number) {
        const comparisonToLeft = this._board.getOperator(coordinate, MoveDirection.Left);
        if (comparisonToLeft !== ComparisonOperator.None) {
            const isLessThanAdjacentCell = comparisonToLeft === ComparisonOperator.LessThan;
            this.reduceForOperator(isLessThanAdjacentCell, coordinate.moveOne(MoveDirection.Left), digit);
        }

        const comparisonToRight = this._board.getOperator(coordinate, MoveDirection.Right);
        if (comparisonToRight !== ComparisonOperator.None) {
            const isLessThanAdjacentCell = comparisonToRight === ComparisonOperator.LessThan;
            this.reduceForOperator(isLessThanAdjacentCell, coordinate.moveOne(MoveDirection.Right), digit);
        }

        const comparisonToAbove = this._board.getOperator(coordinate, MoveDirection.Up);
        if (comparisonToAbove !== ComparisonOperator.None) {
            const isLessThanAdjacentCell = comparisonToAbove === ComparisonOperator.LessThan;
            this.reduceForOperator(isLessThanAdjacentCell, coordinate.moveOne(MoveDirection.Up), digit);
        }

        const comparisonToBelow = this._board.getOperator(coordinate, MoveDirection.Down);
        if (comparisonToBelow !== ComparisonOperator.None) {
            const isLessThanAdjacentCell = comparisonToBelow === ComparisonOperator.LessThan;
            this.reduceForOperator(isLessThanAdjacentCell, coordinate.moveOne(MoveDirection.Down), digit);
        }
    }

    private reduceForOperator(isLessThanAdjacentCell: boolean, adjacentCellCoordinate: Coordinate,
        currentDigit: number): void {
        const adjacentCell = this._board.getCell(adjacentCellCoordinate);

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

    private removeDraftDigits(cell: Cell, digitsToRemove: number[]) {
        for (const digitToRemove of digitsToRemove) {
            cell.removeDraftValue(digitToRemove);
        }
    }
}
