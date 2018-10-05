import { BoardTextConverter } from './board-text-converter';
import { Coordinate } from './models/coordinate';
import { Board } from './models/board';
import { DraftCleaner } from './draft-cleaner';
import { expectEmptyCell, expectDraftValues, expectFixedValue } from './test-expectations.spec';

describe('DraftCleaner', () => {
    let board: Board;
    let cleaner: DraftCleaner;

    beforeEach(() => {
        const boardText = `
            +------+------+-------+------+-----+
            |      | 2345 |       >      | 123 |
            +--v---+--v---+-------+------+--^--+
            | 1234 |      | 12345 |      | 235 |
            +------+--^---+-------+------+-----+
            |      | 235  |       |      |  #4 |
            +------+------+-------+------+--^--+
            | 2345 | 1234 <       | 2345 |     |
            +--v---+------+-------+--v---+-----+
            |      |      |       |      < 235 |
            +------+------+-------+------+-----+
            `;

        const converter = new BoardTextConverter();
        board = converter.textToBoard(boardText);

        cleaner = new DraftCleaner(board);
    });

    describe('reduceDraftValues', () => {
        it('should reduce values in row and column', () => {
            cleaner.reduceDraftValues(5, Coordinate.fromText('D5', board.size));

            expectDraftValues('D1', [2, 3, 4], board);
            expectDraftValues('D2', [1, 2, 3, 4], board);
            expectEmptyCell('D3', board);
            expectDraftValues('D4', [2, 3, 4], board);

            expectDraftValues('A5', [1, 2, 3], board);
            expectDraftValues('B5', [2, 3], board);
            expectFixedValue('C5', 4, board);
            expectDraftValues('E5', [2, 3], board);
        });

        it('should reduce values for greater-than operators', () => {
            cleaner.reduceDraftValues(3, Coordinate.fromText('B2', board.size));

            expectDraftValues('A2', [4, 5], board);
            expectDraftValues('C2', [5], board);
        });

        it('should reduce values for less-than operators', () => {
            cleaner.reduceDraftValues(2, Coordinate.fromText('D3', board.size));

            expectDraftValues('D2', [1], board);
        });
    });
});
