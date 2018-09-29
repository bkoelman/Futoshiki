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

            expect(board.getCell(new Coordinate(1, 1)).value).toBeUndefined();
            expect(board.getCell(new Coordinate(1, 1)).getPossibleValues().length).toBe(0);
            expect(board.getCell(new Coordinate(1, 2)).value).toBeUndefined();
            expect(board.getCell(new Coordinate(1, 2)).getPossibleValues().length).toBe(1);
            expect(board.getCell(new Coordinate(1, 3)).value).toBeUndefined();
            expect(board.getCell(new Coordinate(1, 3)).getPossibleValues().length).toBe(0);
            expect(board.getCell(new Coordinate(1, 4)).value).toBeUndefined();
            expect(board.getCell(new Coordinate(1, 4)).getPossibleValues().length).toBe(0);

            expect(board.getCell(new Coordinate(2, 1)).value).toBeUndefined();
            expect(board.getCell(new Coordinate(2, 1)).getPossibleValues().length).toBe(0);
            expect(board.getCell(new Coordinate(2, 2)).value).toBeUndefined();
            expect(board.getCell(new Coordinate(2, 2)).getPossibleValues().length).toBe(0);
            expect(board.getCell(new Coordinate(2, 3)).value).toBeUndefined();
            expect(board.getCell(new Coordinate(2, 3)).getPossibleValues().length).toBe(0);
            expect(board.getCell(new Coordinate(2, 4)).value).toBeUndefined();
            expect(board.getCell(new Coordinate(2, 4)).getPossibleValues().length).toBe(4);

            expect(board.getCell(new Coordinate(3, 1)).value).toBeUndefined();
            expect(board.getCell(new Coordinate(3, 1)).getPossibleValues().length).toBe(2);
            expect(board.getCell(new Coordinate(3, 2)).value).toBeUndefined();
            expect(board.getCell(new Coordinate(3, 2)).getPossibleValues().length).toBe(2);
            expect(board.getCell(new Coordinate(3, 3)).value).toBeUndefined();
            expect(board.getCell(new Coordinate(3, 3)).getPossibleValues().length).toBe(3);
            expect(board.getCell(new Coordinate(3, 4)).value).toBeUndefined();
            expect(board.getCell(new Coordinate(3, 4)).getPossibleValues().length).toBe(0);

            expect(board.getCell(new Coordinate(4, 1)).value).toBeUndefined();
            expect(board.getCell(new Coordinate(4, 1)).getPossibleValues().length).toBe(2);
            expect(board.getCell(new Coordinate(4, 2)).value).toBe(3);
            expect(board.getCell(new Coordinate(4, 2)).getPossibleValues().length).toBe(1);
            expect(board.getCell(new Coordinate(4, 3)).value).toBe(4);
            expect(board.getCell(new Coordinate(4, 3)).getPossibleValues().length).toBe(1);
            expect(board.getCell(new Coordinate(4, 4)).value).toBeUndefined();
            expect(board.getCell(new Coordinate(4, 4)).getPossibleValues().length).toBe(2);

            expect(board.getOperator(new Coordinate(1, 2), MoveDirection.Down)).toBe(ComparisonOperator.LessThan);
            expect(board.getOperator(new Coordinate(2, 2), MoveDirection.Up)).toBe(ComparisonOperator.GreaterThan);

            expect(board.getOperator(new Coordinate(2, 1), MoveDirection.Down)).toBe(ComparisonOperator.GreaterThan);
            expect(board.getOperator(new Coordinate(3, 1), MoveDirection.Up)).toBe(ComparisonOperator.LessThan);

            expect(board.getOperator(new Coordinate(3, 1), MoveDirection.Right)).toBe(ComparisonOperator.LessThan);
            expect(board.getOperator(new Coordinate(3, 2), MoveDirection.Left)).toBe(ComparisonOperator.GreaterThan);

            expect(board.getOperator(new Coordinate(4, 3), MoveDirection.Right)).toBe(ComparisonOperator.GreaterThan);
            expect(board.getOperator(new Coordinate(4, 4), MoveDirection.Left)).toBe(ComparisonOperator.LessThan);
        });
    });

    describe('boardToText', () => {
        it('should format board correctly', () => {
            const board = new MemoryBoard(4);

            board.getCell(new Coordinate(1, 2)).setDraftValues([1]);

            board.getCell(new Coordinate(2, 4)).setDraftValues([1, 2, 3, 4]);

            board.getCell(new Coordinate(3, 1)).setDraftValues([2, 3]);
            board.getCell(new Coordinate(3, 2)).setDraftValues([2, 4]);
            board.getCell(new Coordinate(3, 3)).setDraftValues([1, 2, 3]);

            board.getCell(new Coordinate(4, 1)).setDraftValues([1, 2]);
            board.getCell(new Coordinate(4, 2)).setUserValue(3);
            board.getCell(new Coordinate(4, 3)).setUserValue(4);
            board.getCell(new Coordinate(4, 4)).setDraftValues([1, 2]);

            board.setOperator(new Coordinate(1, 2), MoveDirection.Down, ComparisonOperator.LessThan);
            board.setOperator(new Coordinate(3, 1), MoveDirection.Up, ComparisonOperator.LessThan);
            board.setOperator(new Coordinate(3, 1), MoveDirection.Right, ComparisonOperator.LessThan);
            board.setOperator(new Coordinate(4, 2), MoveDirection.Left, ComparisonOperator.GreaterThan);
            board.setOperator(new Coordinate(4, 3), MoveDirection.Right, ComparisonOperator.GreaterThan);

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
