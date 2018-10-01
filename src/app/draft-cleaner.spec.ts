import { BoardTextConverter } from './board-text-converter';
import { Coordinate } from './models/coordinate';
import { MoveDirection } from './models/move-direction.enum';
import { ComparisonOperator } from './models/comparison-operator.enum';
import { MemoryBoard } from './models/memory-board';
import { Board } from './models/board';
import { DraftCleaner } from './draft-cleaner';
import { expectEmptyCell, expectSingleValue, expectDraftValues, expectOperator } from './test-expectations.spec';
import { BoundEvent } from '@angular/compiler/src/render3/r3_ast';

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
            |      | 235  |       |      |  !4 |
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
            expectSingleValue('C5', 4, board);
            expectDraftValues('E5', [2, 3], board);
        });

        it('should reduce values for operators', () => {
            cleaner.reduceDraftValues(3, Coordinate.fromText('B2', board.size));

            expectDraftValues('A2', [4, 5], board);
            expectDraftValues('B1', [1, 2, 4], board);
            expectDraftValues('B3', [1, 2, 4, 5], board);
            expectDraftValues('C2', [5], board);
        });
    });
});
