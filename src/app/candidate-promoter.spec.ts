import { BoardTextConverter } from './board-text-converter';
import { Board } from './models/board';
import { CandidatePromoter } from './candidate-promoter';
import { CandidateCleaner } from './candidate-cleaner';
import { expectBoard } from './test-expectations.spec';
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
            expectBoard(board, `
                +-----+----+-----+---+
                |     | !3 | 34  > 2 |
                +-----+-v--+-----+-v-+
                |     |    | #2  |   |
                +-----+----+-----+---+
                | 123 | !4 |  3  |   |
                +-----+----+-----+-^-+
                |     |    | 134 | 4 |
                +-----+----+-----+---+`);
        });

        it('should promote single candidate and cleanup on the board', () => {
            const hasChanges = promoter.promoteSingleCandidateAt(Coordinate.fromText('A2', board.size), true);

            expect(hasChanges).toBeTruthy();
            expectBoard(board, `
                +-----+----+-----+---+
                |     | !3 |  4  > 2 |
                +-----+-v--+-----+-v-+
                |     |    | #2  |   |
                +-----+----+-----+---+
                | 123 | !4 |  3  |   |
                +-----+----+-----+-^-+
                |     |    | 134 | 4 |
                +-----+----+-----+---+`);
        });

        it('should do nothing for fixed value', () => {
            const hasChanges = promoter.promoteSingleCandidateAt(Coordinate.fromText('B3', board.size), true);

            expect(hasChanges).toBeFalsy();
            expectBoard(board, `
                +-----+----+-----+---+
                |     | 3  | 34  > 2 |
                +-----+-v--+-----+-v-+
                |     |    | #2  |   |
                +-----+----+-----+---+
                | 123 | !4 |  3  |   |
                +-----+----+-----+-^-+
                |     |    | 134 | 4 |
                +-----+----+-----+---+`);
        });

        it('should do nothing for user value', () => {
            const hasChanges = promoter.promoteSingleCandidateAt(Coordinate.fromText('C2', board.size), true);

            expect(hasChanges).toBeFalsy();
            expectBoard(board, `
                +-----+----+-----+---+
                |     | 3  | 34  > 2 |
                +-----+-v--+-----+-v-+
                |     |    | #2  |   |
                +-----+----+-----+---+
                | 123 | !4 |  3  |   |
                +-----+----+-----+-^-+
                |     |    | 134 | 4 |
                +-----+----+-----+---+`);
        });

        it('should do nothing for empty cell', () => {
            const hasChanges = promoter.promoteSingleCandidateAt(Coordinate.fromText('D1', board.size), true);

            expect(hasChanges).toBeFalsy();
            expectBoard(board, `
                +-----+----+-----+---+
                |     | 3  | 34  > 2 |
                +-----+-v--+-----+-v-+
                |     |    | #2  |   |
                +-----+----+-----+---+
                | 123 | !4 |  3  |   |
                +-----+----+-----+-^-+
                |     |    | 134 | 4 |
                +-----+----+-----+---+`);
        });

        it('should do nothing for multiple candidates', () => {
            const hasChanges = promoter.promoteSingleCandidateAt(Coordinate.fromText('C1', board.size), true);

            expect(hasChanges).toBeFalsy();
            expectBoard(board, `
                +-----+----+-----+---+
                |     | 3  | 34  > 2 |
                +-----+-v--+-----+-v-+
                |     |    | #2  |   |
                +-----+----+-----+---+
                | 123 | !4 |  3  |   |
                +-----+----+-----+-^-+
                |     |    | 134 | 4 |
                +-----+----+-----+---+`);
        });
    });

    describe('promoteSingleCandidates', () => {
        it('should promote candidates on the board', () => {
            const hasChanges = promoter.promoteSingleCandidates(false);

            expect(hasChanges).toBeTruthy();
            expectBoard(board, `
                +-----+----+-----+----+
                |     | !3 | 34  > !2 |
                +-----+-v--+-----+-v--+
                |     |    | #2  |    |
                +-----+----+-----+----+
                | 123 | !4 | !3  |    |
                +-----+----+-----+-^--+
                |     |    | 134 | !4 |
                +-----+----+-----+----+`);
        });

        it('should promote candidates and cleanup on the board', () => {
            const hasChanges = promoter.promoteSingleCandidates(true);

            expect(hasChanges).toBeTruthy();
            expectBoard(board, `
                +----+----+----+----+
                |    | !3 | 4  > !2 |
                +----+-v--+----+-v--+
                |    |    | #2 |    |
                +----+----+----+----+
                | 12 | !4 | !3 |    |
                +----+----+----+-^--+
                |    |    | 1  | !4 |
                +----+----+----+----+`);
        });
    });
});
