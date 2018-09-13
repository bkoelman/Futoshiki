import { CellContentSnapshot } from './cell-content-snapshot';
import { Coordinate } from './coordinate';

export class UndoCommand {
    targetCell: Coordinate;
    previousState: CellContentSnapshot;
}
