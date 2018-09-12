import { CellContentSnapshot } from './cell-content-snapshot';

export class UndoCommand {
    targetCellOffset: number;
    previousState: CellContentSnapshot;
}
