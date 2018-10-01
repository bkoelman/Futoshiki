import { MemoryBoard } from './models/memory-board';
import { Coordinate } from './models/coordinate';
import { MoveDirection } from './models/move-direction.enum';
import { ComparisonOperator } from './models/comparison-operator.enum';
import { ObjectFacilities } from './object-facilities';
import { Board } from './models/board';
import { Cell } from './models/cell';

export class BoardTextConverter {
    /* Parses a board state to an in-memory object. For example:

        +----+----+-----+------+
        |    | 12 |     |      |
        +----+-^--+-----+------+
        |    |    |     | 1234 |
        +-^--+----+-----+------+
        | 23 < 24 | 123 |      |
        +----+----+-----+------+
        | 12 < !3 | !4  >  12  |
        +----+----+-----+------+
    */
    textToBoard(text: string): MemoryBoard {
        const lines = text.split(/[\r\n]+/).map(line => line.trim()).filter(line => line.length > 0);
        const size = (lines.length - 1) / 2;

        if (size < 4 || size > 9 || Math.floor(size) !== size) {
            throw new Error(`Invalid board size '${size}'.`);
        }

        const board = new MemoryBoard(size);

        for (let lineIndex = 1; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            if (lineIndex % 2 === 1) {
                const rowChar = String.fromCharCode((lineIndex - 1) / 2 + Coordinate.charCodeA);
                let coordinate = Coordinate.fromText(rowChar + '1', size);
                let columnIndex = this.skipWhitespace(line, 1);

                while (columnIndex < line.length) {
                    const ch = line[columnIndex];
                    if (ch === '|') {
                        if (columnIndex < line.length - 1) {
                            coordinate = coordinate.moveOne(MoveDirection.Right);
                        }
                        columnIndex++;
                    } else if (ch === '<') {
                        coordinate = coordinate.moveOne(MoveDirection.Right);
                        board.setOperator(coordinate, MoveDirection.Left, ComparisonOperator.GreaterThan);
                        columnIndex++;
                    } else if (ch === '>') {
                        coordinate = coordinate.moveOne(MoveDirection.Right);
                        board.setOperator(coordinate, MoveDirection.Left, ComparisonOperator.LessThan);
                        columnIndex++;
                    } else if (ch === '!' || ch === '#') {
                        columnIndex++;
                        const { newIndex, digits } = this.consumeDigits(line, columnIndex, size, coordinate);
                        if (digits.length === 0) {
                            throw new Error(`Invalid character '${ch}' in cell ${coordinate}.`);
                        } else if (digits.length > 1) {
                            throw new Error(`Multiple digits found in cell ${coordinate}.`);
                        }
                        const cell = board.getCell(coordinate);
                        if (!cell) {
                            throw new Error(`Cell ${coordinate} not found.`);
                        }
                        columnIndex = newIndex;
                        if (ch === '#') {
                            cell.setFixedValue(digits[0]);
                        } else {
                            cell.setUserValue(digits[0]);
                        }
                    } else if (this.charIsDigit(ch)) {
                        const { newIndex, digits } = this.consumeDigits(line, columnIndex, size, coordinate);
                        const uniqueDigits = ObjectFacilities.getUniqueArrayElements(digits);
                        if (uniqueDigits.length !== digits.length) {
                            throw new Error(`Duplicate digits found in cell ${coordinate}.`);
                        }
                        const cell = board.getCell(coordinate);
                        if (!cell) {
                            throw new Error(`Cell ${coordinate} not found.`);
                        }
                        columnIndex = newIndex;
                        cell.setDraftValues(digits);
                    } else {
                        throw new Error(`Invalid character '${ch}' in cell ${coordinate}.`);
                    }

                    columnIndex = this.skipWhitespace(line, columnIndex);
                }
            } else {
                const rowChar = String.fromCharCode((lineIndex - 2) / 2 + Coordinate.charCodeA);
                let coordinate = Coordinate.fromText(rowChar + '1', size);
                let columnIndex = 1;

                while (columnIndex < line.length) {
                    columnIndex = this.skipDashes(line, columnIndex);

                    const ch = line[columnIndex];
                    if (ch === '+') {
                        if (columnIndex < line.length - 1) {
                            coordinate = coordinate.moveOne(MoveDirection.Right);
                        }
                    } else if (ch === '^') {
                        board.setOperator(coordinate, MoveDirection.Down, ComparisonOperator.LessThan);
                    } else if (ch === 'v') {
                        board.setOperator(coordinate, MoveDirection.Down, ComparisonOperator.GreaterThan);
                    } else {
                        throw new Error(`Invalid character '${ch}' near cell ${coordinate}.`);
                    }

                    columnIndex++;
                }
            }
        }

        return board;
    }

    private skipWhitespace(text: string, start: number): number {
        let index = start;
        while (index < text.length && /\s/.test(text[index])) {
            index++;
        }
        return index;
    }

    private skipDashes(text: string, start: number): number {
        let index = start;
        while (index < text.length && text[index] === '-') {
            index++;
        }
        return index;
    }

