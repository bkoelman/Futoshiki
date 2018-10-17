import { BoardTextConverter } from './board-text-converter';
import { Coordinate } from './models/coordinate';
import { Board } from './models/board';
import { CandidateCleaner } from './candidate-cleaner';
import { expectCandidates, expectBoard } from './test-expectations.spec';

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
            |      | 235  |       |      | #4  |
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

      expectBoard(
        board,
        `
                +------+------+-------+-----+-----+
                |      | 2345 |       >     | 123 |
                +--v---+--v---+-------+-----+--^--+
                | 1234 |      | 12345 |     | 23  |
                +------+--^---+-------+-----+-----+
                |      | 235  |       |     | #4  |
                +------+------+-------+-----+--^--+
                | 234  | 1234 <       | 234 |     |
                +--v---+------+-------+--v--+-----+
                |      |      |       |     < 23  |
                +------+------+-------+-----+-----+`
      );
    });

    it('should reduce values for greater-than operators', () => {
      cleaner.reduceCandidates(3, Coordinate.fromText('B2', board.size));

      expectBoard(
        board,
        `
                +------+-----+------+------+-----+
                |      | 45  |      >      | 123 |
                +--v---+--v--+------+------+--^--+
                | 124  |     | 1245 |      | 25  |
                +------+--^--+------+------+-----+
                |      |  5  |      |      | #4  |
                +------+-----+------+------+--^--+
                | 2345 | 124 <      | 2345 |     |
                +--v---+-----+------+--v---+-----+
                |      |     |      |      < 235 |
                +------+-----+------+------+-----+`
      );
    });

    it('should reduce values for less-than operators', () => {
      cleaner.reduceCandidates(2, Coordinate.fromText('D3', board.size));

      expectBoard(
        board,
        `
                +------+------+------+-----+-----+
                |      | 2345 |      >     | 123 |
                +--v---+--v---+------+-----+--^--+
                | 1234 |      | 1345 |     | 235 |
                +------+--^---+------+-----+-----+
                |      | 235  |      |     | #4  |
                +------+------+------+-----+--^--+
                | 345  |  1   <      | 345 |     |
                +--v---+------+------+--v--+-----+
                |      |      |      |     < 235 |
                +------+------+------+-----+-----+`
      );

      expectCandidates('D2', [1], board);
    });
  });
});
