import { Coordinate } from './coordinate';
import { MoveDirection } from './move-direction.enum';

export class MoveCheckResult {
    static readonly moveIsAllowed: MoveCheckResult = new MoveCheckResult(true, undefined, undefined);

    constructor(public isAllowed: boolean, public offendingCell: Coordinate,
        public offendingOperator: { coordinate: Coordinate, direction: MoveDirection } | undefined) {
    }
}