    private consumeDigits(text: string, start: number, maxDigit: number, coordinate: Coordinate): { newIndex: number, digits: number[] } {
        const digits: number[] = [];
        let index = start;

        while (index < text.length && this.charIsDigit(text[index])) {
            const digit = parseInt(text[index], 10);
            if (digit > maxDigit) {
                throw new Error(`Digit '${digit}' exceeds maximum of ${maxDigit} in cell ${coordinate}.`);
            }
            digits.push(digit);
            index++;
        }

        return {
            newIndex: index,
            digits: digits
        };
    }

    private charIsDigit(char: string): boolean {
        return char >= '1' && char <= '9';
    }

    boardToText(board: Board, indent: string = ''): string {
        const formatter = new BoardTextFormatter(board);
        return formatter.format(indent);
    }
}

class BoardTextFormatter {
    private _board: Board;
    private _indent = '';
    private _maxColumnWidths: number[];
    private _cellOffset = 0;

    constructor(board: Board) {
        this._board = board;
    }

    format(indent: string): string {
        this._indent = indent;
        this._maxColumnWidths = this.calculateMaxColumnWidths();
        this._cellOffset = 0;

        const lines: string[] = [];

        for (const rowCoordinate of Coordinate.fromIndex(0, this._board.size).iterateColumn(false)) {
            const separatorLine = this.formatSeparatorLine(rowCoordinate);
            lines.push(separatorLine);

            this.rewindToFirstCellInCurrentRow();

            const digitLine = this.formatDigitLine(rowCoordinate);
            lines.push(digitLine);
        }

        lines.push(lines[0]);
        return lines.join('\n');
    }

    private calculateMaxColumnWidths(): number[] {
        this._cellOffset = 0;
        const maxColumnWidths: number[] = [];

        for (const coordinate of Coordinate.iterateBoard(this._board.size)) {
            const cell = this._board.getCell(coordinate);
            if (cell) {
                let width = cell.getPossibleValues().length;
                if (cell.value !== undefined) {
                    width++;
                }

                const columnIndex = this.getColumnIndex();
                const previousWidth = maxColumnWidths[columnIndex];
                if (previousWidth === undefined || previousWidth < width) {
                    maxColumnWidths[columnIndex] = width;
                }
            }

            this.moveToNextCell();
        }

        return maxColumnWidths;
    }

    private getColumnIndex(): number {
        return this._cellOffset % this._board.size;
    }

    private formatSeparatorLine(rowCoordinate: Coordinate): string {
        let line = this._indent + '+';

        for (const coordinate of rowCoordinate.iterateRow(false)) {
            const isFirstRow = this._cellOffset < this._board.size;
            const operatorValue = isFirstRow ? ComparisonOperator.None : this._board.getOperator(coordinate, MoveDirection.Up);
            const operatorText = this.formatOperatorInSeparatorLine(operatorValue);

            const width = this.getCurrentColumnWidth();
            line += this.centerText(operatorText, width + 2, '-') + '+';

            this.moveToNextCell();
        }

        return line;
    }

    private formatOperatorInSeparatorLine(operator: ComparisonOperator): string {
        switch (operator) {
            case ComparisonOperator.None:
                return '-';
            case ComparisonOperator.LessThan:
                return 'v';
            case ComparisonOperator.GreaterThan:
                return '^';
            default:
                return '';
        }
    }

    private getCurrentColumnWidth(): number {
        const columnIndex = this.getColumnIndex();
        return this._maxColumnWidths[columnIndex];
    }

    private centerText(text: string, width: number, spacer: string) {
        while (width - text.length > 0) {
            if ((width - text.length) % 2 === 0) {
                text = spacer + text;
            } else {
                text += spacer;
            }
        }

        return text;
    }

    private moveToNextCell() {
        this._cellOffset++;
    }

    private rewindToFirstCellInCurrentRow() {
        this._cellOffset -= this._board.size;
    }

    private formatDigitLine(rowCoordinate: Coordinate): string {
        let line = this._indent + '|';

        for (const coordinate of rowCoordinate.iterateRow(false)) {
            const cell = this._board.getCell(coordinate);
            if (cell) {
                const value = this.formatCellValue(cell);
                const width = this.getCurrentColumnWidth();
                line += this.centerText(value, width + 2, ' ');

                const columnIndex = this.getColumnIndex();
                const isLastColumn = columnIndex === this._board.size - 1;
                const operator = isLastColumn ? ComparisonOperator.None : this._board.getOperator(coordinate, MoveDirection.Right);

                line += this.formatOperatorInDigitLine(operator);
            }

            this.moveToNextCell();
        }

        return line;
    }

    private formatCellValue(cell: Cell): string {
        if (cell.isFixed) {
            return '#' + cell.value;
        }
        if (cell.value !== undefined) {
            return '!' + cell.value;
        }
        return cell.getPossibleValues().join('');
    }

    private formatOperatorInDigitLine(operator: ComparisonOperator): string {
        switch (operator) {
            case ComparisonOperator.None:
                return '|';
            case ComparisonOperator.LessThan:
                return '<';
            case ComparisonOperator.GreaterThan:
                return '>';
            default:
                return '';
        }
    }
}
