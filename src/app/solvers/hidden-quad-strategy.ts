import { Board } from '../models/board';
import { HiddenSetStrategy } from './hidden-set-strategy';

export class HiddenQuadStrategy extends HiddenSetStrategy {
  get powerSets() {
    return [this.powerSetForQuads];
  }

  constructor(board: Board) {
    super('Hidden Quad', board);
  }
}
