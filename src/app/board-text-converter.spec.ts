import { BoardTextConverter } from './board-text-converter';
import { Coordinate } from './models/coordinate';
import { MoveDirection } from './models/move-direction.enum';
import { ComparisonOperator } from './models/comparison-operator.enum';
import { MemoryBoard } from './models/memory-board';

describe('BoardTextConverter', () => {
    let converter: BoardTextConverter;

    beforeEach(() => {
        converter = new BoardTextConverter();
    });

    describe('textToBoard', () => {
        it('should parse board correctly', () => {
            const text = `
                +----+----+-----+------+
                |    | 1  |     |      |
                +----+-^--+-----+------+
                |    |    |     | 1234 |
                +-v--+----+-----+------+
                | 23 < 24 | 123 |      |
                +----+----+-----+------+
                | 12 < !3 | !4  >  12  |
                +----+----+-----+------+
                `;

            const board = converter.textToBoard(text);

            expect(board.size).toBe(4);

            expect(board.getCell(Coordinate.fromText('A1', 4)).value).toBeUndefined();
            expect(board.getCell(Coordinate.fromText('A1', 4)).getPossibleValues().length).toBe(0);
            expect(board.getCell(Coordinate.fromText('A2', 4)).value).toBeUndefined();
            expect(board.getCell(Coordinate.fromText('A2', 4)).getPossibleValues().length).toBe(1);
            expect(board.getCell(Coordinate.fromText('A3', 4)).value).toBeUndefined();
            expect(board.getCell(Coordinate.fromText('A3', 4)).getPossibleValues().length).toBe(0);
            expect(board.getCell(Coordinate.fromText('A4', 4)).value).toBeUndefined();
            expect(board.getCell(Coordinate.fromText('A4', 4)).getPossibleValues().length).toBe(0);

            expect(board.getCell(Coordinate.fromText('B1', 4)).value).toBeUndefined();
            expect(board.getCell(Coordinate.fromText('B1', 4)).getPossibleValues().length).toBe(0);
            expect(board.getCell(Coordinate.fromText('B2', 4)).value).toBeUndefined();
            expect(board.getCell(Coordinate.fromText('B2', 4)).getPossibleValues().length).toBe(0);
            expect(board.getCell(Coordinate.fromText('B3', 4)).value).toBeUndefined();
            expect(board.getCell(Coordinate.fromText('B3', 4)).getPossibleValues().length).toBe(0);
            expect(board.getCell(Coordinate.fromText('B4', 4)).value).toBeUndefined();
            expect(board.getCell(Coordinate.fromText('B4', 4)).getPossibleValues().length).toBe(4);

            expect(board.getCell(Coordinate.fromText('C1', 4)).value).toBeUndefined();
            expect(board.getCell(Coordinate.fromText('C1', 4)).getPossibleValues().length).toBe(2);
            expect(board.getCell(Coordinate.fromText('C2', 4)).value).toBeUndefined();
            expect(board.getCell(Coordinate.fromText('C2', 4)).getPossibleValues().length).toBe(2);
            expect(board.getCell(Coordinate.fromText('C3', 4)).value).toBeUndefined();
            expect(board.getCell(Coordinate.fromText('C3', 4)).getPossibleValues().length).toBe(3);
            expect(board.getCell(Coordinate.fromText('C4', 4)).value).toBeUndefined();
            expect(board.getCell(Coordinate.fromText('C4', 4)).getPossibleValues().length).toBe(0);

            expect(board.getCell(Coordinate.fromText('D1', 4)).value).toBeUndefined();
            expect(board.getCell(Coordinate.fromText('D1', 4)).getPossibleValues().length).toBe(2);
            expect(board.getCell(Coordinate.fromText('D2', 4)).value).toBe(3);
            expect(board.getCell(Coordinate.fromText('D2', 4)).getPossibleValues().length).toBe(1);
            expect(board.getCell(Coordinate.fromText('D3', 4)).value).toBe(4);
            expect(board.getCell(Coordinate.fromText('D3', 4)).getPossibleValues().length).toBe(1);
            expect(board.getCell(Coordinate.fromText('D4', 4)).value).toBeUndefined();
            expect(board.getCell(Coordinate.fromText('D4', 4)).getPossibleValues().length).toBe(2);

            expect(board.getOperator(Coordinate.fromText('A2', 4), MoveDirection.Down)).toBe(ComparisonOperator.LessThan);
            expect(board.getOperator(Coordinate.fromText('B2', 4), MoveDirection.Up)).toBe(ComparisonOperator.GreaterThan);

            expect(board.getOperator(Coordinate.fromText('B1', 4), MoveDirection.Down)).toBe(ComparisonOperator.GreaterThan);
            expect(board.getOperator(Coordinate.fromText('C1', 4), MoveDirection.Up)).toBe(ComparisonOperator.LessThan);

            expect(board.getOperator(Coordinate.fromText('C1', 4), MoveDirection.Right)).toBe(ComparisonOperator.LessThan);
            expect(board.getOperator(Coordinate.fromText('C2', 4), MoveDirection.Left)).toBe(ComparisonOperator.GreaterThan);

            expect(board.getOperator(Coordinate.fromText('D3', 4), MoveDirection.Right)).toBe(ComparisonOperator.GreaterThan);
            expect(board.getOperator(Coordinate.fromText('D4', 4), MoveDirection.Left)).toBe(ComparisonOperator.LessThan);
        });
    });

    describe('boardToText', () => {
        it('should format board correctly', () => {
            const board = new MemoryBoard(4);

            board.getCell(Coordinate.fromText('A2', 4)).setDraftValues([1]);

            board.getCell(Coordinate.fromText('B4', 4)).setDraftValues([1, 2, 3, 4]);

            board.getCell(Coordinate.fromText('C1', 4)).setDraftValues([2, 3]);
            board.getCell(Coordinate.fromText('C2', 4)).setDraftValues([2, 4]);
            board.getCell(Coordinate.fromText('C3', 4)).setDraftValues([1, 2, 3]);

            board.getCell(Coordinate.fromText('D1', 4)).setDraftValues([1, 2]);
            board.getCell(Coordinate.fromText('D2', 4)).setUserValue(3);
            board.getCell(Coordinate.fromText('D3', 4)).setUserValue(4);
            board.getCell(Coordinate.fromText('D4', 4)).setDraftValues([1, 2]);

            board.setOperator(Coordinate.fromText('A2', 4), MoveDirection.Down, ComparisonOperator.LessThan);
            board.setOperator(Coordinate.fromText('C1', 4), MoveDirection.Up, ComparisonOperator.LessThan);
            board.setOperator(Coordinate.fromText('C1', 4), MoveDirection.Right, ComparisonOperator.LessThan);
            board.setOperator(Coordinate.fromText('D2', 4), MoveDirection.Left, ComparisonOperator.GreaterThan);
            board.setOperator(Coordinate.fromText('D3', 4), MoveDirection.Right, ComparisonOperator.GreaterThan);

            const formatted = converter.boardToText(board, ' '.repeat(16));

            expect('\n' + formatted).toBe(`
                +----+----+-----+------+
                |    | 1  |     |      |
                +----+-^--+-----+------+
                |    |    |     | 1234 |
                +-v--+----+-----+------+
                | 23 < 24 | 123 |      |
                +----+----+-----+------+
                | 12 < !3 | !4  >  12  |
                +----+----+-----+------+`);
        });
    });
});
