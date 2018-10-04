import { CellContentSnapshot } from './models/cell-content-snapshot';
import { UndoFrame } from './models/undo-frame';
import { CellSnapshot } from './models/cell-snapshot';
import { ObjectFacilities } from './object-facilities';
import { Coordinate } from './models/coordinate';
import { BoardComponent } from './components/board/board.component';

export class UndoTracker {
    private _isCapturingCellChanges = false;
    private _cellChangesCaptured: { [index: number]: CellContentSnapshot } = {};
    private _undoStack: UndoFrame[] = [];

    constructor(private _board: BoardComponent) {
    }

    reset() {
        this._undoStack = [];
    }

    canUndo(): boolean {
        return this._undoStack.length > 0;
    }

    undo(): boolean {
        let madeChanges = false;

        const undoFrame = this._undoStack.pop();
        if (undoFrame) {
            for (const snapshot of undoFrame.cells) {
                const cell = this._board.getCell(snapshot.coordinate);
                if (cell) {
                    cell.restoreContentSnapshot(snapshot.content);
                    madeChanges = true;
                }
            }
        }

        return madeChanges;
    }

    captureUndoFrame(action: () => void): boolean {
        this.captureCellChanges(action);

        const snapshots = this.getSnapshotsForCapturedCellChanges();
        if (snapshots.length > 0) {
            this._undoStack.push({ cells: snapshots });
            return true;
        }

        return false;
    }

    private captureCellChanges(action: () => void) {
        this._cellChangesCaptured = {};
        this._isCapturingCellChanges = true;

        action();

        this._isCapturingCellChanges = false;
    }

    private getSnapshotsForCapturedCellChanges() {
        const snapshots: CellSnapshot[] = [];

        ObjectFacilities.iterateObjectProperties<CellContentSnapshot>(this._cellChangesCaptured, (index, contentSnapshot) => {
            const coordinate = Coordinate.fromIndex(parseInt(index, 10), this._board.size);
            snapshots.push({ coordinate: coordinate, content: contentSnapshot });
        });

        return snapshots;
    }

    registerCellChange(snapshot: CellSnapshot) {
        if (this._isCapturingCellChanges) {
            const index = snapshot.coordinate.toIndex();
            if (!this._cellChangesCaptured[index]) {
                this._cellChangesCaptured[index] = snapshot.content;
            }
        }
    }
}
