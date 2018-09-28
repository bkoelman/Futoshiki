import { CellContentSnapshot } from './cell-content-snapshot';
import { Coordinate } from './coordinate';

export class SingleUndoCommand {
    constructor(public targetCell: Coordinate, public previousState: CellContentSnapshot) {
    }
}
