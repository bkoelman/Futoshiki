import { PuzzleInfo } from './puzzle-info';
import { CellContentSnapshot } from './cell-content-snapshot';

export interface GameSaveState {
  info: PuzzleInfo;
  playTimeInSeconds: number;
  cellSnapshotMap: { [index: number]: CellContentSnapshot } | undefined;
}
