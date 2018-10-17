import { PuzzleInfo } from './models/puzzle-info';
import { PuzzleData } from './models/puzzle-data';
import { MemoryBoard } from './models/memory-board';
import { ComparisonOperator, parseComparisonOperator, reverseOperator } from './models/comparison-operator.enum';
import { Coordinate } from './models/coordinate';
import { MoveDirection } from './models/move-direction.enum';
import { ObjectFacilities } from './object-facilities';

export class PuzzleTextParser {
  static parseText(puzzleText: string, info: PuzzleInfo): PuzzleData {
    const startBoard = PuzzleTextParser.parseStartBoard(puzzleText, info.boardSize);
    const answerDigits = PuzzleTextParser.parseAnswerDigits(puzzleText, info.boardSize);

    return {
      info: info,
      startBoard: startBoard,
      answerDigits: answerDigits
    };
  }

  private static parseStartBoard(puzzleText: string, boardSize: number): MemoryBoard {
    const startBoard = new MemoryBoard(boardSize);
    const innerParser = new InnerPuzzleTextParser(puzzleText, startBoard);
    innerParser.parseStartBoard();
    return startBoard;
  }

  private static parseAnswerDigits(puzzleText: string, boardSize: number): string {
    const lineLength = boardSize * 2 - 1;
    const answerText = puzzleText.substring(lineLength * lineLength);
    const answerMatchArray = answerText.match(/\d+/g);
    if (answerMatchArray) {
      return answerMatchArray.join('');
    }
    return '';
  }
}

class InnerPuzzleTextParser {
  private readonly _source: string;
  private readonly _board: MemoryBoard;
  private _position: number;
  private _coordinate: Coordinate;

  constructor(source: string, board: MemoryBoard) {
    this._source = source;
    this._board = board;
    this._position = 0;
    this._coordinate = Coordinate.fromIndex(0, board.size);
  }

  parseStartBoard() {
    ObjectFacilities.repeat(this._board.size - 1, () => {
      const startLineCoordinate = this._coordinate;
      this.parseDigitLine();

      this._coordinate = startLineCoordinate;
      this.parseSeparatorLine();
    });

    this.parseDigitLine();
  }

  private parseDigitLine() {
    ObjectFacilities.repeat(this._board.size - 1, () => {
      this.parseValueInDigitLine();
      this.parseOperatorInDigitLine();
    });
    this.parseValueInDigitLine();
  }

  private parseSeparatorLine() {
    ObjectFacilities.repeat(this._board.size - 1, () => {
      this.parseOperatorInSeparatorLine();
      this.skipToken();
    });
    this.parseOperatorInSeparatorLine();
  }

  private parseValueInDigitLine() {
    const token = this._source[this._position];
    if (token !== '.') {
      const cell = this._board.getCell(this._coordinate);
      if (cell) {
        cell.setFixedValue(parseInt(token, 10));
      }
    }

    this.incrementPosition();
    this.incrementCoordinate();
  }

  private parseOperatorInDigitLine() {
    const token = this._source[this._position];
    if (token !== '_') {
      const operator = parseComparisonOperator(token);
      if (operator !== ComparisonOperator.None) {
        this._board.setOperator(this._coordinate, MoveDirection.Left, reverseOperator(operator));
      }
    }

    this.incrementPosition();
  }

  private parseOperatorInSeparatorLine() {
    const token = this._source[this._position];
    if (token !== '_') {
      const operator = parseComparisonOperator(token);
      if (operator !== ComparisonOperator.None) {
        this._board.setOperator(this._coordinate, MoveDirection.Down, operator);
      }
    }

    this.incrementPosition();
    this.incrementCoordinate();
  }

  private skipToken() {
    this.incrementPosition();
  }

  private incrementPosition() {
    if (this._position + 1 >= this._source.length) {
      throw new Error('Unexpected end of stream.');
    }
    this._position++;
  }

  private incrementCoordinate() {
    if (this._coordinate.canIncrement()) {
      this._coordinate = this._coordinate.increment();
    }
  }
}
