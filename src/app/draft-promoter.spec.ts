import { BoardTextConverter } from './board-text-converter';
import { Board } from './models/board';
import { DraftPromoter } from './draft-promoter';
import { DraftCleaner } from './draft-cleaner';
import { expectDraftValues, expectFixedValue, expectSingleUserValue, expectEmptyCell } from './test-expectations.spec';
import { Coordinate } from './models/coordinate';

describe('DraftPromoter', () => {
    let board: Board;
    let promoter: DraftPromoter;

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

        const cleaner = new DraftCleaner(board);

        promoter = new DraftPromoter(cleaner, board);
    });

    describe('promoteSingleDraftValueAt', () => {
        it('should promote single draft value on the board', () => {
            const hasChanges = promoter.promoteSingleDraftValueAt(Coordinate.fromText('A2', board.size), false);

            expect(hasChanges).toBeTruthy();

            expectSingleUserValue('A2', 3, board);
            expectDraftValues('A3', [3, 4], board);

            expectDraftValues('C3', [3], board);
        });

        it('should promote single draft value and cleanup on the board', () => {
            const hasChanges = promoter.promoteSingleDraftValueAt(Coordinate.fromText('A2', board.size), true);

            expect(hasChanges).toBeTruthy();

            expectSingleUserValue('A2', 3, board);
            expectDraftValues('A3', [4], board);

            expectDraftValues('C3', [3], board);
        });

        it('should do nothing for fixed value', () => {
            const hasChanges = promoter.promoteSingleDraftValueAt(Coordinate.fromText('B3', board.size), true);

            expect(hasChanges).toBeFalsy();
            expectFixedValue('B3', 2, board);
        });

        it('should do nothing for user value', () => {
            const hasChanges = promoter.promoteSingleDraftValueAt(Coordinate.fromText('C2', board.size), true);

            expect(hasChanges).toBeFalsy();
            expectSingleUserValue('C2', 4, board);
        });

        it('should do nothing for empty cell', () => {
            const hasChanges = promoter.promoteSingleDraftValueAt(Coordinate.fromText('D1', board.size), true);

            expect(hasChanges).toBeFalsy();
            expectEmptyCell('D1', board);
        });

        it('should do nothing for multiple draft values', () => {
            const hasChanges = promoter.promoteSingleDraftValueAt(Coordinate.fromText('C1', board.size), true);

            expect(hasChanges).toBeFalsy();
            expectDraftValues('C1', [1, 2, 3], board);
        });
    });

    describe('promoteSingleDraftValues', () => {
        it('should promote draft values on the board', () => {
            const hasChanges = promoter.promoteSingleDraftValues(false);

            expect(hasChanges).toBeTruthy();

            expectSingleUserValue('A2', 3, board);
            expectDraftValues('A3', [3, 4], board);
            expectSingleUserValue('A4', 2, board);

            expectDraftValues('C1', [1, 2, 3], board);
            expectSingleUserValue('C3', 3, board);

            expectSingleUserValue('D4', 4, board);
        });

        it('should promote draft values and cleanup on the board', () => {
            const hasChanges = promoter.promoteSingleDraftValues(true);

            expect(hasChanges).toBeTruthy();

            expectDraftValues('A3', [4], board);

            expectFixedValue('B3', 2, board);

            expectDraftValues('C1', [1, 2], board);
            expectSingleUserValue('C2', 4, board);
            expectSingleUserValue('C3', 3, board);
            expectDraftValues('D3', [1], board);
        });
    });
});
