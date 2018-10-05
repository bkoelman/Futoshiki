import { Coordinate } from './coordinate';
import { MoveDirection } from './move-direction.enum';

export class MoveCheckResult {
    private static readonly _emptySingleton = new MoveCheckResult([], []);

    get isValid() {
        return this.offendingCells.length === 0 && this.offendingOperators.length === 0;
    }

    constructor(public offendingCells: Coordinate[],
        public offendingOperators: { coordinate: Coordinate, direction: MoveDirection }[]) {
    }

    static getValid() {
        return MoveCheckResult._emptySingleton;
    }
}
