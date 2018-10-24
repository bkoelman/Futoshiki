import { Board } from '../models/board';
import { HiddenSetStrategy } from './hidden-set-strategy';

export class HiddenPairTripleStrategy extends HiddenSetStrategy {
  get powerSets() {
    return [this.powerSetForPairs, this.powerSetForTriples];
  }
  constructor(board: Board) {
    super('Hidden Pair/Triple', board);
  }
}
