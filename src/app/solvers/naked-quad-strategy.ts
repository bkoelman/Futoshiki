import { NakedSetStrategy } from './naked-set-strategy';
import { Board } from '../models/board';

export class NakedQuadStrategy extends NakedSetStrategy {
  get powerSets() {
    return [this.powerSetForQuads];
  }

  constructor(board: Board) {
    super('Naked Quad', board);
  }
}
