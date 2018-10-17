import { SolverStrategy } from './solver-strategy';
import { Coordinate } from '../models/coordinate';
import { SetFacilities } from '../set-facilities';
import { NamedSequence } from '../models/named-sequence';

export abstract class NakedSetStrategy extends SolverStrategy {
  abstract readonly powerSets: ReadonlySet<ReadonlySet<number>>[];

  runAtBoard(): boolean {
    return this.runAtSequences(this.rowColumnSequences, undefined);
  }

  runAtCoordinate(coordinate: Coordinate): boolean {
    const sequences = this.getSequencesForCoordinate(coordinate, false);
    return this.runAtSequences(sequences, coordinate);
  }

  private runAtSequences(sequences: NamedSequence[], singleCoordinate: Coordinate | undefined): boolean {
    for (const powerSet of this.powerSets) {
      for (const digitSet of powerSet) {
        for (const sequence of sequences) {
          if (this.runAtSequence(sequence, digitSet, singleCoordinate)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  private runAtSequence(sequence: NamedSequence, digitSet: ReadonlySet<number>, singleCoordinate: Coordinate | undefined): boolean {
    const cellsInNakedSet = this.getCellsInNakedSet(sequence.coordinates, digitSet);
    if (cellsInNakedSet.length === digitSet.size) {
      const cellsNotInNakedSet = sequence.coordinates.filter(coordinate => !cellsInNakedSet.some(cell => cell.isEqualTo(coordinate)));
      const nakedSetInfo = new NakedSetInfo(cellsInNakedSet, cellsNotInNakedSet, digitSet, sequence.name, singleCoordinate);
      return this.removeCandidatesFromOtherCells(nakedSetInfo);
    }

    return false;
  }

  private getCellsInNakedSet(sequence: Coordinate[], digitSet: ReadonlySet<number>): Coordinate[] {
    const cellsInNakedSet: Coordinate[] = [];

    for (const coordinate of sequence) {
      const isInSet = this.isCellInNakedSet(coordinate, digitSet);
      if (isInSet) {
        cellsInNakedSet.push(coordinate);
      }
    }

    return cellsInNakedSet;
  }

  private isCellInNakedSet(coordinate: Coordinate, digitSet: ReadonlySet<number>): boolean {
    const cell = this.board.getCell(coordinate);
    if (cell) {
      const candidates = cell.getCandidates();
      const digitsInsideSet = SetFacilities.filterSet(candidates, digit => digitSet.has(digit));
      const digitsOutsideSet = SetFacilities.filterSet(candidates, digit => !digitSet.has(digit));

      if (digitsInsideSet.size > 0 && digitsOutsideSet.size === 0) {
        return true;
      }
    }

    return false;
  }

  private removeCandidatesFromOtherCells(info: NakedSetInfo): boolean {
    const changedCellCount = this.removeCandidatesFromCells(info.cellsToUpdate, info.digitsToRemove);

    if (changedCellCount > 0) {
      const setArity = this.getArityName(info.digitsToRemove.size);
      const message = info.getMessage(changedCellCount, setArity);
      this.reportChange(message);

      return true;
    }

    return false;
  }
}

class NakedSetInfo {
  get cellsToUpdate(): Coordinate[] {
    if (this.singleCoordinate !== undefined) {
      const singleCoordinate = this.singleCoordinate;
      return this.cellsNotInNakedSet.filter(coordinate => coordinate.isEqualTo(singleCoordinate));
    }
    return this.cellsNotInNakedSet;
  }

  constructor(
    readonly cellsInNakedSet: Coordinate[],
    readonly cellsNotInNakedSet: Coordinate[],
    readonly digitsToRemove: ReadonlySet<number>,
    readonly sequenceName: string,
    readonly singleCoordinate: Coordinate | undefined
  ) {}

  getMessage(changedCellCount: number, setArity: string): string {
    const digitsNotInSet = SetFacilities.formatSet(this.digitsToRemove);
    const target = this.singleCoordinate === undefined ? `${changedCellCount} other cells in that ${this.sequenceName}` : `${this.singleCoordinate}`;
    return `Naked ${setArity} (${digitsNotInSet}) in cells (${this.cellsInNakedSet}) eliminated ${digitsNotInSet} from ${target}.`;
  }
}
