import { BoardTextConverter } from './board-text-converter';
import { Board } from './models/board';
import { DraftPromoter } from './draft-promoter';
import { DraftCleaner } from './draft-cleaner';
import { expectDraftValues, expectFixedValue, expectSingleUserValue } from './test-expectations.spec';

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

    describe('promoteSingleDraftValues', () => {
        it('should promote draft values on the board', () => {
            promoter.promoteSingleDraftValues(false);

            expectSingleUserValue('A2', 3, board);
            expectDraftValues('A3', [3, 4], board);
            expectSingleUserValue('A4', 2, board);

            expectDraftValues('C1', [1, 2, 3], board);
            expectSingleUserValue('C3', 3, board);

            expectSingleUserValue('D4', 4, board);
        });

        it('should promote draft values and cleanup on the board', () => {
            promoter.promoteSingleDraftValues(true);

            expectDraftValues('A3', [4], board);

            expectFixedValue('B3', 2, board);

            expectDraftValues('C1', [1, 2], board);
            expectSingleUserValue('C2', 4, board);
            expectSingleUserValue('C3', 3, board);
            expectDraftValues('D3', [1], board);
        });
    });
});
