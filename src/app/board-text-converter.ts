import { MemoryBoard } from './models/memory-board';
import { Coordinate } from './models/coordinate';
import { MoveDirection } from './models/move-direction.enum';
import { ComparisonOperator, parseComparisonOperator, reverseOperator } from './models/comparison-operator.enum';
import { ObjectFacilities } from './object-facilities';
import { Board } from './models/board';
import { Cell } from './models/cell';
import { assertBoardSizeIsValid } from './assertions';

export class BoardTextConverter {
    textToBoard(text: string): MemoryBoard {
        const parser = new BoardTextParser(text);
        return parser.parse();
    }

    boardToText(board: Board, indent: string = ''): string {
        const formatter = new BoardTextFormatter(board, indent);
        return formatter.format();
    }
}

class BoardTextParser {
    private _lines: string[];
    private _size: number;
    private _board: MemoryBoard;
    private _lineIndex = 0;
    private _offsetInLine = 0;
    private _coordinate: Coordinate;

    constructor(text: string) {
        this._lines = text.split(/[\r\n]+/).map(line => line.trim()).filter(line => line.length > 0);
        const size = (this._lines.length - 1) / 2;

        assertBoardSizeIsValid(size);
        this._size = size;
        this._board = new MemoryBoard(this._size);
        this._coordinate = Coordinate.fromIndex(0, this._size);
    }

    parse(): MemoryBoard {
        for (this._lineIndex = 1; this._lineIndex < this._lines.length; this._lineIndex++) {
            if (this._lineIndex % 2 === 1) {
                this.parseDigitLine();
            } else {
                this.parseSeparatorLine();
            }
        }

        return this._board;
    }

    private parseDigitLine() {
        this._offsetInLine = 1;
        this._coordinate = this.getFirstCoordinateForCurrentLine(0);

        this.skipWhitespace();

        while (!this.isAtEndOfLine()) {
            const token = this.getCurrentToken();

            if (token === '|' || token === '<' || token === '>') {
                this.parseOperatorInDigitLine(token);
            } else if (token === '!' || token === '#') {
                this.parseSingleValueInDigitLine(token);
            } else if (this.charIsDigit(token)) {
                this.parseCandidatesInDigitLine();
            } else {
                throw new Error(`Invalid character '${token}' in cell ${this._coordinate}.`);
            }

            this.skipWhitespace();
        }
    }

    private getFirstCoordinateForCurrentLine(extraOffset: number) {
        const rowChar = String.fromCharCode((this._lineIndex - 1 - extraOffset) / 2 + Coordinate.charCodeA);
        return Coordinate.fromText(rowChar + '1', this._size);
    }

    private skipWhitespace() {
        const line = this._lines[this._lineIndex];

        while (this._offsetInLine < line.length && /\s/.test(line[this._offsetInLine])) {
            this.incrementOffsetInLine();
        }
    }

    private incrementOffsetInLine() {
        this._offsetInLine++;
    }

    private isAtEndOfLine(): boolean {
        const line = this._lines[this._lineIndex];
        return this._offsetInLine >= line.length;
    }

    private getCurrentToken(): string {
        return this._lines[this._lineIndex][this._offsetInLine];
    }

    private parseOperatorInDigitLine(token: string) {
        this.moveCoordinateToRight();

        const operator = parseComparisonOperator(token);
        if (operator !== ComparisonOperator.None) {
            this._board.setOperator(this._coordinate, MoveDirection.Left, reverseOperator(operator));
        }

        this.incrementOffsetInLine();
    }

    private moveCoordinateToRight() {
        const lineLength = this._lines[this._lineIndex].length;
        if (this._offsetInLine < lineLength - 1) {
            this._coordinate = this._coordinate.moveOne(MoveDirection.Right);
        }
    }

    private parseSingleValueInDigitLine(token: string) {
        this.incrementOffsetInLine();

        const digits = this.consumeDigits();
        if (digits.length === 0) {
            throw new Error(`Expect digit after '${token}' in cell ${this._coordinate}.`);
        } else if (digits.length > 1) {
            throw new Error(`Multiple digits found in cell ${this._coordinate}.`);
        }

        const cell = this._board.getCell(this._coordinate);
        if (!cell) {
            throw new Error(`Cell ${this._coordinate} not found.`);
        }

        if (token === '#') {
            cell.setFixedValue(digits[0]);
        } else {
            cell.setUserValue(digits[0]);
        }
    }

    private consumeDigits(): number[] {
        const digits: number[] = [];

        const line = this._lines[this._lineIndex];
        const maxDigit = this._size;

        while (this._offsetInLine < line.length && this.charIsDigit(line[this._offsetInLine])) {
            const digit = parseInt(line[this._offsetInLine], 10);
            if (digit > maxDigit) {
                throw new Error(`Digit '${digit}' exceeds maximum of ${maxDigit} in cell ${this._coordinate}.`);
            }
            digits.push(digit);

            this.incrementOffsetInLine();
        }

        return digits;
    }

    private charIsDigit(char: string): boolean {
        return char >= '1' && char <= '9';
    }

    private parseCandidatesInDigitLine() {
        const digits = this.consumeDigits();

        const uniqueDigits = ObjectFacilities.getUniqueArrayElements(digits);
        if (uniqueDigits.length !== digits.length) {
            throw new Error(`Duplicate digits found in cell ${this._coordinate}.`);
        }

        const cell = this._board.getCell(this._coordinate);
        if (!cell) {
            throw new Error(`Cell ${this._coordinate} not found.`);
        }

        cell.setCandidates(digits);
    }

    private parseSeparatorLine() {
        this._offsetInLine = 1;
        this._coordinate = this.getFirstCoordinateForCurrentLine(1);

        while (!this.isAtEndOfLine()) {
            this.skipDashes();

            const token = this.getCurrentToken();

            if (token === '+') {
                this.moveCoordinateToRight();
            } else if (token === '^' || token === 'v') {
                this.parseOperatorInSeparatorLine(token);
            } else {
                throw new Error(`Invalid character '${token}' near cell ${this._coordinate}.`);
            }

            this.incrementOffsetInLine();
        }
    }

    private skipDashes() {
        const line = this._lines[this._lineIndex];

        while (this._offsetInLine < line.length && line[this._offsetInLine] === '-') {
            this.incrementOffsetInLine();
        }
    }

    private parseOperatorInSeparatorLine(token: string) {
        const operator = parseComparisonOperator(token);
        if (operator !== ComparisonOperator.None) {
            this._board.setOperator(this._coordinate, MoveDirection.Down, operator);
        }
    }
}

class BoardTextFormatter {
    private _board: Board;
    private _indent: string;
    private _maxColumnWidths: number[] = [];
    private _cellOffset = 0;

    constructor(board: Board, indent: string) {
        this._board = board;
        this._indent = indent;
    }

    format(): string {
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
