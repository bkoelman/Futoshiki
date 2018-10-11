import { BoardTextConverter } from './board-text-converter';
import { Coordinate } from './models/coordinate';
import { Board } from './models/board';
import { CandidateCleaner } from './candidate-cleaner';
import { expectEmptyCell, expectCandidates, expectFixedValue } from './test-expectations.spec';

describe('CandidateCleaner', () => {
    let board: Board;
    let cleaner: CandidateCleaner;

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

        cleaner = new CandidateCleaner(board);
    });

    describe('reduceCandidates', () => {
        it('should reduce values in row and column', () => {
            cleaner.reduceCandidates(5, Coordinate.fromText('D5', board.size));

            expectCandidates('D1', [2, 3, 4], board);
            expectCandidates('D2', [1, 2, 3, 4], board);
            expectEmptyCell('D3', board);
            expectCandidates('D4', [2, 3, 4], board);

            expectCandidates('A5', [1, 2, 3], board);
            expectCandidates('B5', [2, 3], board);
            expectFixedValue('C5', 4, board);
            expectCandidates('E5', [2, 3], board);
        });

        it('should reduce values for greater-than operators', () => {
            cleaner.reduceCandidates(3, Coordinate.fromText('B2', board.size));

            expectCandidates('A2', [4, 5], board);
            expectCandidates('C2', [5], board);
        });

        it('should reduce values for less-than operators', () => {
            cleaner.reduceCandidates(2, Coordinate.fromText('D3', board.size));

            expectCandidates('D2', [1], board);
        });
    });
});
