import { NumberSequenceService } from './number-sequence.service';
import { BoardComponent } from './board/board.component';
import { Coordinate } from './coordinate';

export class PuzzleSolver {
    private _numberSequenceService: NumberSequenceService = new NumberSequenceService();

    constructor(private _board: BoardComponent) {
    }

    getPossibleValuesAtCoordinate(coordinate: Coordinate): number[] {
        const possibleCellValues = new NumberSequenceService().createNumberSequence(this._board.boardSize);

        this.applyDuplicatesRule(coordinate, possibleCellValues);

        const isGreaterThanOperatorLeftToCell = this.getIsGreaterThanOperatorLeftToCell(coordinate);
        if (isGreaterThanOperatorLeftToCell !== undefined) {
            const otherCoordinate = coordinate.moveLeft();
            this.applyOperatorRule(isGreaterThanOperatorLeftToCell, otherCoordinate, possibleCellValues, coordinate);
        }

        const isGreaterThanOperatorRightToCell = this.getIsGreaterThanOperatorRightToCell(coordinate);
        if (isGreaterThanOperatorRightToCell !== undefined) {
            const otherCoordinate = coordinate.moveRight();
            this.applyOperatorRule(!isGreaterThanOperatorRightToCell, otherCoordinate, possibleCellValues, coordinate);
        }

        const isGreaterThanOperatorAboveCell = this.getIsGreaterThanOperatorAboveCell(coordinate);
        if (isGreaterThanOperatorAboveCell !== undefined) {
            const otherCoordinate = coordinate.moveUp();
            this.applyOperatorRule(isGreaterThanOperatorAboveCell, otherCoordinate, possibleCellValues, coordinate);
        }

        const isGreaterThanOperatorBelowCell = this.getIsGreaterThanOperatorBelowCell(coordinate);
        if (isGreaterThanOperatorBelowCell !== undefined) {
            const otherCoordinate = coordinate.moveDown();
            this.applyOperatorRule(!isGreaterThanOperatorBelowCell, otherCoordinate, possibleCellValues, coordinate);
        }

        return possibleCellValues;
    }

    private applyDuplicatesRule(coordinate: Coordinate, possibleCellValues: number[]) {
        const rowValuesInUse = this.getValuesInRow(coordinate.row, coordinate.column);
        const columnValuesInUse = this.getValuesInColumn(coordinate.column, coordinate.row);
        const valuesInUse = rowValuesInUse.concat(columnValuesInUse);

        if (valuesInUse.length > 0) {
            console.log(`Duplicates rule: removing ${valuesInUse} from cell (${coordinate.row},${coordinate.column}).`);
            this.removeNumbersFromArray(possibleCellValues, valuesInUse);
        }
    }

    private getValuesInRow(row: number, columnToSkip: number): number[] {
        const values = [];

        for (let column = 1; column <= this._board.boardSize; column++) {
            if (column !== columnToSkip) {
                const value = this.getCellValueAt(row, column);
                if (value !== undefined) {
                    values.push(value);
                }
            }
        }

        return values;
    }

    private getValuesInColumn(column: number, rowToSkip: number): number[] {
        const values = [];

        for (let row = 1; row <= this._board.boardSize; row++) {
            if (row !== rowToSkip) {
                const value = this.getCellValueAt(row, column);
                if (value !== undefined) {
                    values.push(value);
                }
            }
        }

        return values;
    }

    private getCellValueAt(row: number, column: number): number | undefined {
        const coordinate = new Coordinate(row, column);
        const cell = this._board.getCellAtCoordinate(coordinate);
        if (cell) {
            return cell.getSingleValue();
        }
    }

    private removeNumbersFromArray(targetArray: number[], numbersToRemove: number[]) {
        for (const numberToRemove of numbersToRemove) {
            const indexToRemove = targetArray.indexOf(numberToRemove);
            if (indexToRemove > -1) {
                targetArray.splice(indexToRemove, 1);
            }
        }
    }

    private applyOperatorRule(isGreaterThanOperator: boolean, otherCellCoordinate: Coordinate, possibleCellValues: number[],
        targetCell: Coordinate) {
        const otherCell = this._board.getCellAtCoordinate(otherCellCoordinate);

        if (isGreaterThanOperator) {
            const otherMaxValue = otherCell.getMaxValue();
            if (otherMaxValue !== undefined) {
                const generateCount = this._board.boardSize - otherMaxValue + 1;
                const numbersToRemove = this._numberSequenceService.createNumberSequence(generateCount, otherMaxValue);

                console.log(`Operator rule: removing ${numbersToRemove} from cell (${targetCell.row},${targetCell.column}).`);
                this.removeNumbersFromArray(possibleCellValues, numbersToRemove);
            }
        } else {
            const otherMinValue = otherCell.getMinValue();
            if (otherMinValue !== undefined) {
                const numbersToRemove = this._numberSequenceService.createNumberSequence(otherMinValue);

                console.log(`Operator rule: removing ${numbersToRemove} from cell (${targetCell.row},${targetCell.column}).`);
                this.removeNumbersFromArray(possibleCellValues, numbersToRemove);
            }
        }
    }

    private getIsGreaterThanOperatorLeftToCell(coordinate: Coordinate): boolean | undefined {
        if (coordinate.column > 1) {
            const lineSetOffset = this.getOffsetInLineArrayForCoordinate(coordinate);
            const leftOperator = this._board.puzzleLines[lineSetOffset.line][lineSetOffset.column - 1];
            if (leftOperator !== '_') {
                return leftOperator === ')';
            }
        }

        return undefined;
    }

    private getIsGreaterThanOperatorRightToCell(coordinate: Coordinate): boolean | undefined {
        if (coordinate.column < this._board.boardSize) {
            const lineSetOffset = this.getOffsetInLineArrayForCoordinate(coordinate);
            const rightOperator = this._board.puzzleLines[lineSetOffset.line][lineSetOffset.column + 1];
            if (rightOperator !== '_') {
                return rightOperator === ')';
            }
        }

        return undefined;
    }

    private getIsGreaterThanOperatorAboveCell(coordinate: Coordinate): boolean | undefined {
        if (coordinate.row > 1) {
            const lineSetOffset = this.getOffsetInLineArrayForCoordinate(coordinate);
            const aboveOperator = this._board.puzzleLines[lineSetOffset.line - 1][lineSetOffset.column];
            if (aboveOperator !== '_') {
                return aboveOperator === 'v';
            }
        }

        return undefined;
    }

    private getIsGreaterThanOperatorBelowCell(coordinate: Coordinate): boolean | undefined {
        if (coordinate.row < this._board.boardSize) {
            const lineSetOffset = this.getOffsetInLineArrayForCoordinate(coordinate);
            const belowOperator = this._board.puzzleLines[lineSetOffset.line + 1][lineSetOffset.column];
            if (belowOperator !== '_') {
                return belowOperator === 'v';
            }
        }

        return undefined;
    }

    private getOffsetInLineArrayForCoordinate(coordinate: Coordinate): { line: number, column: number } {
        return {
            line: (coordinate.row * 2) - 2,
            column: (coordinate.column * 2) - 2
        };
    }
}
