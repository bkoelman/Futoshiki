import { BoardTextConverter } from './board-text-converter';
import { Board } from './models/board';
import { CandidatePromoter } from './candidate-promoter';
import { CandidateCleaner } from './candidate-cleaner';
import { expectCandidates, expectFixedValue, expectSingleUserValue, expectEmptyCell } from './test-expectations.spec';
import { Coordinate } from './models/coordinate';

describe('CandidatePromoter', () => {
    let board: Board;
    let promoter: CandidatePromoter;

    beforeEach(() => {
        const boardText = `
            +-----+----+-----+---+
            |     | 3  | 34  > 2 |
            +-----+-v--+-----+-v-+
            |     |    | #2  |   |
            +-----+----+-----+---+
            | 123 | !4 |  3  |   |
            +-----+----+-----+-^-+
            |     |    | 134 | 4 |
            +-----+----+-----+---+
            `;

        const converter = new BoardTextConverter();
        board = converter.textToBoard(boardText);

        const cleaner = new CandidateCleaner(board);

        promoter = new CandidatePromoter(cleaner, board);
    });

    describe('promoteSingleCandidateAt', () => {
        it('should promote single candidate on the board', () => {
            const hasChanges = promoter.promoteSingleCandidateAt(Coordinate.fromText('A2', board.size), false);

            expect(hasChanges).toBeTruthy();

            expectSingleUserValue('A2', 3, board);
            expectCandidates('A3', [3, 4], board);

            expectCandidates('C3', [3], board);
        });

        it('should promote single candidate and cleanup on the board', () => {
            const hasChanges = promoter.promoteSingleCandidateAt(Coordinate.fromText('A2', board.size), true);

            expect(hasChanges).toBeTruthy();

            expectSingleUserValue('A2', 3, board);
            expectCandidates('A3', [4], board);

            expectCandidates('C3', [3], board);
        });

        it('should do nothing for fixed value', () => {
            const hasChanges = promoter.promoteSingleCandidateAt(Coordinate.fromText('B3', board.size), true);

            expect(hasChanges).toBeFalsy();
            expectFixedValue('B3', 2, board);
        });

        it('should do nothing for user value', () => {
            const hasChanges = promoter.promoteSingleCandidateAt(Coordinate.fromText('C2', board.size), true);

            expect(hasChanges).toBeFalsy();
            expectSingleUserValue('C2', 4, board);
        });

        it('should do nothing for empty cell', () => {
            const hasChanges = promoter.promoteSingleCandidateAt(Coordinate.fromText('D1', board.size), true);

            expect(hasChanges).toBeFalsy();
            expectEmptyCell('D1', board);
        });

        it('should do nothing for multiple candidates', () => {
            const hasChanges = promoter.promoteSingleCandidateAt(Coordinate.fromText('C1', board.size), true);

            expect(hasChanges).toBeFalsy();
            expectCandidates('C1', [1, 2, 3], board);
        });
    });

    describe('promoteSingleCandidates', () => {
        it('should promote candidates on the board', () => {
            const hasChanges = promoter.promoteSingleCandidates(false);

            expect(hasChanges).toBeTruthy();

            expectSingleUserValue('A2', 3, board);
            expectCandidates('A3', [3, 4], board);
            expectSingleUserValue('A4', 2, board);

            expectCandidates('C1', [1, 2, 3], board);
            expectSingleUserValue('C3', 3, board);

            expectSingleUserValue('D4', 4, board);
        });

        it('should promote candidates and cleanup on the board', () => {
            const hasChanges = promoter.promoteSingleCandidates(true);

            expect(hasChanges).toBeTruthy();

            expectCandidates('A3', [4], board);

            expectFixedValue('B3', 2, board);

            expectCandidates('C1', [1, 2], board);
            expectSingleUserValue('C2', 4, board);
            expectSingleUserValue('C3', 3, board);
            expectCandidates('D3', [1], board);
        });
    });
});
