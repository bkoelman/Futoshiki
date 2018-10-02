import { PuzzleInfo } from './puzzle-info';
import { CellContentSnapshot } from './cell-content-snapshot';

export interface GameSaveState {
    info: PuzzleInfo;
    cellSnapshotMap: { [index: number]: CellContentSnapshot } | undefined;
}
