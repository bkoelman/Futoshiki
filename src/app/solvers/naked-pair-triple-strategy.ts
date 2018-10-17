import { Board } from '../models/board';
import { NakedSetStrategy } from './naked-set-strategy';

export class NakedPairTripleStrategy extends NakedSetStrategy {
  get powerSets() {
    return [this.powerSetForPairs, this.powerSetForTriples];
  }

  constructor(board: Board) {
    super('Naked Pair/Triple', board);
  }
}
