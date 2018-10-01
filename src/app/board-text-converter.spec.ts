import { BoardTextConverter } from './board-text-converter';
import { Coordinate } from './models/coordinate';
import { MoveDirection } from './models/move-direction.enum';
import { ComparisonOperator } from './models/comparison-operator.enum';
import { MemoryBoard } from './models/memory-board';
import { expectEmptyCell, expectSingleValue, expectDraftValues, expectOperator } from './test-expectations.spec';

describe('BoardTextConverter', () => {
    let converter: BoardTextConverter;

    beforeEach(() => {
        converter = new BoardTextConverter();
    });

    describe('textToBoard', () => {
        it('should parse board correctly', () => {
            const text = `
                +----+----+-----+-----+-------+
                | 25 |    |     |     | 12345 |
                +-v--+----+--^--+-----+-------+
                |    |    | 345 |     |       |
                +----+-v--+-----+-----+-------+
                |    |    | !2  |     >  134  |
                +-v--+----+-----+-----+-------+
                | !3 > !2 >  1  |     |  45   |
                +----+----+-----+-----+-------+
                | !4 |    >     | 123 <       |
                +----+----+-----+-----+-------+
                `;

            const board = converter.textToBoard(text);

            expect(board.size).toBe(5);

            expectDraftValues('A1', [2, 5], board);
            expectEmptyCell('A2', board);
            expectEmptyCell('A3', board);
            expectEmptyCell('A4', board);
            expectDraftValues('A5', [1, 2, 3, 4, 5], board);

            expectEmptyCell('B1', board);
            expectEmptyCell('B2', board);
            expectDraftValues('B3', [3, 4, 5], board);
            expectEmptyCell('B4', board);
            expectEmptyCell('B5', board);

            expectEmptyCell('C1', board);
            expectEmptyCell('C2', board);
            expectSingleValue('C3', 2, board);
            expectEmptyCell('C4', board);
            expectDraftValues('C5', [1, 3, 4], board);

            expectSingleValue('D1', 3, board);
            expectSingleValue('D2', 2, board);
            expectDraftValues('D3', [1], board);
            expectEmptyCell('D4', board);
            expectDraftValues('D5', [4, 5], board);

            expectSingleValue('E1', 4, board);
            expectEmptyCell('E2', board);
            expectEmptyCell('E3', board);
            expectDraftValues('E4', [1, 2, 3], board);
            expectEmptyCell('E5', board);

            expectOperator('A1', MoveDirection.Right, ComparisonOperator.None, board);
            expectOperator('A1', MoveDirection.Down, ComparisonOperator.GreaterThan, board);
            expectOperator('A3', MoveDirection.Down, ComparisonOperator.LessThan, board);

            expectOperator('C2', MoveDirection.Up, ComparisonOperator.LessThan, board);
            expectOperator('C4', MoveDirection.Right, ComparisonOperator.GreaterThan, board);

            expectOperator('D1', MoveDirection.Up, ComparisonOperator.LessThan, board);
            expectOperator('D1', MoveDirection.Right, ComparisonOperator.GreaterThan, board);
            expectOperator('D3', MoveDirection.Left, ComparisonOperator.LessThan, board);

            expectOperator('E3', MoveDirection.Left, ComparisonOperator.LessThan, board);
            expectOperator('E4', MoveDirection.Right, ComparisonOperator.LessThan, board);
        });
    });

    describe('boardToText', () => {
        it('should format board correctly', () => {
            const board = new MemoryBoard(5);

            board.getCell(Coordinate.fromText('A1', board.size)).setDraftValues([2, 5]);
            board.getCell(Coordinate.fromText('A5', board.size)).setDraftValues([1, 2, 3, 4, 5]);

            board.getCell(Coordinate.fromText('B3', board.size)).setDraftValues([3, 4, 5]);

            board.getCell(Coordinate.fromText('C3', board.size)).setUserValue(2);
            board.getCell(Coordinate.fromText('C5', board.size)).setDraftValues([1, 3, 4]);

            board.getCell(Coordinate.fromText('D1', board.size)).setUserValue(3);
            board.getCell(Coordinate.fromText('D2', board.size)).setUserValue(2);
            board.getCell(Coordinate.fromText('D3', board.size)).setDraftValues([1]);
            board.getCell(Coordinate.fromText('D5', board.size)).setDraftValues([4, 5]);

            board.getCell(Coordinate.fromText('E1', board.size)).setUserValue(4);
            board.getCell(Coordinate.fromText('E4', board.size)).setDraftValues([1, 2, 3]);

            board.setOperator(Coordinate.fromText('A1', board.size), MoveDirection.Down, ComparisonOperator.GreaterThan);
            board.setOperator(Coordinate.fromText('A3', board.size), MoveDirection.Down, ComparisonOperator.LessThan);

            board.setOperator(Coordinate.fromText('C2', board.size), MoveDirection.Up, ComparisonOperator.LessThan);
            board.setOperator(Coordinate.fromText('C4', board.size), MoveDirection.Right, ComparisonOperator.GreaterThan);

            board.setOperator(Coordinate.fromText('D1', board.size), MoveDirection.Up, ComparisonOperator.LessThan);
            board.setOperator(Coordinate.fromText('D1', board.size), MoveDirection.Right, ComparisonOperator.GreaterThan);
            board.setOperator(Coordinate.fromText('D3', board.size), MoveDirection.Left, ComparisonOperator.LessThan);

            board.setOperator(Coordinate.fromText('E3', board.size), MoveDirection.Left, ComparisonOperator.LessThan);
            board.setOperator(Coordinate.fromText('E4', board.size), MoveDirection.Right, ComparisonOperator.LessThan);

            const formatted = converter.boardToText(board, ' '.repeat(16));

            expect('\n' + formatted).toBe(`
                +----+----+-----+-----+-------+
                | 25 |    |     |     | 12345 |
                +-v--+----+--^--+-----+-------+
                |    |    | 345 |     |       |
                +----+-v--+-----+-----+-------+
                |    |    | !2  |     >  134  |
                +-v--+----+-----+-----+-------+
                | !3 > !2 >  1  |     |  45   |
                +----+----+-----+-----+-------+
                | !4 |    >     | 123 <       |
                +----+----+-----+-----+-------+`);
        });
    });
});
