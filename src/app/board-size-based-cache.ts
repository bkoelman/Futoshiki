import { Board } from './models/board';

export class BoardSizeBasedCache<T> {
  private _lastBoardSize = -2;
  private _lastValue: T | undefined = undefined;

  get value(): T {
    if (this._lastBoardSize !== this._board.size) {
      this._lastValue = this._valueFactory();
      this._lastBoardSize = this._board.size;
    }

    if (this._lastValue === undefined) {
      throw new Error('Should never get here.');
    }

    return this._lastValue;
  }

  constructor(private _board: Board, private _valueFactory: () => T) {}
}
