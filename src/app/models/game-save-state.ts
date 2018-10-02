import { PuzzleInfo } from './puzzle-info';

export interface GameSaveState {
    info: PuzzleInfo;
    cellSnapshotMap: object | undefined;
}
