import { BoardTextConverter } from './board-text-converter';
import { Coordinate } from './models/coordinate';
import { MoveChecker } from './move-checker';
import { MoveDirection } from './models/move-direction.enum';

describe('MoveChecker', () => {
    describe('checkIsMoveAllowed', () => {
        it('should allow a valid move', () => {
            const checker = createMoveCheckerForBoard(`
                +----+----+-----+----+
                |    |    |     |    |
                +----+----+-----+----+
                |    |    | 123 |    |
                +-^--+----+-----+----+
                | !2 | !1 |     > !3 |
                +----+----+-----+-v--+
                |    >    | !1  <    |
                +----+----+-----+----+
                `);

            const result = checker.checkIsMoveAllowed(4, Coordinate.fromText('C3', 4));

            expect(result.isValid).toBeTruthy();
            expect(result.offendingCells.length).toBe(0);
            expect(result.offendingOperators.length).toBe(0);
        });

        it('should block on existing value in row', () => {
            const checker = createMoveCheckerForBoard(`
                +----+----+----+----+
                |    |    |    |    |
                +----+----+----+----+
                |    |    |    |    |
                +-^--+----+----+----+
                | !2 |    |    >    |
                +----+----+----+-v--+
                |    >    | !1 <    |
                +----+----+----+----+
                `);

            const result = checker.checkIsMoveAllowed(2, Coordinate.fromText('C3', 4));

            expect(result.isValid).toBeFalsy();
            expect(result.offendingCells.length).toBe(1);
            expect(result.offendingCells[0].toString()).toBe('C1');
            expect(result.offendingOperators.length).toBe(0);
        });

        it('should block on existing values in column', () => {
            const checker = createMoveCheckerForBoard(`
                +----+----+----+----+
                |    |    | !3 |    |
                +----+----+----+----+
                |    |    | !3 |    |
                +-^--+----+----+----+
                | !2 |    |    >    |
                +----+----+----+-v--+
                |    >    | !1 <    |
                +----+----+----+----+
                `);

            const result = checker.checkIsMoveAllowed(3, Coordinate.fromText('C3', 4));

            expect(result.isValid).toBeFalsy();
            expect(result.offendingCells.length).toBe(2);
            expect(result.offendingCells[0].toString()).toBe('A3');
            expect(result.offendingCells[1].toString()).toBe('B3');
            expect(result.offendingOperators.length).toBe(0);
        });

        it('should block on less-than operator mismatches', () => {
            const checker = createMoveCheckerForBoard(`
                +----+----+----+----+
                |    | !3 |    |    |
                +----+-v--+----+----+
                | !2 >    <    |    |
                +----+-^--+----+----+
                |    |    |    |    |
                +----+----+----+----+
                |    |    |    |    |
                +----+----+----+----+
                `);

            const result = checker.checkIsMoveAllowed(4, Coordinate.fromText('B2', 4));

            expect(result.isValid).toBeFalsy();
            expect(result.offendingCells.length).toBe(0);
            expect(result.offendingOperators.length).toBe(4);
            expect(MoveDirection[result.offendingOperators[0]]).toBe(MoveDirection[MoveDirection.Left]);
            expect(MoveDirection[result.offendingOperators[1]]).toBe(MoveDirection[MoveDirection.Right]);
            expect(MoveDirection[result.offendingOperators[2]]).toBe(MoveDirection[MoveDirection.Up]);
            expect(MoveDirection[result.offendingOperators[3]]).toBe(MoveDirection[MoveDirection.Down]);
        });

        it('should block on greater-than operator mismatches', () => {
            const checker = createMoveCheckerForBoard(`
                +----+----+----+----+
                |    |    |    |    |
                +----+-^--+----+----+
                | 12 <    > !3 |    |
                +----+-v--+----+----+
                |    |    |    |    |
                +----+----+----+----+
                |    |    |    |    |
                +----+----+----+----+
                `);

            const result = checker.checkIsMoveAllowed(1, Coordinate.fromText('B2', 4));

            expect(result.isValid).toBeFalsy();
            expect(result.offendingCells.length).toBe(0);
            expect(result.offendingOperators.length).toBe(4);
            expect(MoveDirection[result.offendingOperators[0]]).toBe(MoveDirection[MoveDirection.Left]);
            expect(MoveDirection[result.offendingOperators[1]]).toBe(MoveDirection[MoveDirection.Right]);
            expect(MoveDirection[result.offendingOperators[2]]).toBe(MoveDirection[MoveDirection.Up]);
            expect(MoveDirection[result.offendingOperators[3]]).toBe(MoveDirection[MoveDirection.Down]);
        });

        it('should block on less-than operator pair mismatch', () => {
            const checker = createMoveCheckerForBoard(`
                +----+----+----+----+
                |    |    |    |    |
                +----+----+----+----+
                |    >    <    |    |
                +----+----+----+----+
                |    |    |    |    |
                +----+----+----+----+
                |    |    |    |    |
                +----+----+----+----+
                `);

            const result = checker.checkIsMoveAllowed(3, Coordinate.fromText('B2', 4));

            expect(result.isValid).toBeFalsy();
            expect(result.offendingCells.length).toBe(0);
            expect(result.offendingOperators.length).toBe(2);
            expect(MoveDirection[result.offendingOperators[0]]).toBe(MoveDirection[MoveDirection.Left]);
            expect(MoveDirection[result.offendingOperators[1]]).toBe(MoveDirection[MoveDirection.Right]);
        });

        it('should block on greater-than operator pair mismatch', () => {
            const checker = createMoveCheckerForBoard(`
                +----+----+----+----+
                |    |    |    |    |
                +----+-^--+----+----+
                |    |    |    |    |
                +----+-v--+----+----+
                |    |    |    |    |
                +----+----+----+----+
                |    |    |    |    |
                +----+----+----+----+
                `);

            const result = checker.checkIsMoveAllowed(2, Coordinate.fromText('B2', 4));

            expect(result.isValid).toBeFalsy();
            expect(result.offendingCells.length).toBe(0);
            expect(result.offendingOperators.length).toBe(2);
            expect(MoveDirection[result.offendingOperators[0]]).toBe(MoveDirection[MoveDirection.Up]);
            expect(MoveDirection[result.offendingOperators[1]]).toBe(MoveDirection[MoveDirection.Down]);
        });

        it('should block on mixed mismatches', () => {
            const checker = createMoveCheckerForBoard(`
                +----+----+-----+----+
                |    |    |     |    |
                +----+----+-----+----+
                |    |    | 123 |    |
                +-^--+----+-----+----+
                | !2 | !1 |     > !3 |
                +----+----+-----+-v--+
                |    >    | !1  <    |
                +----+----+-----+----+
                `);

            const result = checker.checkIsMoveAllowed(1, Coordinate.fromText('C3', 4));

            expect(result.isValid).toBeFalsy();
            expect(result.offendingCells.length).toBe(2);
            expect(result.offendingCells[0].toString()).toBe('C2');
            expect(result.offendingCells[1].toString()).toBe('D3');
            expect(result.offendingOperators.length).toBe(1);
            expect(MoveDirection[result.offendingOperators[0]]).toBe(MoveDirection[MoveDirection.Right]);
        });
    });

    function createMoveCheckerForBoard(boardText: string): MoveChecker {
        const converter = new BoardTextConverter();
        const board = converter.textToBoard(boardText);
        return new MoveChecker(board);
    }
});
