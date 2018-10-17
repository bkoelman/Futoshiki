import { CellSnapshot } from './cell-snapshot';

export interface UndoFrame {
  readonly cells: CellSnapshot[];
}
