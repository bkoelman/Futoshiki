import { SolverStrategy } from './solver-strategy';
import { Board } from '../models/board';
import { Coordinate } from '../models/coordinate';

export class HiddenSingleStrategy extends SolverStrategy {
  constructor(board: Board) {
    super('Hidden Single', board);
  }

  runAtBoard(): boolean {
    for (const coordinate of Coordinate.iterateBoard(this.board.size)) {
      const cell = this.board.getCell(coordinate);
      if (cell && cell.value === undefined) {
        if (this.runAtCoordinate(coordinate)) {
          return true;
        }
      }
    }

    return false;
  }

  runAtCoordinate(coordinate: Coordinate): boolean {
    const cell = this.board.getCell(coordinate);
    if (cell) {
      for (const digit of cell.getCandidates()) {
        const sequences = this.getSequencesForCoordinate(coordinate, true);

        for (const sequence of sequences) {
          if (!this.sequenceContainsDigit(sequence.coordinates, digit)) {
            cell.setCandidates(new Set([digit]));
            this.reportChange(`Hidden single (${digit}) in ${sequence.name} of cell ${coordinate} eliminated others in this cell.`);
            return true;
          }
        }
      }
    }

    return false;
  }

  private sequenceContainsDigit(sequence: Coordinate[], digit: number): boolean {
    for (const coordinate of sequence) {
      const digits = this.getPossibleDigitsForCell(coordinate);
      if (digits.has(digit)) {
        return true;
      }
    }

    return false;
  }
}
