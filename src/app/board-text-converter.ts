import { MemoryBoard } from './models/memory-board';
import { Coordinate } from './models/coordinate';
import { MoveDirection } from './models/move-direction.enum';
import { ComparisonOperator } from './models/comparison-operator.enum';
import { ObjectFacilities } from './object-facilities';
import { Board } from './models/board';

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
                    } else if (ch === '!') {
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
                        cell.setUserValue(digits[0]);
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
        const maxColumnWidths = this.calculateMaxColumnWidths(board);
        const lines: string[] = [];

        let offset = 0;
        for (const rowCoordinate of Coordinate.fromIndex(0, board.size).iterateColumn(false)) {
            let line = '+';

            for (const coordinate of rowCoordinate.iterateRow(false)) {
                const isFirstRow = offset < board.size;
                const operator = isFirstRow ? ComparisonOperator.None : board.getOperator(coordinate, MoveDirection.Up);

                let value = '';
                switch (operator) {
                    case ComparisonOperator.None:
                        value += '-';
                        break;
                    case ComparisonOperator.LessThan:
                        value += 'v';
                        break;
                    case ComparisonOperator.GreaterThan:
                        value += '^';
                        break;
                }

                const columnIndex = offset % board.size;
                const width = maxColumnWidths[columnIndex];
                line += this.centerText(value, width + 2, '-') + '+';

                offset++;
            }

            lines.push(indent + line);

            line = '|';
            offset -= board.size;

            for (const coordinate of rowCoordinate.iterateRow(false)) {
                const cell = board.getCell(coordinate);
                if (cell) {
                    const value = cell.value !== undefined ? '!' + cell.value : cell.getPossibleValues().join('');
                    const columnIndex = offset % board.size;
                    const width = maxColumnWidths[columnIndex];
                    line += this.centerText(value, width + 2, ' ');

                    const isLastColumn = columnIndex === board.size - 1;
                    const operator = isLastColumn ? ComparisonOperator.None : board.getOperator(coordinate, MoveDirection.Right);
                    switch (operator) {
                        case ComparisonOperator.None:
                            line += '|';
                            break;
                        case ComparisonOperator.LessThan:
                            line += '<';
                            break;
                        case ComparisonOperator.GreaterThan:
                            line += '>';
                            break;
                    }
                }

                offset++;
            }

            lines.push(indent + line);
        }

        lines.push(lines[0]);

        return lines.join('\n');
    }

    private calculateMaxColumnWidths(board: Board): number[] {
        const maxColumnWidths: number[] = [];

        let offset = 0;
        for (const coordinate of Coordinate.iterateBoard(board.size)) {

            const cell = board.getCell(coordinate);
            if (cell) {
                let width = cell.getPossibleValues().length;
                if (cell.value !== undefined) {
                    width++;
                }

                const columnIndex = offset % board.size;
                const lastWidth = maxColumnWidths[columnIndex];
                if (lastWidth === undefined || lastWidth < width) {
                    maxColumnWidths[columnIndex] = width;
                }
            }

            offset++;
        }

        return maxColumnWidths;
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
}
