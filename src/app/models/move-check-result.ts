import { Coordinate } from './coordinate';
import { MoveDirection } from './move-direction.enum';

export class MoveCheckResult {
  private static readonly _emptySingleton = new MoveCheckResult([], []);

  get isValid() {
    return this.offendingCells.length === 0 && this.offendingOperators.length === 0;
  }

  constructor(public offendingCells: Coordinate[], public offendingOperators: MoveDirection[]) {}

  static createValid() {
    return MoveCheckResult._emptySingleton;
  }
}
