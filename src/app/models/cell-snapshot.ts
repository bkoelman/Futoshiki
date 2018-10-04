import { CellContentSnapshot } from './cell-content-snapshot';
import { Coordinate } from './coordinate';

export interface CellSnapshot {
    readonly coordinate: Coordinate;
    readonly content: CellContentSnapshot;
}
