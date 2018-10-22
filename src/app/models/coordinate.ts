import { MoveDirection } from './move-direction.enum';
import { assertBoardSizeIsValid } from '../assertions';

export class Coordinate {
  static readonly charCodeA = 'A'.charCodeAt(0);

  private readonly _offset: number;
  private readonly _boardSize: number;

  private constructor(offset: number, boardSize: number) {
    this._offset = offset;
    this._boardSize = boardSize;
  }

  static fromIndex(index: number, boardSize: number): Coordinate {
    assertBoardSizeIsValid(boardSize);

    if (Coordinate.isIntegerInRange(index, boardSize * boardSize)) {
      return new Coordinate(index, boardSize);
    }

    throw new Error(`Invalid coordinate index '${index}' on ${boardSize}x${boardSize} board.`);
  }

  static fromText(text: string, boardSize: number): Coordinate {
    assertBoardSizeIsValid(boardSize);

    if (text && text.length === 2) {
      const rowNumber = text.charCodeAt(0) - Coordinate.charCodeA;
      const columnNumber = parseInt(text[1], 10) - 1;
      if (Coordinate.isIntegerInRange(rowNumber, boardSize) && Coordinate.isIntegerInRange(columnNumber, boardSize)) {
        return Coordinate.fromRowColumnNumbers(rowNumber, columnNumber, boardSize);
      }
    }

    throw new Error(`Invalid coordinate '${text}' on ${boardSize}x${boardSize} board.`);
  }

  private static isIntegerInRange(value: number, maxValue: number) {
    return !isNaN(value) && Math.floor(value) === value && value >= 0 && value < maxValue;
  }

  private static fromRowColumnNumbers(rowNumber: number, columnNumber: number, boardSize: number): Coordinate {
    const offset = rowNumber * boardSize + columnNumber;
    return new Coordinate(offset, boardSize);
  }

  static iterateBoard(boardSize: number): Coordinate[] {
    assertBoardSizeIsValid(boardSize);

    // TODO: Optimize by using .fromIndex()

    const coordinates: Coordinate[] = [];

    for (let rowNumber = 0; rowNumber < boardSize; rowNumber++) {
      for (let columnNumber = 0; columnNumber < boardSize; columnNumber++) {
        const nextCoordinate = Coordinate.fromRowColumnNumbers(rowNumber, columnNumber, boardSize);
        coordinates.push(nextCoordinate);
      }
    }

    return coordinates;
  }

  static areEqual(left: Coordinate, right: Coordinate): boolean {
    return left.isEqualTo(right);
  }

  isEqualTo(other: Coordinate): boolean {
    return other && this._offset === other._offset && this._boardSize === other._boardSize;
  }

  toIndex(): number {
    return this._offset;
  }

  toString(): string {
    const rowNumber = this.getRowNumber();
    const columnNumber = this.getColumnNumber();

    const rowChar = String.fromCharCode(Coordinate.charCodeA + rowNumber);
    return `${rowChar}${columnNumber + 1}`;
  }

  canMoveOne(direction: MoveDirection): boolean {
    const rowNumber = this.getRowNumber();
    const columnNumber = this.getColumnNumber();

    switch (direction) {
      case MoveDirection.Left:
        return columnNumber > 0;
      case MoveDirection.Right:
        return columnNumber < this._boardSize - 1;
      case MoveDirection.Up:
        return rowNumber > 0;
      case MoveDirection.Down:
        return rowNumber < this._boardSize - 1;
    }
  }

  moveOne(direction: MoveDirection): Coordinate {
    if (!this.canMoveOne(direction)) {
      throw new Error(`Cannot move ${MoveDirection[direction]} from ${this.toString()} on ${this._boardSize}x${this._boardSize} board.`);
    }

    switch (direction) {
      case MoveDirection.Left:
        return Coordinate.fromIndex(this._offset - 1, this._boardSize);
      case MoveDirection.Right:
        return Coordinate.fromIndex(this._offset + 1, this._boardSize);
      case MoveDirection.Up:
        return Coordinate.fromIndex(this._offset - this._boardSize, this._boardSize);
      case MoveDirection.Down:
        return Coordinate.fromIndex(this._offset + this._boardSize, this._boardSize);
    }
  }

  canIncrement(): boolean {
    return this._offset + 1 < this._boardSize * this._boardSize;
  }

  increment(): Coordinate {
    if (!this.canIncrement()) {
      throw new Error('Cannot move past the end of the board.');
    }

    return new Coordinate(this._offset + 1, this._boardSize);
  }

  private getRowNumber(): number {
    return Math.floor(this._offset / this._boardSize);
  }

  private getColumnNumber(): number {
    return this._offset % this._boardSize;
  }

  iterateRow(skipSelf: boolean): Coordinate[] {
    const coordinates: Coordinate[] = [];
    const thisRowNumber = this.getRowNumber();
    const thisColumnNumber = this.getColumnNumber();

    for (let columnNumber = 0; columnNumber < this._boardSize; columnNumber++) {
      if (!skipSelf || columnNumber !== thisColumnNumber) {
        const nextCoordinate = Coordinate.fromRowColumnNumbers(thisRowNumber, columnNumber, this._boardSize);
        coordinates.push(nextCoordinate);
      }
    }

    return coordinates;
  }

  iterateColumn(skipSelf: boolean): Coordinate[] {
    const coordinates: Coordinate[] = [];
    const thisRowNumber = this.getRowNumber();
    const thisColumnNumber = this.getColumnNumber();

    for (let rowNumber = 0; rowNumber < this._boardSize; rowNumber++) {
      if (!skipSelf || rowNumber !== thisRowNumber) {
        const nextCoordinate = Coordinate.fromRowColumnNumbers(rowNumber, thisColumnNumber, this._boardSize);
        coordinates.push(nextCoordinate);
      }
    }

    return coordinates;
  }
}
