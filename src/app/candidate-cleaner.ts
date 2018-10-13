import { Board } from './models/board';
import { Coordinate } from './models/coordinate';
import { ComparisonOperator } from './models/comparison-operator.enum';
import { Cell } from './models/cell';
import { MoveDirection } from './models/move-direction.enum';
import { SetFacilities } from './set-facilities';

export class CandidateCleaner {
    constructor(private _board: Board) {
    }

    reduceCandidates(digit: number, coordinate: Coordinate) {
        this.reduceForSequences(coordinate, digit);
        this.reduceForOperators(coordinate, digit);
    }

    private reduceForSequences(coordinate: Coordinate, digit: number) {
        const coordinatesInRow = coordinate.iterateRow(true);
        this.reduceInSequence(coordinatesInRow, digit);

        const coordinatesInColumn = coordinate.iterateColumn(true);
        this.reduceInSequence(coordinatesInColumn, digit);
    }

    private reduceInSequence(coordinatesInSequence: Coordinate[], digitToRemove: number) {
        for (const coordinate of coordinatesInSequence) {
            const cell = this._board.getCell(coordinate);
            if (cell) {
                cell.removeCandidate(digitToRemove);
            }
        }
    }

    private reduceForOperators(coordinate: Coordinate, digit: number) {
        for (const direction of [MoveDirection.Left, MoveDirection.Right, MoveDirection.Up, MoveDirection.Down]) {
            this.reduceForOperator(coordinate, direction, digit);
        }
    }

    private reduceForOperator(coordinate: Coordinate, direction: MoveDirection, digit: number) {
        if (coordinate.canMoveOne(direction)) {
            const operator = this._board.getOperator(coordinate, direction);
            if (operator !== ComparisonOperator.None) {
                const adjacentCoordinate = coordinate.moveOne(direction);
                const adjacentCell = this._board.getCell(adjacentCoordinate);

                if (adjacentCell && adjacentCell.value === undefined) {
                    if (operator === ComparisonOperator.LessThan) {
                        const adjacentMinValue = digit + 1;
                        const digitsToRemove = SetFacilities.createNumberSet(adjacentMinValue - 1);
                        this.removeCandidates(adjacentCell, digitsToRemove);
                    } else {
                        const adjacentMaxValue = digit - 1;
                        const generateCount = this._board.size - adjacentMaxValue;
                        const digitsToRemove = SetFacilities.createNumberSet(generateCount, adjacentMaxValue + 1);
                        this.removeCandidates(adjacentCell, digitsToRemove);
                    }
                }
            }
        }
    }

    private removeCandidates(cell: Cell, digitsToRemove: ReadonlySet<number>) {
        for (const digitToRemove of digitsToRemove) {
            cell.removeCandidate(digitToRemove);
        }
    }
}
